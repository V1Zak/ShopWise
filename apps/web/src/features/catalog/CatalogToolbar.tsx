import { useState } from 'react';
import { useProductsStore, type SortBy, type SortDirection } from '@/store/products-store';
import { SearchInput } from '@/components/ui/SearchInput';
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown';
import { useCurrency } from '@/hooks/useCurrency';

interface SortOption {
  label: string;
  sortBy: SortBy;
  direction: SortDirection;
  icon: string;
}

const SORT_OPTIONS: SortOption[] = [
  { label: 'Name A-Z', sortBy: 'name', direction: 'asc', icon: 'sort_by_alpha' },
  { label: 'Name Z-A', sortBy: 'name', direction: 'desc', icon: 'sort_by_alpha' },
  { label: 'Price: Low to High', sortBy: 'price', direction: 'asc', icon: 'arrow_upward' },
  { label: 'Price: High to Low', sortBy: 'price', direction: 'desc', icon: 'arrow_downward' },
  { label: 'Volatility', sortBy: 'volatility', direction: 'desc', icon: 'trending_up' },
];

function getSortLabel(sortBy: SortBy, direction: SortDirection): string {
  const match = SORT_OPTIONS.find((o) => o.sortBy === sortBy && o.direction === direction);
  return match ? match.label : 'Name A-Z';
}

export function CatalogToolbar() {
  const { symbol } = useCurrency();
  const searchQuery = useProductsStore((s) => s.searchQuery);
  const setSearch = useProductsStore((s) => s.setSearch);
  const viewMode = useProductsStore((s) => s.viewMode);
  const setViewMode = useProductsStore((s) => s.setViewMode);
  const sortBy = useProductsStore((s) => s.sortBy);
  const sortDirection = useProductsStore((s) => s.sortDirection);
  const setSort = useProductsStore((s) => s.setSort);
  const priceRange = useProductsStore((s) => s.priceRange);
  const setPriceFilter = useProductsStore((s) => s.setPriceFilter);
  const clearPriceFilter = useProductsStore((s) => s.clearPriceFilter);

  const [minInput, setMinInput] = useState('');
  const [maxInput, setMaxInput] = useState('');
  const hasPriceFilter = priceRange.min !== null || priceRange.max !== null;

  function handleApplyPrice() {
    const min = minInput ? parseFloat(minInput) : null;
    const max = maxInput ? parseFloat(maxInput) : null;
    if (min !== null && isNaN(min)) return;
    if (max !== null && isNaN(max)) return;
    setPriceFilter(min, max);
  }

  function handleClearPrice() {
    setMinInput('');
    setMaxInput('');
    clearPriceFilter();
  }

  return (
    <div className="px-6 lg:px-10 py-4 border-b border-border flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
      <div className="w-full md:w-auto md:flex-1 md:max-w-xl">
        <SearchInput
          value={searchQuery}
          onChange={setSearch}
          placeholder="Search by SKU, product name, or tag (e.g. 'Organic Milk')"
        />
      </div>
      <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-none -mx-2 px-2">
        <button
          onClick={() => useProductsStore.getState().setCreatingProduct(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-black text-sm font-bold whitespace-nowrap hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          Add Product
        </button>
        <div className="w-px h-6 bg-border mx-1" />
        <button
          onClick={() => setViewMode('grid')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
            viewMode === 'grid'
              ? 'bg-primary text-black font-bold'
              : 'bg-surface border border-border text-text-muted hover:text-text'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">grid_view</span>
          Grid
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
            viewMode === 'list'
              ? 'bg-primary text-black font-bold'
              : 'bg-surface border border-border text-text-muted hover:text-text'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">list</span>
          List
        </button>
        <div className="w-px h-6 bg-border mx-1" />
        <Dropdown
          align="right"
          trigger={
            <button
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                hasPriceFilter
                  ? 'bg-primary/15 border border-primary/40 text-primary'
                  : 'bg-surface border border-border text-text-muted hover:text-text'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              Filters
              {hasPriceFilter && <span className="ml-1 w-2 h-2 rounded-full bg-primary" />}
            </button>
          }
        >
          <div className="p-4 w-[260px]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Price Range</span>
              {hasPriceFilter && (
                <button onClick={handleClearPrice} className="text-xs text-primary hover:underline">Clear</button>
              )}
            </div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1">
                <label className="text-[11px] text-text-muted mb-1 block">Min ({symbol})</label>
                <input type="number" min="0" step="0.01" placeholder="0.00" value={minInput}
                  onChange={(e) => setMinInput(e.target.value)}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text placeholder-text-muted outline-none focus:border-primary transition-colors" />
              </div>
              <span className="text-text-muted pt-4">-</span>
              <div className="flex-1">
                <label className="text-[11px] text-text-muted mb-1 block">Max ({symbol})</label>
                <input type="number" min="0" step="0.01" placeholder="999" value={maxInput}
                  onChange={(e) => setMaxInput(e.target.value)}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text placeholder-text-muted outline-none focus:border-primary transition-colors" />
              </div>
            </div>
            <button onClick={handleApplyPrice}
              className="w-full py-2 rounded-lg bg-primary text-black text-sm font-bold hover:bg-primary/90 transition-colors">
              Apply
            </button>
          </div>
        </Dropdown>
        <Dropdown
          align="right"
          trigger={
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-border text-text-muted hover:text-text transition-all text-sm font-medium whitespace-nowrap">
              <span className="material-symbols-outlined text-[18px]">sort</span>
              Sort: {getSortLabel(sortBy, sortDirection)}
            </button>
          }
        >
          {SORT_OPTIONS.map((option) => (
            <DropdownItem
              key={`${option.sortBy}-${option.direction}`}
              label={option.label}
              icon={option.icon}
              active={sortBy === option.sortBy && sortDirection === option.direction}
              onClick={() => setSort(option.sortBy, option.direction)}
            />
          ))}
        </Dropdown>
      </div>
    </div>
  );
}
