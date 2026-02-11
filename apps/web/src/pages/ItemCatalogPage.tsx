import { useCallback, useEffect, useState } from 'react';
import { CatalogToolbar } from '@/features/catalog/CatalogToolbar';
import { CatalogHeroBanner } from '@/features/catalog/CatalogHeroBanner';
import { CategoryPills } from '@/features/catalog/CategoryPills';
import { StorePills } from '@/features/catalog/StorePills';
import { ProductGrid } from '@/features/catalog/ProductGrid';
import { CompareFloatingBar } from '@/features/catalog/CompareFloatingBar';
import { ProductComparisonModal } from '@/components/ProductComparisonModal';
import { useProductsStore } from '@/store/products-store';

export function ItemCatalogPage() {
  const fetchProducts = useProductsStore((s) => s.fetchProducts);
  const products = useProductsStore((s) => s.products);
  const compareList = useProductsStore((s) => s.compareList);
  const toggleCompare = useProductsStore((s) => s.toggleCompare);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const compareProducts = products.filter((p) => compareList.includes(p.id));

  const handleOpenComparison = useCallback(() => {
    if (compareList.length >= 2) {
      setShowComparison(true);
    }
  }, [compareList.length]);

  const handleRemoveFromComparison = useCallback(
    (productId: string) => {
      toggleCompare(productId);
      // Use getState() to get the freshest compareList, avoiding stale closure
      const freshCompareList = useProductsStore.getState().compareList;
      const remaining = freshCompareList.filter((id) => id !== productId);
      if (remaining.length < 2) {
        setShowComparison(false);
      }
    },
    [toggleCompare],
  );

  return (
    <div className="flex flex-col h-full">
      <CatalogHeroBanner />
      <CatalogToolbar />
      <CategoryPills />
      <StorePills />
      <div className="flex-1 overflow-y-auto p-6 lg:p-10">
        <ProductGrid />
      </div>
      <CompareFloatingBar onCompare={handleOpenComparison} />
      {showComparison && (
        <ProductComparisonModal
          products={compareProducts}
          onClose={() => setShowComparison(false)}
          onRemove={handleRemoveFromComparison}
        />
      )}
    </div>
  );
}
