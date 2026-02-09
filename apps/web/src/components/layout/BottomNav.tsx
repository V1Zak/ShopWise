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
    <nav className="md:hidden flex items-center justify-around border-t border-border-dark bg-background-dark px-2 py-2 flex-shrink-0">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
              isActive ? 'text-primary' : 'text-text-secondary'
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
