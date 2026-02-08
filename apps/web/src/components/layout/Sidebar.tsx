import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', icon: 'dashboard', label: 'Dashboard' },
  { to: '/list/active', icon: 'list_alt', label: 'Lists' },
  { to: '/catalog', icon: 'inventory_2', label: 'Catalog' },
  { to: '/history', icon: 'history', label: 'History' },
  { to: '/analytics', icon: 'bar_chart', label: 'Analytics' },
];

export function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-64 h-full border-r border-border-dark bg-background-dark flex-shrink-0">
      <div className="p-6">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-full bg-emerald-900 ring-2 ring-primary/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-xl">shopping_cart</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-white text-lg font-bold tracking-tight">ShopWise</h1>
            <p className="text-text-secondary text-xs font-medium">Smart Shopping</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                  isActive
                    ? 'bg-accent-green text-white'
                    : 'text-text-secondary hover:bg-surface-dark hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`material-symbols-outlined transition-colors ${
                      isActive ? 'text-primary' : 'group-hover:text-primary'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="text-sm font-medium">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User section at bottom */}
      <div className="mt-auto p-6 border-t border-border-dark">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-dark cursor-pointer transition-colors">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-background-dark font-bold text-xs">
            AL
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">Alex L.</span>
            <span className="text-xs text-text-secondary">Pro Plan</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
