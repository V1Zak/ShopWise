import { useState, useRef, useEffect } from 'react';
import { useListsStore } from '@/store/lists-store';
import type { ListItem } from '@shopwise/shared';
import { useCurrency } from '@/hooks/useCurrency';

interface Props {
  item: ListItem;
  isSelected?: boolean;
  onSelect?: (item: ListItem) => void;
  readOnly?: boolean;
}

export function ShoppingListItem({ item, isSelected, onSelect, readOnly }: Props) {
  const toggleItemStatus = useListsStore((s) => s.toggleItemStatus);
  const updateItemPrice = useListsStore((s) => s.updateItemPrice);
  const deleteItem = useListsStore((s) => s.deleteItem);
  const updateItemName = useListsStore((s) => s.updateItemName);
  const updateItemQuantity = useListsStore((s) => s.updateItemQuantity);
  const skipItem = useListsStore((s) => s.skipItem);

  const isChecked = item.status === 'in_cart';
  const isSkipped = item.status === 'skipped';
  const { formatPrice, symbol } = useCurrency();

  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [editPrice, setEditPrice] = useState(item.actualPrice?.toString() ?? '');
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  const handleNameDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (readOnly) return;
    setEditName(item.name);
    setIsEditingName(true);
  };

  const handleNameSave = () => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== item.name) {
      updateItemName(item.id, trimmed);
    } else {
      setEditName(item.name);
    }
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNameSave();
    } else if (e.key === 'Escape') {
      setEditName(item.name);
      setIsEditingName(false);
    }
  };

  const handlePriceSave = () => {
    const val = parseFloat(editPrice);
    if (!isNaN(val) && val >= 0 && val !== (item.actualPrice ?? undefined)) {
      updateItemPrice(item.id, val);
    } else if (editPrice.trim() === '') {
      // User cleared the field — reset to no actual price
      setEditPrice(item.actualPrice?.toString() ?? '');
    }
  };

  const handlePriceKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.target as HTMLInputElement).blur();
    }
  };

  // Sync local editPrice when item.actualPrice changes from outside (e.g. real-time)
  useEffect(() => {
    setEditPrice(item.actualPrice?.toString() ?? '');
  }, [item.actualPrice]);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteItem(item.id);
  };

  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    skipItem(item.id);
  };

  const handleQuantityChange = (delta: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newQty = item.quantity + delta;
    if (newQty >= 1) {
      updateItemQuantity(item.id, newQty);
    }
  };

  const getTagStyle = (tag: string) => {
    if (tag === 'On Sale') return 'text-primary bg-primary/10 border-primary/20';
    if (tag === 'Low Stock') return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
    return 'text-text-muted bg-bg border-border';
  };

  return (
    <div
      onClick={() => onSelect?.(item)}
      className={`group flex items-center gap-2 sm:gap-4 bg-surface hover:bg-surface-active border rounded-lg p-2 sm:p-3 transition-all duration-200 cursor-pointer ${
        isChecked || isSkipped ? 'opacity-60' : ''
      } ${
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-transparent hover:border-border'
      }`}
    >
      <label className={`relative flex items-center p-2 rounded-full ${readOnly ? 'cursor-default' : 'cursor-pointer'}`} onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isChecked}
          onChange={() => !readOnly && toggleItemStatus(item.id)}
          disabled={readOnly}
          aria-label={`Mark ${item.name} as ${isChecked ? 'not in cart' : 'in cart'}`}
          className={`peer h-6 w-6 appearance-none rounded-md border border-border bg-bg checked:border-primary checked:bg-primary transition-all ${readOnly ? 'cursor-default opacity-60' : 'cursor-pointer'}`}
        />
        <span className="absolute text-text-inv opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none material-symbols-outlined text-lg font-bold">
          check
        </span>
      </label>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {isEditingName ? (
            <input
              ref={nameInputRef}
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={handleNameKeyDown}
              onClick={(e) => e.stopPropagation()}
              className="bg-bg border border-primary rounded px-2 py-0.5 text-text font-semibold text-lg w-full focus:ring-1 focus:ring-primary focus:outline-none"
            />
          ) : (
            <span
              onDoubleClick={handleNameDoubleClick}
              className={`text-text font-semibold text-lg truncate ${isChecked || isSkipped ? 'line-through' : ''}`}
              title="Double-click to edit name"
            >
              {item.name}
            </span>
          )}
          {item.tags?.map((tag) => (
            <span key={tag} className={`text-xs px-2 py-0.5 rounded border whitespace-nowrap ${getTagStyle(tag)}`}>
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {!readOnly && (
              <button
                onClick={(e) => handleQuantityChange(-1, e)}
                disabled={item.quantity <= 1}
                aria-label={`Decrease quantity of ${item.name}`}
                className="h-5 w-5 flex items-center justify-center rounded bg-bg border border-border text-text-muted hover:text-text hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">remove</span>
              </button>
            )}
            <span className="text-text-muted text-sm min-w-[3rem] text-center">
              {item.quantity} {item.unit}
            </span>
            {!readOnly && (
              <button
                onClick={(e) => handleQuantityChange(1, e)}
                aria-label={`Increase quantity of ${item.name}`}
                className="h-5 w-5 flex items-center justify-center rounded bg-bg border border-border text-text-muted hover:text-text hover:border-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">add</span>
              </button>
            )}
          </div>
          <span className="text-text-muted text-sm">&bull; Target: {formatPrice(item.estimatedPrice * (item.quantity || 1))}</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        <span className="text-[10px] text-text-muted uppercase tracking-wide font-medium hidden sm:block">Actual Price</span>
        <div className="relative w-20 sm:w-24">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted text-sm">{symbol}</span>
          <input
            type="number"
            step="0.01"
            value={editPrice}
            placeholder={item.estimatedPrice.toFixed(2)}
            onChange={(e) => setEditPrice(e.target.value)}
            onBlur={handlePriceSave}
            onKeyDown={handlePriceKeyDown}
            readOnly={readOnly}
            className={`w-full bg-bg border border-border rounded text-text text-right text-sm py-1.5 px-2 focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-text-muted/50 ${readOnly ? 'cursor-default opacity-60' : ''}`}
          />
        </div>
      </div>
      {!readOnly && (
        <div className="flex flex-col gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={handleSkip}
            title={isSkipped ? 'Unskip item' : 'Skip item'}
            className={`h-7 w-7 flex items-center justify-center rounded transition-colors ${
              isSkipped
                ? 'bg-orange-400/20 text-orange-400 hover:bg-orange-400/30'
                : 'bg-bg border border-border text-text-muted hover:text-orange-400 hover:border-orange-400'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">skip_next</span>
          </button>
          <button
            onClick={handleDelete}
            title="Delete item"
            className="h-7 w-7 flex items-center justify-center rounded bg-bg border border-border text-text-muted hover:text-red-400 hover:border-red-400 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
          </button>
        </div>
      )}
    </div>
  );
}
