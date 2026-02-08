import { ProgressBar } from '@/components/ui/ProgressBar';

const categories = [
  { name: 'Produce', pct: 45, color: 'bg-primary' },
  { name: 'Protein', pct: 30, color: 'bg-[#2c9f65]' },
  { name: 'Pantry', pct: 15, color: 'bg-[#1f5c3f]' },
  { name: 'Beverages', pct: 10, color: 'bg-[#1a3d2c]' },
];

export function BriefingCategoryBreakdown() {
  return (
    <div className="rounded-xl bg-surface-dark border border-border-dark p-5">
      <h3 className="text-white font-bold text-sm mb-4">Spend by Category</h3>
      <div className="space-y-4">
        {categories.map((cat) => (
          <div key={cat.name} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-300">{cat.name}</span>
              <span className="text-white font-mono">{cat.pct}%</span>
            </div>
            <ProgressBar value={cat.pct} color={cat.color} />
          </div>
        ))}
      </div>
    </div>
  );
}
