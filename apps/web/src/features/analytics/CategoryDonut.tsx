import { DonutChart } from '@/components/ui/DonutChart';
import { useAnalyticsStore } from '@/store/analytics-store';

export function CategoryDonut() {
  const data = useAnalyticsStore((s) => s.data);
  const segments = data.categorySpending.map((c) => ({
    label: c.category,
    value: c.amount,
    color: c.color,
  }));
  const top = data.categorySpending[0];

  return (
    <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-text">Spending by Category</h3>
        <button className="text-text-muted hover:text-text">
          <span className="material-symbols-outlined text-[20px]">more_horiz</span>
        </button>
      </div>
      <DonutChart
        segments={segments}
        centerValue={`${top?.percentage || 0}%`}
        centerLabel={top?.category || ''}
      />
    </div>
  );
}
