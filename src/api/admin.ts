import API_BASE_URL from '../lib/config';
import { getAdminToken, clearAdminSession } from './auth';
import { toAdminApiError } from './errors';

function getHeaders(): HeadersInit {
  const token = getAdminToken();
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// SECURITY-FIX (AD-H2): On an auth failure, clear the session and bounce to /login.
// Shared by adminFetch and adminFetchRaw. Guards against a redirect loop when we are
// already on the login screen.
function handleAuthFailure(): void {
  clearAdminSession();
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

export { AdminApiError, PermissionDeniedError, errorMessage, errorDetails } from './errors';

async function readBody(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Maps a non-OK response to a thrown AdminApiError carrying { code, message, details,
 * status } from the envelope. The admin API has no refresh endpoint, so a 401
 * (missing/expired/revoked admin token) is final: clear the session and go to login.
 * A 403 is NOT a session problem, it is a permission refusal for this one action, so it
 * throws PermissionDeniedError and never logs the admin out.
 */
async function throwForStatus(response: Response): Promise<void> {
  if (response.ok) return;
  if (response.status === 401) handleAuthFailure();
  const fallback =
    response.status === 401 ? 'Your session has expired. Please sign in again.' : `Request failed (${response.status})`;
  throw toAdminApiError(response.status, await readBody(response), fallback);
}

// SECURITY-FIX (AD-H2): adminFetch previously called response.json() unconditionally
// and never inspected response.status/.ok, so an expired/invalid session (401)
// was swallowed and the UI stayed "authenticated" forever, and API errors were
// silently parsed as if successful. Now: 401 clears the session and redirects to
// login; 403 throws a PermissionDeniedError without touching the session; other
// non-OK responses throw an AdminApiError built from the error envelope; only OK responses are parsed as JSON.
export async function adminFetch(url: string, options: RequestInit = {}): Promise<any> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });

  await throwForStatus(response);

  return response.json();
}

// SECURITY-FIX (AD-H2 / AD-M2): Raw variant that returns the Response untouched (for
// non-JSON payloads such as CSV export). Applies the same 401/403 handling as
// adminFetch, so callers get consistent auth behaviour without the json() coercion.
export async function adminFetchRaw(url: string, options: RequestInit = {}): Promise<Response> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });

  await throwForStatus(response);

  return response;
}

// Account list/suspend/reinstate for users, agents and companies lives in
// src/features/moderation (one adapter owns the three endpoint shapes).
export const adminApi = {
  users: {
    list: (params?: string) => adminFetch(`/admin/v1/users${params || ''}`),
    getById: (id: string) => adminFetch(`/admin/v1/users/${id}`),
    getListings: (id: string) => adminFetch(`/admin/v1/users/${id}/listings`),
  },
  listings: {
    list: (params?: string) => adminFetch(`/admin/v1/listings${params || ''}`),
    getById: (id: string) => adminFetch(`/admin/v1/listings/${id}`),
    approve: (id: string, note?: string) => adminFetch(`/admin/v1/listings/${id}/approve`, { method: 'PUT', body: JSON.stringify({ note }) }),
    reject: (id: string, reason: string) => adminFetch(`/admin/v1/listings/${id}/reject`, { method: 'PUT', body: JSON.stringify({ reason }) }),
    requestChanges: (id: string, message: string) => adminFetch(`/admin/v1/listings/${id}/request-changes`, { method: 'PUT', body: JSON.stringify({ message }) }),
    archive: (id: string) => adminFetch(`/admin/v1/listings/${id}/archive`, { method: 'PUT' }),
    updateStatus: (id: string, status: string) => adminFetch(`/admin/v1/listings/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  },
  companies: {
    getById: (id: string) => adminFetch(`/admin/v1/companies/${id}`),
    create: (data: any) => adminFetch(`/admin/v1/companies`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => adminFetch(`/admin/v1/companies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    approve: (id: string) => adminFetch(`/admin/v1/companies/${id}/approve`, { method: 'PUT' }),
    reject: (id: string, reason: string) => adminFetch(`/admin/v1/companies/${id}/reject`, { method: 'PUT', body: JSON.stringify({ reason }) }),
    getAgents: (id: string) => adminFetch(`/admin/v1/companies/${id}/agents`),
    // The backend requires the invitee's full name as well as the email (it is in the
    // invitation and on the account); sending only `email` was refused with 400 every time.
    inviteAgent: (id: string, email: string, fullName: string) => adminFetch(`/admin/v1/companies/${id}/invite-agent`, { method: 'POST', body: JSON.stringify({ email, fullName }) }),
  },
  verifications: {
    list: (params?: string) => adminFetch(`/admin/v1/verifications${params || ''}`),
    getById: (id: string) => adminFetch(`/admin/v1/verifications/${id}`),
    updateChecklist: (id: string, checklist: any) => adminFetch(`/admin/v1/verifications/${id}/checklist`, { method: 'PUT', body: JSON.stringify({ checklist }) }),
    updateNotes: (id: string, notes: string) => adminFetch(`/admin/v1/verifications/${id}/notes`, { method: 'PUT', body: JSON.stringify({ notes }) }),
    approve: (id: string) => adminFetch(`/admin/v1/verifications/${id}/approve`, { method: 'PUT' }),
    reject: (id: string, reason: string) => adminFetch(`/admin/v1/verifications/${id}/reject`, { method: 'PUT', body: JSON.stringify({ reason }) }),
    requestInfo: (id: string, message: string) => adminFetch(`/admin/v1/verifications/${id}/request-info`, { method: 'PUT', body: JSON.stringify({ message }) }),
  },
  waitlist: {
    list: (params?: string) => adminFetch(`/admin/v1/waitlist${params || ''}`),
    getById: (id: string) => adminFetch(`/admin/v1/waitlist/${id}`),
    updateStatus: (id: string, status: string) => adminFetch(`/admin/v1/waitlist/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
    delete: (id: string) => adminFetch(`/admin/v1/waitlist/${id}`, { method: 'DELETE' }),
    export: () => adminFetch(`/admin/v1/waitlist/export`),
    analytics: () => adminFetch(`/admin/v1/waitlist/analytics`),
  },
  analytics: {
    dashboard: () => adminFetch(`/admin/v1/analytics/dashboard`),
    waitlist: () => adminFetch(`/admin/v1/analytics/waitlist`),
    revenue: () => adminFetch(`/admin/v1/analytics/revenue`),
    listings: () => adminFetch(`/admin/v1/analytics/listings`),
    bookings: () => adminFetch(`/admin/v1/analytics/bookings`),
    users: () => adminFetch(`/admin/v1/analytics/users`),
    tiers: () => adminFetch(`/admin/v1/analytics/tiers`),
  },
  activity: {
    list: (params?: string) => adminFetch(`/admin/v1/activity${params || ''}`),
  },
  settings: {
    get: () => adminFetch(`/admin/v1/settings`),
    updateProfile: (data: any) => adminFetch(`/admin/v1/settings/profile`, { method: 'PUT', body: JSON.stringify(data) }),
    updatePassword: (data: any) => adminFetch(`/admin/v1/auth/change-password`, { method: 'POST', body: JSON.stringify(data) }),
    updateNotifications: (data: any) => adminFetch(`/admin/v1/settings/notifications`, { method: 'PUT', body: JSON.stringify(data) }),
    updatePlatform: (data: any) => adminFetch(`/admin/v1/settings/platform`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  agents: {
    getReviews: () => adminFetch(`/admin/v1/agents/reviews`),
    updateReviewStatus: (id: string, status: string) => adminFetch(`/admin/v1/agents/reviews/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  },
  bookings: {
    list: (params?: Record<string, any>) => adminFetch(`/admin/v1/bookings${params ? '?' + new URLSearchParams(params as any).toString() : ''}`),
    resolve: (id: string, action: string) => adminFetch(`/admin/v1/bookings/${id}/resolve`, { method: 'PATCH', body: JSON.stringify({ action }) }),
  },
  payments: {
    list: (params?: Record<string, any>) => adminFetch(`/admin/v1/payments${params ? '?' + new URLSearchParams(params as any).toString() : ''}`),
    markProcessed: (id: string) => adminFetch(`/admin/v1/payments/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'processed' }) }),
    // QA-ADM-036: the console advertised a "Refunded" state it had no way to reach. The
    // server-side path already exists and is real, PATCH .../status with 'refunded' goes
    // through refundService.refundPayment, which verifies with Paystack and calls the
    // refund API rather than just flipping a flag.
    refund: (id: string) => adminFetch(`/admin/v1/payments/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'refunded' }) }),
  },
  reports: {
    list: (params?: Record<string, any>) => adminFetch(`/admin/v1/reports${params ? '?' + new URLSearchParams(params as any).toString() : ''}`),
    action: (id: string, action: string) => adminFetch(`/admin/v1/reports/${id}/action`, { method: 'PATCH', body: JSON.stringify({ action }) }),
  },
  notifications: {
    sendPush: (data: { title: string; body: string; type?: string; userIds?: string[]; roles?: string[]; data?: Record<string, any> }) =>
      adminFetch('/admin/v1/notifications/push', { method: 'POST', body: JSON.stringify(data) }),
  },
  emails: {
    broadcast: (data: { subject: string; body: string; recipientType: string }) =>
      adminFetch('/admin/v1/emails/broadcast', { method: 'POST', body: JSON.stringify(data) }),
    single: (data: { subject: string; body: string; userId: string }) =>
      adminFetch('/admin/v1/emails/single', { method: 'POST', body: JSON.stringify(data) }),
    history: (params?: string) => adminFetch(`/admin/v1/emails/history${params || ''}`),
    detail: (id: string) => adminFetch(`/admin/v1/emails/history/${id}`),
  },
  ads: {
    list: () => adminFetch('/admin/v1/ads'),
    create: (data: { imageUrl: string; link?: string; isActive?: boolean }) =>
      adminFetch('/admin/v1/ads', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: { imageUrl?: string; link?: string; isActive?: boolean }) =>
      adminFetch(`/admin/v1/ads/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => adminFetch(`/admin/v1/ads/${id}`, { method: 'DELETE' }),
  },
  audit: {
    logs: (params?: Record<string, any>) => adminFetch(`/admin/v1/audit/logs${params ? '?' + new URLSearchParams(params as any).toString() : ''}`),
    paystackTransactions: (params?: Record<string, any>) => adminFetch(`/admin/v1/audit/paystack-transactions${params ? '?' + new URLSearchParams(params as any).toString() : ''}`),
    paystackTransactionDetail: (id: string) => adminFetch(`/admin/v1/audit/paystack-transactions/${id}`),
  },
};
