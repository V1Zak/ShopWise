import { useEffect, useCallback } from 'react';
import { AnalyticsKPIs } from '@/features/analytics/AnalyticsKPIs';
import { MonthlyBarChart } from '@/features/analytics/MonthlyBarChart';
import { CategoryDonut } from '@/features/analytics/CategoryDonut';
import { PriceGuardingTable } from '@/features/analytics/PriceGuardingTable';
import { ToggleGroup } from '@/components/ui/ToggleGroup';
import { useAnalyticsStore } from '@/store/analytics-store';
import type { AnalyticsPeriod } from '@/services/analytics.service';
import { exportAnalyticsReport } from '@/utils/export';

export function SpendingAnalyticsPage() {
  const period = useAnalyticsStore((s) => s.period);
  const setPeriod = useAnalyticsStore((s) => s.setPeriod);
  const fetchAnalytics = useAnalyticsStore((s) => s.fetchAnalytics);
  const analyticsData = useAnalyticsStore((s) => s.data);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleExportReport = useCallback(() => {
    exportAnalyticsReport(analyticsData, period);
  }, [analyticsData, period]);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Sub-header */}
      <div className="sticky top-0 z-10 bg-background-dark/90 backdrop-blur-md border-b border-border-dark px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Spending Analytics</h2>
          <p className="text-sm text-text-secondary hidden sm:block">Track expenses and savings in real-time</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Mobile: dropdown select */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as AnalyticsPeriod)}
            className="sm:hidden bg-surface-dark text-white border border-border-dark rounded-lg px-3 py-2 text-sm"
          >
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
            <option value="Quarterly">Quarterly</option>
            <option value="YTD">YTD</option>
          </select>
          {/* Desktop: toggle group */}
          <div className="hidden sm:block">
            <ToggleGroup
              options={['Weekly', 'Monthly', 'Quarterly', 'YTD']}
              value={period}
              onChange={(v) => setPeriod(v as AnalyticsPeriod)}
            />
          </div>
          <button
            onClick={handleExportReport}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-background-dark px-4 py-2 rounded-lg text-sm font-bold transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span className="hidden sm:inline">Export Report</span>
          </button>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto w-full flex flex-col gap-6">
        <AnalyticsKPIs />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <MonthlyBarChart />
          <CategoryDonut />
        </div>
        <PriceGuardingTable />
      </div>
    </div>
  );
}
