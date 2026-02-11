import { create } from 'zustand';
import { DEFAULT_CURRENCY, SUPPORTED_CURRENCIES } from '@/utils/currency';

type Theme = 'light' | 'dark' | 'system';

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  const resolved = theme === 'system' ? getSystemTheme() : theme;
  document.documentElement.classList.toggle('dark', resolved === 'dark');
  // Update meta theme-color for mobile browsers
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', resolved === 'dark' ? '#11221a' : '#ffffff');
  }
}

function loadTheme(): Theme {
  const stored = localStorage.getItem('sw_theme');
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  return 'system';
}

function loadCurrency(): string {
  try {
    // Check new key first
    const stored = localStorage.getItem('sw_currency');
    if (stored && SUPPORTED_CURRENCIES.some((c) => c.code === stored)) return stored;

    // Migrate from old format: "USD ($)" → "USD"
    const legacy = localStorage.getItem('sw_pref_currency');
    if (legacy) {
      const code = legacy.split(' ')[0].trim();
      if (SUPPORTED_CURRENCIES.some((c) => c.code === code)) {
        localStorage.setItem('sw_currency', code);
        return code;
      }
    }
  } catch { /* localStorage unavailable */ }
  return DEFAULT_CURRENCY;
}

interface UIState {
  sidebarOpen: boolean;
  theme: Theme;
  currency: string;
  toggleSidebar: () => void;
  setTheme: (theme: Theme) => void;
  setCurrency: (code: string) => void;
}

export const useUIStore = create<UIState>((set) => {
  // Initialize theme
  const initial = loadTheme();
  applyTheme(initial);

  // Initialize currency
  const initialCurrency = loadCurrency();

  // Listen for OS theme changes when in system mode
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', () => {
    const current = useUIStore.getState().theme;
    if (current === 'system') applyTheme('system');
  });

  return {
    sidebarOpen: true,
    theme: initial,
    currency: initialCurrency,
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setTheme: (theme: Theme) => {
      localStorage.setItem('sw_theme', theme);
      applyTheme(theme);
      set({ theme });
    },
    setCurrency: (code: string) => {
      localStorage.setItem('sw_currency', code);
      set({ currency: code });
    },
  };
});
