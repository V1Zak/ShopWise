import { useEffect } from 'react';
import { realtimeService } from '@/services/realtime.service';
import { useListsStore } from '@/store/lists-store';

export function useRealtimeList(listId: string | undefined) {
  const fetchListItems = useListsStore((s) => s.fetchListItems);

  useEffect(() => {
    if (!listId || listId.length !== 36) return;

    const channel = realtimeService.subscribeToListItems(listId, () => {
      fetchListItems(listId);
    });

    return () => {
      realtimeService.unsubscribe(channel);
    };
  }, [listId, fetchListItems]);
}
