import { StatCard } from '@/components/ui/StatCard';
import { ProgressBar } from '@/components/ui/ProgressBar';

export function BriefingKPIs() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard label="Total Spent" value="$142.50" trend={-0.5} trendLabel="0.5%" icon="payments" iconColor="text-text">
        <p className="text-text-muted text-xs mt-1">vs. 30-day average for similar basket size</p>
      </StatCard>
      <StatCard label="Total Saved" value="$24.10" trend={15.2} trendLabel="15.2%" icon="savings" highlight>
        <p className="text-primary/70 text-xs mt-1">High performance: You beat the market average.</p>
      </StatCard>
      <StatCard label="Efficiency Score" value="92/100" trend={12} trendLabel="+12 pts" icon="speed" iconColor="text-text">
        <ProgressBar value={92} className="mt-2" />
      </StatCard>
    </div>
  );
}
