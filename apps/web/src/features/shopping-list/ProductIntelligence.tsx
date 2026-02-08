import { CATEGORY_MAP } from '@shopwise/shared';
import type { ListItem } from '@shopwise/shared';

interface Props {
  selectedItem: ListItem | null;
}

export function ProductIntelligence({ selectedItem }: Props) {
  if (!selectedItem) {
    return (
      <div className="bg-background-dark rounded-xl p-5 border border-border-dark">
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <span className="material-symbols-outlined text-3xl text-text-secondary mb-3">touch_app</span>
          <p className="text-text-secondary text-sm">Tap an item for details</p>
          <p className="text-[#517d66] text-xs mt-1">
            See pricing tips, purchase history, and product info
          </p>
        </div>
      </div>
    );
  }

  const category = CATEGORY_MAP[selectedItem.categoryId];
  const hasActualPrice = selectedItem.actualPrice != null && selectedItem.actualPrice > 0;
  const priceDiff = hasActualPrice
    ? selectedItem.actualPrice! - selectedItem.estimatedPrice
    : null;

  const hasBestPriceTip = hasActualPrice && priceDiff !== null && priceDiff > 0;

  return (
    <div className="bg-background-dark rounded-xl p-5 border border-border-dark">
      <div className="flex items-start gap-4 mb-4">
        <div className="h-16 w-16 bg-white/5 rounded-lg flex items-center justify-center border border-border-dark">
          <span className="material-symbols-outlined text-3xl text-text-secondary">
            {category?.icon || 'category'}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold text-lg truncate">{selectedItem.name}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-text-secondary text-sm">
              {category?.name || selectedItem.categoryId}
            </span>
            {selectedItem.tags?.map((tag) => (
              <span
                key={tag}
                className={`text-xs px-1.5 py-0.5 rounded ${
                  tag === 'On Sale'
                    ? 'text-primary bg-primary/10'
                    : 'text-text-secondary bg-surface-dark'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-surface-dark p-3 rounded-lg">
          <div className="text-text-secondary text-xs uppercase mb-1">Estimated</div>
          <div className="text-white font-semibold">${selectedItem.estimatedPrice.toFixed(2)}</div>
        </div>
        <div className="bg-surface-dark p-3 rounded-lg">
          <div className="text-text-secondary text-xs uppercase mb-1">Actual</div>
          <div className={`font-semibold ${hasActualPrice ? (priceDiff! > 0 ? 'text-red-400' : 'text-primary') : 'text-text-secondary'}`}>
            {hasActualPrice ? `$${selectedItem.actualPrice!.toFixed(2)}` : '--'}
          </div>
        </div>
        <div className="bg-surface-dark p-3 rounded-lg">
          <div className="text-text-secondary text-xs uppercase mb-1">Quantity</div>
          <div className="text-white font-semibold">
            {selectedItem.quantity} {selectedItem.unit}
          </div>
        </div>
        <div className="bg-surface-dark p-3 rounded-lg">
          <div className="text-text-secondary text-xs uppercase mb-1">Status</div>
          <div className={`font-semibold ${
            selectedItem.status === 'in_cart'
              ? 'text-primary'
              : selectedItem.status === 'skipped'
                ? 'text-orange-400'
                : 'text-white'
          }`}>
            {selectedItem.status === 'to_buy' ? 'To Buy' : selectedItem.status === 'in_cart' ? 'In Cart' : 'Skipped'}
          </div>
        </div>
      </div>

      {hasBestPriceTip && (
        <div className="bg-red-400/10 border border-red-400/20 rounded-lg p-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-red-400 text-sm">trending_up</span>
            <span className="text-red-400 text-xs font-medium">
              ${priceDiff!.toFixed(2)} above estimated price
            </span>
          </div>
          <p className="text-text-secondary text-xs mt-1">
            Your estimated price was ${selectedItem.estimatedPrice.toFixed(2)}. Check for alternatives or store brands.
          </p>
        </div>
      )}

      {hasActualPrice && priceDiff !== null && priceDiff < 0 && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-sm">savings</span>
            <span className="text-primary text-xs font-medium">
              Saving ${Math.abs(priceDiff).toFixed(2)} vs estimate
            </span>
          </div>
        </div>
      )}

      {selectedItem.tags?.includes('On Sale') && (
        <div className="text-text-secondary text-xs leading-relaxed">
          <span className="material-symbols-outlined text-primary text-xs align-middle mr-1">local_offer</span>
          This item is currently on sale. Great time to stock up!
        </div>
      )}
    </div>
  );
}
