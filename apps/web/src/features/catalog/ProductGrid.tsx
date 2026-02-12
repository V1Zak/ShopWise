import { useProductsStore } from '@/store/products-store';
import { ProductCard } from './ProductCard';
import { ProductListItem } from './ProductListItem';
import { ProductForm } from '@/components/ProductForm';

export function ProductGrid() {
  const getFilteredProducts = useProductsStore((s) => s.getFilteredProducts);
  const products = getFilteredProducts();
  const allProducts = useProductsStore((s) => s.products);
  const viewMode = useProductsStore((s) => s.viewMode);
  const editingProductId = useProductsStore((s) => s.editingProductId);
  const setEditingProduct = useProductsStore((s) => s.setEditingProduct);
  const isCreatingProduct = useProductsStore((s) => s.isCreatingProduct);
  const setCreatingProduct = useProductsStore((s) => s.setCreatingProduct);
  const fetchProducts = useProductsStore((s) => s.fetchProducts);

  const editingProduct = editingProductId
    ? allProducts.find((p) => p.id === editingProductId)
    : undefined;

  const handleEditSave = () => {
    setEditingProduct(null);
    fetchProducts();
  };

  const handleCreateSave = () => {
    setCreatingProduct(false);
    fetchProducts();
  };

  return (
    <>
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {products.map((product) => (
            <ProductListItem key={product.id} product={product} />
          ))}
        </div>
      )}

      {editingProduct && (
        <ProductForm
          mode="edit"
          product={editingProduct}
          onSave={handleEditSave}
          onClose={() => setEditingProduct(null)}
        />
      )}

      {isCreatingProduct && (
        <ProductForm
          mode="create"
          onSave={handleCreateSave}
          onClose={() => setCreatingProduct(false)}
        />
      )}
    </>
  );
}
