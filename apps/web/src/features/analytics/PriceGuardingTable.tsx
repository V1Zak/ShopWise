import { useAnalyticsStore } from '@/store/analytics-store';

export function PriceGuardingTable() {
  const data = useAnalyticsStore((s) => s.data);

  return (
    <div className="bg-surface-dark rounded-xl border border-border-dark shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border-dark flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">shield_lock</span>
            Price Guarding & Alerts
          </h3>
          <p className="text-xs text-text-secondary">Real-time tracking of volatile items in your frequent purchases.</p>
        </div>
        <div className="flex gap-2">
          <button className="text-xs font-medium px-3 py-1.5 rounded-full border border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 transition-colors">
            Watchlist (12)
          </button>
          <button className="text-xs font-medium px-3 py-1.5 rounded-full border border-border-dark text-text-secondary hover:text-white hover:bg-accent-green transition-colors">
            History
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-background-dark text-xs uppercase text-text-secondary font-semibold tracking-wider">
              <th className="px-6 py-4">Item Name</th>
              <th className="px-6 py-4">Current Price</th>
              <th className="px-6 py-4">Trend (7d)</th>
              <th className="px-6 py-4">Est. Savings</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-dark">
            {data.priceAlerts.map((alert) => {
              const isDown = alert.priceChangePercent < 0;
              return (
                <tr key={alert.id} className="hover:bg-[#1a3328] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent-green flex items-center justify-center">
                        <span className="material-symbols-outlined text-text-secondary">nutrition</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{alert.productName}</p>
                        <p className="text-[10px] text-text-secondary">Last bought: {alert.lastBought}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-white">${alert.currentPrice.toFixed(2)}</p>
                    <p className={`text-[10px] ${isDown ? 'text-primary' : 'text-rose-400'}`}>{alert.priceChange}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-end gap-1 h-8 w-24">
                      {alert.trend.map((h, i) => (
                        <div
                          key={i}
                          className={`w-1 rounded-sm ${i === alert.trend.length - 1 ? (isDown ? 'bg-primary' : 'bg-rose-400') : 'bg-accent-green'}`}
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
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-accent-green text-text-secondary">
                        No savings
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-accent-green transition-colors">
                      <span className="material-symbols-outlined text-[20px]">
                        {alert.savings ? 'notifications_active' : 'notifications_off'}
                      </span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
