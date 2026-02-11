import { Icon } from '@/components/ui/Icon';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDeleteModal({ isOpen, title, message, onConfirm, onCancel }: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm mx-4 rounded-xl bg-surface border border-border shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-red-400 text-[22px]">warning</span>
            </div>
            <h2 className="text-text text-lg font-bold">{title}</h2>
          </div>
          <button onClick={onCancel} className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-active transition-colors">
            <Icon name="close" size={20} />
          </button>
        </div>
        <div className="p-5">
          <p className="text-text-muted text-sm leading-relaxed">{message}</p>
        </div>
        <div className="flex items-center gap-3 p-5 pt-0">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-lg bg-surface-active text-text text-sm font-medium hover:bg-surface-active/80 transition-colors border border-border"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-lg bg-red-500/20 text-red-400 text-sm font-bold hover:bg-red-500/30 transition-colors border border-red-500/30"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
