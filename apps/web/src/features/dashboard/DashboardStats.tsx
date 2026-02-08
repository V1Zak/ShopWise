import { StatCard } from '@/components/ui/StatCard';
import { ProgressBar } from '@/components/ui/ProgressBar';

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard label="Monthly Budget" value="$450.00" trend={5} icon="account_balance_wallet">
        <ProgressBar value={65} className="mb-2" />
        <p className="text-xs text-text-secondary text-right">65% used</p>
      </StatCard>

      <StatCard label="Projected Spend" value="$385.20" trend={-2} icon="trending_up" iconColor="text-blue-400">
        <div className="h-8 flex items-end gap-1 opacity-70">
          <div className="w-1/6 bg-primary/30 h-1/3 rounded-t-sm" />
          <div className="w-1/6 bg-primary/40 h-1/2 rounded-t-sm" />
          <div className="w-1/6 bg-primary/50 h-2/3 rounded-t-sm" />
          <div className="w-1/6 bg-primary/40 h-1/2 rounded-t-sm" />
          <div className="w-1/6 bg-primary/60 h-3/4 rounded-t-sm" />
          <div className="w-1/6 bg-primary h-full rounded-t-sm" />
        </div>
      </StatCard>

      <StatCard label="Items Tracked" value="142" trend={12} trendLabel="+12 New" icon="inventory" iconColor="text-purple-400">
        <div className="flex gap-2 mt-2">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-background-dark rounded text-xs text-text-secondary">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            3 Low Stock
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-background-dark rounded text-xs text-text-secondary">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
            5 Expiring
          </div>
        </div>
      </StatCard>
    </div>
  );
}
