import { useTripsStore } from '@/store/trips-store';

export function HistoryFilters() {
  const searchQuery = useTripsStore((s) => s.searchQuery);
  const setSearch = useTripsStore((s) => s.setSearch);

  return (
    <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-surface-dark p-2 rounded-xl border border-border-dark">
      <div className="flex flex-1 w-full md:w-auto items-center gap-2 bg-background-dark rounded-lg px-3 py-2 border border-border-dark focus-within:border-primary transition-colors">
        <span className="material-symbols-outlined text-slate-400">search</span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-none outline-none text-white placeholder-slate-500 w-full text-sm focus:ring-0 p-0"
          placeholder="Search items, stores, or dates..."
        />
      </div>
      <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-background-dark font-bold text-sm whitespace-nowrap">
          All Time
          <span className="material-symbols-outlined text-[18px]">expand_more</span>
        </button>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent-green hover:bg-[#2d5c45] text-white text-sm whitespace-nowrap transition-colors">
          Store: All
          <span className="material-symbols-outlined text-[18px]">expand_more</span>
        </button>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent-green hover:bg-[#2d5c45] text-white text-sm whitespace-nowrap transition-colors">
          Price Range
          <span className="material-symbols-outlined text-[18px]">expand_more</span>
        </button>
      </div>
    </div>
  );
}
