import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { notificationsService } from '@/services/notifications.service';
import { useAuthStore } from '@/store/auth-store';
import { useListsStore } from '@/store/lists-store';

/**
 * Listens to realtime changes on list_items and fires a browser notification
 * when the tab is in the background and the change was made by someone else.
 */
export function useRealtimeNotifications() {
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('list_items_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'list_items',
        },
        (payload) => {
          if (!document.hidden) return;
          if (!notificationsService.hasPermission()) return;

          const addedBy = (payload.new as Record<string, unknown>)?.added_by;
          if (addedBy === user.id) return;

          const listId = (payload.new as Record<string, unknown>)?.list_id as string | undefined;
          const userLists = useListsStore.getState().lists;
          if (listId && !userLists.some((l) => l.id === listId)) return;

          const itemName =
            (payload.new as Record<string, unknown>)?.name ?? 'an item';

          notificationsService.showNotification(
            'ShopWise',
            `Someone added "${itemName}" to a shared list`,
            { tag: 'list-item-added' },
          );
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'list_items',
        },
        (payload) => {
          if (!document.hidden) return;
          if (!notificationsService.hasPermission()) return;

          const updatedBy = (payload.new as Record<string, unknown>)?.updated_by;
          if (updatedBy === user.id) return;

          const updateListId = (payload.new as Record<string, unknown>)?.list_id as string | undefined;
          const currentLists = useListsStore.getState().lists;
          if (updateListId && !currentLists.some((l) => l.id === updateListId)) return;

          const isChecked = (payload.new as Record<string, unknown>)?.is_checked;
          const itemName =
            (payload.new as Record<string, unknown>)?.name ?? 'an item';

          if (isChecked) {
            notificationsService.showNotification(
              'ShopWise',
              `Someone checked off "${itemName}"`,
              { tag: 'list-item-checked' },
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
}
