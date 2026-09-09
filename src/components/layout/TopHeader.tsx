import {
  Notification01Icon,
  Search01Icon,
  Menu01Icon,
  ArrowDown01Icon
} from '@hugeicons/react';
import { useLocation } from 'react-router-dom';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/':              { title: 'Dashboard',          subtitle: 'Platform overview & live metrics' },
  '/listings':      { title: 'Listings',            subtitle: 'Manage properties & approvals' },
  '/verification':  { title: 'Verification Queue',  subtitle: 'Review agent & company documents' },
  '/users':         { title: 'Users',               subtitle: 'Tenants, agents & landlords' },
  '/agents':        { title: 'Agents',              subtitle: 'Manage verified agents' },
  '/agent-reviews': { title: 'Agent Reviews',       subtitle: 'Community feedback & ratings' },
  '/companies':     { title: 'Companies',           subtitle: 'Registered real estate companies' },
  '/bookings':      { title: 'Bookings',            subtitle: 'Viewing & inspection bookings' },
  '/payments':      { title: 'Payments',            subtitle: 'Transactions & revenue' },
  '/reports':       { title: 'Reports',             subtitle: 'Flagged content & issues' },
  '/waitlist':      { title: 'Waitlist',            subtitle: 'Student demand & corridor data' },
  '/analytics':     { title: 'Analytics',           subtitle: 'Performance & intelligence' },
  '/tiers':         { title: 'Tier Management',     subtitle: 'Subscription plans & limits' },
  '/notifications': { title: 'Notifications',       subtitle: 'Push & email broadcasts' },
  '/ads':           { title: 'Ads Management',      subtitle: 'Campaigns & placements' },
  '/audit-logs':    { title: 'Audit Logs',          subtitle: 'System activity trail' },
  '/settings':      { title: 'Settings',            subtitle: 'Platform configuration' },
};

export function TopHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const location = useLocation();
  const page = pageTitles[location.pathname] || { title: 'iléSure Admin', subtitle: '' };

  return (
    <header className="fixed top-3 left-3 md:left-[284px] right-3 h-[60px] z-20 flex items-center gap-3 md:gap-4
      bg-white/90 backdrop-blur-xl rounded-[18px] shadow-header-pill border border-clay-border/50 px-4 md:px-5">

      {/* Mobile Menu01Icon */}
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 -ml-1 text-text-tertiary hover:text-burnt-brown rounded-xl transition-colors hover:bg-clay-border-light"
      >
        <Menu01Icon className="w-5 h-5" />
      </button>

      {/* Page Title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-[15px] font-bold text-text-primary leading-tight truncate">{page.title}</h1>
        <p className="text-[11px] text-text-tertiary truncate hidden sm:block leading-tight mt-0.5">{page.subtitle}</p>
      </div>

      {/* Search01Icon Bar */}
      <div className="relative hidden lg:flex items-center w-64">
        <Search01Icon className="absolute left-3.5 w-3.5 h-3.5 text-text-tertiary pointer-events-none" />
        <input
          type="text"
          placeholder="Search01Icon anything..."
          className="w-full pl-9 pr-4 py-2 bg-clay-border-light/70 border border-clay-border/50 rounded-xl
            text-sm text-text-primary placeholder:text-text-tertiary/70 outline-none
            focus:border-mustard focus:ring-2 focus:ring-mustard/15 focus:bg-white transition-all duration-150"
        />
      </div>

      {/* Notification Notification01Icon */}
      <button className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-clay-border-light
        hover:bg-mustard-pale border border-clay-border/50 transition-colors duration-150 group">
        <Notification01Icon className="w-4 h-4 text-text-secondary group-hover:text-mustard transition-colors" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-mustard-light text-white text-[9px] font-bold
          rounded-full flex items-center justify-center shadow-sm border border-white">
          5
        </span>
      </button>

      {/* Divider */}
      <div className="hidden md:block w-px h-6 bg-clay-border" />

      {/* Admin Profile */}
      <button className="flex items-center gap-2.5 py-1.5 px-2.5 rounded-xl hover:bg-clay-border-light/80
        transition-colors duration-150 group">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm
          shadow-clay-sm flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #9B5B35, #6B3A1F)' }}>
          A
        </div>
        <div className="hidden md:block text-left">
          <div className="text-[13px] font-bold text-text-primary leading-tight">Super Admin</div>
          <div className="text-[11px] text-text-tertiary leading-tight">Administrator</div>
        </div>
        <ArrowDown01Icon className="w-3.5 h-3.5 text-text-tertiary group-hover:text-burnt-brown transition-colors hidden md:block" />
      </button>
    </header>
  );
}
