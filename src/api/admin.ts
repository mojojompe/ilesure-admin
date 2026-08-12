import API_BASE_URL from '../lib/config';
import { getAdminToken, clearAdminSession } from './auth';

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

async function extractErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const data = await response.json();
    return data?.error?.message || data?.message || fallback;
  } catch {
    return fallback;
  }
}

// SECURITY-FIX (AD-H2): adminFetch previously called response.json() unconditionally
// and never inspected response.status/.ok, so an expired/invalid session (401/403)
// was swallowed and the UI stayed "authenticated" forever, and API errors were
// silently parsed as if successful. Now: 401/403 clears the session and redirects to
// login; other non-OK responses throw with a surfaced message; only OK responses are
// parsed as JSON.
async function adminFetch(url: string, options: RequestInit = {}): Promise<any> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });

  if (response.status === 401 || response.status === 403) {
    handleAuthFailure();
    throw new Error(
      await extractErrorMessage(response, 'Your session has expired. Please sign in again.'),
    );
  }

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response, `Request failed (${response.status})`));
  }

  return response.json();
}

// SECURITY-FIX (AD-H2 / AD-M2): Raw variant that returns the Response untouched (for
// non-JSON payloads such as CSV export). Applies the same 401/403 session handling as
// adminFetch, so callers get consistent auth behaviour without the json() coercion.
export async function adminFetchRaw(url: string, options: RequestInit = {}): Promise<Response> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });

  if (response.status === 401 || response.status === 403) {
    handleAuthFailure();
    throw new Error('Your session has expired. Please sign in again.');
  }

  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }

  return response;
}

export const adminApi = {
  users: {
    list: (params?: string) => adminFetch(`/admin/v1/users${params || ''}`),
    getById: (id: string) => adminFetch(`/admin/v1/users/${id}`),
    suspend: (id: string) => adminFetch(`/admin/v1/users/${id}/suspend`, { method: 'PUT' }),
    unsuspend: (id: string) => adminFetch(`/admin/v1/users/${id}/unsuspend`, { method: 'PUT' }),
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
    list: (params?: string) => adminFetch(`/admin/v1/companies${params || ''}`),
    getById: (id: string) => adminFetch(`/admin/v1/companies/${id}`),
    create: (data: any) => adminFetch(`/admin/v1/companies`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => adminFetch(`/admin/v1/companies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    suspend: (id: string) => adminFetch(`/admin/v1/companies/${id}/suspend`, { method: 'PUT' }),
    approve: (id: string) => adminFetch(`/admin/v1/companies/${id}/approve`, { method: 'PUT' }),
    reject: (id: string, reason: string) => adminFetch(`/admin/v1/companies/${id}/reject`, { method: 'PUT', body: JSON.stringify({ reason }) }),
    getAgents: (id: string) => adminFetch(`/admin/v1/companies/${id}/agents`),
    inviteAgent: (id: string, email: string) => adminFetch(`/admin/v1/companies/${id}/invite-agent`, { method: 'POST', body: JSON.stringify({ email }) }),
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
    list: (params?: Record<string, any>) => adminFetch(`/admin/v1/agents${params ? '?' + new URLSearchParams(params).toString() : ''}`),
    suspend: (id: string) => adminFetch(`/admin/v1/agents/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'suspended' }) }),
    activate: (id: string) => adminFetch(`/admin/v1/agents/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'active' }) }),
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
  },
  audit: {
    logs: (params?: Record<string, any>) => adminFetch(`/admin/v1/audit/logs${params ? '?' + new URLSearchParams(params as any).toString() : ''}`),
    paystackTransactions: (params?: Record<string, any>) => adminFetch(`/admin/v1/audit/paystack-transactions${params ? '?' + new URLSearchParams(params as any).toString() : ''}`),
    paystackTransactionDetail: (id: string) => adminFetch(`/admin/v1/audit/paystack-transactions/${id}`),
  },
  ads: {
    list: () => adminFetch(`/admin/v1/ads`),
    create: (data: any) => adminFetch(`/admin/v1/ads`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => adminFetch(`/admin/v1/ads/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => adminFetch(`/admin/v1/ads/${id}`, { method: 'DELETE' }),
  },
};