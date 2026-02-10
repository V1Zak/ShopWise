import { useState, useRef, useEffect } from 'react';
import { CATEGORIES } from '@shopwise/shared';
import type { CategoryId, Product, StorePrice } from '@shopwise/shared';
import { productsService } from '@/services/products.service';
import { storageService } from '@/services/storage.service';
import { useStoresStore } from '@/store/stores-store';
import { useProductsStore } from '@/store/products-store';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { ProductImageGallery } from '@/components/ProductImageGallery';
import { ConfirmDeleteModal } from '@/components/ConfirmDeleteModal';

interface ProductFormProps {
  mode: 'create' | 'edit';
  product?: Product;
  barcode?: string;
  onSave: (product: Product) => void;
  onClose: () => void;
}

interface StorePriceEdit {
  storeId: string;
  price: string;
  isNew?: boolean;
}

export function ProductForm({ mode, product, barcode, onSave, onClose }: ProductFormProps) {
  const [name, setName] = useState(product?.name ?? '');
  const [brand, setBrand] = useState(product?.brand ?? '');
  const [categoryId, setCategoryId] = useState<CategoryId>(product?.categoryId ?? 'other');
  const [unit, setUnit] = useState(product?.unit ?? 'each');
  const [price, setPrice] = useState(product ? String(product.averagePrice) : '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Store prices (edit mode only)
  const [storePrices, setStorePrices] = useState<StorePriceEdit[]>(() =>
    (product?.storePrices ?? []).map((sp) => ({
      storeId: sp.storeId,
      price: String(sp.price),
    })),
  );
  const [newStoreId, setNewStoreId] = useState('');
  const [newStorePrice, setNewStorePrice] = useState('');

  const stores = useStoresStore((s) => s.stores);
  const fetchStores = useStoresStore((s) => s.fetchStores);
  const updateProduct = useProductsStore((s) => s.updateProduct);
  const deleteProduct = useProductsStore((s) => s.deleteProduct);

  // Image state (create mode only)
  const fileRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'edit' && stores.length === 0) fetchStores();
  }, [mode, stores.length, fetchStores]);

  const isValid = name.trim().length > 0 && (mode === 'edit' || (price.trim().length > 0 && Number(price) > 0));

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Available stores not yet in the price list
  const availableStores = stores.filter(
    (s) => !storePrices.some((sp) => sp.storeId === s.id),
  );

  const handleAddStorePrice = () => {
    if (!newStoreId || !newStorePrice || Number(newStorePrice) <= 0) return;
    setStorePrices((prev) => [...prev, { storeId: newStoreId, price: newStorePrice, isNew: true }]);
    setNewStoreId('');
    setNewStorePrice('');
  };

  const handleRemoveStorePrice = (storeId: string) => {
    setStorePrices((prev) => prev.filter((sp) => sp.storeId !== storeId));
  };

  const handleUpdateStorePriceValue = (storeId: string, value: string) => {
    setStorePrices((prev) =>
      prev.map((sp) => (sp.storeId === storeId ? { ...sp, price: value } : sp)),
    );
  };

  const getStoreName = (storeId: string): string => {
    const store = stores.find((s) => s.id === storeId);
    if (store) return store.name;
    const sp = product?.storePrices.find((s) => s.storeId === storeId);
    return sp?.storeName ?? storeId;
  };

  const getStoreColor = (storeId: string): string => {
    const store = stores.find((s) => s.id === storeId);
    if (store) return store.color;
    const sp = product?.storePrices.find((s) => s.storeId === storeId);
    return sp?.storeColor ?? '#888';
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      if (mode === 'create') {
        const created = await productsService.createProduct({
          barcode: barcode ?? undefined,
          name: name.trim(),
          brand: brand.trim() || undefined,
          categoryId,
          unit,
          averagePrice: Number(price),
        });

        if (imageFile) {
          try {
            const url = await storageService.uploadProductImage(created.id, imageFile);
            await storageService.updateProductImageUrl(created.id, url);
            await storageService.addProductImage(created.id, imageFile).catch(() => {});
            created.imageUrl = url;
          } catch (imgErr) {
            console.warn('[ProductForm] Image upload failed (product still created):', imgErr);
          }
        }

        onSave(created);
      } else if (product) {
        // Edit mode - update product fields
        await updateProduct(product.id, {
          name: name.trim(),
          brand: brand.trim() || undefined,
          categoryId,
          unit,
          averagePrice: price ? Number(price) : undefined,
        });

        // Sync store prices
        const originalIds = new Set(product.storePrices.map((sp) => sp.storeId));
        const currentIds = new Set(storePrices.map((sp) => sp.storeId));

        // Removed prices
        for (const sp of product.storePrices) {
          if (!currentIds.has(sp.storeId)) {
            await productsService.removeStorePrice(product.id, sp.storeId);
          }
        }

        // Added or updated prices
        for (const sp of storePrices) {
          const priceNum = Number(sp.price);
          if (priceNum <= 0) continue;
          const original = product.storePrices.find((o) => o.storeId === sp.storeId);
          if (!original || original.price !== priceNum) {
            await productsService.upsertStorePrice(product.id, sp.storeId, priceNum);
          }
        }

        // Refetch to get updated product with new store prices
        const updatedProducts = await productsService.getProducts();
        const updated = updatedProducts.find((p) => p.id === product.id);
        if (updated) onSave(updated);
        else onClose();
      }
    } catch (err) {
      console.error('[ProductForm] Submit failed:', err);
      setError(mode === 'create' ? 'Failed to add product. Please try again.' : 'Failed to save changes. Please try again.');
      setSubmitting(false);
    }
  }

  const handleDelete = async () => {
    if (!product) return;
    setShowDeleteConfirm(false);
    setSubmitting(true);
    try {
      await deleteProduct(product.id);
      onClose();
    } catch (err) {
      console.error('[ProductForm] Delete failed:', err);
      setError('Failed to delete product.');
      setSubmitting(false);
    }
  };

  const inputClasses =
    'w-full rounded-lg border border-border-dark bg-surface-dark px-3 py-2 text-sm text-white placeholder-text-secondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 rounded-xl border border-border-dark bg-background-dark shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-dark px-5 py-4 sticky top-0 bg-background-dark z-10">
          <div className="flex items-center gap-2">
            <Icon name={mode === 'create' ? 'add_circle' : 'edit'} className="text-primary" size={22} />
            <h2 className="text-lg font-bold text-white">
              {mode === 'create' ? 'Add New Product' : 'Edit Product'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-text-secondary hover:bg-accent-green hover:text-white transition-colors"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Barcode (create mode only) */}
          {mode === 'create' && barcode && (
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">Barcode</label>
              <div className="flex items-center gap-2 rounded-lg border border-border-dark bg-surface-dark/50 px-3 py-2">
                <Icon name="barcode" className="text-text-secondary" size={18} />
                <span className="text-sm text-text-secondary font-mono">{barcode}</span>
              </div>
            </div>
          )}

          {/* Photo (create mode) / Image Gallery (edit mode) */}
          {mode === 'create' ? (
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">Photo (optional)</label>
              <div
                onClick={() => fileRef.current?.click()}
                className="relative group cursor-pointer w-full h-32 rounded-lg border-2 border-dashed border-border-dark hover:border-primary/50 transition-colors bg-surface-dark overflow-hidden flex items-center justify-center"
              >
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-[28px]">photo_camera</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-text-secondary">
                    <span className="material-symbols-outlined text-[28px]">add_a_photo</span>
                    <span className="text-xs font-medium">Tap to add photo</span>
                  </div>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
          ) : product ? (
            <ProductImageGallery productId={product.id} />
          ) : null}

          {/* Name */}
          <div>
            <label htmlFor="product-name" className="mb-1 block text-xs font-medium text-text-secondary">
              Product Name <span className="text-red-400">*</span>
            </label>
            <input
              id="product-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Organic Whole Milk"
              className={inputClasses}
              autoFocus={mode === 'create'}
            />
          </div>

          {/* Brand */}
          <div>
            <label htmlFor="product-brand" className="mb-1 block text-xs font-medium text-text-secondary">
              Brand
            </label>
            <input
              id="product-brand"
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Horizon"
              className={inputClasses}
            />
          </div>

          {/* Category + Unit row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="product-category" className="mb-1 block text-xs font-medium text-text-secondary">
                Category
              </label>
              <select
                id="product-category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value as CategoryId)}
                className={inputClasses}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="product-unit" className="mb-1 block text-xs font-medium text-text-secondary">
                Unit
              </label>
              <select
                id="product-unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className={inputClasses}
              >
                <option value="each">Each</option>
                <option value="kg">Kilogram (kg)</option>
                <option value="g">Gram (g)</option>
                <option value="lb">Pound (lb)</option>
                <option value="oz">Ounce (oz)</option>
                <option value="L">Litre (L)</option>
                <option value="ml">Millilitre (ml)</option>
                <option value="pack">Pack</option>
                <option value="box">Box</option>
                <option value="bag">Bag</option>
              </select>
            </div>
          </div>

          {/* Price (create mode shows required, edit shows as average) */}
          <div>
            <label htmlFor="product-price" className="mb-1 block text-xs font-medium text-text-secondary">
              {mode === 'create' ? (
                <>Price <span className="text-red-400">*</span></>
              ) : (
                'Average Price'
              )}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-secondary">$</span>
              <input
                id="product-price"
                type="number"
                step="0.01"
                min="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className={`${inputClasses} pl-7`}
              />
            </div>
          </div>

          {/* Store Prices (edit mode only) */}
          {mode === 'edit' && product && (
            <div className="space-y-3">
              <label className="block text-xs font-medium text-text-secondary">Store Prices</label>

              {storePrices.length === 0 && (
                <p className="text-xs text-text-secondary/60 italic">No store prices set</p>
              )}

              {storePrices.map((sp) => (
                <div key={sp.storeId} className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getStoreColor(sp.storeId) }}
                  />
                  <span className="text-sm text-gray-300 flex-1 truncate">{getStoreName(sp.storeId)}</span>
                  <div className="relative w-24">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-text-secondary">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={sp.price}
                      onChange={(e) => handleUpdateStorePriceValue(sp.storeId, e.target.value)}
                      className="w-full rounded-lg border border-border-dark bg-surface-dark px-2 py-1.5 pl-5 text-xs text-white font-mono focus:border-primary focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveStorePrice(sp.storeId)}
                    className="p-1 rounded text-text-secondary hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  >
                    <Icon name="close" size={16} />
                  </button>
                </div>
              ))}

              {/* Add new store price */}
              {availableStores.length > 0 && (
                <div className="flex items-center gap-2 pt-1">
                  <select
                    value={newStoreId}
                    onChange={(e) => setNewStoreId(e.target.value)}
                    className="flex-1 rounded-lg border border-border-dark bg-surface-dark px-2 py-1.5 text-xs text-white focus:border-primary focus:outline-none"
                  >
                    <option value="">Add store...</option>
                    {availableStores.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <div className="relative w-24">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-text-secondary">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={newStorePrice}
                      onChange={(e) => setNewStorePrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full rounded-lg border border-border-dark bg-surface-dark px-2 py-1.5 pl-5 text-xs text-white font-mono focus:border-primary focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddStorePrice}
                    disabled={!newStoreId || !newStorePrice || Number(newStorePrice) <= 0}
                    className="p-1 rounded text-primary hover:bg-primary/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Icon name="add" size={18} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2">
              <Icon name="error" className="text-red-400" size={18} />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            {/* Delete button (edit mode only) */}
            {mode === 'edit' && product ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-red-400 text-sm font-medium hover:bg-red-400/10 transition-colors"
              >
                <Icon name="delete" size={16} />
                Delete
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              <Button type="button" variant="ghost" size="md" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md" disabled={!isValid || submitting}>
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <Icon name="progress_activity" className="animate-spin" size={16} />
                    Saving...
                  </span>
                ) : mode === 'create' ? (
                  <span className="flex items-center gap-1">
                    <Icon name="add" size={16} />
                    Add Product
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Icon name="check" size={16} />
                    Save Changes
                  </span>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Delete confirmation */}
      <ConfirmDeleteModal
        isOpen={showDeleteConfirm}
        title="Delete Product"
        message={`Are you sure you want to delete "${product?.name}"? This will also remove all store prices and images. This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
