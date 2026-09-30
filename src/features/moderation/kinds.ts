/**
 * Per-kind knowledge for account moderation: which endpoint lists the kind, where the
 * rows sit in the response, how a raw row becomes a table row, and which request
 * suspends or reinstates one. This is the only file that knows the three endpoints
 * differ (users and companies: PUT suspend/unsuspend, agents: PATCH status).
 */

export type AccountKind = 'user' | 'agent' | 'company';
export type StatusChange = 'suspend' | 'reinstate';

interface AccountBase {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  joinDate: string;
}

export interface UserAccount extends AccountBase {
  /** Display role: the API's 'student' is shown as 'tenant', 'company' as 'company_admin'. */
  role: string;
  verificationStatus: string;
  university: string;
  listings: number;
  bookings: number;
}

interface PayoutDetails {
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  subaccountCode?: string;
}

export interface AgentAccount extends AccountBase, PayoutDetails {
  tier: string;
  verificationStatus: string;
  isVerified: boolean;
  listingsCount: number;
  rewardPoints: number;
  purchasedSlots: number;
}

export interface CompanyAccount extends AccountBase, PayoutDetails {
  tradingName?: string;
  cacNumber: string;
  tin: string;
  tier: string;
  director: string;
  officeAddress: string;
  agentsCount: number;
  listingsCount: number;
}

export interface AccountByKind {
  user: UserAccount;
  agent: AgentAccount;
  company: CompanyAccount;
}
export type AccountOf<K extends AccountKind> = AccountByKind[K];

export interface StatusRequest {
  path: string;
  init: RequestInit;
}

export interface KindSpec<K extends AccountKind> {
  basePath: string;
  /** Key of the row array inside `response.data`. */
  listKey: string;
  normalise: (raw: any) => AccountOf<K>;
  /** null when the backend has no endpoint for that change. */
  statusRequest: (id: string, change: StatusChange) => StatusRequest | null;
  messages: { suspend: string; reinstate: string; failure: string; loadFailure: string };
}

const isoDate = (value: unknown): string => {
  if (!value) return '';
  const d = new Date(value as string);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
};

const idOf = (raw: any): string => String(raw?._id ?? raw?.id ?? '');

const USER_ROLE_DISPLAY: Record<string, string> = { student: 'tenant', company: 'company_admin' };

const payout = (raw: any): PayoutDetails => ({
  bankName: raw.bankName,
  accountName: raw.accountName,
  accountNumber: raw.accountNumber,
  subaccountCode: raw.subaccountCode,
});

export const KIND_SPECS: { [K in AccountKind]: KindSpec<K> } = {
  user: {
    basePath: '/admin/v1/users',
    listKey: 'users',
    normalise: (u) => ({
      id: idOf(u),
      name: u.fullName || u.name || '',
      email: u.email ?? '',
      phone: u.phone || '',
      role: USER_ROLE_DISPLAY[u.role] ?? u.role,
      status: u.status,
      verificationStatus: u.verificationStatus,
      university: u.university || '',
      joinDate: isoDate(u.createdAt),
      listings: u.listings ?? 0,
      bookings: u.bookings ?? 0,
    }),
    statusRequest: (id, change) => ({
      path: `/admin/v1/users/${id}/${change === 'suspend' ? 'suspend' : 'unsuspend'}`,
      init: { method: 'PUT' },
    }),
    messages: {
      suspend: 'User suspended successfully',
      reinstate: 'User unsuspended successfully',
      failure: 'Failed to update user status',
      loadFailure: 'Failed to fetch users',
    },
  },
  agent: {
    basePath: '/admin/v1/agents',
    listKey: 'agents',
    normalise: (a) => ({
      id: idOf(a),
      name: a.fullName || a.name || '',
      email: a.email ?? '',
      phone: a.phone || '',
      status: a.status,
      joinDate: isoDate(a.joinDate || a.createdAt),
      tier: a.tier || 'free',
      verificationStatus: a.verificationStatus,
      isVerified: a.isVerified ?? a.verificationStatus === 'verified',
      listingsCount: a.listingsCount ?? 0,
      rewardPoints: a.rewardPoints ?? 0,
      purchasedSlots: a.purchasedSlots ?? 0,
      ...payout(a),
    }),
    statusRequest: (id, change) => ({
      path: `/admin/v1/agents/${id}/status`,
      init: {
        method: 'PATCH',
        body: JSON.stringify({ status: change === 'suspend' ? 'suspended' : 'active' }),
      },
    }),
    messages: {
      suspend: 'Agent suspended successfully',
      reinstate: 'Agent activated successfully',
      failure: 'Failed to update agent status',
      loadFailure: 'Failed to fetch agents',
    },
  },
  company: {
    basePath: '/admin/v1/companies',
    listKey: 'companies',
    normalise: (c) => ({
      id: idOf(c),
      name: c.name || '',
      email: c.email ?? '',
      phone: c.phone || '',
      status: c.status,
      joinDate: isoDate(c.joinDate || c.createdAt),
      tradingName: c.tradingName,
      cacNumber: c.cacNumber ?? '',
      tin: c.tin ?? '',
      tier: c.tier || 'free',
      director: c.director ?? '',
      officeAddress: c.officeAddress ?? '',
      agentsCount: c.agentsCount ?? 0,
      listingsCount: c.listingsCount ?? 0,
      ...payout(c),
    }),
    // PUT /companies/:id/unsuspend (write:companies) restores a suspended company to
    // 'verified'; it answers 400 INVALID_STATUS when the company is not suspended.
    statusRequest: (id, change) => ({
      path: `/admin/v1/companies/${id}/${change === 'suspend' ? 'suspend' : 'unsuspend'}`,
      init: { method: 'PUT' },
    }),
    messages: {
      suspend: 'Company suspended successfully',
      reinstate: 'Company reinstated successfully',
      failure: 'Failed to update company status',
      loadFailure: 'Failed to fetch companies',
    },
  },
};
