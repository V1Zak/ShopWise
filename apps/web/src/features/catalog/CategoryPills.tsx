import { useProductsStore } from '@/store/products-store';
import { CATEGORIES } from '@shopwise/shared';
import { FilterChip } from '@/components/ui/FilterChip';

export function CategoryPills() {
  const activeCategory = useProductsStore((s) => s.activeCategory);
  const setCategory = useProductsStore((s) => s.setCategory);

  return (
    <div className="px-6 lg:px-10 py-3 flex gap-2 overflow-x-auto border-b border-border-dark">
      <FilterChip
        label="All Categories"
        active={activeCategory === 'all'}
        onClick={() => setCategory('all')}
      />
      {CATEGORIES.filter((c) => c.id !== 'other').map((cat) => (
        <FilterChip
          key={cat.id}
          label={cat.name}
          active={activeCategory === cat.id}
          onClick={() => setCategory(cat.id)}
        />
      ))}
    </div>
  );
}
