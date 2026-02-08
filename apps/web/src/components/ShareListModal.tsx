import { useState, useEffect, useCallback } from 'react';
import type { ListShare, SharePermission } from '@shopwise/shared';
import { sharingService } from '@/services/sharing.service';
import { useAuthStore } from '@/store/auth-store';
import { Icon } from '@/components/ui/Icon';

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
      <div className="relative w-full max-w-md mx-4 rounded-xl bg-surface-dark border border-border-dark shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border-dark">
          <div>
            <h2 className="text-white text-lg font-bold">Share List</h2>
            <p className="text-text-secondary text-sm mt-0.5">{listTitle}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-text-secondary hover:text-white hover:bg-accent-green transition-colors">
            <Icon name="close" size={20} />
          </button>
        </div>
        {isOwner && (
          <form onSubmit={handleShare} className="p-5 border-b border-border-dark">
            <label className="block text-text-secondary text-xs font-medium uppercase tracking-wider mb-2">Invite collaborator</label>
            <div className="flex gap-2">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email address" className="flex-1 px-3 py-2 rounded-lg bg-background-dark border border-border-dark text-white text-sm placeholder:text-text-secondary/50 focus:outline-none focus:border-primary transition-colors" disabled={isSharing} />
              <select value={permission} onChange={(e) => setPermission(e.target.value as SharePermission)} className="px-3 py-2 rounded-lg bg-background-dark border border-border-dark text-white text-sm focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer" disabled={isSharing}>
                <option value="edit">Edit</option>
                <option value="view">View</option>
              </select>
            </div>
            <button type="submit" disabled={isSharing || !email.trim()} className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-emerald-400 text-background-dark text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(19,236,128,0.3)]">
              <Icon name="person_add" size={18} />
              {isSharing ? 'Sharing...' : 'Share'}
            </button>
          </form>
        )}
        {error && <div className="mx-5 mt-4 px-3 py-2 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">{error}</div>}
        {successMsg && <div className="mx-5 mt-4 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm">{successMsg}</div>}
        <div className="p-5">
          <h3 className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-3">Collaborators ({collaborators.length + 1})</h3>
          {isLoading ? <div className="py-6 text-center text-text-secondary text-sm">Loading...</div> : (
            <ul className="space-y-2">
              <li className="flex items-center gap-3 p-3 rounded-lg bg-background-dark/50">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0"><Icon name="person" size={16} className="text-primary" /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">{user?.id === ownerId ? 'You' : 'Owner'}</div>
                  <div className="text-text-secondary text-xs truncate">Owner</div>
                </div>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary border border-primary/20">Owner</span>
              </li>
              {collaborators.map((collab) => (
                <li key={collab.id} className="flex items-center gap-3 p-3 rounded-lg bg-background-dark/50">
                  <div className="w-8 h-8 rounded-full bg-accent-green flex items-center justify-center shrink-0">
                    {collab.userAvatarUrl ? <img src={collab.userAvatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" /> : <Icon name="person" size={16} className="text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate">{collab.userName || collab.userEmail || 'Unknown'}</div>
                    <div className="text-text-secondary text-xs truncate">{collab.userEmail}</div>
                  </div>
                  {isOwner ? (
                    <div className="flex items-center gap-1.5">
                      <select value={collab.permission} onChange={(e) => handlePermissionChange(collab.id, e.target.value as SharePermission)} className="px-2 py-1 rounded text-xs bg-background-dark border border-border-dark text-white focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer">
                        <option value="edit">Edit</option>
                        <option value="view">View</option>
                      </select>
                      <button onClick={() => handleRemove(collab.id)} className="p-1 rounded text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors" title="Remove collaborator">
                        <Icon name="close" size={16} />
                      </button>
                    </div>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-background-dark border border-border-dark text-text-secondary">{collab.permission === 'edit' ? 'Can edit' : 'View only'}</span>
                  )}
                </li>
              ))}
              {collaborators.length === 0 && <li className="py-4 text-center text-text-secondary text-sm">No collaborators yet. Invite someone above.</li>}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
