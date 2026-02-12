import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useListsStore } from '@/store/lists-store';
import { useTripsStore } from '@/store/trips-store';
import { useListPermission } from '@/hooks/useListPermission';

export function CompleteButton() {
  const navigate = useNavigate();
  const activeListId = useListsStore((s) => s.activeListId);
  const lists = useListsStore((s) => s.lists);
  const items = useListsStore((s) => s.items);
  const createTrip = useTripsStore((s) => s.createTrip);
  const { canEdit } = useListPermission();
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inCartItems = items.filter((i) => i.listId === activeListId && i.status === 'in_cart');
  const hasItems = inCartItems.length > 0;

  const handleComplete = async () => {
    if (isCompleting || !hasItems) return;
    setIsCompleting(true);
    setError(null);

    try {
      const list = lists.find((l) => l.id === activeListId);

      const totalSpent = inCartItems.reduce(
        (sum, item) => sum + (item.actualPrice ?? item.estimatedPrice) * (item.quantity || 1),
        0,
      );

      const totalSaved = inCartItems.reduce((sum, item) => {
        const saved = (item.estimatedPrice - (item.actualPrice ?? item.estimatedPrice)) * (item.quantity || 1);
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
        navigate(`/briefing/${activeListId}`);
      }
    } catch {
      setError('Failed to complete trip. Please try again.');
      setTimeout(() => setError(null), 4000);
    } finally {
      setIsCompleting(false);
    }
  };

  if (!canEdit) return null;

  return (
    <div className="p-6 border-t border-border bg-surface-alt">
      {error && (
        <p className="text-red-400 text-sm font-medium text-center mb-3">{error}</p>
      )}
      <button
        onClick={handleComplete}
        disabled={isCompleting || !hasItems}
        className="w-full bg-primary hover:bg-primary/90 text-text-inv font-bold text-lg h-14 rounded-lg flex items-center justify-center gap-3 transition-colors shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        <span className="material-symbols-outlined">
          {isCompleting ? 'progress_activity' : 'shopping_bag'}
        </span>
        {isCompleting ? 'Completing...' : !hasItems ? 'Check off items to complete' : 'Complete Shopping Trip'}
      </button>
    </div>
  );
}
