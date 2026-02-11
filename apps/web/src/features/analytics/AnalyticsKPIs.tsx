import { StatCard } from '@/components/ui/StatCard';
import { useAnalyticsStore } from '@/store/analytics-store';
import { useCurrency } from '@/hooks/useCurrency';

export function AnalyticsKPIs() {
  const data = useAnalyticsStore((s) => s.data);
  const isLoading = useAnalyticsStore((s) => s.isLoading);
  const { formatPrice } = useCurrency();
  const isEmpty = !isLoading && data.totalSpentYTD === 0 && data.monthlyAverage === 0 && data.totalSavings === 0;

  if (isEmpty) {
    return (
      <div className="rounded-xl border border-border bg-surface p-12 text-center">
        <span className="material-symbols-outlined text-5xl text-text-muted/30 mb-3 block">analytics</span>
        <p className="text-text font-semibold text-lg mb-1">No analytics data yet</p>
        <p className="text-text-muted text-sm max-w-md mx-auto">
          Complete your first shopping trip to start tracking spending patterns, savings, and category breakdowns.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard
        label="Total Spent (YTD)"
        value={formatPrice(data.totalSpentYTD)}
        trend={data.totalSpentChange}
        trendLabel={`${data.totalSpentChange}%`}
        icon="payments"
      />
      <StatCard
        label="Monthly Average"
        value={formatPrice(data.monthlyAverage)}
        trend={-data.monthlyAverageChange}
        trendLabel={`${data.monthlyAverageChange}%`}
        icon="calendar_month"
      />
      <StatCard
        label="Total Savings"
        value={formatPrice(data.totalSavings)}
        trend={data.savingsRate}
        trendLabel={`${data.savingsRate}%`}
        icon="savings"
        highlight
      />
    </div>
  );
}
