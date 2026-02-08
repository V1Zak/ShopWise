import { useListsStore } from '@/store/lists-store';

export function ListHeader() {
  const activeListId = useListsStore((s) => s.activeListId);
  const lists = useListsStore((s) => s.lists);
  const getRunningTotal = useListsStore((s) => s.getRunningTotal);
  const items = useListsStore((s) => s.items);

  const list = lists.find((l) => l.id === activeListId);
  const total = getRunningTotal(activeListId);
  const allItems = items.filter((i) => i.listId === activeListId);

  return (
    <div className="p-6 pb-2 border-b border-border-dark">
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-text-secondary text-xs font-medium uppercase tracking-wider">Home</span>
        <span className="text-text-secondary text-xs font-medium">/</span>
        <span className="text-text-secondary text-xs font-medium uppercase tracking-wider">{list?.storeName}</span>
        <span className="text-text-secondary text-xs font-medium">/</span>
        <span className="text-primary text-xs font-medium uppercase tracking-wider">Active List</span>
      </div>
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-white text-3xl font-bold leading-tight mb-1">Active Shopping Trip</h1>
          <p className="text-text-secondary text-sm">
            Target: {list?.title} &bull; {allItems.length} Items
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-text-secondary font-medium mb-1">Running Total</div>
          <div className="text-3xl font-bold text-primary tabular-nums">${total.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}
