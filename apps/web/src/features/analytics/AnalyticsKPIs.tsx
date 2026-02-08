import { StatCard } from '@/components/ui/StatCard';
import { useAnalyticsStore } from '@/store/analytics-store';

export function AnalyticsKPIs() {
  const data = useAnalyticsStore((s) => s.data);
  const isLoading = useAnalyticsStore((s) => s.isLoading);
  const isEmpty = !isLoading && data.totalSpentYTD === 0 && data.monthlyAverage === 0 && data.totalSavings === 0;

  if (isEmpty) {
    return (
      <div className="rounded-xl border border-border-dark bg-surface-dark p-12 text-center">
        <span className="material-symbols-outlined text-5xl text-text-secondary/30 mb-3 block">analytics</span>
        <p className="text-white font-semibold text-lg mb-1">No analytics data yet</p>
        <p className="text-text-secondary text-sm max-w-md mx-auto">
          Complete your first shopping trip to start tracking spending patterns, savings, and category breakdowns.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard
        label="Total Spent (YTD)"
        value={`$${data.totalSpentYTD.toLocaleString()}`}
        trend={data.totalSpentChange}
        trendLabel={`${data.totalSpentChange}%`}
        icon="payments"
      />
      <StatCard
        label="Monthly Average"
        value={`$${data.monthlyAverage.toLocaleString()}`}
        trend={-data.monthlyAverageChange}
        trendLabel={`${data.monthlyAverageChange}%`}
        icon="calendar_month"
      />
      <StatCard
        label="Total Savings"
        value={`$${data.totalSavings.toFixed(2)}`}
        trend={data.savingsRate}
        trendLabel={`${data.savingsRate}%`}
        icon="savings"
        highlight
      />
    </div>
  );
}
