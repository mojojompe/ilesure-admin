import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { moderationApi, type AccountFilters, type ModerationApi } from './api';
import { KIND_SPECS, type AccountKind, type AccountOf, type StatusChange } from './kinds';
import { errorMessage } from '../../api/errors';

export interface ModerationOptions<C extends string> {
  /** Server filters for the table (e.g. the Users tab's role). Changing them returns to page 1. */
  filters?: AccountFilters;
  /** Named server totals for summary cards, e.g. { suspended: { status: 'suspended' } }. */
  counts?: Record<C, AccountFilters>;
  pageSize?: number;
  debounceMs?: number;
  /** Seam for tests; defaults to the adminFetch-backed adapter. */
  api?: ModerationApi;
}

export interface AccountModeration<K extends AccountKind, C extends string> {
  rows: AccountOf<K>[];
  loading: boolean;
  /** Rows matching the current filters + search, across all pages. */
  total: number;
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  /** 1-based index range of the rows on screen (0–0 when empty). */
  range: { first: number; last: number };
  search: string;
  setSearch: (value: string) => void;
  counts: Record<C, number>;
  /** Suspends/reinstates, then refetches rows and counts and toasts. Resolves true on success. */
  changeStatus: (account: AccountOf<K>, change: StatusChange) => Promise<boolean>;
  canReinstate: boolean;
  /** Refetch rows and counts, e.g. after a page-specific action such as approving a company. */
  refresh: () => Promise<void>;
}

export const DEFAULT_PAGE_SIZE = 25;

/**
 * One account-moderation list: server-side paging, debounced + escaped search, a stale
 * response guard, server-total summary counts, and status changes for users, agents or
 * companies. Pages supply only their columns and extra actions.
 */
export function useAccountModeration<K extends AccountKind, C extends string = never>(
  kind: K,
  options: ModerationOptions<C> = {},
): AccountModeration<K, C> {
  const { pageSize = DEFAULT_PAGE_SIZE, debounceMs = 300, api = moderationApi } = options;
  const spec = KIND_SPECS[kind];

  // Callers pass object literals; key them by value so a re-render doesn't refetch.
  const filtersKey = JSON.stringify(options.filters ?? {});
  const countsKey = JSON.stringify(options.counts ?? {});
  const filters = useMemo(() => JSON.parse(filtersKey) as AccountFilters, [filtersKey]);
  const countSpecs = useMemo(() => JSON.parse(countsKey) as Record<C, AccountFilters>, [countsKey]);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), debounceMs);
    return () => clearTimeout(timer);
  }, [search, debounceMs]);

  // The page belongs to one filter+search combination; a new combination starts at 1
  // without an extra fetch of the old page number.
  const queryKey = `${filtersKey}|${debouncedSearch}`;
  const [pageState, setPageState] = useState({ key: queryKey, page: 1 });
  const page = pageState.key === queryKey ? pageState.page : 1;

  const [rows, setRows] = useState<AccountOf<K>[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState<Record<C, number>>(() => zeroCounts(countSpecs));
  const requestSeq = useRef(0);

  const fetchRows = useCallback(async () => {
    const seq = ++requestSeq.current;
    setLoading(true);
    try {
      const result = await api.list(kind, { page, limit: pageSize, search: debouncedSearch, filters });
      // A slower response for an older page/filter/search must not overwrite a newer one.
      if (seq !== requestSeq.current) return;
      setRows(result.rows);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (error: any) {
      if (seq !== requestSeq.current) return;
      console.error(`Failed to fetch ${kind} accounts:`, error);
      toast.error(errorMessage(error, spec.messages.loadFailure));
    } finally {
      if (seq === requestSeq.current) setLoading(false);
    }
  }, [api, kind, page, pageSize, debouncedSearch, filters, spec]);

  const fetchCounts = useCallback(async () => {
    const names = Object.keys(countSpecs) as C[];
    if (names.length === 0) return;
    try {
      const values = await Promise.all(names.map((n) => api.count(kind, countSpecs[n])));
      setCounts(Object.fromEntries(names.map((n, i) => [n, values[i]])) as Record<C, number>);
    } catch {
      // Summary cards are secondary; the table reports its own errors.
    }
  }, [api, kind, countSpecs]);

  useEffect(() => { fetchRows(); }, [fetchRows]);
  useEffect(() => { fetchCounts(); }, [fetchCounts]);

  const refresh = useCallback(async () => {
    await Promise.all([fetchRows(), fetchCounts()]);
  }, [fetchRows, fetchCounts]);

  const changeStatus = useCallback(
    async (account: AccountOf<K>, change: StatusChange) => {
      try {
        await api.setStatus(kind, account.id, change);
        await refresh();
        toast.success(spec.messages[change]);
        return true;
      } catch (error: any) {
        console.error(`Failed to ${change} ${kind}:`, error);
        toast.error(errorMessage(error, spec.messages.failure));
        return false;
      }
    },
    [api, kind, refresh, spec],
  );

  const setPage = useCallback(
    (next: number) => setPageState({ key: queryKey, page: Math.max(1, next) }),
    [queryKey],
  );

  return {
    rows,
    loading,
    total,
    page,
    totalPages,
    setPage,
    range: {
      first: rows.length === 0 ? 0 : (page - 1) * pageSize + 1,
      last: rows.length === 0 ? 0 : (page - 1) * pageSize + rows.length,
    },
    search,
    setSearch,
    counts,
    changeStatus,
    canReinstate: api.supportsReinstate(kind),
    refresh,
  };
}

function zeroCounts<C extends string>(specs: Record<C, AccountFilters>): Record<C, number> {
  return Object.fromEntries(Object.keys(specs).map((k) => [k, 0])) as Record<C, number>;
}
