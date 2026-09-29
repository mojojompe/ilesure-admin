// Shares admin.ts's adminFetch so 401/403 handling cannot drift between two copies
// (a 403 permission refusal must not log the admin out).
import { adminFetch } from './admin';

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
