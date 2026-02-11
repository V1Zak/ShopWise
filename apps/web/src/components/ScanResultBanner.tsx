import type { Product } from '@shopwise/shared';
import { useCurrency } from '@/hooks/useCurrency';

interface ScanResultBannerProps {
  product: Product | null;
  notFound: boolean;
  barcode: string | null;
  onAddToList?: (product: Product) => void;
  onAddNewProduct?: () => void;
  onDismiss: () => void;
}

export function ScanResultBanner({ product, notFound, barcode, onAddToList, onAddNewProduct, onDismiss }: ScanResultBannerProps) {
  const { formatPrice } = useCurrency();

  if (!product && !notFound) return null;

  return (
    <div className={`mx-6 mt-4 rounded-lg border p-4 ${
      product
        ? 'border-primary/30 bg-primary/10'
        : 'border-yellow-500/30 bg-yellow-500/10'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className={`material-symbols-outlined text-[24px] mt-0.5 ${
            product ? 'text-primary' : 'text-yellow-400'
          }`}>
            {product ? 'check_circle' : 'help'}
          </span>
          <div>
            {product ? (
              <>
                <p className="text-text font-medium">{product.name}</p>
                <p className="text-text-muted text-sm">
                  {product.brand && `${product.brand} · `}
                  {product.unit} · Avg {formatPrice(product.averagePrice)}
                </p>
              </>
            ) : (
              <>
                <p className="text-text font-medium">Product not found</p>
                <p className="text-text-muted text-sm">
                  Barcode: {barcode}
                </p>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {product && onAddToList && (
            <button
              onClick={() => onAddToList(product)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-text-inv text-sm font-bold hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Add
            </button>
          )}
          {notFound && onAddNewProduct && (
            <button
              onClick={onAddNewProduct}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-text-inv text-sm font-bold hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              Add Product
            </button>
          )}
          <button onClick={onDismiss} className="text-text-muted hover:text-text transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      </div>
    </div>
  );
}
