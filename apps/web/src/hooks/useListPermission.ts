import { useListsStore } from '@/store/lists-store';

export function useListPermission() {
  const canEdit = useListsStore((s) => {
    const list = s.lists.find((l) => l.id === s.activeListId);
    return list ? !list.sharedPermission || list.sharedPermission === 'edit' : false;
  });

  return { canEdit };
}
