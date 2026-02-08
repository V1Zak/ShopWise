import { supabase } from '@/lib/supabase';
import type { Product, CategoryId } from '@shopwise/shared';

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
};
