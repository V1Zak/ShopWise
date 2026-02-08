import { CatalogToolbar } from '@/features/catalog/CatalogToolbar';
import { CategoryPills } from '@/features/catalog/CategoryPills';
import { ProductGrid } from '@/features/catalog/ProductGrid';
import { CompareFloatingBar } from '@/features/catalog/CompareFloatingBar';

export function ItemCatalogPage() {
  return (
    <div className="flex flex-col h-full">
      <CatalogToolbar />
      <CategoryPills />
      <div className="flex-1 overflow-y-auto p-6 lg:p-10">
        <ProductGrid />
      </div>
      <CompareFloatingBar />
    </div>
  );
}
