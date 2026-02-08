import { StatCard } from '@/components/ui/StatCard';
import { useAnalyticsStore } from '@/store/analytics-store';

export function AnalyticsKPIs() {
  const data = useAnalyticsStore((s) => s.data);

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
