import { describe, it, expect, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createModerationApi, useAccountModeration, type FetchJson } from './index';
import { AdminApiError } from '../../api/errors';

interface Call { path: string; init?: RequestInit }

/** Stub transport: records every request and answers from `respond`. */
function stubFetch(respond: (path: string, init?: RequestInit) => any = () => ({ success: true, data: {} })) {
  const calls: Call[] = [];
  const fetchJson: FetchJson = vi.fn(async (path: string, init?: RequestInit) => {
    calls.push({ path, init });
    return respond(path, init);
  });
  return { fetchJson, calls };
}

const params = (path: string) => Object.fromEntries(new URL(path, 'http://x').searchParams);
const pathname = (path: string) => new URL(path, 'http://x').pathname;

const page = (key: string, rows: any[], totalItems: number, totalPages: number) => ({
  success: true,
  data: { [key]: rows, pagination: { totalItems, totalPages } },
});

describe('moderation api: listing', () => {
  it('pages, filters and searches users on the server, escaping the regex search', async () => {
    const { fetchJson, calls } = stubFetch(() => page('users', [], 0, 1));
    await createModerationApi(fetchJson).list('user', {
      page: 3, limit: 25, search: '  a+b (x) ', filters: { role: 'agent,landlord', status: undefined },
    });
    expect(pathname(calls[0].path)).toBe('/admin/v1/users');
    expect(params(calls[0].path)).toEqual({ role: 'agent,landlord', search: 'a\\+b \\(x\\)', page: '3', limit: '25' });
  });

  it('uses server paging for agents and companies too', async () => {
    const { fetchJson, calls } = stubFetch((p) => page(p.includes('agents') ? 'agents' : 'companies', [], 0, 1));
    const api = createModerationApi(fetchJson);
    await api.list('agent', { page: 2, limit: 25, search: 'ade' });
    await api.list('company', { page: 1, limit: 25, filters: { status: 'pending' } });
    expect(pathname(calls[0].path)).toBe('/admin/v1/agents');
    expect(params(calls[0].path)).toEqual({ search: 'ade', page: '2', limit: '25' });
    expect(pathname(calls[1].path)).toBe('/admin/v1/companies');
    expect(params(calls[1].path)).toEqual({ status: 'pending', page: '1', limit: '25' });
  });

  it('normalises each kind into its row shape and reads server totals', async () => {
    const { fetchJson } = stubFetch((p) => {
      if (p.startsWith('/admin/v1/users')) {
        return page('users', [{ _id: 'u1', fullName: 'Ada', email: 'a@x', role: 'student', status: 'active', createdAt: '2026-01-02T10:00:00Z' }], 51, 3);
      }
      if (p.startsWith('/admin/v1/agents')) {
        return page('agents', [{ id: 'g1', fullName: 'Bola', verificationStatus: 'verified', status: 'active', listingsCount: 4 }], 1, 1);
      }
      return page('companies', [{ _id: 'c1', name: 'Acme', status: 'pending', createdAt: '2026-03-04T00:00:00Z' }], 1, 1);
    });
    const api = createModerationApi(fetchJson);

    const users = await api.list('user', { page: 1, limit: 25 });
    expect(users.total).toBe(51);
    expect(users.totalPages).toBe(3);
    expect(users.rows[0]).toMatchObject({ id: 'u1', name: 'Ada', role: 'tenant', joinDate: '2026-01-02', phone: '', listings: 0, bookings: 0 });

    const agents = await api.list('agent', { page: 1, limit: 25 });
    expect(agents.rows[0]).toMatchObject({ id: 'g1', name: 'Bola', isVerified: true, tier: 'free', listingsCount: 4, rewardPoints: 0 });

    const companies = await api.list('company', { page: 1, limit: 25 });
    expect(companies.rows[0]).toMatchObject({ id: 'c1', name: 'Acme', joinDate: '2026-03-04', agentsCount: 0, tier: 'free', cacNumber: '' });
  });

  it('counts with a one-row request and reads totalItems', async () => {
    const { fetchJson, calls } = stubFetch(() => page('users', [{}], 42, 42));
    expect(await createModerationApi(fetchJson).count('user', { status: 'suspended' })).toBe(42);
    expect(params(calls[0].path)).toEqual({ status: 'suspended', limit: '1' });
  });

  it('throws the server message on success: false', async () => {
    const { fetchJson } = stubFetch(() => ({ success: false, error: { code: 'SERVER_ERROR', message: 'nope' } }));
    await expect(createModerationApi(fetchJson).list('agent', { page: 1, limit: 25 })).rejects.toThrow('nope');
  });
});

describe('moderation api: status changes use each kind’s endpoint', () => {
  it.each([
    ['user', 'suspend', '/admin/v1/users/id1/suspend', 'PUT', undefined],
    ['user', 'reinstate', '/admin/v1/users/id1/unsuspend', 'PUT', undefined],
    ['agent', 'suspend', '/admin/v1/agents/id1/status', 'PATCH', { status: 'suspended' }],
    ['agent', 'reinstate', '/admin/v1/agents/id1/status', 'PATCH', { status: 'active' }],
    ['company', 'suspend', '/admin/v1/companies/id1/suspend', 'PUT', undefined],
    ['company', 'reinstate', '/admin/v1/companies/id1/unsuspend', 'PUT', undefined],
  ] as const)('%s %s -> %s %s', async (kind: any, change: any, path: string, method: string, body: any) => {
    const { fetchJson, calls } = stubFetch(() => ({ success: true }));
    await createModerationApi(fetchJson).setStatus(kind, 'id1', change);
    expect(calls).toHaveLength(1);
    expect(calls[0].path).toBe(path);
    expect(calls[0].init?.method).toBe(method);
    expect(calls[0].init?.body ? JSON.parse(calls[0].init.body as string) : undefined).toEqual(body);
  });

  it('supports reinstating every kind, companies included', () => {
    const api = createModerationApi(stubFetch().fetchJson);
    expect(api.supportsReinstate('company')).toBe(true);
    expect(api.supportsReinstate('user')).toBe(true);
    expect(api.supportsReinstate('agent')).toBe(true);
  });

  it('surfaces the backend refusal to reinstate a company that is not suspended', async () => {
    const { fetchJson } = stubFetch(() => ({
      success: false,
      error: { code: 'INVALID_STATUS', message: 'Company is not suspended' },
    }));
    const error = await createModerationApi(fetchJson).setStatus('company', 'c1', 'reinstate').catch((e) => e);
    expect(error).toBeInstanceOf(AdminApiError);
    expect(error).toMatchObject({ code: 'INVALID_STATUS', message: 'Company is not suspended' });
  });
});

describe('useAccountModeration', () => {
  const userPage = (p: string) => {
    const q = params(p);
    if (q.limit === '1') return page('users', [], q.status === 'suspended' ? 2 : 60, 60);
    const n = Number(q.page);
    return page('users', [{ _id: `u${n}`, fullName: `User ${n}`, status: 'active' }], 60, 3);
  };

  it('loads page 1 of 25 and the named server counts', async () => {
    const { fetchJson, calls } = stubFetch(userPage);
    const api = createModerationApi(fetchJson);
    const { result } = renderHook(() =>
      useAccountModeration('user', { api, counts: { all: {}, suspended: { status: 'suspended' } } }));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.rows.map((r: any) => r.id)).toEqual(['u1']);
    expect(result.current.total).toBe(60);
    expect(result.current.totalPages).toBe(3);
    expect(result.current.range).toEqual({ first: 1, last: 1 });
    await waitFor(() => expect(result.current.counts).toEqual({ all: 60, suspended: 2 }));
    const listCall = calls.find(c => params(c.path).limit === '25')!;
    expect(params(listCall.path)).toEqual({ page: '1', limit: '25' });
  });

  it('a new search goes back to page 1 and is sent to the server', async () => {
    const { fetchJson, calls } = stubFetch(userPage);
    const api = createModerationApi(fetchJson);
    const { result } = renderHook(() => useAccountModeration('user', { api, debounceMs: 5 }));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setPage(2));
    await waitFor(() => expect(result.current.rows[0]?.id).toBe('u2'));
    expect(result.current.range).toEqual({ first: 26, last: 26 });

    act(() => result.current.setSearch('ada'));
    await waitFor(() => expect(params(calls[calls.length - 1].path).search).toBe('ada'));
    expect(result.current.page).toBe(1);
    expect(params(calls[calls.length - 1].path).page).toBe('1');
  });

  it('ignores a slower response for an older page', async () => {
    const resolvers: Record<string, (v: any) => void> = {};
    const fetchJson: FetchJson = (path) => new Promise(resolve => { resolvers[params(path).page] = resolve; });
    const api = createModerationApi(fetchJson);
    const { result } = renderHook(() => useAccountModeration('agent', { api }));

    await waitFor(() => expect(resolvers['1']).toBeDefined());
    act(() => result.current.setPage(2));
    await waitFor(() => expect(resolvers['2']).toBeDefined());

    await act(async () => resolvers['2'](page('agents', [{ id: 'new' }], 30, 2)));
    await act(async () => resolvers['1'](page('agents', [{ id: 'stale' }], 30, 2)));
    expect(result.current.rows.map((r: any) => r.id)).toEqual(['new']);
    expect(result.current.page).toBe(2);
  });

  it('changeStatus hits the kind’s endpoint, then refetches rows and counts', async () => {
    const { fetchJson, calls } = stubFetch((p, init) =>
      init?.method ? { success: true } : page('agents', [{ id: 'g1', status: 'active' }], 1, 1));
    const api = createModerationApi(fetchJson);
    const { result } = renderHook(() =>
      useAccountModeration('agent', { api, counts: { suspended: { status: 'suspended' } } }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    const before = calls.length;

    let ok = false;
    await act(async () => { ok = await result.current.changeStatus(result.current.rows[0], 'suspend'); });

    expect(ok).toBe(true);
    const after = calls.slice(before);
    expect(after[0]).toMatchObject({ path: '/admin/v1/agents/g1/status', init: { method: 'PATCH' } });
    expect(after.slice(1).map(c => params(c.path).limit).sort()).toEqual(['1', '25']);
  });

  it('changeStatus reinstates a suspended company through PUT /companies/:id/unsuspend', async () => {
    const { fetchJson, calls } = stubFetch((p) =>
      p.includes('/unsuspend') ? { success: true } : page('companies', [{ _id: 'c1', name: 'Acme', status: 'suspended' }], 1, 1));
    const api = createModerationApi(fetchJson);
    const { result } = renderHook(() => useAccountModeration('company', { api }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.canReinstate).toBe(true);

    let ok = false;
    await act(async () => { ok = await result.current.changeStatus(result.current.rows[0], 'reinstate'); });
    expect(ok).toBe(true);
    expect(calls.find(c => c.init?.method === 'PUT')?.path).toBe('/admin/v1/companies/c1/unsuspend');
  });

  it('changeStatus resolves false and makes no refetch when the server refuses', async () => {
    const { fetchJson, calls } = stubFetch((p, init) => {
      if (init?.method) throw new Error("You don't have permission to do this.");
      return page('users', [{ _id: 'u1', status: 'active' }], 1, 1);
    });
    const api = createModerationApi(fetchJson);
    const { result } = renderHook(() => useAccountModeration('user', { api }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    const before = calls.length;

    let ok = true;
    await act(async () => { ok = await result.current.changeStatus(result.current.rows[0], 'suspend'); });
    expect(ok).toBe(false);
    expect(calls.length - before).toBe(1);
  });
});
