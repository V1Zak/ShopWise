import { useListsStore } from '@/store/lists-store';
import { ShoppingListItem } from './ShoppingListItem';
import { CATEGORY_MAP } from '@shopwise/shared';
import type { ListItem, ListItemStatus } from '@shopwise/shared';

interface Props {
  activeTab: ListItemStatus;
  selectedItemId?: string | null;
  onSelectItem?: (item: ListItem) => void;
}

export function ShoppingListContent({ activeTab, selectedItemId, onSelectItem }: Props) {
  const activeListId = useListsStore((s) => s.activeListId);
  const items = useListsStore((s) => s.items);
  const filteredItems = items.filter((i) => i.listId === activeListId && i.status === activeTab);

  // Group by category
  const grouped = filteredItems.reduce<Record<string, typeof filteredItems>>((acc, item) => {
    const cat = item.categoryId;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-2">
      {Object.entries(grouped).map(([catId, catItems]) => {
        const category = CATEGORY_MAP[catId];
        return (
          <div key={catId} className="mb-6">
            <h3 className="text-text-secondary text-xs font-bold uppercase tracking-wider mb-3 ml-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">{category?.icon || 'category'}</span>
              {category?.name || catId} {category?.aisle ? `(Aisle ${category.aisle})` : ''}
            </h3>
            {catItems.map((item) => (
              <ShoppingListItem
                key={item.id}
                item={item}
                isSelected={selectedItemId === item.id}
                onSelect={onSelectItem}
              />
            ))}
          </div>
        );
      })}
      {filteredItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="material-symbols-outlined text-4xl text-text-secondary mb-2">
            {activeTab === 'in_cart' ? 'shopping_cart' : activeTab === 'skipped' ? 'remove_shopping_cart' : 'checklist'}
          </span>
          <p className="text-text-secondary">No items in this tab</p>
        </div>
      )}
    </div>
  );
}
