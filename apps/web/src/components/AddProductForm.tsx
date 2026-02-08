import { useState } from 'react';
import { CATEGORIES } from '@shopwise/shared';
import type { CategoryId, Product } from '@shopwise/shared';
import { productsService } from '@/services/products.service';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';

interface AddProductFormProps {
  barcode: string;
  onProductCreated: (product: Product) => void;
  onClose: () => void;
}

export function AddProductForm({ barcode, onProductCreated, onClose }: AddProductFormProps) {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [categoryId, setCategoryId] = useState<CategoryId>('other');
  const [unit, setUnit] = useState('each');
  const [price, setPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = name.trim().length > 0 && price.trim().length > 0 && Number(price) > 0;

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
      onProductCreated(product);
    } catch (err) {
      console.error('[AddProductForm] Failed to create product:', err);
      setError('Failed to add product. Please try again.');
      setSubmitting(false);
    }
  }

  const inputClasses =
    'w-full rounded-lg border border-border-dark bg-surface-dark px-3 py-2 text-sm text-white placeholder-text-secondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 rounded-xl border border-border-dark bg-background-dark shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-dark px-5 py-4">
          <div className="flex items-center gap-2">
            <Icon name="add_circle" className="text-primary" size={22} />
            <h2 className="text-lg font-bold text-white">Add New Product</h2>
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
          {/* Barcode (read-only) */}
          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">Barcode</label>
            <div className="flex items-center gap-2 rounded-lg border border-border-dark bg-surface-dark/50 px-3 py-2">
              <Icon name="barcode" className="text-text-secondary" size={18} />
              <span className="text-sm text-text-secondary font-mono">{barcode}</span>
            </div>
          </div>

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
              autoFocus
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

          {/* Price */}
          <div>
            <label htmlFor="product-price" className="mb-1 block text-xs font-medium text-text-secondary">
              Price <span className="text-red-400">*</span>
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
