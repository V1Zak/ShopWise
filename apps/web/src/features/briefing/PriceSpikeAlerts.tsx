import { useNavigate } from 'react-router-dom';
import { useAnalyticsStore } from '@/store/analytics-store';
import { useCurrency } from '@/hooks/useCurrency';

export function PriceSpikeAlerts() {
  const navigate = useNavigate();
  const priceAlerts = useAnalyticsStore((s) => s.data.priceAlerts);
  const { formatPrice } = useCurrency();

  const spikes = priceAlerts.filter((a) => a.priceChangePercent > 0);

  return (
    <div className="rounded-xl bg-surface border border-border flex flex-col overflow-hidden">
      <div className="p-4 border-b border-border flex justify-between items-center bg-surface-alt">
        <h3 className="text-text font-bold flex items-center gap-2">
          <span aria-hidden="true" className="material-symbols-outlined text-warning">warning</span>
          Price Spike Alerts
        </h3>
        {spikes.length > 0 && (
          <span className="bg-warning/20 text-warning text-xs font-bold px-2 py-0.5 rounded">
            {spikes.length} Item{spikes.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      {spikes.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-text-muted">
          <span aria-hidden="true" className="material-symbols-outlined text-[28px] mb-2">check_circle</span>
          <p className="text-sm">No price spikes detected</p>
          <p className="text-xs mt-1">Prices are stable across your recent purchases.</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {spikes.map((item) => (
            <div key={item.id} className="p-4 hover:bg-surface-active/50 transition-colors flex justify-between items-center">
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded bg-bg border border-border flex items-center justify-center shrink-0">
                  <span aria-hidden="true" className="material-symbols-outlined text-text-muted">nutrition</span>
                </div>
                <div>
                  <p className="text-text text-sm font-medium">{item.productName}</p>
                  <p className="text-text-muted text-xs">Last bought: {item.lastBought}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-text font-mono font-bold">{formatPrice(item.currentPrice)}</p>
                <p className="text-danger text-xs font-bold flex items-center justify-end gap-0.5">
                  <span aria-hidden="true" className="material-symbols-outlined text-[10px]">arrow_upward</span>
                  {item.priceChange}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="p-3 bg-surface-alt border-t border-border">
        <button
          onClick={() => navigate('/analytics')}
          className="w-full text-xs text-text-muted hover:text-text font-medium text-center transition-colors"
        >
          View all items
        </button>
      </div>
    </div>
  );
}
