import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useListsStore } from '@/store/lists-store';
import { StoreSelector } from '@/components/StoreSelector';
import { Icon } from '@/components/ui/Icon';

interface NewListDialogProps {
  open: boolean;
  onClose: () => void;
}

export function NewListDialog({ open, onClose }: NewListDialogProps) {
  const [title, setTitle] = useState('');
  const [storeId, setStoreId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createList = useListsStore((s) => s.createList);
  const navigate = useNavigate();

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSubmitting(true);
    try {
      const listId = await createList({ title: title.trim(), storeId: storeId ?? undefined });
      onClose();
      setTitle('');
      setStoreId(null);
      navigate(`/list/${listId}`);
    } catch {
      // stay open for retry
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-md mx-4 rounded-2xl border border-border-dark bg-surface-dark shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border-dark">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-lg text-primary"><Icon name="playlist_add" size={22} /></div>
            <h2 className="text-white text-lg font-bold">New Shopping List</h2>
          </div>
          <button type="button" onClick={onClose} className="text-text-secondary hover:text-white p-1 rounded-lg hover:bg-background-dark transition-colors"><Icon name="close" size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">List Name</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Weekly Groceries" autoFocus
              className="w-full rounded-lg bg-background-dark border border-border-dark py-3 px-4 text-sm placeholder-text-secondary text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Store <span className="text-text-secondary/60">(optional)</span></label>
            <StoreSelector value={storeId} onChange={setStoreId} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:text-white border border-border-dark hover:bg-background-dark transition-colors">Cancel</button>
            <button type="submit" disabled={!title.trim() || isSubmitting}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold bg-primary hover:bg-emerald-400 text-background-dark transition-colors shadow-[0_0_15px_rgba(19,236,128,0.3)] disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? 'Creating...' : 'Create List'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
