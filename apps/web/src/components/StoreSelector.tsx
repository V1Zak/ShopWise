import { useState, useEffect, useRef } from 'react';
import { useStoresStore } from '@/store/stores-store';
import { Icon } from '@/components/ui/Icon';

const PRESET_COLORS = [
  '#13ec80', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#84cc16', '#6366f1',
];

interface StoreSelectorProps {
  value: string | null;
  onChange: (storeId: string | null) => void;
}

export function StoreSelector({ value, onChange }: StoreSelectorProps) {
  const stores = useStoresStore((s) => s.stores);
  const isLoading = useStoresStore((s) => s.isLoading);
  const fetchStores = useStoresStore((s) => s.fetchStores);
  const createStore = useStoresStore((s) => s.createStore);

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [isCreating, setIsCreating] = useState(false);

  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus();
  }, [open]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setShowNewForm(false);
        setSearch('');
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const selectedStore = stores.find((s) => s.id === value);
  const filtered = stores.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));

  const handleSelect = (id: string) => { onChange(id); setOpen(false); setSearch(''); setShowNewForm(false); };
  const handleClear = (e: React.MouseEvent) => { e.stopPropagation(); onChange(null); };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setIsCreating(true);
    try {
      const store = await createStore({ name: newName.trim(), color: newColor });
      onChange(store.id);
      setNewName('');
      setNewColor(PRESET_COLORS[0]);
      setShowNewForm(false);
      setOpen(false);
    } catch {
      // leave form open for retry
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <div role="button" tabIndex={0} onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen((o) => !o); } }}
        className="flex items-center gap-2 w-full rounded-lg border border-border bg-surface text-left transition-colors hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none px-4 py-3 text-sm cursor-pointer">
        {selectedStore ? (
          <>
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: selectedStore.color }} />
            <span className="text-text flex-1 truncate">{selectedStore.name}</span>
            <button type="button" onClick={handleClear} className="text-text-muted hover:text-text transition-colors p-0.5"><Icon name="close" size={16} /></button>
          </>
        ) : (
          <>
            <Icon name="store" className="text-text-muted" size={18} />
            <span className="text-text-muted flex-1">Select a store...</span>
          </>
        )}
        <Icon name={open ? 'expand_less' : 'expand_more'} className="text-text-muted" size={18} />
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl border border-border bg-surface shadow-2xl overflow-hidden">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Icon name="search" size={18} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input ref={searchRef} type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search stores..."
                className="w-full rounded-lg bg-bg border border-border py-2 pl-8 pr-3 text-sm placeholder-text-muted text-text focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all" />
            </div>
          </div>
          <div className="max-h-[220px] overflow-y-auto py-1">
            {isLoading ? (<div className="px-4 py-6 text-center text-text-muted text-sm">Loading stores...</div>
            ) : filtered.length === 0 ? (<div className="px-4 py-6 text-center text-text-muted text-sm">{search ? 'No stores match your search' : 'No stores yet'}</div>
            ) : (filtered.map((store) => (
                <button key={store.id} type="button" onClick={() => handleSelect(store.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${value === store.id ? 'bg-primary/15 text-primary font-semibold' : 'text-text hover:bg-bg'}`}>
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: store.color }} />
                  <span className="flex-1 truncate">{store.name}</span>
                  {store.location && <span className="text-xs text-text-muted truncate max-w-[120px]">{store.location}</span>}
                  {value === store.id && <Icon name="check" size={18} className="text-primary flex-shrink-0" />}
                </button>
              ))
            )}
          </div>
          <div className="border-t border-border" />
          {!showNewForm ? (
            <button type="button" onClick={() => setShowNewForm(true)}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-primary hover:bg-bg transition-colors">
              <Icon name="add_circle" size={18} /><span className="font-medium">Add new store</span>
            </button>
          ) : (
            <div className="p-3 space-y-3">
              <div className="text-xs font-medium text-text-muted uppercase tracking-wider">New Store</div>
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Store name" autoFocus
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') { setShowNewForm(false); setNewName(''); } }}
                className="w-full rounded-lg bg-bg border border-border py-2 px-3 text-sm placeholder-text-muted text-text focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all" />
              <div>
                <div className="text-xs text-text-muted mb-1.5">Color</div>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_COLORS.map((color) => (
                    <button key={color} type="button" onClick={() => setNewColor(color)}
                      className={`w-6 h-6 rounded-full transition-all ${newColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-surface scale-110' : 'hover:scale-110'}`}
                      style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => { setShowNewForm(false); setNewName(''); }}
                  className="flex-1 py-2 rounded-lg text-sm font-medium text-text-muted hover:text-text hover:bg-bg transition-colors">Cancel</button>
                <button type="button" onClick={handleCreate} disabled={!newName.trim() || isCreating}
                  className="flex-1 py-2 rounded-lg text-sm font-bold bg-primary hover:bg-emerald-400 text-text-inv transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {isCreating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
