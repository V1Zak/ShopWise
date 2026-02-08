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
      .subscribe();
  },

  unsubscribe(channel: RealtimeChannel) {
    supabase.removeChannel(channel);
  },
};
