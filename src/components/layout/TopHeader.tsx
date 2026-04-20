import { Bell, Search, ChevronDown, Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Overview of platform activity' },
  '/listings': { title: 'Listings', subtitle: 'Manage property listings & approvals' },
  '/verification': { title: 'Verification Queue', subtitle: 'Review agent & company documents' },
  '/users': { title: 'Users', subtitle: 'Manage tenants, agents & landlords' },
  '/companies': { title: 'Companies', subtitle: 'Manage registered real estate companies' },
  '/waitlist': { title: 'Waitlist Data', subtitle: 'Student demand & corridor analytics' },
  '/analytics': { title: 'Analytics', subtitle: 'Platform performance & demand intelligence' },
};

export function TopHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const location = useLocation();
  const page = pageTitles[location.pathname] || { title: 'iléSure Admin', subtitle: '' };

  return (
    <header className="fixed top-3 left-3 md:left-[276px] right-3 h-14 bg-white rounded-[9999px] shadow-sidebar-pill z-20 flex items-center px-4 md:px-5 gap-3 md:gap-4">
      {/* Mobile Menu Button */}
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 -ml-2 text-text-secondary hover:text-burnt-brown rounded-clay-sm transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-bold text-text-primary leading-tight truncate">{page.title}</h1>
        <p className="text-xs text-text-tertiary truncate hidden sm:block">{page.subtitle}</p>
      </div>

      {/* Search */}
      <div className="relative hidden md:flex items-center w-72">
        <Search className="absolute left-3 w-4 h-4 text-text-tertiary pointer-events-none" />
        <input
          type="text"
          placeholder="Search listings, users, agents..."
          className="w-full pl-9 pr-4 py-2 bg-clay-border-light border border-clay-border rounded-pill text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-mustard focus:ring-2 focus:ring-mustard/20 transition-all duration-150"
        />
      </div>

      {/* Notification bell */}
      <button className="relative w-9 h-9 flex items-center justify-center rounded-clay-sm bg-clay-border-light hover:bg-clay-border transition-colors duration-150 group">
        <Bell className="w-4.5 h-4.5 text-text-secondary group-hover:text-burnt-brown transition-colors" />
        {/* Unread badge */}
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-mustard-light text-burnt-brown-dark text-[9px] font-bold rounded-pill flex items-center justify-center">
          5
        </span>
      </button>

      {/* Admin profile */}
      <button className="flex items-center gap-2.5 py-1.5 px-3 rounded-clay-sm hover:bg-clay-border-light transition-colors duration-150 group">
        <div className="w-8 h-8 rounded-pill bg-gradient-to-br from-burnt-brown-light to-burnt-brown flex items-center justify-center text-white font-bold text-sm shadow-clay-sm flex-shrink-0">
          A
        </div>
        <div className="hidden md:block text-left">
          <div className="text-sm font-semibold text-text-primary leading-tight">Super Admin</div>
          <div className="text-xs text-text-tertiary">Administrator</div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-text-tertiary group-hover:text-burnt-brown transition-colors" />
      </button>
    </header>
  );
}
