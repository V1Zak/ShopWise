import { useMemo } from 'react';
import { useTripsStore } from '@/store/trips-store';
import { useListsStore } from '@/store/lists-store';

export function SmartSuggestions() {
  const trips = useTripsStore((s) => s.trips);
  const items = useListsStore((s) => s.items);

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

  const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div className="bg-gradient-to-br from-accent-green to-background-dark rounded-xl border border-border-dark p-5 relative overflow-hidden">
      <div className="absolute right-0 top-0 w-32 h-32 bg-primary/20 blur-[50px] rounded-full -mr-10 -mt-10" />
      <h3 className="text-white font-bold text-base mb-2 relative z-10">
        Smart Suggestions
      </h3>
      {suggestions.length === 0 ? (
        <div className="relative z-10">
          <p className="text-text-secondary text-sm">
            Add items to get suggestions
          </p>
          <p className="text-text-secondary text-xs mt-1">
            Your frequently purchased items will appear here.
          </p>
        </div>
      ) : (
        <>
          <p className="text-text-secondary text-sm mb-4 relative z-10">
            Based on your {dayName} habits, you often buy:
          </p>
          <div className="flex flex-wrap gap-2 relative z-10">
            {suggestions.map((item) => (
              <button
                key={item}
                className="flex items-center gap-2 px-3 py-1.5 bg-background-dark hover:bg-surface-dark border border-border-dark rounded-lg text-xs text-white transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">
                  add
                </span>
                {item}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
