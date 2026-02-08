import { useState, useRef, useEffect } from 'react';
import { useListsStore } from '@/store/lists-store';
import { useAuthStore } from '@/store/auth-store';
import { listsService } from '@/services/lists.service';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function TopBar() {
  const [quickAdd, setQuickAdd] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const lists = useListsStore((s) => s.lists).filter((l) => !l.isTemplate);
  const user = useAuthStore((s) => s.user);
  const firstName = user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'there';

  // Close notification panel on click outside
  useEffect(() => {
    if (!showNotifications) return;
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showNotifications]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleQuickAdd = async () => {
    const text = quickAdd.trim();
    if (!text) return;

    // Parse: "Milk $4.50" → name: "Milk", price: 4.50
    const priceMatch = text.match(/\$(\d+(?:\.\d+)?)/);
    const price = priceMatch ? parseFloat(priceMatch[1]) : 0;
    const name = text.replace(/\$\d+(?:\.\d+)?/, '').trim();

    if (!name) {
      setToast('Please enter an item name');
      return;
    }

    // Find the first active list, or create one
    let targetList = lists[0];
    if (!targetList) {
      try {
        const row = await listsService.createList({ title: 'My Shopping List' });
        targetList = { id: row.id, title: 'My Shopping List', ownerId: '', isTemplate: false, itemCount: 0, estimatedTotal: 0, createdAt: '', updatedAt: '' };
        useListsStore.getState().fetchLists();
      } catch {
        setToast('Failed to create list');
        return;
      }
    }

    try {
      await listsService.addItem({
        listId: targetList.id,
        name,
        categoryId: 'other',
        estimatedPrice: price,
      });
      setQuickAdd('');
      setToast(`"${name}" added to ${targetList.title}${price ? ` at $${price.toFixed(2)}` : ''}`);
    } catch {
      setToast('Failed to add item');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleQuickAdd();
    }
  };

  return (
    <header className="w-full border-b border-border-dark bg-background-dark/95 backdrop-blur z-20 sticky top-0">
      <div className="max-w-[1600px] mx-auto px-6 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col">
          <h2 className="text-white text-xl font-bold">{getGreeting()}, {firstName}.</h2>
          <p className="text-text-secondary text-sm">
            You have <span className="text-primary font-medium">{lists.length} active {lists.length === 1 ? 'list' : 'lists'}</span> this month.
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
            onKeyDown={handleKeyDown}
            className="w-full bg-surface-dark text-white border border-border-dark rounded-lg py-3 pl-10 pr-24 focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-text-secondary/70 transition-all shadow-sm"
            placeholder="Add item to list or track price (e.g. 'Milk $4.50')..."
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded border border-border-dark bg-background-dark text-xs font-sans text-text-secondary">
              <span className="text-[10px]">&#8984;</span> K
            </kbd>
            <button
              onClick={handleQuickAdd}
              className="ml-2 bg-primary hover:bg-emerald-400 text-background-dark text-xs font-bold px-3 py-1.5 rounded transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4 pl-4 relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications((v) => !v)}
            aria-label="Notifications"
            className="p-2 text-text-secondary hover:text-white hover:bg-accent-green rounded-full transition-colors relative"
          >
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary ring-2 ring-background-dark"></span>
          </button>

          {/* Notification Panel */}
          {showNotifications && (
            <div className="absolute top-full right-0 mt-2 w-80 rounded-xl border border-border-dark bg-surface-dark shadow-2xl z-50">
              <div className="px-4 py-3 border-b border-border-dark flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Notifications</h3>
                <span className="text-xs text-text-secondary">All caught up</span>
              </div>
              <div className="p-6 text-center">
                <span className="material-symbols-outlined text-3xl text-text-secondary/30 mb-2 block">notifications_none</span>
                <p className="text-text-secondary text-sm">No new notifications</p>
                <p className="text-text-secondary/60 text-xs mt-1">
                  Price alerts, shared list updates, and reminders will appear here.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-surface-dark border border-border-dark rounded-lg px-4 py-3 shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
          <span className="text-sm text-white">{toast}</span>
        </div>
      )}
    </header>
  );
}
