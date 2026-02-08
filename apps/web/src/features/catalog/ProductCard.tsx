import type { Product } from '@shopwise/shared';
import { Sparkline } from '@/components/ui/Sparkline';
import { useProductsStore } from '@/store/products-store';

interface Props {
  product: Product;
}

export function ProductCard({ product }: Props) {
  const toggleCompare = useProductsStore((s) => s.toggleCompare);
  const compareList = useProductsStore((s) => s.compareList);
  const isComparing = compareList.includes(product.id);
  const volatilityColor =
    product.volatility === 'high' ? '#ef4444' : product.volatility === 'low' ? '#13ec80' : '#92c9ad';
  const volatilityBg =
    product.volatility === 'high' ? 'text-red-400 bg-red-400/10' : product.volatility === 'low' ? 'text-primary bg-primary/10' : 'text-text-secondary bg-white/5';

  return (
    <div className="group bg-surface-dark border border-border-dark rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 flex flex-col">
      {/* Image placeholder */}
      <div className="relative h-48 w-full overflow-hidden bg-white/5">
        <div className="w-full h-full flex items-center justify-center bg-accent-green/30">
          <span className="material-symbols-outlined text-5xl text-text-secondary/30">image</span>
        </div>
        {product.badge && (
          <div className={`absolute top-3 left-3 ${product.badgeColor} text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-sm`}>
            {product.badge}
          </div>
        )}
        <button
          onClick={() => toggleCompare(product.id)}
          className={`absolute top-3 right-3 h-8 w-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors ${
            isComparing
              ? 'bg-primary text-black'
              : 'bg-black/50 hover:bg-primary hover:text-black text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">compare_arrows</span>
        </button>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-white font-bold text-lg leading-tight">{product.name}</h3>
            <p className="text-text-secondary text-xs">{product.unit} {product.brand ? `• ${product.brand}` : ''}</p>
          </div>
          <div className="text-right">
            <p className="text-white font-mono font-bold">${product.averagePrice.toFixed(2)}</p>
            <p className="text-text-secondary text-[10px]">Avg Price</p>
          </div>
        </div>

        {/* Sparkline */}
        <div className="flex items-center gap-3 mb-4">
          {product.priceHistory.length > 1 ? (
            <Sparkline data={product.priceHistory} color={volatilityColor} className="h-6 w-24" />
          ) : (
            <svg className="h-6 w-24" viewBox="0 0 100 25">
              <path d="M0 12 L100 12" fill="none" stroke="#92c9ad" strokeWidth="2" strokeDasharray="4" />
            </svg>
          )}
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${volatilityBg}`}>
            {product.volatilityLabel || product.volatility}
          </span>
        </div>

        {/* Store Prices */}
        <div className="mt-auto space-y-2 border-t border-border-dark pt-3">
          {product.storePrices.map((sp, i) => {
            const isCheapest = i === 0 || sp.price <= Math.min(...product.storePrices.map((s) => s.price));
            return (
              <div key={sp.storeId} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sp.storeColor }} />
                  <span className="text-sm text-gray-300">{sp.storeName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-mono ${isCheapest ? 'text-primary font-bold' : 'text-gray-400'}`}>
                    ${sp.price.toFixed(2)}
                  </span>
                  <button className="text-text-secondary hover:text-white hover:bg-accent-green p-1 rounded transition-colors">
                    <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
