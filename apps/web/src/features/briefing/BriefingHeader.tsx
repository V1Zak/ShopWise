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
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-primary text-sm font-bold uppercase tracking-wider mb-1">
          <span className="material-symbols-outlined text-sm">verified</span>
          Mission Complete
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Post-Shop Briefing</h1>
        <p className="text-gray-400 text-lg mt-1 flex items-center gap-2 flex-wrap">
          {storeName} <span className="w-1 h-1 bg-gray-600 rounded-full" /> {date} <span className="w-1 h-1 bg-gray-600 rounded-full" /> {itemCount} Items
        </p>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={onToggleEditing}
          className={`flex items-center justify-center h-10 px-5 rounded-lg text-sm font-medium transition-colors ${
            isEditing
              ? 'bg-primary text-background-dark font-bold shadow-[0_0_15px_rgba(19,236,128,0.3)]'
              : 'bg-accent-green hover:bg-[#2c5842] text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[18px] mr-2">{isEditing ? 'check' : 'edit'}</span>
          {isEditing ? 'Done Editing' : 'Edit Prices'}
        </button>
        <button
          onClick={handleShare}
          className="flex items-center justify-center h-10 px-5 rounded-lg bg-accent-green hover:bg-[#2c5842] text-white text-sm font-medium transition-colors"
        >
          <span className="material-symbols-outlined text-[18px] mr-2">share</span>
          Share Summary
        </button>
        <button
          onClick={onScrollToReceipt}
          className="flex items-center justify-center h-10 px-5 rounded-lg bg-primary hover:bg-primary/90 text-background-dark text-sm font-bold transition-colors shadow-[0_0_15px_rgba(19,236,128,0.3)]"
        >
          <span className="material-symbols-outlined text-[20px] mr-2">upload_file</span>
          Verify Receipt
        </button>
      </div>
    </header>
  );
}
