import { useState, useRef, useEffect } from 'react';
import type { Product } from '@shopwise/shared';
import { Sparkline } from '@/components/ui/Sparkline';
import { useProductsStore } from '@/store/products-store';
import { useListsStore } from '@/store/lists-store';
import { useCurrency } from '@/hooks/useCurrency';
import { categoryIcon } from '@/utils/categoryIcon';

interface Props {
  product: Product;
}

export function ProductListItem({ product }: Props) {
  const toggleCompare = useProductsStore((s) => s.toggleCompare);
  const compareList = useProductsStore((s) => s.compareList);
  const activeStoreId = useProductsStore((s) => s.activeStoreId);
  const setEditingProduct = useProductsStore((s) => s.setEditingProduct);
  const isComparing = compareList.includes(product.id);
  const addItem = useListsStore((s) => s.addItem);
  const lists = useListsStore((s) => s.lists).filter((l) => !l.isTemplate);
  const { formatPrice } = useCurrency();

  const [expanded, setExpanded] = useState(false);
  const [pickerPrice, setPickerPrice] = useState<number | null>(null);
  const [addedToList, setAddedToList] = useState<string | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const volatilityColor =
    product.volatility === 'high' ? 'rgb(var(--color-danger))' : product.volatility === 'low' ? 'rgb(var(--color-primary))' : 'rgb(var(--color-text-muted))';
  const volatilityBg =
    product.volatility === 'high' ? 'text-red-400 bg-red-400/10' : product.volatility === 'low' ? 'text-primary bg-primary/10' : 'text-text-muted bg-surface-active/10';

  const showListPicker = pickerPrice !== null;

  useEffect(() => {
    if (!showListPicker) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerPrice(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showListPicker]);

  const handleAddToList = (listId: string) => {
    addItem({
      id: `temp-${Date.now()}-${product.id}`,
      listId,
      name: product.name,
      categoryId: product.categoryId,
      quantity: 1,
      unit: product.unit,
      estimatedPrice: pickerPrice ?? product.averagePrice,
      productId: product.id,
      status: 'to_buy',
      sortOrder: 0,
    });
    setAddedToList(listId);
    setTimeout(() => {
      setPickerPrice(null);
      setAddedToList(null);
    }, 800);
  };

  const sortedStorePrices = [...product.storePrices].sort((a, b) => {
    if (activeStoreId === 'all') return 0;
    if (a.storeId === activeStoreId) return -1;
    if (b.storeId === activeStoreId) return 1;
    return 0;
  });

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all duration-200">
      {/* Compact row */}
      <div
        className="flex items-center gap-3 p-3 cursor-pointer group"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Thumbnail */}
        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-surface-active/10">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl text-primary/30">
                {categoryIcon(product.categoryId)}
              </span>
            </div>
          )}
        </div>

        {/* Name / brand / unit */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-text font-semibold truncate">{product.name}</span>
            {product.badge && (
              <span className={`${product.badgeColor} text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider`}>
                {product.badge}
              </span>
            )}
          </div>
          <p className="text-text-muted text-xs truncate">
            {product.brand ? `${product.brand} · ` : ''}{product.unit}
          </p>
        </div>

        {/* Price + volatility */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-text font-mono font-bold text-sm">{formatPrice(product.averagePrice)}</span>
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${volatilityBg}`}>
            {product.volatilityLabel || product.volatility}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setEditingProduct(product.id)}
            className="h-7 w-7 rounded flex items-center justify-center text-text-muted hover:text-primary hover:bg-surface-active transition-colors"
            title="Edit product"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
          </button>
          <button
            onClick={() => toggleCompare(product.id)}
            className={`h-7 w-7 rounded flex items-center justify-center transition-colors ${
              isComparing
                ? 'text-primary bg-primary/10'
                : 'text-text-muted hover:text-primary hover:bg-surface-active'
            }`}
            title="Compare"
          >
            <span className="material-symbols-outlined text-[16px]">compare_arrows</span>
          </button>
        </div>

        {/* Expand indicator */}
        <span className={`material-symbols-outlined text-[18px] text-text-muted transition-transform ${expanded ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </div>

      {/* Expanded section */}
      {expanded && (
        <div className="border-t border-border px-3 pb-3 pt-2 space-y-3">
          {/* Sparkline */}
          <div className="flex items-center gap-3">
            <span className="text-text-muted text-xs">Price trend:</span>
            {product.priceHistory.length > 1 ? (
              <Sparkline data={product.priceHistory} color={volatilityColor} className="h-6 w-32" />
            ) : (
              <svg className="h-6 w-32" viewBox="0 0 128 25">
                <path d="M0 12 L128 12" fill="none" stroke="rgb(var(--color-text-muted))" strokeWidth="2" strokeDasharray="4" />
              </svg>
            )}
          </div>

          {/* Store prices */}
          <div className="space-y-1.5">
            <span className="text-text-muted text-xs font-medium">Store prices:</span>
            {sortedStorePrices.length === 0 ? (
              <p className="text-text-muted text-xs italic">No store prices available</p>
            ) : (() => {
              const cheapestPrice = Math.min(...product.storePrices.map((s) => s.price));
              return sortedStorePrices.map((sp) => {
                const isCheapest = sp.price <= cheapestPrice;
                const isSelected = activeStoreId !== 'all' && sp.storeId === activeStoreId;
                const isDimmed = activeStoreId !== 'all' && sp.storeId !== activeStoreId;
                return (
                  <div key={sp.storeId} className={`flex items-center justify-between ${isDimmed ? 'opacity-40' : ''} transition-opacity`}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sp.storeColor }} />
                      <span className={`text-sm ${isSelected ? 'text-text font-medium' : 'text-text-muted'}`}>{sp.storeName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-mono ${isSelected ? 'text-primary font-bold' : isCheapest ? 'text-primary font-bold' : 'text-text-muted'}`}>
                        {formatPrice(sp.price)}
                      </span>
                      <button
                        onClick={() => setPickerPrice(sp.price)}
                        className="text-text-muted hover:text-text hover:bg-surface-active p-1 rounded transition-colors"
                        title={`Add at ${formatPrice(sp.price)}`}
                      >
                        <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
                      </button>
                    </div>
                  </div>
                );
              });
            })()}
          </div>

          {/* List picker */}
          {showListPicker && (
            <div ref={pickerRef} className="rounded-lg border border-border bg-bg shadow-xl p-3 space-y-1">
              <p className="text-xs font-semibold text-text-muted mb-2">Add to list at {formatPrice(pickerPrice ?? product.averagePrice)}:</p>
              {lists.length === 0 ? (
                <p className="text-xs text-text-muted">No lists yet. Create one first.</p>
              ) : (
                lists.map((list) => (
                  <button
                    key={list.id}
                    onClick={() => handleAddToList(list.id)}
                    disabled={addedToList === list.id}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-text hover:bg-surface-active transition-colors disabled:opacity-50"
                  >
                    <span className="truncate">{list.title}</span>
                    {addedToList === list.id ? (
                      <span className="material-symbols-outlined text-primary text-[16px]">check_circle</span>
                    ) : (
                      <span className="material-symbols-outlined text-text-muted text-[16px]">add</span>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
