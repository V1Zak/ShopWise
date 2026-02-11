import type { Product } from '@shopwise/shared';
import { Icon } from '@/components/ui/Icon';
import { useCurrency } from '@/hooks/useCurrency';

interface ProductComparisonModalProps {
  products: Product[];
  onClose: () => void;
  onRemove: (productId: string) => void;
}

export function ProductComparisonModal({ products, onClose, onRemove }: ProductComparisonModalProps) {
  const { formatPrice } = useCurrency();

  if (products.length === 0) return null;

  const globalMinPrice = Math.min(...products.map((p) => p.averagePrice));

  // Collect all unique store names across all compared products
  const allStoreNames = Array.from(
    new Set(products.flatMap((p) => p.storePrices.map((sp) => sp.storeName))),
  );

  function getStorePriceForProduct(product: Product, storeName: string) {
    return product.storePrices.find((sp) => sp.storeName === storeName);
  }

  function pctDiff(price: number, baseline: number): string {
    if (baseline === 0) return '';
    const diff = ((price - baseline) / baseline) * 100;
    if (diff === 0) return '';
    return `+${diff.toFixed(0)}%`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-5xl mx-4 my-8 bg-surface border border-border rounded-2xl shadow-2xl shadow-primary/5">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Icon name="compare_arrows" className="text-primary" size={24} />
            <h2 className="text-text text-lg font-bold">
              Comparing {products.length} Product{products.length > 1 ? 's' : ''}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-full flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-active transition-colors"
          >
            <Icon name="close" size={22} />
          </button>
        </div>

        {/* Product cards */}
        <div className="p-6">
          <div className={`grid gap-4 ${
            products.length === 2
              ? 'grid-cols-1 md:grid-cols-2'
              : products.length === 3
                ? 'grid-cols-1 md:grid-cols-3'
                : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4'
          }`}>
            {products.map((product) => {
              const isCheapestOverall = product.averagePrice === globalMinPrice && products.length > 1;
              return (
                <div
                  key={product.id}
                  className={`relative flex flex-col rounded-xl border transition-all ${
                    isCheapestOverall
                      ? 'border-primary/60 shadow-lg shadow-primary/10 bg-primary/5'
                      : 'border-border bg-bg'
                  }`}
                >
                  {isCheapestOverall && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
                      Best Value
                    </div>
                  )}

                  <button
                    onClick={() => onRemove(product.id)}
                    className="absolute top-2 right-2 h-7 w-7 rounded-full flex items-center justify-center text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors"
                    title="Remove from comparison"
                  >
                    <Icon name="close" size={16} />
                  </button>

                  <div className="p-4 pt-5 flex flex-col flex-1">
                    <div className="h-28 w-full rounded-lg bg-surface-active/10 flex items-center justify-center mb-3">
                      <Icon name="image" className="text-text-muted/30" size={40} />
                    </div>

                    <h3 className="text-text font-bold text-base leading-tight mb-1">{product.name}</h3>
                    {product.brand && (
                      <p className="text-text-muted text-xs mb-1">{product.brand}</p>
                    )}
                    <p className="text-text-muted text-xs mb-3">
                      {product.categoryId} &middot; {product.unit}
                    </p>

                    <div className="flex items-baseline gap-2 mb-1">
                      <span className={`font-mono font-bold text-xl ${isCheapestOverall ? 'text-primary' : 'text-text'}`}>
                        {formatPrice(product.averagePrice)}
                      </span>
                      <span className="text-text-muted text-[10px]">avg</span>
                    </div>

                    {!isCheapestOverall && products.length > 1 && (
                      <p className="text-red-400 text-xs font-medium mb-3">
                        {pctDiff(product.averagePrice, globalMinPrice)} more
                      </p>
                    )}
                    {isCheapestOverall && products.length > 1 && (
                      <p className="text-primary text-xs font-medium mb-3">Cheapest option</p>
                    )}

                    <div className="mt-auto border-t border-border pt-3 space-y-2">
                      <p className="text-text-muted text-[10px] uppercase tracking-wider font-medium mb-1">Store Prices</p>
                      {product.storePrices.length > 0 ? (
                        product.storePrices.map((sp) => {
                          const isCheapestStore =
                            sp.price <= Math.min(...product.storePrices.map((s) => s.price));
                          return (
                            <div key={sp.storeId} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-2 h-2 rounded-full shrink-0"
                                  style={{ backgroundColor: sp.storeColor }}
                                />
                                <span className="text-sm text-text-muted truncate">{sp.storeName}</span>
                              </div>
                              <span
                                className={`text-sm font-mono ${
                                  isCheapestStore ? 'text-primary font-bold' : 'text-text-muted'
                                }`}
                              >
                                {formatPrice(sp.price)}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-text-muted text-xs italic">No store prices</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {allStoreNames.length > 0 && products.length > 1 && (
            <div className="mt-8">
              <h3 className="text-text font-bold text-sm mb-3 flex items-center gap-2">
                <Icon name="storefront" className="text-primary" size={18} />
                Price Comparison by Store
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-text-muted text-xs font-medium py-2 pr-4">Store</th>
                      {products.map((p) => (
                        <th key={p.id} className="text-right text-text-muted text-xs font-medium py-2 px-3">
                          {p.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allStoreNames.map((storeName) => {
                      const prices = products.map((p) => getStorePriceForProduct(p, storeName)?.price ?? null);
                      const validPrices = prices.filter((pr): pr is number => pr !== null);
                      const minStorePrice = validPrices.length > 0 ? Math.min(...validPrices) : null;

                      return (
                        <tr key={storeName} className="border-b border-border/50">
                          <td className="py-2 pr-4 text-text-muted">{storeName}</td>
                          {prices.map((price, idx) => (
                            <td key={products[idx].id} className="text-right py-2 px-3">
                              {price !== null ? (
                                <span
                                  className={`font-mono ${
                                    price === minStorePrice && validPrices.length > 1
                                      ? 'text-primary font-bold'
                                      : 'text-text-muted'
                                  }`}
                                >
                                  {formatPrice(price)}
                                </span>
                              ) : (
                                <span className="text-text-muted/50">&mdash;</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
