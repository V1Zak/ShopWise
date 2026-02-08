import { useProductsStore } from '@/store/products-store';
import { ProductCard } from './ProductCard';

export function ProductGrid() {
  const getFilteredProducts = useProductsStore((s) => s.getFilteredProducts);
  const products = getFilteredProducts();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
