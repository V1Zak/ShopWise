import { supabase } from '@/lib/supabase';
import type { Store } from '@shopwise/shared';

export const storesService = {
  async getStores(): Promise<Store[]> {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .order('name');

    if (error) throw error;

    return (data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      logo: row.logo ?? undefined,
      location: row.location ?? undefined,
      color: row.color,
      createdBy: row.created_by ?? undefined,
    }));
  },

  async getStore(id: string): Promise<Store> {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      logo: data.logo ?? undefined,
      location: data.location ?? undefined,
      color: data.color,
      createdBy: data.created_by ?? undefined,
    };
  },

  async createStore(store: { name: string; location?: string; color: string }): Promise<Store> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('stores')
      .insert({
        name: store.name,
        location: store.location ?? null,
        color: store.color,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      logo: data.logo ?? undefined,
      location: data.location ?? undefined,
      color: data.color,
      createdBy: data.created_by ?? undefined,
    };
  },
};
