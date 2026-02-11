import { BarChart } from '@/components/ui/BarChart';
import { useAnalyticsStore } from '@/store/analytics-store';

export function MonthlyBarChart() {
  const data = useAnalyticsStore((s) => s.data);
  const barData = data.monthlySpending.map((m) => ({ label: m.month, value: m.amount }));
  const highestIdx = barData.reduce((maxI, b, i, arr) => (b.value > arr[maxI].value ? i : maxI), 0);

  return (
    <div className="lg:col-span-2 bg-surface rounded-xl border border-border p-6 shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-text">Monthly Expenditure</h3>
          <p className="text-xs text-text-muted">Breakdown of grocery costs over the last 6 months</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-3 w-3 rounded-full bg-primary" />
          <span className="text-xs text-text-muted">Spent</span>
        </div>
      </div>
      <BarChart data={barData} highlightIndex={highestIdx} />
    </div>
  );
}
