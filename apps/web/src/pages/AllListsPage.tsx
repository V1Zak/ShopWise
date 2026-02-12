import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useListsStore } from '@/store/lists-store';
import { useCurrency } from '@/hooks/useCurrency';
import { ConfirmDeleteModal } from '@/components/ConfirmDeleteModal';
import { NewListDialog } from '@/components/NewListDialog';
import type { ShoppingList } from '@shopwise/shared';

function ListCard({
  list,
  onDelete,
  formatPrice,
}: {
  list: ShoppingList;
  onDelete: (id: string) => void;
  formatPrice: (n: number) => string;
}) {
  const budgetPct =
    list.budget && list.budget > 0
      ? Math.min((list.estimatedTotal / list.budget) * 100, 100)
      : null;

  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden hover:border-primary/40 transition-colors">
      <div className="p-5 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Link
            to={`/list/${list.id}`}
            className="text-text font-bold text-lg hover:text-primary transition-colors line-clamp-1"
          >
            {list.title}
          </Link>
          {list.storeName && (
            <p className="text-text-muted text-sm mt-0.5">{list.storeName}</p>
          )}
          <div className="flex items-center gap-3 mt-2 text-sm text-text-muted">
            <span>{list.itemCount} {list.itemCount === 1 ? 'item' : 'items'}</span>
            <span>&bull;</span>
            <span>Est. {formatPrice(list.estimatedTotal)}</span>
          </div>

          {budgetPct !== null && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-text-muted mb-1">
                <span>Budget</span>
                <span>{formatPrice(list.estimatedTotal)} / {formatPrice(list.budget!)}</span>
              </div>
              <div className="h-1.5 bg-bg rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    budgetPct >= 90 ? 'bg-danger' : budgetPct >= 70 ? 'bg-warning' : 'bg-primary'
                  }`}
                  style={{ width: `${budgetPct}%` }}
                />
              </div>
            </div>
          )}

          {(list.collaboratorCount ?? 0) > 0 && (
            <div className="mt-2 flex items-center gap-1 text-xs text-text-muted">
              <span className="material-symbols-outlined text-[16px]">group</span>
              <span>{list.collaboratorCount} collaborator{list.collaboratorCount === 1 ? '' : 's'}</span>
            </div>
          )}

          <p className="text-text-muted/60 text-xs mt-2">
            Created {new Date(list.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <Link
            to={`/list/${list.id}`}
            className="bg-primary hover:bg-emerald-400 text-text-inv px-3 py-2 rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            Start Shopping
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
          <button
            onClick={() => onDelete(list.id)}
            className="text-text-muted hover:text-danger p-1.5 rounded-lg hover:bg-surface-active transition-colors"
            aria-label={`Delete ${list.title}`}
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function AllListsPage() {
  const lists = useListsStore((s) => s.lists);
  const fetchLists = useListsStore((s) => s.fetchLists);
  const deleteList = useListsStore((s) => s.deleteList);
  const getOwnedLists = useListsStore((s) => s.getOwnedLists);
  const getSharedLists = useListsStore((s) => s.getSharedLists);
  const { formatPrice } = useCurrency();

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [showNewList, setShowNewList] = useState(false);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const ownedLists = getOwnedLists().filter((l) => !l.isTemplate);
  const sharedLists = getSharedLists().filter((l) => !l.isTemplate);
  const deleteTarget = lists.find((l) => l.id === deleteTargetId);

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteList(deleteTargetId);
    } catch {
      // handled by store
    }
    setDeleteTargetId(null);
  };

  const isEmpty = ownedLists.length === 0 && sharedLists.length === 0;

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-text text-2xl font-bold">All Lists</h1>
            <p className="text-text-muted text-sm mt-1">
              {lists.filter((l) => !l.isTemplate).length} {lists.filter((l) => !l.isTemplate).length === 1 ? 'list' : 'lists'} total
            </p>
          </div>
          <button
            onClick={() => setShowNewList(true)}
            className="bg-primary hover:bg-emerald-400 text-text-inv px-4 py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New List
          </button>
        </div>

        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-5xl text-text-muted/30 mb-4">
              playlist_add
            </span>
            <h2 className="text-text text-lg font-semibold mb-2">No lists yet</h2>
            <p className="text-text-muted text-sm mb-6 max-w-sm">
              Create your first shopping list to start tracking items, prices, and budgets.
            </p>
            <button
              onClick={() => setShowNewList(true)}
              className="bg-primary hover:bg-emerald-400 text-text-inv px-5 py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Create Your First List
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {ownedLists.length > 0 && (
              <section>
                <h2 className="text-text font-semibold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">person</span>
                  My Lists
                  <span className="text-text-muted font-normal normal-case text-xs">({ownedLists.length})</span>
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {ownedLists.map((list) => (
                    <ListCard
                      key={list.id}
                      list={list}
                      onDelete={setDeleteTargetId}
                      formatPrice={formatPrice}
                    />
                  ))}
                </div>
              </section>
            )}

            {sharedLists.length > 0 && (
              <section>
                <h2 className="text-text font-semibold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">group</span>
                  Shared with Me
                  <span className="text-text-muted font-normal normal-case text-xs">({sharedLists.length})</span>
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {sharedLists.map((list) => (
                    <ListCard
                      key={list.id}
                      list={list}
                      onDelete={setDeleteTargetId}
                      formatPrice={formatPrice}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      <ConfirmDeleteModal
        isOpen={deleteTargetId !== null}
        title="Delete List"
        message={`Are you sure you want to delete "${deleteTarget?.title ?? ''}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
      <NewListDialog open={showNewList} onClose={() => setShowNewList(false)} />
    </>
  );
}
