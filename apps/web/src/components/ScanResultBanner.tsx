import type { Product } from '@shopwise/shared';

interface ScanResultBannerProps {
  product: Product | null;
  notFound: boolean;
  barcode: string | null;
  onAddToList?: (product: Product) => void;
  onDismiss: () => void;
}

export function ScanResultBanner({ product, notFound, barcode, onAddToList, onDismiss }: ScanResultBannerProps) {
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
                <p className="text-white font-medium">{product.name}</p>
                <p className="text-text-secondary text-sm">
                  {product.brand && `${product.brand} · `}
                  {product.unit} · Avg ${product.averagePrice.toFixed(2)}
                </p>
              </>
            ) : (
              <>
                <p className="text-white font-medium">Product not found</p>
                <p className="text-text-secondary text-sm">
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
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-background-dark text-sm font-bold hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Add
            </button>
          )}
          <button onClick={onDismiss} className="text-text-secondary hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      </div>
    </div>
  );
}
