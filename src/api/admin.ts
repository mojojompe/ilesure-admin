import API_BASE_URL from '../lib/config';
import { getAdminToken } from './auth';

function getHeaders(): HeadersInit {
  const token = getAdminToken();
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function adminFetch(url: string, options: RequestInit = {}): Promise<any> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });
  return response.json();
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
    approve: (id: string) => adminFetch(`/admin/v1/listings/${id}/approve`, { method: 'PUT' }),
    reject: (id: string, reason: string) => adminFetch(`/admin/v1/listings/${id}/reject`, { method: 'PUT', body: JSON.stringify({ reason }) }),
    requestChanges: (id: string, message: string) => adminFetch(`/admin/v1/listings/${id}/request-changes`, { method: 'PUT', body: JSON.stringify({ message }) }),
    archive: (id: string) => adminFetch(`/admin/v1/listings/${id}/archive`, { method: 'PUT' }),
    updateStatus: (id: string, status: string) => adminFetch(`/admin/v1/listings/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  },
  companies: {
    list: (params?: string) => adminFetch(`/admin/v1/companies${params || ''}`),
    getById: (id: string) => adminFetch(`/admin/v1/companies/${id}`),
    create: (data: any) => adminFetch(`/admin/v1/companies`, { method: 'POST', body: JSON.stringify(data) }),
    approve: (id: string) => adminFetch(`/admin/v1/companies/${id}/approve`, { method: 'PUT' }),
    reject: (id: string, reason: string) => adminFetch(`/admin/v1/companies/${id}/reject`, { method: 'PUT', body: JSON.stringify({ reason }) }),
    getAgents: (id: string) => adminFetch(`/admin/v1/companies/${id}/agents`),
    inviteAgent: (id: string, email: string) => adminFetch(`/admin/v1/companies/${id}/invite-agent`, { method: 'POST', body: JSON.stringify({ email }) }),
  },
  verifications: {
    list: (params?: string) => adminFetch(`/admin/v1/verifications${params || ''}`),
    getById: (id: string) => adminFetch(`/admin/v1/verifications/${id}`),
    updateChecklist: (id: string, checklist: any) => adminFetch(`/admin/v1/verifications/${id}/checklist`, { method: 'PUT', body: JSON.stringify({ checklist }) }),
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
    updateNotifications: (data: any) => adminFetch(`/admin/v1/settings/notifications`, { method: 'PUT', body: JSON.stringify(data) }),
  },
};