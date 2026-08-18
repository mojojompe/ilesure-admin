import { getAdminRole, getAdminPermissions } from '../api/auth';

// SECURITY-FIX (AD-H3): Lightweight client-side capability checks so destructive
// actions are hidden/disabled for roles that lack the permission.
//
// DECISION: The backend is the AUTHORITATIVE RBAC enforcer (its per-role
// authorization gap is being fixed separately — audit finding A-M2). This module is
// DEFENSE-IN-DEPTH ONLY: it keeps a lower-privilege admin from being shown (and
// tempted to fire) an action the server will reject. It is NOT a security boundary
// and must never be treated as one — anyone can edit client state.
//
// DECISION: Capability resolution is deliberately conservative but non-breaking,
// because we cannot know the exact permission strings the backend mints:
//   - role 'super_admin'                 -> allowed (full access)
//   - permissions[] contains the cap,
//     or a '*' / 'all' wildcard           -> allowed
//   - known limited role (support|moderator)
//     with no matching permission         -> denied (least-privilege by default)
//   - token carries NEITHER a recognised
//     role NOR any permissions            -> allowed (legacy/opaque token: we can't
//                                            determine capabilities client-side and
//                                            the backend enforces authoritatively, so
//                                            we avoid breaking the console for a valid
//                                            admin)

export const CAP = {
  USERS_SUSPEND: 'users.suspend',
  COMPANIES_APPROVE: 'companies.approve',
  COMPANIES_SUSPEND: 'companies.suspend',
  AGENTS_SUSPEND: 'agents.suspend',
  VERIFICATIONS_REVIEW: 'verifications.review',
  LISTINGS_MODERATE: 'listings.moderate',
  PAYMENTS_PROCESS: 'payments.process',
  BOOKINGS_RESOLVE: 'bookings.resolve',
  REPORTS_ACTION: 'reports.action',
  TIERS_MANAGE: 'tiers.manage',
  ADS_MANAGE: 'ads.manage',
  NOTIFICATIONS_BROADCAST: 'notifications.broadcast',
} as const;

export type Capability = (typeof CAP)[keyof typeof CAP];

const LIMITED_ROLES = ['support', 'moderator'];

export function can(capability: Capability | string): boolean {
  const role = getAdminRole();
  if (role === 'super_admin') return true;

  const perms = getAdminPermissions();
  if (perms.includes('*') || perms.includes('all') || perms.includes(capability)) {
    return true;
  }

  // Explicitly limited role without a matching permission -> deny (least privilege).
  if (role && LIMITED_ROLES.includes(role)) return false;

  // Legacy/opaque token that carries neither a recognised role nor any permissions:
  // allow, since the backend remains the authoritative enforcer (see DECISION above).
  if (!role && perms.length === 0) return true;

  return false;
}
