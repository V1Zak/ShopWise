import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useListsStore } from '@/store/lists-store';
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown';
import { ConfirmDeleteModal } from '@/components/ConfirmDeleteModal';

export function ActiveListWidget() {
  const lists = useListsStore((s) => s.lists);
  const items = useListsStore((s) => s.items);
  const deleteList = useListsStore((s) => s.deleteList);
  const activeList = lists[0]; // Trader Joe's Run
  const listItems = items.filter((i) => i.listId === activeList?.id).slice(0, 5);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

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
      <section className="bg-surface-dark rounded-xl border border-border-dark overflow-hidden">
        <div className="p-5 border-b border-border-dark flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-lg text-primary">
              <span className="material-symbols-outlined">shopping_cart</span>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">{activeList.title}</h3>
              <p className="text-text-secondary text-xs">
                {activeList.itemCount} items &bull; Estimated ${activeList.estimatedTotal.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Dropdown
              align="right"
              trigger={
                <button className="flex items-center justify-center w-8 h-8 rounded-lg text-text-secondary hover:text-white hover:bg-accent-green transition-colors" title="More actions">
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
              className="bg-primary hover:bg-emerald-400 text-background-dark px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
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
                className="group flex items-center justify-between p-3 hover:bg-accent-green/50 rounded-lg transition-colors cursor-pointer border-b border-border-dark/50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded border border-text-secondary/50 group-hover:border-primary flex items-center justify-center transition-colors" />
                  <span className="text-white font-medium">{item.name}</span>
                  {item.tags?.[0] && (
                    <span className="text-xs text-text-secondary bg-background-dark px-2 py-0.5 rounded">
                      {item.tags[0]}
                    </span>
                  )}
                </div>
                <span className="text-text-secondary font-mono text-sm">
                  ${item.estimatedPrice.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="p-3 bg-background-dark/50 text-center border-t border-border-dark">
          <Link
            to={`/list/${activeList.id}`}
            className="text-primary text-sm font-medium hover:text-emerald-300 transition-colors"
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
