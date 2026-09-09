import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import { removeAdminToken } from '../../api/auth';
import {
  DashboardSquare01Icon,
  Building04Icon,
  SecurityCheckIcon,
  UserMultipleIcon,
  Briefcase01Icon,
  ClipboardIcon,
  Analytics01Icon,
  Logout01Icon,
  Settings01Icon,
  UserCheck01Icon,
  Calendar01Icon,
  CreditCardIcon,
  Flag01Icon,
  Notification01Icon,
  Note01Icon,
  Megaphone01Icon,
  StarIcon,
  SparklesIcon,
  ArrowRight01Icon
} from '@hugeicons/react';
import { clsx } from 'clsx';

const NAV_SECTIONS = [
  {
    title: 'Core',
    items: [
      { path: '/',         label: 'Dashboard',   icon: DashboardSquare01Icon },
      { path: '/listings', label: 'Listings',     icon: Building04Icon },
      { path: '/verification', label: 'Verification', icon: SecurityCheckIcon },
    ],
  },
  {
    title: 'People',
    items: [
      { path: '/users',         label: 'Users',        icon: UserMultipleIcon },
      { path: '/agents',        label: 'Agents',        icon: UserCheck01Icon },
      { path: '/agent-reviews', label: 'Reviews',       icon: StarIcon },
      { path: '/companies',     label: 'Companies',     icon: Briefcase01Icon },
    ],
  },
  {
    title: 'Operations',
    items: [
      { path: '/bookings',   label: 'Bookings',    icon: Calendar01Icon },
      { path: '/payments',   label: 'Payments',    icon: CreditCardIcon },
      { path: '/upgrade-requests', label: 'Feature Upgrades', icon: SparklesIcon },
      { path: '/reports',    label: 'Reports',     icon: Flag01Icon },
      { path: '/waitlist',   label: 'Waitlist',    icon: ClipboardIcon },
    ],
  },
  {
    title: 'Growth',
    items: [
      { path: '/analytics',      label: 'Analytics',   icon: Analytics01Icon },
      { path: '/tiers',          label: 'Tiers',        icon: Analytics01Icon },
      { path: '/notifications',  label: 'Notifications',icon: Notification01Icon },
      { path: '/ads',            label: 'Ads',          icon: Megaphone01Icon },
      { path: '/audit-logs',     label: 'Audit Logs',   icon: Note01Icon },
    ],
  },
];


export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [pendingVerifications, setPendingVerifications] = useState(0);
  const [pendingListings, setPendingListings] = useState(0);

  const handleLogout = () => {
    setShowLogoutModal(false);
    removeAdminToken();
    localStorage.removeItem('ilesure_admin_auth');
    window.location.href = '/login';
  };

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [verificationsRes, listingsRes] = await Promise.all([
          adminApi.verifications.list('?status=pending'),
          adminApi.listings.list('?status=pending'),
        ]);
        if (verificationsRes.success) {
          const total = verificationsRes.data?.pagination?.totalItems
            || (verificationsRes.data?.verifications || verificationsRes.verifications || []).length;
          setPendingVerifications(total);
        }
        if (listingsRes.success) {
          const total = listingsRes.data?.pagination?.totalItems
            || (listingsRes.data?.listings || listingsRes.listings || []).length;
          setPendingListings(total);
        }
      } catch (err) {
        console.error('Error fetching sidebar counts', err);
      }
    };
    fetchCounts();
  }, []);

  const getBadge = (path: string, label: string) => {
    if (label === 'Verification' && pendingVerifications > 0)
      return <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-mustard-light text-burnt-brown-dark min-w-[18px] text-center leading-none">{pendingVerifications}</span>;
    if (label === 'Listings' && pendingListings > 0)
      return <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/20 text-white min-w-[18px] text-center leading-none">{pendingListings}</span>;
    return null;
  };

  return (
    <>
      {/* ── Sidebar ────────────────────────────────────────── */}
      <aside className={clsx(
        'fixed left-3 top-3 bottom-3 w-[260px] z-30 flex flex-col overflow-hidden',
        'rounded-[24px] transition-transform duration-300 md:translate-x-0',
        'bg-sidebar-gradient sidebar-glow',
        isOpen ? 'translate-x-0' : '-translate-x-full',
      )}>

        {/* Decorative background orbs */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/3 pointer-events-none" />
        <div className="absolute bottom-32 -left-12 w-36 h-36 rounded-full bg-mustard-light/5 pointer-events-none" />

        {/* ── Logo ──────────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/8 relative">
          <div className="w-10 h-10 rounded-[14px] bg-white/12 flex items-center justify-center flex-shrink-0 border border-white/10 shadow-clay-sm backdrop-blur-sm">
            <img src="/NoBG Logo.png" alt="iléSure" className="w-7 h-7 object-contain" />
          </div>
          <div>
            <div className="text-white font-bold text-[17px] leading-tight tracking-tight">iléSure</div>
            <div className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: 'rgba(232,148,30,0.8)' }}>Admin Panel</div>
          </div>
        </div>

        {/* ── Navigation ────────────────────────────────────── */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              <div className="text-[10px] font-bold uppercase tracking-widest px-3 mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map(({ path, label, icon: Icon }) => {
                  const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
                  return (
                    <NavLink
                      key={path}
                      to={path}
                      onClick={onClose}
                      className={clsx(
                        'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group',
                        isActive
                          ? 'bg-white/12 text-white nav-active shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
                          : 'text-white/55 hover:text-white/90 hover:bg-white/7',
                      )}
                    >
                      <Icon className={clsx(
                        'w-4.5 h-4.5 flex-shrink-0 transition-all duration-150',
                        isActive ? 'text-mustard-light' : 'text-white/45 group-hover:text-white/70',
                      )} />
                      <span className="truncate flex-1">{label}</span>
                      {getBadge(path, label)}
                      {isActive && <ArrowRight01Icon className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* ── Bottom Section ─────────────────────────────────── */}
        <div className="px-3 pb-4 border-t border-white/8 pt-3 space-y-1">
          <NavLink
            to="/settings"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white/90 hover:bg-white/7 transition-all duration-150 group"
          >
            <Settings01Icon className="w-4.5 h-4.5 group-hover:rotate-45 transition-transform duration-300 text-white/40 group-hover:text-white/70" />
            <span>Settings01Icon</span>
          </NavLink>

          {/* Admin Profile chip */}
          <div className="flex items-center gap-3 px-3 py-3 mt-1 rounded-xl bg-white/7 border border-white/8">
            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm text-burnt-brown-dark shadow-clay-sm"
              style={{ background: 'linear-gradient(135deg, #E8941E, #C97B1C)' }}>
              A
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-semibold truncate leading-tight">Super Admin</div>
              <div className="text-[11px] truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>iléSure Platform</div>
            </div>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="text-white/30 hover:text-status-error transition-colors duration-150 p-1 rounded-lg hover:bg-white/10"
              title="Logout"
            >
              <Logout01Icon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Logout Confirmation Modal ──────────────────────── */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] p-7 max-w-sm w-full shadow-clay-lg animate-bounce-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-burnt-brown-pale flex items-center justify-center mx-auto mb-4 shadow-clay-sm">
                <Logout01Icon className="w-7 h-7 text-burnt-brown" />
              </div>
              <h3 className="text-lg font-bold text-text-primary">Sign Out</h3>
              <p className="text-sm text-text-tertiary mt-1.5">You'll need to sign in again to access the admin panel.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2.5 rounded-clay-sm border border-clay-border text-text-secondary font-semibold hover:bg-clay-border-light transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2.5 rounded-clay-sm bg-burnt-brown text-white font-semibold hover:bg-burnt-brown-dark transition-colors text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
