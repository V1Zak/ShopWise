import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useUIStore } from '@/store/ui-store';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { SUPPORTED_CURRENCIES } from '@/utils/currency';

export function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);
  const currency = useUIStore((s) => s.currency);
  const setCurrency = useUIStore((s) => s.setCurrency);
  const navigate = useNavigate();

  const [pushNotifications, setPushNotifications] = useState(() => {
    try { return localStorage.getItem('sw_pref_pushNotifications') !== 'false'; } catch { return true; }
  });
  const [emailDigest, setEmailDigest] = useState(() => {
    try { return localStorage.getItem('sw_pref_emailDigest') === 'true'; } catch { return false; }
  });
  const [priceAlerts, setPriceAlerts] = useState(() => {
    try { return localStorage.getItem('sw_pref_priceAlerts') !== 'false'; } catch { return true; }
  });
  const [listReminders, setListReminders] = useState(() => {
    try { return localStorage.getItem('sw_pref_listReminders') !== 'false'; } catch { return true; }
  });

  useEffect(() => {
    try {
      localStorage.setItem('sw_pref_pushNotifications', String(pushNotifications));
      localStorage.setItem('sw_pref_emailDigest', String(emailDigest));
      localStorage.setItem('sw_pref_priceAlerts', String(priceAlerts));
      localStorage.setItem('sw_pref_listReminders', String(listReminders));
    } catch { /* localStorage unavailable */ }
  }, [pushNotifications, emailDigest, priceAlerts, listReminders]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const displayName = user?.name || 'User';
  const displayEmail = user?.email || 'user@example.com';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const [editName, setEditName] = useState(displayName);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Avatar
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Delete
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('profiles').update({ name: editName.trim() }).eq('id', user.id);
      if (error) throw error;
      useAuthStore.setState({ user: { ...user, name: editName.trim() } });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith('image/')) return;

    setUploadingAvatar(true);
    try {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      const newUrl = data.publicUrl;

      const { error: updateError } = await supabase.from('profiles').update({ avatar_url: newUrl }).eq('id', user.id);
      if (updateError) throw updateError;

      setAvatarUrl(newUrl);
      useAuthStore.setState({ user: { ...user, avatarUrl: newUrl } });
    } catch (err) {
      console.error('Failed to upload avatar:', err);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      // Delete user data (lists, items, etc. cascade via FK)
      await supabase.from('shopping_lists').delete().eq('owner_id', user.id);
      await supabase.from('profiles').delete().eq('id', user.id);
      await logout();
      navigate('/auth');
    } catch (err) {
      console.error('Failed to delete account:', err);
      setDeleting(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Sub-header */}
      <div className="sticky top-0 z-10 bg-bg/90 backdrop-blur-md border-b border-border px-6 py-4">
        <h2 className="text-2xl font-bold text-text tracking-tight">Settings</h2>
        <p className="text-sm text-text-muted hidden sm:block">
          Manage your profile, preferences, and account
        </p>
      </div>

      <div className="p-6 max-w-3xl mx-auto w-full flex flex-col gap-6">
        {/* Profile Section */}
        <section className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-lg font-semibold text-text">Profile</h3>
          </div>
          <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-text-inv font-bold text-xl flex-shrink-0 overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
              >
                {uploadingAvatar ? (
                  <span className="material-symbols-outlined text-white text-xl animate-spin">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-white text-xl">photo_camera</span>
                )}
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>

            {/* Name & Email */}
            <div className="flex flex-col gap-4 flex-1 w-full">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-surface-alt border border-border rounded-lg px-4 py-2.5 text-text text-sm placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={displayEmail}
                  readOnly
                  className="w-full bg-surface-alt border border-border rounded-lg px-4 py-2.5 text-text-muted text-sm cursor-not-allowed"
                />
                <p className="text-xs text-text-muted mt-1">
                  Email is managed through your authentication provider
                </p>
              </div>
            </div>
          </div>
          <div className="px-6 pb-6 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary hover:bg-primary/90 text-text-inv px-5 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
            >
              {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </section>

        {/* Preferences Section */}
        <section className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-lg font-semibold text-text">Preferences</h3>
          </div>
          <div className="p-6 flex flex-col gap-6">
            {/* Currency */}
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">
                Default Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full sm:w-64 bg-surface-alt border border-border rounded-lg px-4 py-2.5 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors appearance-none cursor-pointer"
              >
                {SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Theme */}
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">
                Appearance
              </label>
              <div className="flex gap-2">
                {([['light', 'light_mode', 'Light'], ['dark', 'dark_mode', 'Dark'], ['system', 'desktop_windows', 'System']] as const).map(([val, icon, label]) => (
                  <button
                    key={val}
                    onClick={() => setTheme(val)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                      theme === val
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'bg-surface-alt border-border text-text-muted hover:text-text hover:border-border'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{icon}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notification Toggles */}
            <div className="flex flex-col gap-1">
              <h4 className="text-sm font-medium text-text mb-3">Notifications</h4>

              <ToggleRow
                label="Push Notifications"
                description="Get notified about shared list updates and reminders"
                checked={pushNotifications}
                onChange={setPushNotifications}
              />
              <ToggleRow
                label="Weekly Email Digest"
                description="Receive a weekly summary of your shopping activity"
                checked={emailDigest}
                onChange={setEmailDigest}
              />
              <ToggleRow
                label="Price Alerts"
                description="Get notified when tracked item prices change"
                checked={priceAlerts}
                onChange={setPriceAlerts}
              />
              <ToggleRow
                label="List Reminders"
                description="Remind me about upcoming scheduled shopping trips"
                checked={listReminders}
                onChange={setListReminders}
              />
            </div>
          </div>
        </section>

        {/* Account Section */}
        <section className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-lg font-semibold text-text">Account</h3>
          </div>
          <div className="p-6 flex flex-col gap-6">
            {/* Change Password */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text">Change Password</p>
                <p className="text-xs text-text-muted mt-0.5">
                  Update your password to keep your account secure
                </p>
              </div>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="flex items-center gap-2 border border-border hover:border-primary/50 text-text px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">lock</span>
                Update
              </button>
            </div>

            {/* Sign Out */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text">Sign Out</p>
                <p className="text-xs text-text-muted mt-0.5">
                  Sign out of your account on this device
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 border border-border hover:border-primary/50 text-text px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Sign Out
              </button>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-surface rounded-xl border border-red-900/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-red-900/50">
            <h3 className="text-lg font-semibold text-red-400">Danger Zone</h3>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text">Delete Account</p>
                <p className="text-xs text-text-muted mt-0.5">
                  Permanently remove your account and all data. This action cannot be undone.
                </p>
              </div>
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 border border-red-900/50 hover:bg-red-900/20 text-red-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0"
                >
                  <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                  Delete
                </button>
              ) : (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="border border-border text-text-muted hover:text-text px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                  >
                    {deleting ? 'Deleting...' : 'Confirm Delete'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </div>
  );
}

/* ---- Change Password Modal ---- */

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSaving(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;
      setSuccess(true);
      setTimeout(onClose, 1500);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm mx-4 rounded-xl border border-border bg-bg shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-lg font-bold text-text">Change Password</h2>
          <button onClick={onClose} className="rounded-full p-1 text-text-muted hover:bg-surface-active hover:text-text transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-text-muted">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
              placeholder="At least 8 characters"
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-text-muted">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
              placeholder="Repeat your password"
            />
          </div>
          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}
          {success && (
            <p className="text-sm text-primary">Password updated successfully!</p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-text-muted hover:text-text transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || success}
              className="bg-primary hover:bg-primary/90 text-text-inv px-5 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
            >
              {saving ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---- Toggle Row Component ---- */

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
      <div className="pr-4">
        <p className="text-sm font-medium text-text">{label}</p>
        <p className="text-xs text-text-muted mt-0.5">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
          checked ? 'bg-primary' : 'bg-border'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
