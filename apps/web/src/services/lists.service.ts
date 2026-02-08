import { supabase } from '@/lib/supabase';
import type { ShoppingList, ListItem } from '@shopwise/shared';

export const listsService = {
  async getLists(): Promise<ShoppingList[]> {
    const { data, error } = await supabase
      .from('shopping_lists')
      .select(`
        *,
        stores ( name ),
        list_items ( id )
      `)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    return (data ?? []).map((row) => ({
      id: row.id,
      ownerId: row.owner_id,
      title: row.title,
      storeId: row.store_id ?? undefined,
      storeName: row.stores?.name ?? undefined,
      isTemplate: row.is_template,
      budget: row.budget ? Number(row.budget) : null,
      itemCount: row.list_items?.length ?? 0,
      estimatedTotal: 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },

  async getListItems(listId: string): Promise<ListItem[]> {
    const { data, error } = await supabase
      .from('list_items')
      .select('*')
      .eq('list_id', listId)
      .order('sort_order');

    if (error) throw error;

    return (data ?? []).map((row) => ({
      id: row.id,
      listId: row.list_id,
      productId: row.product_id ?? undefined,
      name: row.name,
      categoryId: row.category_id,
      quantity: row.quantity,
      unit: row.unit,
      estimatedPrice: Number(row.estimated_price),
      actualPrice: row.actual_price ? Number(row.actual_price) : undefined,
      status: row.status,
      tags: row.tags ?? [],
      sortOrder: row.sort_order,
    }));
  },

  async createList(list: { title: string; storeId?: string; isTemplate?: boolean }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('shopping_lists')
      .insert({
        owner_id: user.id,
        title: list.title,
        store_id: list.storeId ?? null,
        is_template: list.isTemplate ?? false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateList(id: string, updates: { title?: string; storeId?: string; budget?: number | null }) {
    const mapped: Record<string, unknown> = {};
    if (updates.title) mapped.title = updates.title;
    if (updates.storeId !== undefined) mapped.store_id = updates.storeId;
    if (updates.budget !== undefined) mapped.budget = updates.budget;

    const { error } = await supabase
      .from('shopping_lists')
      .update(mapped)
      .eq('id', id);

    if (error) throw error;
  },

  async updateListBudget(listId: string, budget: number | null) {
    const { error } = await supabase
      .from('shopping_lists')
      .update({ budget })
      .eq('id', listId);

    if (error) throw error;
  },

  async deleteList(id: string) {
    const { error } = await supabase
      .from('shopping_lists')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async addItem(item: {
    listId: string;
    name: string;
    categoryId: string;
    quantity?: number;
    unit?: string;
    estimatedPrice?: number;
    productId?: string;
    tags?: string[];
    sortOrder?: number;
  }) {
    const { data, error } = await supabase
      .from('list_items')
      .insert({
        list_id: item.listId,
        name: item.name,
        category_id: item.categoryId,
        quantity: item.quantity ?? 1,
        unit: item.unit ?? 'each',
        estimated_price: item.estimatedPrice ?? 0,
        product_id: item.productId ?? null,
        tags: item.tags ?? [],
        sort_order: item.sortOrder ?? 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateItem(id: string, updates: Partial<{
    status: string;
    actualPrice: number | null;
    quantity: number;
    name: string;
    sortOrder: number;
  }>) {
    const mapped: Record<string, unknown> = {};
    if (updates.status !== undefined) mapped.status = updates.status;
    if (updates.actualPrice !== undefined) mapped.actual_price = updates.actualPrice;
    if (updates.quantity !== undefined) mapped.quantity = updates.quantity;
    if (updates.name !== undefined) mapped.name = updates.name;
    if (updates.sortOrder !== undefined) mapped.sort_order = updates.sortOrder;

    const { error } = await supabase
      .from('list_items')
      .update(mapped)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteItem(id: string) {
    const { error } = await supabase
      .from('list_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
