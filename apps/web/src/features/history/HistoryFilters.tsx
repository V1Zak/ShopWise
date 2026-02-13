import { useState } from 'react';
import { useTripsStore, type DateRange } from '@/store/trips-store';
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown';

const DATE_RANGE_OPTIONS: { label: string; value: DateRange }[] = [
  { label: 'All Time', value: 'all' },
  { label: 'Past Week', value: 'week' },
  { label: 'Past Month', value: 'month' },
  { label: 'Past Quarter', value: 'quarter' },
  { label: 'Past Year', value: 'year' },
];

function getDateRangeLabel(range: DateRange): string {
  return DATE_RANGE_OPTIONS.find((o) => o.value === range)?.label ?? 'All Time';
}

export function HistoryFilters() {
  const searchQuery = useTripsStore((s) => s.searchQuery);
  const setSearch = useTripsStore((s) => s.setSearch);
  const dateRange = useTripsStore((s) => s.dateRange);
  const setDateRange = useTripsStore((s) => s.setDateRange);
  const storeFilter = useTripsStore((s) => s.storeFilter);
  const setStoreFilter = useTripsStore((s) => s.setStoreFilter);
  const getUniqueStores = useTripsStore((s) => s.getUniqueStores);
  const spentRange = useTripsStore((s) => s.spentRange);
  const setSpentRange = useTripsStore((s) => s.setSpentRange);
  const clearSpentRange = useTripsStore((s) => s.clearSpentRange);

  const stores = getUniqueStores();
  const selectedStoreName = storeFilter
    ? stores.find((s) => s.id === storeFilter)?.name ?? 'Unknown'
    : 'All';

  const [minInput, setMinInput] = useState('');
  const [maxInput, setMaxInput] = useState('');
  const hasSpentFilter = spentRange.min !== null || spentRange.max !== null;

  function handleApplySpent() {
    const min = minInput ? parseFloat(minInput) : null;
    const max = maxInput ? parseFloat(maxInput) : null;
    if (min !== null && isNaN(min)) return;
    if (max !== null && isNaN(max)) return;
    setSpentRange(min, max);
  }

  function handleClearSpent() {
    setMinInput('');
    setMaxInput('');
    clearSpentRange();
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-surface p-2 rounded-xl border border-border">
      <div className="flex flex-1 w-full md:w-auto items-center gap-2 bg-bg rounded-lg px-3 py-2 border border-border focus-within:border-primary transition-colors">
        <span aria-hidden="true" className="material-symbols-outlined text-text-muted">search</span>
        <input type="text" value={searchQuery} onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-none outline-none text-text placeholder-text-muted w-full text-sm focus:ring-0 p-0"
          placeholder="Search items, stores, or dates..." />
      </div>
      <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
        <Dropdown
          trigger={
            <button className="flex items-center gap-2 px-3 py-2 min-h-[44px] rounded-lg font-bold text-sm whitespace-nowrap transition-colors bg-primary text-text-inv">
              {getDateRangeLabel(dateRange)}
              <span aria-hidden="true" className="material-symbols-outlined text-[18px]">expand_more</span>
            </button>
          }
        >
          {DATE_RANGE_OPTIONS.map((option) => (
            <DropdownItem key={option.value} label={option.label} active={dateRange === option.value}
              onClick={() => setDateRange(option.value)} />
          ))}
        </Dropdown>
        <Dropdown
          trigger={
            <button className={`flex items-center gap-2 px-3 py-2 min-h-[44px] rounded-lg text-sm whitespace-nowrap transition-colors ${
              storeFilter ? 'bg-primary/15 border border-primary/40 text-primary font-semibold' : 'bg-surface-active hover:bg-surface-active/80 text-text'
            }`}>
              Store: {selectedStoreName}
              <span aria-hidden="true" className="material-symbols-outlined text-[18px]">expand_more</span>
            </button>
          }
        >
          <DropdownItem label="All Stores" active={storeFilter === null} onClick={() => setStoreFilter(null)} icon="storefront" />
          {stores.length > 0 && <div className="border-t border-border my-1" />}
          {stores.map((store) => (
            <DropdownItem key={store.id} label={store.name} active={storeFilter === store.id}
              onClick={() => setStoreFilter(store.id)} icon="store" />
          ))}
        </Dropdown>
        <Dropdown
          align="right"
          trigger={
            <button className={`flex items-center gap-2 px-3 py-2 min-h-[44px] rounded-lg text-sm whitespace-nowrap transition-colors ${
              hasSpentFilter ? 'bg-primary/15 border border-primary/40 text-primary font-semibold' : 'bg-surface-active hover:bg-surface-active/80 text-text'
            }`}>
              {hasSpentFilter ? `$${spentRange.min ?? 0} - $${spentRange.max ?? '...'}` : 'Total Spent'}
              <span aria-hidden="true" className="material-symbols-outlined text-[18px]">expand_more</span>
            </button>
          }
        >
          <div className="p-4 w-[260px]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Total Spent Range</span>
              {hasSpentFilter && (
                <button onClick={handleClearSpent} className="text-xs text-primary hover:underline">Clear</button>
              )}
            </div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1">
                <label className="text-[11px] text-text-muted mb-1 block">Min ($)</label>
                <input type="number" min="0" step="1" placeholder="0" value={minInput}
                  onChange={(e) => setMinInput(e.target.value)}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text placeholder-text-muted outline-none focus:border-primary transition-colors" />
              </div>
              <span className="text-text-muted pt-4">-</span>
              <div className="flex-1">
                <label className="text-[11px] text-text-muted mb-1 block">Max ($)</label>
                <input type="number" min="0" step="1" placeholder="999" value={maxInput}
                  onChange={(e) => setMaxInput(e.target.value)}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text placeholder-text-muted outline-none focus:border-primary transition-colors" />
              </div>
            </div>
            <button onClick={handleApplySpent}
              className="w-full py-2 rounded-lg bg-primary text-black text-sm font-bold hover:bg-primary/90 transition-colors">
              Apply
            </button>
          </div>
        </Dropdown>
      </div>
    </div>
  );
}
