import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/', icon: 'dashboard', label: 'Home' },
  { to: '/catalog', icon: 'inventory_2', label: 'Catalog' },
  { to: '/history', icon: 'history', label: 'History' },
  { to: '/analytics', icon: 'bar_chart', label: 'Stats' },
  { to: '/settings', icon: 'settings', label: 'Settings' },
];

export function BottomNav() {
  return (
    <nav className="md:hidden flex items-center justify-around border-t border-border bg-bg px-2 py-2 flex-shrink-0">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 px-3 min-w-[44px] min-h-[44px] rounded-lg transition-colors ${
              isActive ? 'text-primary' : 'text-text-muted'
            }`
          }
        >
          <span className="material-symbols-outlined text-[22px]">{tab.icon}</span>
          <span className="text-[10px] font-medium">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
