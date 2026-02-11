import { useState, useRef, useEffect } from 'react';
import type { Product } from '@shopwise/shared';
import { Sparkline } from '@/components/ui/Sparkline';
import { useProductsStore } from '@/store/products-store';
import { useListsStore } from '@/store/lists-store';
import { listsService } from '@/services/lists.service';
import { useCurrency } from '@/hooks/useCurrency';

function categoryIcon(categoryId: string): string {
  const icons: Record<string, string> = {
    produce: 'nutrition',
    dairy: 'egg_alt',
    meat: 'set_meal',
    bakery: 'bakery_dining',
    pantry: 'kitchen',
    beverages: 'local_cafe',
    frozen: 'ac_unit',
    household: 'cleaning_services',
    snacks: 'cookie',
  };
  return icons[categoryId] ?? 'shopping_bag';
}

interface Props {
  product: Product;
}

export function ProductCard({ product }: Props) {
  const toggleCompare = useProductsStore((s) => s.toggleCompare);
  const compareList = useProductsStore((s) => s.compareList);
  const activeStoreId = useProductsStore((s) => s.activeStoreId);
  const setEditingProduct = useProductsStore((s) => s.setEditingProduct);
  const isComparing = compareList.includes(product.id);
  const lists = useListsStore((s) => s.lists).filter((l) => !l.isTemplate);
  const { formatPrice } = useCurrency();
  const [showListPicker, setShowListPicker] = useState(false);
  const [addingToList, setAddingToList] = useState<string | null>(null);
  const [addedToList, setAddedToList] = useState<string | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const volatilityColor =
    product.volatility === 'high' ? 'rgb(var(--color-danger))' : product.volatility === 'low' ? 'rgb(var(--color-primary))' : 'rgb(var(--color-text-muted))';
  const volatilityBg =
    product.volatility === 'high' ? 'text-red-400 bg-red-400/10' : product.volatility === 'low' ? 'text-primary bg-primary/10' : 'text-text-muted bg-surface-active/10';

  // Close picker on click outside
  useEffect(() => {
    if (!showListPicker) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowListPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showListPicker]);

  const handleAddToList = async (listId: string) => {
    setAddingToList(listId);
    try {
      await listsService.addItem({
        listId,
        name: product.name,
        categoryId: product.categoryId,
        quantity: 1,
        unit: product.unit,
        estimatedPrice: product.averagePrice,
        productId: product.id,
      });
      setAddedToList(listId);
      setTimeout(() => {
        setShowListPicker(false);
        setAddedToList(null);
      }, 800);
    } catch (err) {
      console.error('Failed to add item to list:', err);
    } finally {
      setAddingToList(null);
    }
  };

  return (
    <div className="group bg-surface border border-border rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 flex flex-col">
      {/* Image */}
      <div className="relative h-48 w-full overflow-hidden bg-surface-active/10">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-active/20 to-surface-active/5">
            <span className="material-symbols-outlined text-5xl text-primary/30">
              {categoryIcon(product.categoryId)}
            </span>
          </div>
        )}
        {product.badge && (
          <div className={`absolute top-3 left-3 ${product.badgeColor} text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-sm`}>
            {product.badge}
          </div>
        )}
        <div className="absolute top-3 right-3 flex gap-1.5">
          <button
            onClick={() => setEditingProduct(product.id)}
            className="h-8 w-8 rounded-full flex items-center justify-center backdrop-blur-sm bg-black/50 hover:bg-primary hover:text-black text-white transition-colors opacity-0 group-hover:opacity-100"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button
            onClick={() => toggleCompare(product.id)}
            className={`h-8 w-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors ${
              isComparing
                ? 'bg-primary text-black'
                : 'bg-black/50 hover:bg-primary hover:text-black text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">compare_arrows</span>
          </button>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-text font-bold text-lg leading-tight">{product.name}</h3>
            <p className="text-text-muted text-xs">{product.unit} {product.brand ? `• ${product.brand}` : ''}</p>
          </div>
          <div className="text-right">
            <p className="text-text font-mono font-bold">{formatPrice(product.averagePrice)}</p>
            <p className="text-text-muted text-[10px]">Avg Price</p>
          </div>
        </div>

        {/* Sparkline */}
        <div className="flex items-center gap-3 mb-4">
          {product.priceHistory.length > 1 ? (
            <Sparkline data={product.priceHistory} color={volatilityColor} className="h-6 w-24" />
          ) : (
            <svg className="h-6 w-24" viewBox="0 0 100 25">
              <path d="M0 12 L100 12" fill="none" stroke="rgb(var(--color-text-muted))" strokeWidth="2" strokeDasharray="4" />
            </svg>
          )}
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${volatilityBg}`}>
            {product.volatilityLabel || product.volatility}
          </span>
        </div>

        {/* Store Prices */}
        <div className="mt-auto space-y-2 border-t border-border pt-3">
          {[...product.storePrices]
            .sort((a, b) => {
              if (activeStoreId === 'all') return 0;
              if (a.storeId === activeStoreId) return -1;
              if (b.storeId === activeStoreId) return 1;
              return 0;
            })
            .map((sp) => {
            const isCheapest = sp.price <= Math.min(...product.storePrices.map((s) => s.price));
            const isSelected = activeStoreId !== 'all' && sp.storeId === activeStoreId;
            const isDimmed = activeStoreId !== 'all' && sp.storeId !== activeStoreId;
            return (
              <div key={sp.storeId} className={`flex items-center justify-between ${isDimmed ? 'opacity-40' : ''} transition-opacity`}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sp.storeColor }} />
                  <span className={`text-sm ${isSelected ? 'text-text font-medium' : 'text-text-muted'}`}>{sp.storeName}</span>
                </div>
                <div className="flex items-center gap-3 relative">
                  <span className={`text-sm font-mono ${isSelected ? 'text-primary font-bold' : isCheapest ? 'text-primary font-bold' : 'text-text-muted'}`}>
                    {formatPrice(sp.price)}
                  </span>
                  <button
                    onClick={() => setShowListPicker(true)}
                    className="text-text-muted hover:text-text hover:bg-surface-active p-1 rounded transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* List Picker Popover */}
        {showListPicker && (
          <div ref={pickerRef} className="mt-3 rounded-lg border border-border bg-bg shadow-xl p-3 space-y-1">
            <p className="text-xs font-semibold text-text-muted mb-2">Add to list:</p>
            {lists.length === 0 ? (
              <p className="text-xs text-text-muted">No lists yet. Create one first.</p>
            ) : (
              lists.map((list) => (
                <button
                  key={list.id}
                  onClick={() => handleAddToList(list.id)}
                  disabled={addingToList === list.id}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-text hover:bg-surface-active transition-colors disabled:opacity-50"
                >
                  <span className="truncate">{list.title}</span>
                  {addedToList === list.id ? (
                    <span className="material-symbols-outlined text-primary text-[16px]">check_circle</span>
                  ) : addingToList === list.id ? (
                    <span className="material-symbols-outlined text-text-muted text-[16px] animate-spin">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-text-muted text-[16px]">add</span>
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
