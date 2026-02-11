import { useState } from 'react';
import { useAnalyticsStore } from '@/store/analytics-store';

type Tab = 'watchlist' | 'history';

export function PriceGuardingTable() {
  const data = useAnalyticsStore((s) => s.data);
  const [activeTab, setActiveTab] = useState<Tab>('watchlist');
  const [mutedIds, setMutedIds] = useState<Set<string>>(new Set());

  const toggleMuted = (id: string) => {
    setMutedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allAlerts = data.priceAlerts;
  const watchedAlerts = allAlerts.filter((a) => !mutedIds.has(a.id));
  const visibleAlerts = activeTab === 'watchlist' ? watchedAlerts : allAlerts;

  return (
    <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-text flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">shield_lock</span>
            Price Guarding & Alerts
          </h3>
          <p className="text-xs text-text-muted">Real-time tracking of volatile items in your frequent purchases.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              activeTab === 'watchlist'
                ? 'border-primary/30 text-primary bg-primary/5 hover:bg-primary/10'
                : 'border-border text-text-muted hover:text-text hover:bg-surface-active'
            }`}
          >
            Watchlist ({watchedAlerts.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              activeTab === 'history'
                ? 'border-primary/30 text-primary bg-primary/5 hover:bg-primary/10'
                : 'border-border text-text-muted hover:text-text hover:bg-surface-active'
            }`}
          >
            History
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-bg text-xs uppercase text-text-muted font-semibold tracking-wider">
              <th className="px-6 py-4">Item Name</th>
              <th className="px-6 py-4">Current Price</th>
              <th className="px-6 py-4">Trend (7d)</th>
              <th className="px-6 py-4">Est. Savings</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visibleAlerts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-text-muted text-sm">
                  {activeTab === 'watchlist'
                    ? 'No watched items. Toggle notifications on items in History to add them.'
                    : 'No price alerts yet.'}
                </td>
              </tr>
            ) : (
              visibleAlerts.map((alert) => {
                const isDown = alert.priceChangePercent < 0;
                const isMuted = mutedIds.has(alert.id);
                return (
                  <tr key={alert.id} className="hover:bg-surface-active transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-active flex items-center justify-center">
                          <span className="material-symbols-outlined text-text-muted">nutrition</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-text">{alert.productName}</p>
                          <p className="text-[10px] text-text-muted">Last bought: {alert.lastBought}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-text">${alert.currentPrice.toFixed(2)}</p>
                      <p className={`text-[10px] ${isDown ? 'text-primary' : 'text-danger'}`}>{alert.priceChange}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-end gap-1 h-8 w-24">
                        {alert.trend.map((h, i) => (
                          <div
                            key={i}
                            className={`w-1 rounded-sm ${i === alert.trend.length - 1 ? (isDown ? 'bg-primary' : 'bg-rose-400') : 'bg-surface-active'}`}
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {alert.savings ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                          {alert.savings}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-surface-active text-text-muted">
                          No savings
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => toggleMuted(alert.id)}
                        title={isMuted ? 'Enable notifications' : 'Mute notifications'}
                        className={`p-2 rounded-full transition-colors ${
                          isMuted
                            ? 'text-text-muted hover:text-text hover:bg-surface-active'
                            : 'text-primary hover:text-primary/80 hover:bg-primary/10'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {isMuted ? 'notifications_off' : 'notifications_active'}
                        </span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
