import { supabase } from '@/lib/supabase';
import type { Product, CategoryId } from '@shopwise/shared';

const ALLOWED_UNITS = ['each', 'kg', 'g', 'lb', 'oz', 'L', 'ml', 'pack', 'box', 'bag'] as const;

/** Escape special PostgREST characters to prevent query injection */
function sanitizeQuery(input: string): string {
  return input
    .replace(/\\/g, '')
    .replace(/,/g, '')
    .replace(/\./g, '')
    .replace(/\(/g, '')
    .replace(/\)/g, '');
}

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
    if (error) {
      // Fallback: products without store prices
      console.warn('getProducts: join query failed, retrying without joins:', error.message);
      let fallback = supabase.from('products').select('*').order('name');
      if (categoryId && categoryId !== 'all') fallback = fallback.eq('category_id', categoryId);
      const { data: simpleData, error: simpleError } = await fallback;
      if (simpleError) throw simpleError;
      return ((simpleData ?? []) as unknown as DbProduct[]).map(toProduct);
    }

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
      .or(`name.ilike.%${sanitizeQuery(query)}%,brand.ilike.%${sanitizeQuery(query)}%`)
      .order('name');

    if (categoryId && categoryId !== 'all') {
      q = q.eq('category_id', categoryId);
    }

    const { data, error } = await q;
    if (error) {
      console.warn('searchProducts: join query failed, retrying without joins:', error.message);
      let fallback = supabase.from('products').select('*')
        .or(`name.ilike.%${sanitizeQuery(query)}%,brand.ilike.%${sanitizeQuery(query)}%`)
        .order('name');
      if (categoryId && categoryId !== 'all') fallback = fallback.eq('category_id', categoryId);
      const { data: simpleData, error: simpleError } = await fallback;
      if (simpleError) throw simpleError;
      return ((simpleData ?? []) as unknown as DbProduct[]).map(toProduct);
    }

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
    // Input validation
    const trimmedName = product.name.trim();
    if (!trimmedName || trimmedName.length > 200) {
      throw new Error('Product name must be between 1 and 200 characters.');
    }
    if (!Number.isFinite(product.averagePrice) || product.averagePrice <= 0) {
      throw new Error('Price must be a finite positive number.');
    }
    if (!ALLOWED_UNITS.includes(product.unit as (typeof ALLOWED_UNITS)[number])) {
      throw new Error(`Invalid unit "${product.unit}". Allowed: ${ALLOWED_UNITS.join(', ')}.`);
    }

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

  async updateProduct(
    id: string,
    updates: {
      name?: string;
      brand?: string;
      categoryId?: CategoryId;
      unit?: string;
      averagePrice?: number;
    },
  ): Promise<Product> {
    const patch: Record<string, unknown> = {};
    if (updates.name !== undefined) {
      const trimmed = updates.name.trim();
      if (!trimmed || trimmed.length > 200) {
        throw new Error('Product name must be between 1 and 200 characters.');
      }
      patch.name = trimmed;
    }
    if (updates.brand !== undefined) patch.brand = updates.brand.trim() || null;
    if (updates.categoryId !== undefined) patch.category_id = updates.categoryId;
    if (updates.unit !== undefined) {
      if (!ALLOWED_UNITS.includes(updates.unit as (typeof ALLOWED_UNITS)[number])) {
        throw new Error(`Invalid unit "${updates.unit}". Allowed: ${ALLOWED_UNITS.join(', ')}.`);
      }
      patch.unit = updates.unit;
    }
    if (updates.averagePrice !== undefined) {
      if (!Number.isFinite(updates.averagePrice) || updates.averagePrice <= 0) {
        throw new Error('Price must be a finite positive number.');
      }
      patch.average_price = updates.averagePrice;
    }

    const { data, error } = await supabase
      .from('products')
      .update(patch)
      .eq('id', id)
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

  async deleteProduct(id: string): Promise<void> {
    // store_products cascade via FK, but delete explicitly in case
    await supabase.from('store_products').delete().eq('product_id', id);
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  },

  async upsertStorePrice(
    productId: string,
    storeId: string,
    price: number,
  ): Promise<void> {
    if (!Number.isFinite(price) || price <= 0) {
      throw new Error('Price must be a finite positive number.');
    }
    const { error } = await supabase
      .from('store_products')
      .upsert(
        { product_id: productId, store_id: storeId, price, last_updated: new Date().toISOString() },
        { onConflict: 'product_id,store_id' },
      );
    if (error) throw error;
    await this.recalcAveragePrice(productId);
  },

  async removeStorePrice(productId: string, storeId: string): Promise<void> {
    const { error } = await supabase
      .from('store_products')
      .delete()
      .eq('product_id', productId)
      .eq('store_id', storeId);
    if (error) throw error;
    await this.recalcAveragePrice(productId);
  },

  async recalcAveragePrice(productId: string): Promise<void> {
    const { data } = await supabase
      .from('store_products')
      .select('price')
      .eq('product_id', productId);
    const prices = (data ?? []).map((r) => Number(r.price));
    const avg = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
    if (avg > 0) {
      await supabase.from('products').update({ average_price: avg }).eq('id', productId);
    }
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
