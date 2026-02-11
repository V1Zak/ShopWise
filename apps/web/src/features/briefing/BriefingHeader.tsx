import { useCallback } from 'react';

interface BriefingHeaderProps {
  storeName: string;
  date: string;
  itemCount: number;
  totalSpent: number;
  totalSaved: number;
  isEditing: boolean;
  onToggleEditing: () => void;
  onScrollToReceipt: () => void;
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Clipboard API not available -- silent fallback
  }
}

export function BriefingHeader({
  storeName,
  date,
  itemCount,
  totalSpent,
  totalSaved,
  isEditing,
  onToggleEditing,
  onScrollToReceipt,
}: BriefingHeaderProps) {
  const handleShare = useCallback(async () => {
    const summaryText = [
      'ShopWise Post-Shop Briefing',
      `Store: ${storeName}`,
      `Date: ${date}`,
      `Items: ${itemCount}`,
      `Total Spent: $${totalSpent.toFixed(2)}`,
      `Total Saved: $${totalSaved.toFixed(2)}`,
    ].join('\n');

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ShopWise Trip Summary',
          text: summaryText,
        });
      } catch (err) {
        if ((err as DOMException).name !== 'AbortError') {
          await copyToClipboard(summaryText);
        }
      }
    } else {
      await copyToClipboard(summaryText);
    }
  }, [storeName, date, itemCount, totalSpent, totalSaved]);

  return (
    <header className="mb-8">
      {/* Savings hero */}
      {totalSaved > 0 && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl px-6 py-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-primary text-2xl">savings</span>
            </div>
            <div>
              <p className="text-text-muted text-sm">You saved today</p>
              <p className="text-primary text-3xl font-black">${totalSaved.toFixed(2)}</p>
            </div>
          </div>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-text-inv text-sm font-bold hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">share</span>
            Share Summary
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-primary text-sm font-bold uppercase tracking-wider mb-1">
            <span className="material-symbols-outlined text-sm">verified</span>
            Session Complete
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-text tracking-tight">Post-Shop Briefing</h1>
          <p className="text-text-muted text-lg mt-1 flex items-center gap-2 flex-wrap">
            {storeName} <span className="w-1 h-1 bg-text-muted rounded-full" /> {date} <span className="w-1 h-1 bg-text-muted rounded-full" /> {itemCount} Items
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={onToggleEditing}
            className={`flex items-center justify-center h-10 px-5 rounded-lg text-sm font-medium transition-colors ${
              isEditing
                ? 'bg-primary text-text-inv font-bold shadow-[0_0_15px_rgba(var(--color-primary)/0.3)]'
                : 'bg-surface border border-border hover:border-primary/50 text-text'
            }`}
          >
            <span className="material-symbols-outlined text-[18px] mr-2">{isEditing ? 'check' : 'edit'}</span>
            {isEditing ? 'Done Editing' : 'Edit Prices'}
          </button>
          <button
            onClick={onScrollToReceipt}
            className="flex items-center justify-center h-10 px-5 rounded-lg bg-primary hover:bg-primary/90 text-text-inv text-sm font-bold transition-colors"
          >
            <span className="material-symbols-outlined text-[20px] mr-2">upload_file</span>
            Verify Receipt
          </button>
        </div>
      </div>
    </header>
  );
}
