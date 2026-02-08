import { useEffect, useState } from 'react';
import type { ListItem, PriceHistoryEntry } from '@shopwise/shared';
import { productsService } from '@/services/products.service';
import { PriceHistoryChart } from '@/components/PriceHistoryChart';
import { useListsStore } from '@/store/lists-store';

interface Props {
  item?: ListItem;
}

export function ProductIntelligence({ item }: Props) {
  const [priceHistory, setPriceHistory] = useState<PriceHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const activeListId = useListsStore((s) => s.activeListId);
  const items = useListsStore((s) => s.items);

  const selectedItem = item ?? items.find(
    (i) => i.listId === activeListId && i.status === 'to_buy' && i.productId,
  );

  useEffect(() => {
    if (!selectedItem?.productId) {
      setPriceHistory([]);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    productsService.getPriceHistory(selectedItem.productId).then((entries) => {
      if (!cancelled) {
        setPriceHistory(entries);
        setIsLoading(false);
      }
    }).catch(() => {
      if (!cancelled) {
        setPriceHistory([]);
        setIsLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [selectedItem?.productId]);

  const avgPrice = priceHistory.length > 0
    ? priceHistory.reduce((sum, e) => sum + e.price, 0) / priceHistory.length
    : selectedItem?.estimatedPrice ?? 0;

  const storeMap = new Map<string, { name: string; total: number; count: number }>();
  for (const entry of priceHistory) {
    const existing = storeMap.get(entry.storeId);
    if (existing) {
      existing.total += entry.price;
      existing.count += 1;
    } else {
      storeMap.set(entry.storeId, { name: entry.storeName, total: entry.price, count: 1 });
    }
  }
  const storeAverages = Array.from(storeMap.entries())
    .map(([id, s]) => ({ storeId: id, storeName: s.name, avgPrice: s.total / s.count }))
    .sort((a, b) => a.avgPrice - b.avgPrice);

  const cheapestStore = storeAverages[0];

  const priceDiff = selectedItem?.actualPrice && avgPrice > 0
    ? selectedItem.actualPrice - avgPrice
    : null;

  if (!selectedItem) {
    return (
      <div className="bg-background-dark rounded-xl p-5 border border-border-dark">
        <div className="flex items-center gap-3 text-text-secondary">
          <span className="material-symbols-outlined text-2xl">insights</span>
          <div>
            <h3 className="text-white font-bold text-lg">Product Intelligence</h3>
            <p className="text-sm mt-1">Add items with linked products to see price insights</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-dark rounded-xl p-5 border border-border-dark">
      <div className="flex items-start gap-4 mb-4">
        <div className="h-16 w-16 bg-white/5 rounded-lg flex items-center justify-center border border-border-dark">
          <span className="material-symbols-outlined text-3xl text-text-secondary">nutrition</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold text-lg truncate">{selectedItem.name}</h3>
          {priceDiff !== null && (
            <div className={`text-sm font-medium ${priceDiff < 0 ? 'text-primary' : priceDiff > 0 ? 'text-red-400' : 'text-text-secondary'}`}>
              {priceDiff < 0 ? `On Sale (-$${Math.abs(priceDiff).toFixed(2)})` : priceDiff > 0 ? `Above Avg (+$${priceDiff.toFixed(2)})` : 'At Average'}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-surface-dark p-3 rounded-lg">
          <div className="text-text-secondary text-xs uppercase mb-1">Avg Price</div>
          <div className="text-white font-semibold">
            {avgPrice > 0 ? `$${avgPrice.toFixed(2)}` : '--'}
          </div>
        </div>
        <div className="bg-surface-dark p-3 rounded-lg">
          <div className="text-text-secondary text-xs uppercase mb-1">Best Store</div>
          <div className="text-white font-semibold truncate">
            {cheapestStore ? `${cheapestStore.storeName} ($${cheapestStore.avgPrice.toFixed(2)})` : '--'}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-6 text-text-secondary text-sm">
          <span className="material-symbols-outlined animate-spin mr-2 text-base">progress_activity</span>
          Loading price history...
        </div>
      ) : priceHistory.length >= 2 ? (
        <div className="mb-4">
          <PriceHistoryChart entries={priceHistory} width={370} height={150} />
        </div>
      ) : (
        <div className="text-text-secondary text-xs leading-relaxed mb-4 bg-surface-dark rounded-lg p-3">
          <span className="material-symbols-outlined text-sm align-middle mr-1">info</span>
          Not enough price data yet. Prices are recorded as you shop.
        </div>
      )}

      {storeAverages.length > 1 && (
        <div className="text-text-secondary text-xs leading-relaxed">
          <span className="text-primary font-medium">Tip:</span>{' '}
          {cheapestStore.storeName} is typically the cheapest for this item
          {storeAverages.length > 1 && storeAverages[storeAverages.length - 1].avgPrice > cheapestStore.avgPrice
            ? `, saving you $${(storeAverages[storeAverages.length - 1].avgPrice - cheapestStore.avgPrice).toFixed(2)} vs ${storeAverages[storeAverages.length - 1].storeName}`
            : ''}.
        </div>
      )}
    </div>
  );
}
