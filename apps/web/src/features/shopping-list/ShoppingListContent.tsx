import { useState } from 'react';
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
  const addItem = useListsStore((s) => s.addItem);
  const [inlineInput, setInlineInput] = useState('');

  const filteredItems = items.filter((i) => i.listId === activeListId && i.status === activeTab);

  // Group by category
  const grouped = filteredItems.reduce<Record<string, typeof filteredItems>>((acc, item) => {
    const cat = item.categoryId;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const handleInlineAdd = () => {
    const text = inlineInput.trim();
    if (!text || !activeListId) return;

    // Parse: "Milk $4.50" -> name: "Milk", price: 4.50
    const priceMatch = text.match(/\$(\d+(?:\.\d+)?)/);
    const price = priceMatch ? parseFloat(priceMatch[1]) : 0;
    const name = text.replace(/\$\d+(?:\.\d+)?/, '').trim();

    if (!name) return;

    const toBuyItems = items.filter((i) => i.listId === activeListId && i.status === 'to_buy');

    addItem({
      id: `temp-${Date.now()}`,
      listId: activeListId,
      name,
      categoryId: 'other',
      quantity: 1,
      unit: 'each',
      estimatedPrice: price,
      status: 'to_buy',
      sortOrder: toBuyItems.length + 1,
    });

    setInlineInput('');
  };

  const handleInlineKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleInlineAdd();
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-2 flex flex-col">
      {/* Progress bar */}
      {activeTab === 'to_buy' && (() => {
        const allListItems = items.filter((i) => i.listId === activeListId);
        const totalCount = allListItems.length;
        const checkedCount = allListItems.filter((i) => i.status === 'in_cart').length;
        const pct = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;
        if (totalCount === 0) return null;
        return (
          <div className="mb-4 px-1">
            <div className="flex items-center justify-between text-xs text-text-muted mb-1.5">
              <span>{checkedCount} of {totalCount} items checked</span>
              <span className="font-bold text-primary">{pct}%</span>
            </div>
            <div className="h-2 rounded-full bg-surface-active overflow-hidden">
              <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })()}
      <div className="flex-1 space-y-2">
        {Object.entries(grouped).map(([catId, catItems]) => {
          const category = CATEGORY_MAP[catId];
          return (
            <div key={catId} className="mb-6">
              <h3 className="text-text-muted text-xs font-bold uppercase tracking-wider mb-3 ml-2 flex items-center gap-2">
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
            <span className="material-symbols-outlined text-4xl text-text-muted mb-2">
              {activeTab === 'in_cart' ? 'shopping_cart' : activeTab === 'skipped' ? 'remove_shopping_cart' : 'checklist'}
            </span>
            <p className="text-text-muted">No items in this tab</p>
          </div>
        )}
      </div>

      {activeTab === 'to_buy' && activeListId && (
        <div className="sticky bottom-0 pt-4 pb-2 bg-bg border-t border-border -mx-6 px-6">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-text-muted group-focus-within:text-primary transition-colors text-[20px]">
                add_circle
              </span>
            </div>
            <input
              type="text"
              value={inlineInput}
              onChange={(e) => setInlineInput(e.target.value)}
              onKeyDown={handleInlineKeyDown}
              placeholder="Add item... (e.g. 'Milk $4.50')"
              className="w-full bg-surface text-text border border-border rounded-lg py-2.5 pl-10 pr-20 focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-text-muted/50 transition-all text-sm"
            />
            {inlineInput.trim() && (
              <button
                onClick={handleInlineAdd}
                className="absolute inset-y-0 right-2 flex items-center"
              >
                <span className="bg-primary hover:bg-emerald-400 text-text-inv text-xs font-bold px-3 py-1.5 rounded transition-colors">
                  Add
                </span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
