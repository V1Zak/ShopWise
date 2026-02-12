import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useListsStore } from '@/store/lists-store';
import { ShareListModal } from '@/components/ShareListModal';
import { ConfirmDeleteModal } from '@/components/ConfirmDeleteModal';
import { Icon } from '@/components/ui/Icon';
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown';
import { useCurrency } from '@/hooks/useCurrency';
import { useListPermission } from '@/hooks/useListPermission';

interface ListHeaderProps { onScanClick?: () => void; }

export function ListHeader({ onScanClick }: ListHeaderProps) {
  const navigate = useNavigate();
  const activeListId = useListsStore((s) => s.activeListId);
  const lists = useListsStore((s) => s.lists);
  const getRunningTotal = useListsStore((s) => s.getRunningTotal);
  const items = useListsStore((s) => s.items);
  const saveAsTemplate = useListsStore((s) => s.saveAsTemplate);
  const updateList = useListsStore((s) => s.updateList);
  const deleteList = useListsStore((s) => s.deleteList);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { formatPrice } = useCurrency();
  const { canEdit } = useListPermission();

  const list = lists.find((l) => l.id === activeListId);
  const total = getRunningTotal(activeListId);
  const allItems = items.filter((i) => i.listId === activeListId);
  const collaboratorCount = list?.collaboratorCount ?? 0;

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inline title editing state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleStartEditTitle = () => {
    if (!list) return;
    setEditTitle(list.title);
    setIsEditingTitle(true);
  };

  const handleSaveTitle = () => {
    const trimmed = editTitle.trim();
    if (trimmed && list && trimmed !== list.title) {
      updateList(activeListId, { title: trimmed });
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
    }
  };

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

  const handleDeleteList = async () => {
    try {
      await deleteList(activeListId);
      navigate('/');
    } catch {
      setError('Failed to delete list');
      setTimeout(() => setError(null), 4000);
    }
    setIsDeleteModalOpen(false);
  };

  return (
    <>
      <div className="p-4 sm:p-6 pb-2 border-b border-border">
        <div className="hidden sm:flex flex-wrap gap-2 mb-4">
          <span className="text-text-muted text-xs font-medium uppercase tracking-wider">Home</span>
          <span className="text-text-muted text-xs font-medium">/</span>
          <span className="text-text-muted text-xs font-medium uppercase tracking-wider">{list?.storeName}</span>
          <span className="text-text-muted text-xs font-medium">/</span>
          <span className="text-primary text-xs font-medium uppercase tracking-wider">Active List</span>
        </div>
        <div className="flex justify-between items-start sm:items-end gap-3 mb-3 sm:mb-6">
          <div className="min-w-0 flex-1">
            <h1 className="text-text text-xl sm:text-3xl font-bold leading-tight mb-1">
              {isEditingTitle && canEdit ? (
                <input
                  ref={titleInputRef}
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={handleSaveTitle}
                  onKeyDown={handleTitleKeyDown}
                  className="w-full bg-bg border border-primary rounded px-2 py-1 text-text text-xl sm:text-3xl font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                />
              ) : canEdit ? (
                <button
                  onClick={handleStartEditTitle}
                  className="inline-flex items-center gap-1 text-text hover:text-primary transition-colors group text-left"
                  title="Click to edit list title"
                >
                  <span className="truncate">{list?.title || 'Shopping List'}</span>
                  <span className="material-symbols-outlined text-[16px] text-text-muted group-hover:text-primary transition-colors flex-shrink-0">edit</span>
                </button>
              ) : (
                <span className="truncate">{list?.title || 'Shopping List'}</span>
              )}
            </h1>
            <p className="text-text-muted text-sm truncate">
              {allItems.length} Items
              {list?.storeName && <> &bull; {list.storeName}</>}
              {list?.sharedPermission && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-400/10 text-blue-400 border border-blue-400/20">
                  Shared ({list.sharedPermission})
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {canEdit && (
              <Dropdown
                align="right"
                trigger={
                  <button className="flex items-center justify-center w-9 h-9 rounded-lg bg-surface-active text-text hover:bg-surface-active/80 transition-colors" title="More actions">
                    <span className="material-symbols-outlined text-[20px]">more_vert</span>
                  </button>
                }
              >
                <DropdownItem
                  label={saving ? 'Saving...' : saved ? 'Saved as Template' : 'Save as Template'}
                  icon={saved ? 'bookmark_added' : 'bookmark'}
                  onClick={handleSaveAsTemplate}
                />
                <DropdownItem
                  label="Delete List"
                  icon="delete"
                  onClick={() => setIsDeleteModalOpen(true)}
                />
              </Dropdown>
            )}
            {error && (
              <span className="text-red-400 text-sm font-medium">{error}</span>
            )}
            <button onClick={() => setIsShareModalOpen(true)} className="relative flex items-center justify-center w-9 h-9 sm:w-auto sm:h-auto sm:gap-2 sm:px-4 sm:py-2 rounded-lg bg-surface-active text-text text-sm font-medium hover:bg-surface-active/80 transition-colors">
              <Icon name="share" size={18} />
              <span className="hidden sm:inline">Share</span>
              {collaboratorCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-primary text-text-inv text-[10px] font-bold px-1">{collaboratorCount}</span>
              )}
            </button>
            {onScanClick && canEdit && (
              <button onClick={onScanClick} className="flex items-center justify-center w-9 h-9 sm:w-auto sm:h-auto sm:gap-2 sm:px-4 sm:py-2 rounded-lg bg-surface-active text-text text-sm font-medium hover:bg-surface-active/80 transition-colors">
                <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
                <span className="hidden sm:inline">Scan</span>
              </button>
            )}
            <div className="text-right hidden sm:block">
              <div className="text-sm text-text-muted font-medium mb-1">Running Total</div>
              <div className="text-3xl font-bold text-primary tabular-nums">{formatPrice(total)}</div>
            </div>
            <div className="text-right sm:hidden">
              <div className="text-xl font-bold text-primary tabular-nums">{formatPrice(total)}</div>
            </div>
          </div>
        </div>
      </div>
      {list && (
        <ShareListModal listId={list.id} listTitle={list.title} ownerId={list.ownerId} isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} />
      )}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        title="Delete List"
        message={`Are you sure you want to delete "${list?.title ?? 'this list'}"? This action cannot be undone.`}
        onConfirm={handleDeleteList}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </>
  );
}
