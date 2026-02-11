import { ProgressBar } from '@/components/ui/ProgressBar';

const categories = [
  { name: 'Produce', pct: 45, color: 'bg-primary' },
  { name: 'Protein', pct: 30, color: 'bg-primary' },
  { name: 'Pantry', pct: 15, color: 'bg-primary/60' },
  { name: 'Beverages', pct: 10, color: 'bg-primary/30' },
];

export function BriefingCategoryBreakdown() {
  return (
    <div className="rounded-xl bg-surface border border-border p-5">
      <h3 className="text-text font-bold text-sm mb-4">Spend by Category</h3>
      <div className="space-y-4">
        {categories.map((cat) => (
          <div key={cat.name} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">{cat.name}</span>
              <span className="text-text font-mono">{cat.pct}%</span>
            </div>
            <ProgressBar value={cat.pct} color={cat.color} />
          </div>
        ))}
      </div>
    </div>
  );
}
