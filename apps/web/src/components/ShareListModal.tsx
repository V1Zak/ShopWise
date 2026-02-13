import { useState, useEffect, useCallback } from 'react';
import type { ListShare, SharePermission } from '@shopwise/shared';
import { sharingService } from '@/services/sharing.service';
import { useAuthStore } from '@/store/auth-store';
import { Icon } from '@/components/ui/Icon';

function ShareLinkSection({ listId }: { listId: string }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/list/${listId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* fallback */ }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: 'ShopWise Shopping List', url: shareUrl }); }
      catch { /* cancelled */ }
    }
  };

  return (
    <div className="px-5 py-4 border-b border-border">
      <label className="block text-text-muted text-xs font-medium uppercase tracking-wider mb-2">Anyone with the link</label>
      <div className="flex gap-2">
        <div className="flex-1 px-3 py-2 rounded-lg bg-bg border border-border text-text-muted text-sm truncate">{shareUrl}</div>
        <button onClick={handleCopy} className="px-3 py-2 rounded-lg border border-border text-text-muted hover:text-text hover:border-primary/50 transition-colors text-sm">
          <span aria-hidden="true" className="material-symbols-outlined text-[18px]">{copied ? 'check' : 'content_copy'}</span>
        </button>
        {typeof navigator.share === 'function' && (
          <button onClick={handleNativeShare} className="px-3 py-2 rounded-lg border border-border text-text-muted hover:text-text hover:border-primary/50 transition-colors text-sm">
            <span aria-hidden="true" className="material-symbols-outlined text-[18px]">share</span>
          </button>
        )}
      </div>
      <p className="text-text-muted text-xs mt-2">
        <span aria-hidden="true" className="material-symbols-outlined text-[14px] align-middle mr-1">info</span>
        Editors can add and remove items. Viewers can only see the list.
      </p>
    </div>
  );
}

interface ShareListModalProps { listId: string; listTitle: string; ownerId: string; isOpen: boolean; onClose: () => void; }

export function ShareListModal({ listId, listTitle, ownerId, isOpen, onClose }: ShareListModalProps) {
  const user = useAuthStore((s) => s.user);
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<SharePermission>('edit');
  const [collaborators, setCollaborators] = useState<ListShare[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const isOwner = user?.id === ownerId;

  const loadCollaborators = useCallback(async () => {
    setIsLoading(true);
    try { const shares = await sharingService.getSharedUsers(listId); setCollaborators(shares); }
    catch { setError('Failed to load collaborators'); }
    finally { setIsLoading(false); }
  }, [listId]);

  useEffect(() => { if (isOpen) { loadCollaborators(); setEmail(''); setError(null); setSuccessMsg(null); } }, [isOpen, loadCollaborators]);

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSharing(true); setError(null); setSuccessMsg(null);
    try {
      const newShare = await sharingService.shareList(listId, email.trim(), permission);
      setCollaborators((prev) => [...prev, newShare]);
      setEmail('');
      setSuccessMsg('Shared with ' + (newShare.userName || newShare.userEmail));
    } catch (err) { setError((err as Error).message); }
    finally { setIsSharing(false); }
  };

  const handleRemove = async (shareId: string) => {
    try { await sharingService.removeShare(shareId); setCollaborators((prev) => prev.filter((c) => c.id !== shareId)); }
    catch { setError('Failed to remove collaborator'); }
  };

  const handlePermissionChange = async (shareId: string, newPerm: SharePermission) => {
    try { await sharingService.updateSharePermission(shareId, newPerm); setCollaborators((prev) => prev.map((c) => c.id === shareId ? { ...c, permission: newPerm } : c)); }
    catch { setError('Failed to update permission'); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 rounded-xl bg-surface border border-border shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="text-text text-lg font-bold">Share List</h2>
            <p className="text-text-muted text-sm mt-0.5">{listTitle}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-active transition-colors">
            <Icon name="close" size={20} />
          </button>
        </div>
        <ShareLinkSection listId={listId} />
        {isOwner && (
          <form onSubmit={handleShare} className="p-5 border-b border-border">
            <label className="block text-text-muted text-xs font-medium uppercase tracking-wider mb-2">Invite collaborator</label>
            <div className="flex gap-2">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email address" className="flex-1 px-3 py-2 rounded-lg bg-bg border border-border text-text text-sm placeholder:text-text-muted/50 focus:outline-none focus:border-primary transition-colors" disabled={isSharing} />
              <select value={permission} onChange={(e) => setPermission(e.target.value as SharePermission)} className="px-3 py-2 rounded-lg bg-bg border border-border text-text text-sm focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer" disabled={isSharing}>
                <option value="edit">Edit</option>
                <option value="view">View</option>
              </select>
            </div>
            <button type="submit" disabled={isSharing || !email.trim()} className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-emerald-400 text-text-inv text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(19,236,128,0.3)]">
              <Icon name="person_add" size={18} />
              {isSharing ? 'Sharing...' : 'Share'}
            </button>
          </form>
        )}
        {error && <div className="mx-5 mt-4 px-3 py-2 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">{error}</div>}
        {successMsg && <div className="mx-5 mt-4 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm">{successMsg}</div>}
        <div className="p-5">
          <h3 className="text-text-muted text-xs font-medium uppercase tracking-wider mb-3">Collaborators ({collaborators.length + 1})</h3>
          {isLoading ? <div className="py-6 text-center text-text-muted text-sm">Loading...</div> : (
            <ul className="space-y-2">
              <li className="flex items-center gap-3 p-3 rounded-lg bg-bg/50">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0"><Icon name="person" size={16} className="text-primary" /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-text text-sm font-medium truncate">{user?.id === ownerId ? 'You' : 'Owner'}</div>
                  <div className="text-text-muted text-xs truncate">Owner</div>
                </div>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary border border-primary/20">Owner</span>
              </li>
              {collaborators.map((collab) => (
                <li key={collab.id} className="flex items-center gap-3 p-3 rounded-lg bg-bg/50">
                  <div className="w-8 h-8 rounded-full bg-surface-active flex items-center justify-center shrink-0">
                    {collab.userAvatarUrl ? <img src={collab.userAvatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" /> : <Icon name="person" size={16} className="text-text" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-text text-sm font-medium truncate">{collab.userName || collab.userEmail || 'Unknown'}</div>
                    <div className="text-text-muted text-xs truncate">{collab.userEmail}</div>
                  </div>
                  {isOwner ? (
                    <div className="flex items-center gap-1.5">
                      <select value={collab.permission} onChange={(e) => handlePermissionChange(collab.id, e.target.value as SharePermission)} className="px-2 py-1 rounded text-xs bg-bg border border-border text-text focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer">
                        <option value="edit">Edit</option>
                        <option value="view">View</option>
                      </select>
                      <button onClick={() => handleRemove(collab.id)} className="p-1 rounded text-text-muted hover:text-danger hover:bg-danger/10 transition-colors" title="Remove collaborator">
                        <Icon name="close" size={16} />
                      </button>
                    </div>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-bg border border-border text-text-muted">{collab.permission === 'edit' ? 'Can edit' : 'View only'}</span>
                  )}
                </li>
              ))}
              {collaborators.length === 0 && <li className="py-4 text-center text-text-muted text-sm">No collaborators yet. Invite someone above.</li>}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
