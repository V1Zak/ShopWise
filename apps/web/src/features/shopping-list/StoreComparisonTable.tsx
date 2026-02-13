import { useMemo, useState } from 'react';
import { useListsStore } from '@/store/lists-store';
import { useProductsStore } from '@/store/products-store';
import { useCurrency } from '@/hooks/useCurrency';

interface StoreColumn {
  storeId: string;
  storeName: string;
  total: number;
}

interface RowData {
  itemId: string;
  itemName: string;
  quantity: number;
  prices: Record<string, number | null>; // storeId -> price
  cheapestStoreId: string | null;
}

export function StoreComparisonTable() {
  const activeListId = useListsStore((s) => s.activeListId);
  const items = useListsStore((s) => s.items).filter((i) => i.listId === activeListId && i.status === 'to_buy');
  const products = useProductsStore((s) => s.products);
  const [expanded, setExpanded] = useState(true);
  const { formatPrice } = useCurrency();

  const { stores, rows, bestStoreId, projectedSavings } = useMemo(() => {
    // Collect all stores from product store prices
    const storeMap = new Map<string, string>();
    for (const product of products) {
      for (const sp of product.storePrices) {
        storeMap.set(sp.storeId, sp.storeName);
      }
    }

    const storeColumns: StoreColumn[] = Array.from(storeMap.entries()).map(([id, name]) => ({
      storeId: id,
      storeName: name,
      total: 0,
    }));

    const rowData: RowData[] = [];

    for (const item of items) {
      const product = item.productId ? products.find((p) => p.id === item.productId) : null;
      const prices: Record<string, number | null> = {};
      let cheapestPrice = Infinity;
      let cheapestId: string | null = null;

      for (const store of storeColumns) {
        const sp = product?.storePrices.find((s) => s.storeId === store.storeId);
        const price = sp ? sp.price * (item.quantity || 1) : null;
        prices[store.storeId] = price;
        if (price !== null && price < cheapestPrice) {
          cheapestPrice = price;
          cheapestId = store.storeId;
        }
      }

      rowData.push({
        itemId: item.id,
        itemName: item.name,
        quantity: item.quantity || 1,
        prices,
        cheapestStoreId: cheapestId,
      });
    }

    // Compute store totals
    for (const store of storeColumns) {
      store.total = rowData.reduce((sum, row) => {
        const price = row.prices[store.storeId];
        return sum + (price ?? (items.find((i) => i.id === row.itemId)?.estimatedPrice ?? 0) * row.quantity);
      }, 0);
    }

    const best = storeColumns.length > 0
      ? storeColumns.reduce((a, b) => a.total < b.total ? a : b)
      : null;

    const worst = storeColumns.length > 0
      ? storeColumns.reduce((a, b) => a.total > b.total ? a : b)
      : null;

    const savings = best && worst ? worst.total - best.total : 0;

    return {
      stores: storeColumns,
      rows: rowData,
      bestStoreId: best?.storeId ?? null,
      projectedSavings: savings,
    };
  }, [items, products]);

  if (stores.length < 2 || items.length === 0) return null;

  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-active/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="material-symbols-outlined text-primary">compare_arrows</span>
          <div className="text-left">
            <h3 className="text-text font-bold text-sm">Store Price Comparison</h3>
            <p className="text-text-muted text-xs">{stores.length} stores compared</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {projectedSavings > 0 && (
            <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full">
              Save up to {formatPrice(projectedSavings)}
            </span>
          )}
          <span className={`material-symbols-outlined text-text-muted transition-transform ${expanded ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        </div>
      </button>

      {expanded && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-border bg-surface-alt">
                <th className="text-left text-text-muted text-xs font-semibold uppercase tracking-wider px-5 py-3">Item</th>
                <th className="text-center text-text-muted text-xs font-semibold uppercase tracking-wider px-3 py-3">Qty</th>
                {stores.map((store) => (
                  <th key={store.storeId} className="text-right text-text-muted text-xs font-semibold uppercase tracking-wider px-5 py-3 whitespace-nowrap">
                    {store.storeName}
                    {store.storeId === bestStoreId && (
                      <span className="ml-1 text-primary">*</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.itemId} className="hover:bg-surface-active/20">
                  <td className="px-5 py-3 text-text font-medium">{row.itemName}</td>
                  <td className="px-3 py-3 text-center text-text-muted">{row.quantity}</td>
                  {stores.map((store) => {
                    const price = row.prices[store.storeId];
                    const isCheapest = store.storeId === row.cheapestStoreId && price !== null;
                    return (
                      <td key={store.storeId} className={`px-5 py-3 text-right font-mono ${
                        isCheapest ? 'text-primary font-bold' : price !== null ? 'text-text' : 'text-text-muted'
                      }`}>
                        {price !== null ? formatPrice(price) : '—'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border bg-surface-alt">
                <td className="px-5 py-3 text-text font-bold" colSpan={2}>Total</td>
                {stores.map((store) => (
                  <td key={store.storeId} className={`px-5 py-3 text-right font-mono font-bold ${
                    store.storeId === bestStoreId ? 'text-primary' : 'text-text'
                  }`}>
                    {formatPrice(store.total)}
                    {store.storeId === bestStoreId && (
                      <span className="block text-[10px] text-primary font-medium">Best Value</span>
                    )}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
