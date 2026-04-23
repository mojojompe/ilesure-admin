const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ilesure-backend.onrender.com';

export const API_ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/admin/v1/auth/login`,
  },
  users: {
    list: `${API_BASE_URL}/admin/v1/users`,
    getById: (id: string) => `${API_BASE_URL}/admin/v1/users/${id}`,
    suspend: (id: string) => `${API_BASE_URL}/admin/v1/users/${id}/suspend`,
    unsuspend: (id: string) => `${API_BASE_URL}/admin/v1/users/${id}/unsuspend`,
    listings: (id: string) => `${API_BASE_URL}/admin/v1/users/${id}/listings`,
  },
  listings: {
    list: `${API_BASE_URL}/admin/v1/listings`,
    getById: (id: string) => `${API_BASE_URL}/admin/v1/listings/${id}`,
    approve: (id: string) => `${API_BASE_URL}/admin/v1/listings/${id}/approve`,
    reject: (id: string) => `${API_BASE_URL}/admin/v1/listings/${id}/reject`,
  },
  companies: {
    list: `${API_BASE_URL}/admin/v1/companies`,
    getById: (id: string) => `${API_BASE_URL}/admin/v1/companies/${id}`,
    approve: (id: string) => `${API_BASE_URL}/admin/v1/companies/${id}/approve`,
    reject: (id: string) => `${API_BASE_URL}/admin/v1/companies/${id}/reject`,
  },
  verifications: {
    list: `${API_BASE_URL}/admin/v1/verifications`,
    getById: (id: string) => `${API_BASE_URL}/admin/v1/verifications/${id}`,
    approve: (id: string) => `${API_BASE_URL}/admin/v1/verifications/${id}/approve`,
    reject: (id: string) => `${API_BASE_URL}/admin/v1/verifications/${id}/reject`,
  },
  waitlist: {
    list: `${API_BASE_URL}/admin/v1/waitlist`,
    export: `${API_BASE_URL}/admin/v1/waitlist/export`,
  },
  analytics: {
    dashboard: `${API_BASE_URL}/admin/v1/analytics/dashboard`,
    waitlist: `${API_BASE_URL}/admin/v1/analytics/waitlist`,
    revenue: `${API_BASE_URL}/admin/v1/analytics/revenue`,
    listings: `${API_BASE_URL}/admin/v1/analytics/listings`,
  },
} as const;

export default API_BASE_URL;