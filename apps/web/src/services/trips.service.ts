import { supabase } from '@/lib/supabase';
import type { ShoppingTrip, CategoryBreakdown, TripInsight } from '@shopwise/shared';

export const tripsService = {
  async getTrips(): Promise<ShoppingTrip[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data: any[] | null = null;
    const { data: fullData, error } = await supabase
      .from('shopping_trips')
      .select(`
        *,
        stores ( id, name, color, logo )
      `)
      .order('date', { ascending: false });

    if (!error) {
      data = fullData;
    } else {
      // Fallback: query without stores join
      console.warn('getTrips: full query failed, retrying without joins:', error.message);
      const { data: simpleData, error: simpleError } = await supabase
        .from('shopping_trips')
        .select('*')
        .order('date', { ascending: false });
      if (simpleError) throw simpleError;
      data = simpleData;
    }

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

  async getTripById(tripId: string): Promise<ShoppingTrip | null> {
    const { data, error } = await supabase
      .from('shopping_trips')
      .select(`
        *,
        stores ( id, name, color, logo )
      `)
      .eq('id', tripId)
      .single();

    if (error) return null;
    if (!data) return null;

    const meta = (data.metadata ?? {}) as Record<string, unknown>;
    return {
      id: data.id,
      userId: data.user_id,
      listId: data.list_id ?? '',
      storeId: data.store_id,
      storeName: data.stores?.name ?? '',
      storeLogo: data.stores?.logo ?? undefined,
      date: new Date(data.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      itemCount: data.item_count,
      totalSpent: Number(data.total_spent),
      totalSaved: Number(data.total_saved),
      efficiencyScore: data.efficiency_score ?? undefined,
      topCategory: (meta.topCategory as string) ?? undefined,
      topCategoryPercentage: (meta.topCategoryPercentage as number) ?? undefined,
      variance: (meta.variance as string) ?? undefined,
      categoryBreakdown: (meta.categoryBreakdown as CategoryBreakdown[]) ?? [],
      insights: (meta.insights as TripInsight[]) ?? [],
      tags: (meta.tags as string[]) ?? undefined,
    };
  },

  async uploadReceipt(tripId: string, file: File): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'heic'];
    const MIME_TO_EXT: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/heic': 'heic',
    };

    let fileExt = (file.name.split('.').pop() ?? '').toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
      fileExt = MIME_TO_EXT[file.type] ?? 'jpg';
    }

    const filePath = `${user.id}/${tripId}/receipt.${fileExt}`;

    const { error } = await supabase.storage
      .from('receipts')
      .upload(filePath, file, { upsert: true });

    if (error) throw error;

    const { data: urlData, error: signedUrlError } = await supabase.storage
      .from('receipts')
      .createSignedUrl(filePath, 3600);

    if (signedUrlError) throw signedUrlError;

    return urlData?.signedUrl ?? null;
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
