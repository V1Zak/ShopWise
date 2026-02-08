import { useProductsStore } from '@/store/products-store';
import { SearchInput } from '@/components/ui/SearchInput';

export function CatalogToolbar() {
  const searchQuery = useProductsStore((s) => s.searchQuery);
  const setSearch = useProductsStore((s) => s.setSearch);
  const viewMode = useProductsStore((s) => s.viewMode);
  const setViewMode = useProductsStore((s) => s.setViewMode);

  return (
    <div className="px-6 lg:px-10 py-4 border-b border-border-dark flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
      <div className="w-full md:w-auto md:flex-1 md:max-w-xl">
        <SearchInput
          value={searchQuery}
          onChange={setSearch}
          placeholder="Search by SKU, product name, or tag (e.g. 'Organic Milk')"
        />
      </div>
      <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
        <button
          onClick={() => setViewMode('grid')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
            viewMode === 'grid'
              ? 'bg-primary text-black font-bold'
              : 'bg-surface-dark border border-border-dark text-text-secondary hover:text-white'
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
              : 'bg-surface-dark border border-border-dark text-text-secondary hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">list</span>
          List
        </button>
        <div className="w-px h-6 bg-border-dark mx-1" />
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-dark border border-border-dark text-text-secondary hover:text-white transition-all text-sm font-medium whitespace-nowrap">
          <span className="material-symbols-outlined text-[18px]">tune</span>
          Filters
        </button>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-dark border border-border-dark text-text-secondary hover:text-white transition-all text-sm font-medium whitespace-nowrap">
          <span className="material-symbols-outlined text-[18px]">sort</span>
          Sort: Volatility
        </button>
      </div>
    </div>
  );
}
