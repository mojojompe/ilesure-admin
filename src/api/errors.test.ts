import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AdminApiError, PermissionDeniedError, errorDetails, errorMessage, toAdminApiError } from './errors';
import { adminFetch, adminFetchRaw } from './admin';

const envelope = (code: string, message: string, details?: unknown) => ({
  success: false,
  error: { code, message, ...(details !== undefined ? { details } : {}) },
});

describe('toAdminApiError', () => {
  it('carries code, message, details and status from the envelope', () => {
    const e = toAdminApiError(502, envelope('EMAIL_DISPATCH_FAILED', 'Brevo said no', { sent: 0, failed: 12 }), 'x');
    expect(e).toBeInstanceOf(AdminApiError);
    expect(e).toMatchObject({ code: 'EMAIL_DISPATCH_FAILED', message: 'Brevo said no', status: 502, details: { sent: 0, failed: 12 } });
  });

  it('falls back when the body is not an envelope', () => {
    const e = toAdminApiError(500, '<html>', 'Request failed (500)');
    expect(e).toMatchObject({ code: 'UNKNOWN_ERROR', message: 'Request failed (500)', status: 500, details: undefined });
  });

  it('makes a 403 a PermissionDeniedError that keeps the server reason', () => {
    const e = toAdminApiError(403, envelope('FORBIDDEN', 'Missing permission: write:users'), 'x');
    expect(e).toBeInstanceOf(PermissionDeniedError);
    expect(e.status).toBe(403);
    expect(e.code).toBe('FORBIDDEN');
    expect(e.message).toBe("You don't have permission to do this. Missing permission: write:users");
  });
});

describe('errorMessage / errorDetails', () => {
  it('reads thrown errors, raw envelopes and unknowns', () => {
    expect(errorMessage(new AdminApiError({ code: 'X', message: 'boom', status: 400 }), 'fb')).toBe('boom');
    expect(errorMessage(envelope('X', 'from body'), 'fb')).toBe('from body');
    expect(errorMessage({ message: 'top-level legacy' }, 'fb')).toBe('fb');
    expect(errorMessage(undefined, 'fb')).toBe('fb');
  });

  it('reads details (where retryAfter/requiresAction/counts now live), {} otherwise', () => {
    expect(errorDetails(toAdminApiError(429, envelope('RESEND_TOO_SOON', 'wait', { retryAfter: 30 }), 'x'))).toEqual({ retryAfter: 30 });
    expect(errorDetails(envelope('X', 'm', { requiresAction: 'SIGN' }))).toEqual({ requiresAction: 'SIGN' });
    expect(errorDetails(new Error('plain'))).toEqual({});
  });
});

describe('adminFetch', () => {
  const respond = (status: number, body: unknown) =>
    vi.fn(async () => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }));

  beforeEach(() => {
    localStorage.setItem('ilesure_admin_token', 'a.b.c');
    localStorage.setItem('ilesure_admin_permissions', '[]');
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it('throws the envelope as an AdminApiError and keeps the session on 400', async () => {
    vi.stubGlobal('fetch', respond(400, envelope('INVALID_STATUS', 'Company is not suspended')));
    const e = await adminFetch('/admin/v1/companies/c1/unsuspend', { method: 'PUT' }).catch((x) => x);
    expect(e).toMatchObject({ code: 'INVALID_STATUS', message: 'Company is not suspended', status: 400 });
    expect(localStorage.getItem('ilesure_admin_token')).toBe('a.b.c');
  });

  it('throws PermissionDeniedError on 403 without logging out', async () => {
    vi.stubGlobal('fetch', respond(403, envelope('FORBIDDEN', 'Missing permission: write:companies')));
    await expect(adminFetch('/x')).rejects.toBeInstanceOf(PermissionDeniedError);
    expect(localStorage.getItem('ilesure_admin_token')).toBe('a.b.c');
  });

  it('clears the session on 401 and still reports the envelope', async () => {
    vi.stubGlobal('fetch', respond(401, envelope('UNAUTHORIZED', 'Token expired')));
    const e = await adminFetchRaw('/x').catch((x) => x);
    expect(e).toMatchObject({ code: 'UNAUTHORIZED', message: 'Token expired', status: 401 });
    expect(localStorage.getItem('ilesure_admin_token')).toBeNull();
    expect(localStorage.getItem('ilesure_admin_permissions')).toBeNull();
  });

  it('parses OK bodies', async () => {
    vi.stubGlobal('fetch', respond(200, { success: true, data: { ok: 1 } }));
    await expect(adminFetch('/x')).resolves.toEqual({ success: true, data: { ok: 1 } });
  });
});
