import { StatCard } from '@/components/ui/StatCard';

export function HistoryStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard label="Total Spend YTD" value="$4,285.50" trend={2.5} icon="payments" iconColor="text-white" />
      <StatCard label="Avg Savings" value="12.4%" trend={-1.1} icon="savings" iconColor="text-white" />
      <StatCard label="Top Source" value="Whole Foods" trend={5} trendLabel="+5 visits" icon="storefront" iconColor="text-white" />
    </div>
  );
}
