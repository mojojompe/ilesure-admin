import {
  DashboardSquare01Icon,
  Building04Icon,
  SecurityCheckIcon,
  UserMultipleIcon,
  Briefcase01Icon,
  ClipboardIcon,
  Analytics01Icon,
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
} from '@hugeicons/react';
import { Dashboard } from '../pages/Dashboard';
import { Listings } from '../pages/Listings';
import { VerificationQueue } from '../pages/VerificationQueue';
import { Users } from '../pages/Users';
import { Companies } from '../pages/Companies';
import { Agents } from '../pages/Agents';
import { AgentReviews } from '../pages/AgentReviews';
import { Bookings } from '../pages/Bookings';
import { Payments } from '../pages/Payments';
import { Reports } from '../pages/Reports';
import { WaitlistData } from '../pages/WaitlistData';
import { Analytics } from '../pages/Analytics';
import Tiers from '../pages/Tiers';
import { Settings } from '../pages/Settings';
import { AuditLogs } from '../pages/AuditLogs';
import { PushNotifications } from '../pages/PushNotifications';
import { Ads } from '../pages/Ads';
import { UpgradeRequests } from '../pages/UpgradeRequests';
import { PAGE_CAP } from '../lib/rbac';
import type { NavEntry } from './access';

/**
 * Every admin page, in sidebar order. App.tsx builds the routes from this, the Sidebar
 * shows the entries the admin can access, and RouteGuard shows a permission message
 * for the rest. `requires` is the backend permission the page's data needs; entries
 * without it (Dashboard, Feature Upgrades, Settings) are open to every signed-in admin,
 * matching routers that only check adminAuthMiddleware.
 */
export const NAV_TABLE: readonly NavEntry[] = [
  { section: 'Core', path: '/', label: 'Dashboard', icon: DashboardSquare01Icon, element: <Dashboard /> },
  { section: 'Core', path: '/listings', label: 'Listings', icon: Building04Icon, element: <Listings />, requires: [PAGE_CAP.LISTINGS] },
  { section: 'Core', path: '/verification', label: 'Verification', icon: SecurityCheckIcon, element: <VerificationQueue />, requires: [PAGE_CAP.VERIFICATIONS] },

  { section: 'People', path: '/users', label: 'Users', icon: UserMultipleIcon, element: <Users />, requires: [PAGE_CAP.USERS] },
  { section: 'People', path: '/agents', label: 'Agents', icon: UserCheck01Icon, element: <Agents />, requires: [PAGE_CAP.AGENTS] },
  { section: 'People', path: '/agent-reviews', label: 'Reviews', icon: StarIcon, element: <AgentReviews />, requires: [PAGE_CAP.AGENTS] },
  { section: 'People', path: '/companies', label: 'Companies', icon: Briefcase01Icon, element: <Companies />, requires: [PAGE_CAP.COMPANIES] },

  { section: 'Operations', path: '/bookings', label: 'Bookings', icon: Calendar01Icon, element: <Bookings />, requires: [PAGE_CAP.BOOKINGS] },
  { section: 'Operations', path: '/payments', label: 'Payments', icon: CreditCardIcon, element: <Payments />, requires: [PAGE_CAP.PAYMENTS] },
  { section: 'Operations', path: '/upgrade-requests', label: 'Feature Upgrades', icon: SparklesIcon, element: <UpgradeRequests /> },
  { section: 'Operations', path: '/reports', label: 'Reports', icon: Flag01Icon, element: <Reports />, requires: [PAGE_CAP.REPORTS] },
  { section: 'Operations', path: '/waitlist', label: 'Waitlist', icon: ClipboardIcon, element: <WaitlistData />, requires: [PAGE_CAP.WAITLIST] },

  { section: 'Growth', path: '/analytics', label: 'Analytics', icon: Analytics01Icon, element: <Analytics />, requires: [PAGE_CAP.ANALYTICS] },
  { section: 'Growth', path: '/tiers', label: 'Tiers', icon: Analytics01Icon, element: <Tiers />, requires: [PAGE_CAP.TIERS] },
  // Push (write:notifications) and Email (read/write:emails) tabs: any one opens the page.
  { section: 'Growth', path: '/notifications', label: 'Notifications', icon: Notification01Icon, element: <PushNotifications />, requires: [PAGE_CAP.NOTIFICATIONS_SEND, PAGE_CAP.EMAILS_READ, PAGE_CAP.EMAILS_SEND] },
  { section: 'Growth', path: '/ads', label: 'Ads', icon: Megaphone01Icon, element: <Ads />, requires: [PAGE_CAP.ADS] },
  { section: 'Growth', path: '/audit-logs', label: 'Audit Logs', icon: Note01Icon, element: <AuditLogs />, requires: [PAGE_CAP.AUDIT] },

  { section: 'Account', placement: 'footer', path: '/settings', label: 'Settings', icon: Settings01Icon, element: <Settings /> },
];
