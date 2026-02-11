import { useNavigate } from 'react-router-dom';

const spikes = [
  { icon: 'egg', name: 'Org. Brown Eggs', desc: 'Dozen • Vital Farms', price: '$8.99', change: '$1.50' },
  { icon: 'nutrition', name: 'Avocados (4ct)', desc: 'Bag • Organic', price: '$6.49', change: '$0.50' },
  { icon: 'local_cafe', name: 'Cold Brew', desc: '48oz • Stok', price: '$5.99', change: '$0.30' },
];

export function PriceSpikeAlerts() {
  const navigate = useNavigate();

  return (
    <div className="rounded-xl bg-surface border border-border flex flex-col overflow-hidden">
      <div className="p-4 border-b border-border flex justify-between items-center bg-surface-alt">
        <h3 className="text-text font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-warning">warning</span>
          Price Spike Alerts
        </h3>
        <span className="bg-warning/20 text-warning text-xs font-bold px-2 py-0.5 rounded">3 Items</span>
      </div>
      <div className="divide-y divide-border">
        {spikes.map((item) => (
          <div key={item.name} className="p-4 hover:bg-surface-active/50 transition-colors flex justify-between items-center">
            <div className="flex gap-3">
              <div className="h-10 w-10 rounded bg-bg border border-border flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-text-muted">{item.icon}</span>
              </div>
              <div>
                <p className="text-text text-sm font-medium">{item.name}</p>
                <p className="text-text-muted text-xs">{item.desc}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-text font-mono font-bold">{item.price}</p>
              <p className="text-danger text-xs font-bold flex items-center justify-end gap-0.5">
                <span className="material-symbols-outlined text-[10px]">arrow_upward</span>
                {item.change}
              </p>
            </div>
          </div>
        ))}
      </div>
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
