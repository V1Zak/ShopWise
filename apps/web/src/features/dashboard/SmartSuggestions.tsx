import { useMemo, useState } from 'react';
import { useTripsStore } from '@/store/trips-store';
import { useListsStore } from '@/store/lists-store';
import { listsService } from '@/services/lists.service';

export function SmartSuggestions() {
  const trips = useTripsStore((s) => s.trips);
  const items = useListsStore((s) => s.items);
  const lists = useListsStore((s) => s.lists);
  const [addingItem, setAddingItem] = useState<string | null>(null);
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());

  const suggestions = useMemo<string[]>(() => {
    const itemCounts = new Map<string, number>();

    // Count item name frequency across all list items
    for (const item of items) {
      const name = item.name;
      itemCounts.set(name, (itemCounts.get(name) ?? 0) + 1);
    }

    // Also factor in trip top categories as general suggestions
    for (const trip of trips) {
      if (trip.topCategory) {
        itemCounts.set(
          trip.topCategory,
          (itemCounts.get(trip.topCategory) ?? 0) + 1,
        );
      }
    }

    if (itemCounts.size === 0) return [];

    // Sort by frequency descending, return top 5
    return [...itemCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name);
  }, [trips, items]);

  const handleAddToList = async (itemName: string) => {
    const targetList = lists[0];
    if (!targetList || addingItem || addedItems.has(itemName)) return;

    setAddingItem(itemName);
    try {
      await listsService.addItem({
        listId: targetList.id,
        name: itemName,
        categoryId: 'other',
        quantity: 1,
        unit: 'each',
        estimatedPrice: 0,
      });
      setAddedItems((prev) => new Set(prev).add(itemName));
      useListsStore.getState().fetchLists();
    } catch {
      // silently fail — item stays clickable
    } finally {
      setAddingItem(null);
    }
  };

  const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div className="bg-gradient-to-br from-surface-active to-bg rounded-xl border border-border p-5 relative overflow-hidden">
      <div className="absolute right-0 top-0 w-32 h-32 bg-primary/20 blur-[50px] rounded-full -mr-10 -mt-10" />
      <h3 className="text-text font-bold text-base mb-2 relative z-10">
        Smart Suggestions
      </h3>
      {suggestions.length === 0 ? (
        <div className="relative z-10">
          <p className="text-text-muted text-sm">
            Add items to get suggestions
          </p>
          <p className="text-text-muted text-xs mt-1">
            Your frequently purchased items will appear here.
          </p>
        </div>
      ) : (
        <>
          <p className="text-text-muted text-sm mb-4 relative z-10">
            Based on your {dayName} habits, you often buy:
          </p>
          <div className="flex flex-wrap gap-2 relative z-10">
            {suggestions.map((item) => {
              const isAdded = addedItems.has(item);
              const isAdding = addingItem === item;
              return (
                <button
                  key={item}
                  onClick={() => handleAddToList(item)}
                  disabled={isAdding || isAdded || lists.length === 0}
                  className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-xs transition-colors ${
                    isAdded
                      ? 'bg-primary/10 border-primary/30 text-primary'
                      : 'bg-bg hover:bg-surface border-border text-text'
                  } disabled:opacity-60`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isAdded ? 'check' : 'add'}
                  </span>
                  {item}
                </button>
              );
            })}
          </div>
          {lists.length === 0 && (
            <p className="text-text-muted text-xs mt-3 relative z-10">
              Create a list first to add suggestions.
            </p>
          )}
        </>
      )}
    </div>
  );
}
