import { useState } from 'react';
import { useListsStore } from '@/store/lists-store';
import { useAuthStore } from '@/store/auth-store';
import { ShareListModal } from '@/components/ShareListModal';
import { Icon } from '@/components/ui/Icon';

interface ListHeaderProps { onScanClick?: () => void; }

export function ListHeader({ onScanClick }: ListHeaderProps) {
  const activeListId = useListsStore((s) => s.activeListId);
  const lists = useListsStore((s) => s.lists);
  const getRunningTotal = useListsStore((s) => s.getRunningTotal);
  const items = useListsStore((s) => s.items);
  const user = useAuthStore((s) => s.user);
  const saveAsTemplate = useListsStore((s) => s.saveAsTemplate);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const list = lists.find((l) => l.id === activeListId);
  const total = getRunningTotal(activeListId);
  const allItems = items.filter((i) => i.listId === activeListId);
  const collaboratorCount = list?.collaboratorCount ?? 0;

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSaveAsTemplate = async () => {
    if (!list || saving) return;
    setSaving(true);
    setError(null);
    try {
      await saveAsTemplate(activeListId, `${list.title} (Template)`);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save template';
      setError(message);
      setTimeout(() => setError(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="p-6 pb-2 border-b border-border-dark">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-text-secondary text-xs font-medium uppercase tracking-wider">Home</span>
          <span className="text-text-secondary text-xs font-medium">/</span>
          <span className="text-text-secondary text-xs font-medium uppercase tracking-wider">{list?.storeName}</span>
          <span className="text-text-secondary text-xs font-medium">/</span>
          <span className="text-primary text-xs font-medium uppercase tracking-wider">Active List</span>
        </div>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-white text-3xl font-bold leading-tight mb-1">Active Shopping Trip</h1>
            <p className="text-text-secondary text-sm">
              Target: {list?.title} &bull; {allItems.length} Items
              {list?.sharedPermission && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-400/10 text-blue-400 border border-blue-400/20">
                  Shared ({list.sharedPermission})
                </span>
              )}
            </p>
          </div>
          <div className="flex items-end gap-3">
            <button
              onClick={handleSaveAsTemplate}
              disabled={saving || saved}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                saved
                  ? 'bg-primary/20 text-primary'
                  : 'bg-accent-green text-white hover:bg-[#2d5c45]'
              }`}
              title="Save as Template"
            >
              <span className="material-symbols-outlined text-[18px]">
                {saved ? 'bookmark_added' : 'bookmark'}
              </span>
              {saving ? 'Saving...' : saved ? 'Saved' : 'Save as Template'}
            </button>
            {error && (
              <span className="text-red-400 text-sm font-medium">{error}</span>
            )}
            <button onClick={() => setIsShareModalOpen(true)} className="relative flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-green text-white text-sm font-medium hover:bg-[#2d5c45] transition-colors">
              <Icon name="share" size={18} />
              Share
              {collaboratorCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-primary text-background-dark text-[10px] font-bold px-1">{collaboratorCount}</span>
              )}
            </button>
            {onScanClick && (
              <button onClick={onScanClick} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-green text-white text-sm font-medium hover:bg-[#2d5c45] transition-colors">
                <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
                Scan
              </button>
            )}
            <div className="text-right">
              <div className="text-sm text-text-secondary font-medium mb-1">Running Total</div>
              <div className="text-3xl font-bold text-primary tabular-nums">${total.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>
      {list && (
        <ShareListModal listId={list.id} listTitle={list.title} ownerId={list.ownerId} isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} />
      )}
    </>
  );
}
