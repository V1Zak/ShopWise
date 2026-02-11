import { ProgressBar } from '@/components/ui/ProgressBar';
import type { CategoryBreakdown } from '@shopwise/shared';

interface Props {
  categories: CategoryBreakdown[];
}

const opacityLevels = ['bg-primary', 'bg-primary', 'bg-primary/60', 'bg-primary/30'];

export function BriefingCategoryBreakdown({ categories }: Props) {
  return (
    <div className="rounded-xl bg-surface border border-border p-5">
      <h3 className="text-text font-bold text-sm mb-4">Spend by Category</h3>
      {categories.length === 0 ? (
        <div className="flex flex-col items-center py-6 text-text-muted">
          <span className="material-symbols-outlined text-[28px] mb-2">category</span>
          <p className="text-sm">No category data for this trip</p>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((cat, i) => (
            <div key={cat.category} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-text-muted">{cat.category}</span>
                <span className="text-text font-mono">{cat.percentage}%</span>
              </div>
              <ProgressBar value={cat.percentage} color={opacityLevels[i] ?? 'bg-primary/20'} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
