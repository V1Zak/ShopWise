import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export const realtimeService = {
  subscribeToListItems(
    listId: string,
    onChange: () => void,
  ): RealtimeChannel {
    return supabase
      .channel(`list_items:${listId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'list_items',
          filter: `list_id=eq.${listId}`,
        },
        () => onChange(),
      )
      .subscribe((status, err) => {
        if (status === 'CHANNEL_ERROR') {
          console.error(`[Realtime] Channel error for list ${listId}:`, err?.message ?? 'unknown');
        } else if (status === 'TIMED_OUT') {
          console.warn(`[Realtime] Subscription timed out for list ${listId}`);
        }
      });
  },

  unsubscribe(channel: RealtimeChannel) {
    supabase.removeChannel(channel);
  },
};
