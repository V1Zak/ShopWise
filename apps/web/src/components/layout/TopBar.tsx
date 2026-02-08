import { useState } from 'react';

export function TopBar() {
  const [quickAdd, setQuickAdd] = useState('');

  return (
    <header className="w-full border-b border-border-dark bg-background-dark/95 backdrop-blur z-20 sticky top-0">
      <div className="max-w-[1600px] mx-auto px-6 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col">
          <h2 className="text-white text-xl font-bold">Good evening, Alex.</h2>
          <p className="text-text-secondary text-sm">
            You are <span className="text-primary font-medium">$15 under budget</span> for this month.
          </p>
        </div>

        {/* Quick Add Bar */}
        <div className="flex-1 max-w-2xl w-full mx-auto md:mx-0 md:ml-12 relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-text-secondary group-focus-within:text-primary transition-colors">
              add_circle
            </span>
          </div>
          <input
            type="text"
            value={quickAdd}
            onChange={(e) => setQuickAdd(e.target.value)}
            className="w-full bg-surface-dark text-white border border-border-dark rounded-lg py-3 pl-10 pr-24 focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-text-secondary/70 transition-all shadow-sm"
            placeholder="Add item to list or track price (e.g. 'Milk $4.50')..."
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded border border-border-dark bg-background-dark text-xs font-sans text-text-secondary">
              <span className="text-[10px]">&#8984;</span> K
            </kbd>
            <button className="ml-2 bg-primary hover:bg-emerald-400 text-background-dark text-xs font-bold px-3 py-1.5 rounded transition-colors">
              Add
            </button>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4 pl-4">
          <button className="p-2 text-text-secondary hover:text-white hover:bg-accent-green rounded-full transition-colors relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary ring-2 ring-background-dark"></span>
          </button>
        </div>
      </div>
    </header>
  );
}
