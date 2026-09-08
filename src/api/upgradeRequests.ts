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

export interface IndividualRequest {
  _id: string;
  title: string;
  description: string;
  category: string;
  userName: string;
  userEmail?: string;
  userRole: string;
  status: string;
  votesCount: number;
  keywords: string[];
  adminNotes?: string;
  createdAt: string;
}

export interface RankedStack {
  rank: number;
  stackId: string;
  stackTitle: string;
  category: string;
  status: 'pending' | 'under_review' | 'planned' | 'in_progress' | 'completed' | 'declined';
  requestCount: number;
  totalVotes: number;
  topKeywords: string[];
  latestRequestedAt: string;
  requests: IndividualRequest[];
}

export interface RankedStacksResponse {
  success: boolean;
  summary: {
    totalStacks: number;
    totalRequests: number;
    plannedCount: number;
    inProgressCount: number;
    completedCount: number;
  };
  data: RankedStack[];
}

export const upgradeRequestsApi = {
  async getRankedStacks(status?: string): Promise<RankedStacksResponse> {
    const query = status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : '';
    return adminFetch(`/admin/v1/upgrade-requests/ranked-stacks${query}`);
  },

  async updateStackStatus(
    stackId: string,
    payload: { status?: string; adminNotes?: string; stackTitle?: string }
  ): Promise<{ success: boolean; message: string }> {
    return adminFetch(`/admin/v1/upgrade-requests/stack/${encodeURIComponent(stackId)}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
};

export default upgradeRequestsApi;
