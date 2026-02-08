import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useNavigate } from 'react-router-dom';

const currencies = ['USD ($)', 'EUR (€)', 'GBP (£)', 'CAD (C$)', 'AUD (A$)'];

export function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const [currency, setCurrency] = useState(() => {
    try { return localStorage.getItem('sw_pref_currency') || 'USD ($)'; } catch { return 'USD ($)'; }
  });
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
      localStorage.setItem('sw_pref_currency', currency);
      localStorage.setItem('sw_pref_pushNotifications', String(pushNotifications));
      localStorage.setItem('sw_pref_emailDigest', String(emailDigest));
      localStorage.setItem('sw_pref_priceAlerts', String(priceAlerts));
      localStorage.setItem('sw_pref_listReminders', String(listReminders));
    } catch { /* localStorage unavailable */ }
  }, [currency, pushNotifications, emailDigest, priceAlerts, listReminders]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Sub-header */}
      <div className="sticky top-0 z-10 bg-background-dark/90 backdrop-blur-md border-b border-border-dark px-6 py-4">
        <h2 className="text-2xl font-bold text-white tracking-tight">Settings</h2>
        <p className="text-sm text-text-secondary hidden sm:block">
          Manage your profile, preferences, and account
        </p>
      </div>

      <div className="p-6 max-w-3xl mx-auto w-full flex flex-col gap-6">
        {/* Profile Section */}
        <section className="bg-surface-dark rounded-xl border border-border-dark overflow-hidden">
          <div className="px-6 py-4 border-b border-border-dark">
            <h3 className="text-lg font-semibold text-white">Profile</h3>
          </div>
          <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-background-dark font-bold text-xl flex-shrink-0">
                {initials}
              </div>
              <button className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="material-symbols-outlined text-white text-xl">photo_camera</span>
              </button>
            </div>

            {/* Name & Email */}
            <div className="flex flex-col gap-4 flex-1 w-full">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-surface-darker border border-border-dark rounded-lg px-4 py-2.5 text-white text-sm placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={displayEmail}
                  readOnly
                  className="w-full bg-surface-darker border border-border-dark rounded-lg px-4 py-2.5 text-text-secondary text-sm cursor-not-allowed"
                />
                <p className="text-xs text-text-secondary mt-1">
                  Email is managed through your authentication provider
                </p>
              </div>
            </div>
          </div>
          <div className="px-6 pb-6 flex justify-end">
            <button
              onClick={handleSave}
              className="bg-primary hover:bg-primary/90 text-background-dark px-5 py-2 rounded-lg text-sm font-bold transition-colors"
            >
              {saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
        </section>

        {/* Preferences Section */}
        <section className="bg-surface-dark rounded-xl border border-border-dark overflow-hidden">
          <div className="px-6 py-4 border-b border-border-dark">
            <h3 className="text-lg font-semibold text-white">Preferences</h3>
          </div>
          <div className="p-6 flex flex-col gap-6">
            {/* Currency */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Default Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full sm:w-64 bg-surface-darker border border-border-dark rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors appearance-none cursor-pointer"
              >
                {currencies.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Notification Toggles */}
            <div className="flex flex-col gap-1">
              <h4 className="text-sm font-medium text-white mb-3">Notifications</h4>

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
        <section className="bg-surface-dark rounded-xl border border-border-dark overflow-hidden">
          <div className="px-6 py-4 border-b border-border-dark">
            <h3 className="text-lg font-semibold text-white">Account</h3>
          </div>
          <div className="p-6 flex flex-col gap-6">
            {/* Change Password */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Change Password</p>
                <p className="text-xs text-text-secondary mt-0.5">
                  Update your password to keep your account secure
                </p>
              </div>
              <button
                disabled
                title="Coming soon"
                className="flex items-center gap-2 border border-border-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors opacity-50 cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[18px]">lock</span>
                Update
              </button>
            </div>

            {/* Sign Out */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Sign Out</p>
                <p className="text-xs text-text-secondary mt-0.5">
                  Sign out of your account on this device
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 border border-border-dark hover:border-primary/50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Sign Out
              </button>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-surface-dark rounded-xl border border-red-900/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-red-900/50">
            <h3 className="text-lg font-semibold text-red-400">Danger Zone</h3>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Delete Account</p>
                <p className="text-xs text-text-secondary mt-0.5">
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
                    className="border border-border-dark text-text-secondary hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    disabled
                    title="Coming soon"
                    className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors opacity-50 cursor-not-allowed"
                  >
                    Confirm Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
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
    <div className="flex items-center justify-between py-3 border-b border-border-dark last:border-b-0">
      <div className="pr-4">
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-text-secondary mt-0.5">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
          checked ? 'bg-primary' : 'bg-border-dark'
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
