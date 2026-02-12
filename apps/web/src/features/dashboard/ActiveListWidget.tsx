import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useListsStore } from '@/store/lists-store';
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown';
import { ConfirmDeleteModal } from '@/components/ConfirmDeleteModal';
import { useCurrency } from '@/hooks/useCurrency';

export function ActiveListWidget() {
  const lists = useListsStore((s) => s.lists);
  const items = useListsStore((s) => s.items);
  const deleteList = useListsStore((s) => s.deleteList);
  const activeList = lists[0]; // Trader Joe's Run
  const listItems = items.filter((i) => i.listId === activeList?.id).slice(0, 5);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const { formatPrice } = useCurrency();

  if (!activeList) return null;

  const handleDeleteList = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteList(deleteTargetId);
    } catch {
      // silently fail
    }
    setDeleteTargetId(null);
  };

  return (
    <>
      <section className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-lg text-primary">
              <span className="material-symbols-outlined">shopping_cart</span>
            </div>
            <div>
              <h3 className="text-text font-bold text-lg">{activeList.title}</h3>
              <p className="text-text-muted text-xs">
                {activeList.itemCount} items &bull; Estimated {formatPrice(activeList.estimatedTotal)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Dropdown
              align="right"
              trigger={
                <button className="flex items-center justify-center w-11 h-11 rounded-lg text-text-muted hover:text-text hover:bg-surface-active transition-colors" title="More actions">
                  <span className="material-symbols-outlined text-[20px]">more_vert</span>
                </button>
              }
            >
              <DropdownItem
                label="Delete List"
                icon="delete"
                onClick={() => setDeleteTargetId(activeList.id)}
              />
            </Dropdown>
            <Link
              to={`/list/${activeList.id}`}
              className="bg-primary hover:bg-emerald-400 text-text-inv px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
            >
              <span>Start Shopping</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        </div>
        <div className="p-2">
          <div className="flex flex-col">
            {listItems.map((item) => (
              <div
                key={item.id}
                className="group flex items-center justify-between p-3 hover:bg-surface-active/50 rounded-lg transition-colors cursor-pointer border-b border-border/50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded border border-text-muted/50 group-hover:border-primary flex items-center justify-center transition-colors" />
                  <span className="text-text font-medium">{item.name}</span>
                  {item.tags?.[0] && (
                    <span className="text-xs text-text-muted bg-bg px-2 py-0.5 rounded">
                      {item.tags[0]}
                    </span>
                  )}
                </div>
                <span className="text-text-muted font-mono text-sm">
                  {formatPrice(item.estimatedPrice)}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="p-3 bg-bg/50 text-center border-t border-border">
          <Link
            to={`/list/${activeList.id}`}
            className="text-primary text-sm font-medium hover:text-primary/80 transition-colors"
          >
            View all {activeList.itemCount} items
          </Link>
        </div>
      </section>
      <ConfirmDeleteModal
        isOpen={deleteTargetId !== null}
        title="Delete List"
        message={`Are you sure you want to delete "${activeList.title}"? This action cannot be undone.`}
        onConfirm={handleDeleteList}
        onCancel={() => setDeleteTargetId(null)}
      />
    </>
  );
}
