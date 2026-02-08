import { supabase } from '@/lib/supabase';
import type { ShoppingTrip, CategoryBreakdown, TripInsight } from '@shopwise/shared';

export const tripsService = {
  async getTrips(): Promise<ShoppingTrip[]> {
    const { data, error } = await supabase
      .from('shopping_trips')
      .select(`
        *,
        stores ( id, name, color, logo )
      `)
      .order('date', { ascending: false });

    if (error) throw error;

    return (data ?? []).map((row) => {
      const meta = (row.metadata ?? {}) as Record<string, unknown>;
      return {
        id: row.id,
        userId: row.user_id,
        listId: row.list_id ?? '',
        storeId: row.store_id,
        storeName: row.stores?.name ?? '',
        storeLogo: row.stores?.logo ?? undefined,
        date: new Date(row.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        itemCount: row.item_count,
        totalSpent: Number(row.total_spent),
        totalSaved: Number(row.total_saved),
        efficiencyScore: row.efficiency_score ?? undefined,
        topCategory: (meta.topCategory as string) ?? undefined,
        topCategoryPercentage: (meta.topCategoryPercentage as number) ?? undefined,
        variance: (meta.variance as string) ?? undefined,
        categoryBreakdown: (meta.categoryBreakdown as CategoryBreakdown[]) ?? [],
        insights: (meta.insights as TripInsight[]) ?? [],
        tags: (meta.tags as string[]) ?? undefined,
      };
    });
  },

  async createTrip(trip: {
    storeId: string;
    listId?: string;
    date?: string;
    itemCount: number;
    totalSpent: number;
    totalSaved: number;
    efficiencyScore?: number;
    metadata?: Record<string, unknown>;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('shopping_trips')
      .insert({
        user_id: user.id,
        store_id: trip.storeId,
        list_id: trip.listId ?? null,
        date: trip.date ?? new Date().toISOString(),
        item_count: trip.itemCount,
        total_spent: trip.totalSpent,
        total_saved: trip.totalSaved,
        efficiency_score: trip.efficiencyScore ?? null,
        metadata: trip.metadata ?? {},
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
