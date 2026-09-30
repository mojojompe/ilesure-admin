import { getAdminRole, getAdminPermissions, hasKnownAdminPermissions } from '../api/auth';

// SECURITY-FIX (AD-H3): Lightweight client-side capability checks so destructive
// actions are hidden/disabled for roles that lack the permission.
//
// DECISION: The backend is the AUTHORITATIVE RBAC enforcer (its per-role
// authorization gap is being fixed separately, audit finding A-M2). This module is
// DEFENSE-IN-DEPTH ONLY: it keeps a lower-privilege admin from being shown (and
// tempted to fire) an action the server will reject. It is NOT a security boundary
// and must never be treated as one, anyone can edit client state.
//
// DECISION: Capabilities use the backend contract's vocabulary (contracts/generated.ts).
// Every admin request is gated by `read:<resource>` (GET) or `write:<resource>` (anything
// else). Pages are gated directly on `read:<resource>`; action names such as
// 'users.suspend' resolve through ADMIN_ACTION_PERMISSIONS to the permission that really
// gates the request ('write:users'). Before this, action names were compared verbatim
// against the permission list, so a limited admin holding 'write:users' never matched
// 'users.suspend' and lost every action button.
//
// Resolution:
//   - adminHasPermission(role, permissions, required)  -> allowed (super_admin bypasses)
//   - session without a saved permission list
//     (signed in before login stored it):
//       page capability                                 -> allowed (show all; backend enforces)
//       action, known limited role                      -> denied (least privilege)
//       action, no recognised role                      -> allowed (legacy/opaque token)
//   - otherwise                                         -> denied

import {
  ADMIN_ACTION_PERMISSIONS,
  ADMIN_ROLES,
  adminHasPermission,
  type AdminAction,
  type AdminPermission,
} from '../contracts/generated';

/** Action names; each resolves to a backend permission via ADMIN_ACTION_PERMISSIONS. */
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
  EMAILS_SEND: 'emails.send',
  SETTINGS_MANAGE: 'settings.manage',
  WAITLIST_MANAGE: 'waitlist.manage',
} as const satisfies Record<string, AdminAction>;

/**
 * Page access: every GET on /admin/v1/<resource> requires `read:<resource>`, so an account
 * without it gets a 403 for the page's data. Used by the nav table (src/navigation) to gate
 * sidebar items and routes.
 */
export const PAGE_CAP = {
  LISTINGS: 'read:listings',
  VERIFICATIONS: 'read:verifications',
  USERS: 'read:users',
  AGENTS: 'read:agents',
  COMPANIES: 'read:companies',
  BOOKINGS: 'read:bookings',
  PAYMENTS: 'read:payments',
  REPORTS: 'read:reports',
  WAITLIST: 'read:waitlist',
  ANALYTICS: 'read:analytics',
  TIERS: 'read:tiers',
  AUDIT: 'read:audit',
  ADS: 'read:ads',
  NOTIFICATIONS_SEND: 'write:notifications',
  EMAILS_READ: 'read:emails',
  EMAILS_SEND: 'write:emails',
} as const satisfies Record<string, AdminPermission>;

export type PageCapability = (typeof PAGE_CAP)[keyof typeof PAGE_CAP];
/** An action name from the contract, or a backend permission string. */
export type Capability = AdminAction | AdminPermission;

const isAction = (capability: string): capability is AdminAction =>
  Object.prototype.hasOwnProperty.call(ADMIN_ACTION_PERMISSIONS, capability);

/** The backend permission that gates a capability. */
export function requiredPermission(capability: Capability): AdminPermission {
  return isAction(capability) ? ADMIN_ACTION_PERMISSIONS[capability] : capability;
}

export interface AdminSession {
  role: string | null;
  permissions: readonly string[];
  /** False for a session signed in before the login response's permissions were saved. */
  permissionsKnown: boolean;
}

const LIMITED_ROLES: readonly string[] = ADMIN_ROLES.filter((r) => r !== 'super_admin');

/** Pure resolution against an explicit session (see the table above). */
export function canWith(session: AdminSession, capability: Capability): boolean {
  if (adminHasPermission(session, requiredPermission(capability))) return true;
  if (session.permissionsKnown) return false;
  if (!isAction(capability)) return true;
  return !(session.role && LIMITED_ROLES.includes(session.role));
}

export function currentAdminSession(): AdminSession {
  return {
    role: getAdminRole(),
    permissions: getAdminPermissions(),
    permissionsKnown: hasKnownAdminPermissions(),
  };
}

export function can(capability: Capability): boolean {
  return canWith(currentAdminSession(), capability);
}
