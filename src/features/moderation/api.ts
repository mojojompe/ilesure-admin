import { adminFetch } from '../../api/admin';
import { toAdminApiError } from '../../api/errors';
import { KIND_SPECS, type AccountKind, type AccountOf, type StatusChange } from './kinds';

/** The transport seam: production uses adminFetch (401/403 handling), tests pass a stub. */
export type FetchJson = (path: string, init?: RequestInit) => Promise<any>;

/** Exact-match server filters, e.g. { role: 'agent,landlord' } or { status: 'suspended' }. */
export type AccountFilters = Record<string, string | undefined>;

export interface ListQuery {
  page: number;
  limit: number;
  /** Free text; escaped here because every list endpoint matches it as a regex. */
  search?: string;
  filters?: AccountFilters;
}

export interface AccountPage<K extends AccountKind> {
  rows: AccountOf<K>[];
  total: number;
  totalPages: number;
}

export interface ModerationApi {
  list<K extends AccountKind>(kind: K, query: ListQuery): Promise<AccountPage<K>>;
  /** Server-side total matching `filters` (reads the pagination block of a one-row page). */
  count(kind: AccountKind, filters?: AccountFilters): Promise<number>;
  setStatus(kind: AccountKind, id: string, change: StatusChange): Promise<void>;
  supportsReinstate(kind: AccountKind): boolean;
}

export const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function queryString(params: Record<string, string | undefined>): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') qs.set(key, value);
  }
  const s = qs.toString();
  return s ? `?${s}` : '';
}

function assertSuccess(response: any, fallback: string): void {
  // adminFetch already throws for non-OK statuses; this catches an envelope sent with 2xx.
  if (response?.success === false) throw toAdminApiError(200, response, fallback);
}

export function createModerationApi(fetchJson: FetchJson = adminFetch): ModerationApi {
  return {
    async list(kind, { page, limit, search, filters }) {
      const spec = KIND_SPECS[kind];
      const trimmed = search?.trim();
      const response = await fetchJson(
        `${spec.basePath}${queryString({
          ...filters,
          search: trimmed ? escapeRegex(trimmed) : undefined,
          page: String(page),
          limit: String(limit),
        })}`,
      );
      assertSuccess(response, spec.messages.loadFailure);
      const data = response?.data;
      const raw: any[] = Array.isArray(data) ? data : data?.[spec.listKey] ?? [];
      const rows = raw.map((r) => spec.normalise(r)) as AccountOf<typeof kind>[];
      return {
        rows,
        total: data?.pagination?.totalItems ?? rows.length,
        totalPages: Math.max(data?.pagination?.totalPages ?? 1, 1),
      };
    },

    async count(kind, filters = {}) {
      const spec = KIND_SPECS[kind];
      const response = await fetchJson(`${spec.basePath}${queryString({ ...filters, limit: '1' })}`);
      assertSuccess(response, spec.messages.loadFailure);
      return response?.data?.pagination?.totalItems ?? 0;
    },

    async setStatus(kind, id, change) {
      const request = (KIND_SPECS[kind] as (typeof KIND_SPECS)[AccountKind]).statusRequest(id, change);
      if (!request) throw new Error(`Cannot ${change} a ${kind} account: no endpoint for it.`);
      const response = await fetchJson(request.path, request.init);
      assertSuccess(response, KIND_SPECS[kind].messages.failure);
    },

    supportsReinstate(kind) {
      return (KIND_SPECS[kind] as (typeof KIND_SPECS)[AccountKind]).statusRequest('', 'reinstate') !== null;
    },
  };
}

export const moderationApi = createModerationApi();
