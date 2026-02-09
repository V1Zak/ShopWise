import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useListsStore } from '@/store/lists-store';
import { useTripsStore } from '@/store/trips-store';

export function CompleteButton() {
  const navigate = useNavigate();
  const activeListId = useListsStore((s) => s.activeListId);
  const lists = useListsStore((s) => s.lists);
  const items = useListsStore((s) => s.items);
  const createTrip = useTripsStore((s) => s.createTrip);
  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = async () => {
    if (isCompleting) return;
    setIsCompleting(true);

    try {
      const list = lists.find((l) => l.id === activeListId);
      const listItems = items.filter((i) => i.listId === activeListId);
      const inCartItems = listItems.filter((i) => i.status === 'in_cart');

      const totalSpent = inCartItems.reduce(
        (sum, item) => sum + (item.actualPrice ?? item.estimatedPrice),
        0,
      );

      const totalSaved = inCartItems.reduce((sum, item) => {
        const saved = item.estimatedPrice - (item.actualPrice ?? item.estimatedPrice);
        return sum + Math.max(0, saved);
      }, 0);

      const itemCount = inCartItems.length;
      const storeId = list?.storeId;

      if (storeId) {
        const tripId = await createTrip({
          storeId,
          listId: activeListId,
          itemCount,
          totalSpent,
          totalSaved,
        });
        navigate(`/briefing/${tripId}`);
      } else {
        // No store associated - navigate with list ID as fallback
        navigate(`/briefing/${activeListId}`);
      }
    } catch {
      // If trip creation fails, still navigate to briefing with list ID
      navigate(`/briefing/${activeListId}`);
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="p-6 border-t border-border-dark bg-surface-darker">
      <button
        onClick={handleComplete}
        disabled={isCompleting}
        className="w-full bg-primary hover:bg-[#10c96d] text-background-dark font-bold text-lg h-14 rounded-lg flex items-center justify-center gap-3 transition-colors shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        <span className="material-symbols-outlined">
          {isCompleting ? 'progress_activity' : 'shopping_bag'}
        </span>
        {isCompleting ? 'Completing...' : 'Complete Shopping Trip'}
      </button>
    </div>
  );
}
