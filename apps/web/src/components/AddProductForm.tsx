import { useState, useRef } from 'react';
import { CATEGORIES } from '@shopwise/shared';
import type { CategoryId, Product } from '@shopwise/shared';
import { productsService } from '@/services/products.service';
import { storageService } from '@/services/storage.service';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { useCurrency } from '@/hooks/useCurrency';

interface AddProductFormProps {
  barcode: string;
  onProductCreated: (product: Product) => void;
  onClose: () => void;
}

export function AddProductForm({ barcode, onProductCreated, onClose }: AddProductFormProps) {
  const { symbol } = useCurrency();
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [categoryId, setCategoryId] = useState<CategoryId>('other');
  const [unit, setUnit] = useState('each');
  const [price, setPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Image state
  const cameraFileRef = useRef<HTMLInputElement>(null);
  const galleryFileRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const isValid = name.trim().length > 0 && price.trim().length > 0 && Number(price) > 0;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const product = await productsService.createProduct({
        barcode,
        name: name.trim(),
        brand: brand.trim() || undefined,
        categoryId,
        unit,
        averagePrice: Number(price),
      });

      // Upload image after product creation if one was selected
      if (imageFile) {
        try {
          const url = await storageService.uploadProductImage(product.id, imageFile);
          await storageService.updateProductImageUrl(product.id, url);
          // Also add to product_images table
          await storageService.addProductImage(product.id, imageFile).catch(() => {
            // Table may not exist yet, silently skip
          });
          product.imageUrl = url;
        } catch (imgErr) {
          console.warn('[AddProductForm] Image upload failed (product still created):', imgErr);
        }
      }

      onProductCreated(product);
    } catch (err) {
      console.error('[AddProductForm] Failed to create product:', err);
      setError('Failed to add product. Please try again.');
      setSubmitting(false);
    }
  }

  const inputClasses =
    'w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 rounded-xl border border-border bg-bg shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4 sticky top-0 bg-bg z-10">
          <div className="flex items-center gap-2">
            <Icon name="add_circle" className="text-primary" size={22} />
            <h2 className="text-lg font-bold text-text">Add New Product</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-text-muted hover:bg-surface-active hover:text-text transition-colors"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Barcode (read-only) */}
          <div>
            <label className="mb-1 block text-xs font-medium text-text-muted">Barcode</label>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-surface/50 px-3 py-2">
              <Icon name="barcode" className="text-text-muted" size={18} />
              <span className="text-sm text-text-muted font-mono">{barcode}</span>
            </div>
          </div>

          {/* Photo */}
          <div>
            <label className="mb-1 block text-xs font-medium text-text-muted">Photo (optional)</label>
            <div
              onClick={() => galleryFileRef.current?.click()}
              className="relative group cursor-pointer w-full h-32 rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors bg-surface overflow-hidden flex items-center justify-center"
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span aria-hidden="true" className="material-symbols-outlined text-white text-[28px]">photo_camera</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1 text-text-muted">
                  <span aria-hidden="true" className="material-symbols-outlined text-[28px]">add_a_photo</span>
                  <span className="text-xs font-medium">Tap to add photo</span>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => cameraFileRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-active text-text text-xs font-medium hover:bg-surface-active/80 transition-colors"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-[16px]">photo_camera</span>
                Camera
              </button>
              <button
                type="button"
                onClick={() => galleryFileRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-active text-text text-xs font-medium hover:bg-surface-active/80 transition-colors"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-[16px]">photo_library</span>
                Gallery
              </button>
            </div>
            <input
              ref={cameraFileRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageSelect}
              className="hidden"
            />
            <input
              ref={galleryFileRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

          {/* Name */}
          <div>
            <label htmlFor="product-name" className="mb-1 block text-xs font-medium text-text-muted">
              Product Name <span className="text-red-400">*</span>
            </label>
            <input
              id="product-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Organic Whole Milk"
              className={inputClasses}
              autoFocus
            />
          </div>

          {/* Brand */}
          <div>
            <label htmlFor="product-brand" className="mb-1 block text-xs font-medium text-text-muted">
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
              <label htmlFor="product-category" className="mb-1 block text-xs font-medium text-text-muted">
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
              <label htmlFor="product-unit" className="mb-1 block text-xs font-medium text-text-muted">
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

          {/* Price */}
          <div>
            <label htmlFor="product-price" className="mb-1 block text-xs font-medium text-text-muted">
              Price <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted">{symbol}</span>
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

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2">
              <Icon name="error" className="text-red-400" size={18} />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" size="md" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={!isValid || submitting}>
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Icon name="progress_activity" className="animate-spin" size={16} />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Icon name="add" size={16} />
                  Add Product
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
