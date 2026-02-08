import { useListsStore } from '@/store/lists-store';
import type { ListItem } from '@shopwise/shared';

interface Props {
  item: ListItem;
}

export function ShoppingListItem({ item }: Props) {
  const toggleItemStatus = useListsStore((s) => s.toggleItemStatus);
  const updateItemPrice = useListsStore((s) => s.updateItemPrice);
  const isChecked = item.status === 'in_cart';

  const getTagStyle = (tag: string) => {
    if (tag === 'On Sale') return 'text-primary bg-primary/10 border-primary/20';
    if (tag === 'Low Stock') return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
    return 'text-text-secondary bg-background-dark border-border-dark';
  };

  return (
    <div className={`group flex items-center gap-4 bg-surface-dark hover:bg-accent-green border border-transparent hover:border-[#32674d] rounded-lg p-3 transition-all duration-200 ${isChecked ? 'opacity-60' : ''}`}>
      <label className="relative flex items-center p-2 rounded-full cursor-pointer">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={() => toggleItemStatus(item.id)}
          className="peer h-6 w-6 cursor-pointer appearance-none rounded-md border border-[#32674d] bg-background-dark checked:border-primary checked:bg-primary transition-all"
        />
        <span className="absolute text-background-dark opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none material-symbols-outlined text-lg font-bold">
          check
        </span>
      </label>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between">
          <span className={`text-white font-semibold text-lg truncate ${isChecked ? 'line-through' : ''}`}>
            {item.name}
          </span>
          {item.tags?.map((tag) => (
            <span key={tag} className={`text-xs px-2 py-0.5 rounded border ${getTagStyle(tag)}`}>
              {tag}
            </span>
          ))}
        </div>
        <div className="text-text-secondary text-sm truncate">
          {item.quantity} {item.unit} &bull; Target: ${item.estimatedPrice.toFixed(2)}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="text-[10px] text-text-secondary uppercase tracking-wide font-medium">Actual Price</span>
        <div className="relative w-24">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-text-secondary text-sm">$</span>
          <input
            type="number"
            step="0.01"
            value={item.actualPrice ?? ''}
            placeholder={item.estimatedPrice.toFixed(2)}
            onChange={(e) => updateItemPrice(item.id, parseFloat(e.target.value) || 0)}
            className="w-full bg-background-dark border border-[#32674d] rounded text-white text-right text-sm py-1.5 px-2 focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-[#2d5c45]"
          />
        </div>
      </div>
    </div>
  );
}
