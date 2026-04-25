import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Building2, ShieldCheck, Users, Briefcase,
  ClipboardList, BarChart3, LogOut, Settings,
} from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/listings', label: 'Listings', icon: Building2 },
  { path: '/verification', label: 'Verification Queue', icon: ShieldCheck },
  { path: '/users', label: 'Users', icon: Users },
  { path: '/companies', label: 'Companies', icon: Briefcase },
  { path: '/waitlist', label: 'Waitlist Data', icon: ClipboardList },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(false);
    localStorage.removeItem('ilesure_admin_auth');
    window.location.href = '/login';
  };

  return (
    <>
      <aside className={clsx(
        'fixed left-3 top-3 bottom-3 w-60 bg-sidebar-gradient shadow-sidebar-pill z-30 flex flex-col overflow-hidden transition-transform duration-300 md:translate-x-0 rounded-[28px]',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-10 h-10 rounded-clay-sm overflow-hidden bg-white/10 flex items-center justify-center flex-shrink-0 shadow-clay-sm">
            <img src="/NoBG Logo.png" alt="iléSure" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <div className="text-white font-bold text-lg leading-tight tracking-tight">iléSure</div>
            <div className="text-white/50 text-xs font-medium tracking-widest uppercase">Admin Panel</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          <div className="text-white/30 text-[10px] font-bold uppercase tracking-widest px-3 mb-3">Main Menu</div>
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
            return (
              <NavLink
                key={path}
                to={path}
                className={clsx(
                  'relative flex items-center gap-3 px-3 py-2.5 rounded-clay-sm text-sm font-medium transition-all duration-150 group',
                  isActive
                    ? 'bg-white/12 text-white nav-active'
                    : 'text-white/65 hover:text-white hover:bg-white/8',
                )}
              >
                <Icon className={clsx('w-5 h-5 flex-shrink-0 transition-transform duration-150', isActive ? 'text-mustard-light' : 'group-hover:scale-110')} />
                <span className="truncate">{label}</span>
                {/* Pending indicator dots */}
                {label === 'Verification Queue' && (
                  <span className="ml-auto bg-mustard-light text-burnt-brown-dark text-[10px] font-bold rounded-pill px-2 py-0.5 min-w-[20px] text-center">3</span>
                )}
                {label === 'Listings' && (
                  <span className="ml-auto bg-white/20 text-white text-[10px] font-bold rounded-pill px-2 py-0.5 min-w-[20px] text-center">2</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="px-3 py-4 border-t border-white/10 space-y-1">
          <NavLink
            to="/settings"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-clay-sm text-sm font-medium text-white/60 hover:text-white hover:bg-white/8 transition-all duration-150 group"
          >
            <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
            Settings
          </NavLink>
          {/* Admin Profile */}
          <div className="flex items-center gap-3 px-3 py-3 mt-2 rounded-clay-sm bg-white/8">
            <div className="w-8 h-8 rounded-pill bg-mustard-light flex items-center justify-center text-burnt-brown-dark font-bold text-sm flex-shrink-0">
              A
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-semibold truncate">Super Admin</div>
              <div className="text-white/40 text-xs truncate">admin@example.com</div>
            </div>
            <button onClick={() => setShowLogoutModal(true)} className="text-white/40 hover:text-status-error transition-colors duration-150" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-clay-lg">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-burnt-brown-pale flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-7 h-7 text-burnt-brown" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary">Logout</h3>
              <p className="text-sm text-text-tertiary mt-1">Are you sure you want to logout?</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2.5 rounded-clay-sm border border-clay-border text-text-secondary font-medium hover:bg-clay-border-light transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2.5 rounded-clay-sm bg-burnt-brown text-white font-medium hover:bg-burnt-brown-dark transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
