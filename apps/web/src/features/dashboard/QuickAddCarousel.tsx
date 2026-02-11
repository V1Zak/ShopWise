import { useState } from 'react';
import { useProductsStore } from '@/store/products-store';
import { useListsStore } from '@/store/lists-store';
import { listsService } from '@/services/lists.service';
import { categoryImages } from '@/assets/imageAssets';

export function QuickAddCarousel() {
  const products = useProductsStore((s) => s.products);
  const lists = useListsStore((s) => s.lists).filter((l) => !l.isTemplate);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [addingId, setAddingId] = useState<string | null>(null);

  // Show top 10 products by price history count (most bought)
  const frequentProducts = [...products]
    .sort((a, b) => b.priceHistory.length - a.priceHistory.length)
    .slice(0, 10);

  const handleQuickAdd = async (productId: string) => {
    const product = products.find((p) => p.id === productId);
    const targetList = lists[0];
    if (!product || !targetList) return;

    setAddingId(productId);
    try {
      await listsService.addItem({
        listId: targetList.id,
        name: product.name,
        categoryId: product.categoryId,
        quantity: 1,
        unit: product.unit,
        estimatedPrice: product.averagePrice,
        productId: product.id,
      });
      setAddedIds((prev) => new Set(prev).add(productId));
    } catch (err) {
      console.error('Failed to quick-add:', err);
    } finally {
      setAddingId(null);
    }
  };

  if (frequentProducts.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-text font-bold text-lg">Frequently Bought</h3>
          <p className="text-text-muted text-xs">Tap to add to your active list</p>
        </div>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-none">
        {frequentProducts.map((product) => {
          const imgUrl = product.imageUrl || categoryImages[product.categoryId];
          const isAdded = addedIds.has(product.id);
          const isAdding = addingId === product.id;

          return (
            <button
              key={product.id}
              onClick={() => handleQuickAdd(product.id)}
              disabled={isAdding || isAdded || lists.length === 0}
              className="flex-shrink-0 w-32 rounded-xl border border-border bg-surface overflow-hidden hover:border-primary/50 transition-all group disabled:opacity-70"
            >
              <div className="h-20 w-full overflow-hidden bg-surface-active/20 relative">
                {imgUrl ? (
                  <img src={imgUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl text-primary/30">shopping_bag</span>
                  </div>
                )}
                {isAdded && (
                  <div className="absolute inset-0 bg-primary/80 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-xl">check</span>
                  </div>
                )}
              </div>
              <div className="p-2">
                <p className="text-text text-xs font-medium truncate">{product.name}</p>
                <p className="text-primary text-xs font-bold font-mono">${product.averagePrice.toFixed(2)}</p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
