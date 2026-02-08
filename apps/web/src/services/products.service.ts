import { supabase } from '@/lib/supabase';
import type { Product, CategoryId, PriceHistoryEntry } from '@shopwise/shared';

interface DbProduct {
  id: string;
  barcode: string | null;
  name: string;
  brand: string | null;
  description: string | null;
  category_id: string;
  image_url: string | null;
  unit: string;
  average_price: number;
  verified: boolean;
  created_at: string;
  store_products: {
    price: number;
    last_updated: string;
    stores: { id: string; name: string; color: string } | null;
  }[];
}

function toProduct(row: DbProduct): Product {
  return {
    id: row.id,
    barcode: row.barcode ?? undefined,
    name: row.name,
    brand: row.brand ?? undefined,
    description: row.description ?? undefined,
    categoryId: row.category_id as CategoryId,
    imageUrl: row.image_url ?? undefined,
    unit: row.unit,
    averagePrice: Number(row.average_price),
    storePrices: (row.store_products ?? [])
      .filter((sp) => sp.stores)
      .map((sp) => ({
        storeId: sp.stores!.id,
        storeName: sp.stores!.name,
        storeColor: sp.stores!.color,
        price: Number(sp.price),
        lastUpdated: sp.last_updated,
      })),
    priceHistory: [],
    volatility: 'stable',
    createdAt: row.created_at,
  };
}

export const productsService = {
  async getProducts(categoryId?: CategoryId | 'all'): Promise<Product[]> {
    let query = supabase
      .from('products')
      .select(`
        *,
        store_products (
          price,
          last_updated,
          stores ( id, name, color )
        )
      `)
      .order('name');

    if (categoryId && categoryId !== 'all') {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data as unknown as DbProduct[] ?? []).map(toProduct);
  },

  async searchProducts(query: string, categoryId?: CategoryId | 'all'): Promise<Product[]> {
    let q = supabase
      .from('products')
      .select(`
        *,
        store_products (
          price,
          last_updated,
          stores ( id, name, color )
        )
      `)
      .or(`name.ilike.%${query}%,brand.ilike.%${query}%`)
      .order('name');

    if (categoryId && categoryId !== 'all') {
      q = q.eq('category_id', categoryId);
    }

    const { data, error } = await q;
    if (error) throw error;

    return (data as unknown as DbProduct[] ?? []).map(toProduct);
  },

  async createProduct(product: {
    barcode?: string;
    name: string;
    brand?: string;
    categoryId: CategoryId;
    unit: string;
    averagePrice: number;
  }): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert({
        barcode: product.barcode ?? null,
        name: product.name,
        brand: product.brand ?? null,
        description: null,
        category_id: product.categoryId,
        image_url: null,
        unit: product.unit,
        average_price: product.averagePrice,
        verified: false,
      })
      .select(`
        *,
        store_products (
          price,
          last_updated,
          stores ( id, name, color )
        )
      `)
      .single();

    if (error) throw error;

    return toProduct(data as unknown as DbProduct);
  },

  async findByBarcode(barcode: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        store_products (
          price,
          last_updated,
          stores ( id, name, color )
        )
      `)
      .eq('barcode', barcode)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return toProduct(data as unknown as DbProduct);
  },

  async getPriceHistory(productId: string): Promise<PriceHistoryEntry[]> {
    const { data, error } = await supabase
      .from('price_history')
      .select(`
        id,
        product_id,
        store_id,
        price,
        recorded_at,
        stores ( name )
      `)
      .eq('product_id', productId)
      .order('recorded_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return (data ?? []).map((row: Record<string, unknown>) => ({
      id: row.id as string,
      productId: row.product_id as string,
      storeId: row.store_id as string,
      storeName: (row.stores as { name: string } | null)?.name ?? 'Unknown',
      price: Number(row.price),
      recordedAt: row.recorded_at as string,
    }));
  },

  async recordPrice(productId: string, storeId: string, price: number): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('price_history')
      .insert({
        product_id: productId,
        store_id: storeId,
        user_id: user.id,
        price,
        recorded_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Failed to record price:', error);
    }
  },
};
