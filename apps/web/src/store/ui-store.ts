import { create } from 'zustand';

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

interface UIState {
  sidebarOpen: boolean;
  theme: Theme;
  toggleSidebar: () => void;
  setTheme: (theme: Theme) => void;
}

export const useUIStore = create<UIState>((set) => {
  // Initialize theme
  const initial = loadTheme();
  applyTheme(initial);

  // Listen for OS theme changes when in system mode
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', () => {
    const current = useUIStore.getState().theme;
    if (current === 'system') applyTheme('system');
  });

  return {
    sidebarOpen: true,
    theme: initial,
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setTheme: (theme: Theme) => {
      localStorage.setItem('sw_theme', theme);
      applyTheme(theme);
      set({ theme });
    },
  };
});
