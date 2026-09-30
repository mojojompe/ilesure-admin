import { describe, it, expect, beforeEach } from 'vitest';
import { ADMIN_ACTION_PERMISSIONS, type AdminAction } from '../contracts/generated';
import { CAP, PAGE_CAP, can, canWith, requiredPermission, type AdminSession } from './rbac';

const session = (over: Partial<AdminSession>): AdminSession => ({
  role: 'moderator',
  permissions: [],
  permissionsKnown: true,
  ...over,
});

describe('requiredPermission', () => {
  it('resolves every action name through the contract map', () => {
    for (const action of Object.keys(ADMIN_ACTION_PERMISSIONS) as AdminAction[]) {
      expect(requiredPermission(action)).toBe(ADMIN_ACTION_PERMISSIONS[action]);
    }
    expect(requiredPermission(CAP.USERS_SUSPEND)).toBe('write:users');
    expect(requiredPermission(CAP.EMAILS_SEND)).toBe('write:emails');
  });

  it('passes backend permissions through unchanged', () => {
    expect(requiredPermission(PAGE_CAP.USERS)).toBe('read:users');
  });

  it('only names actions the contract knows', () => {
    for (const action of Object.values(CAP)) expect(ADMIN_ACTION_PERMISSIONS).toHaveProperty([action]);
  });
});

describe('canWith', () => {
  it('lets an admin holding write:users suspend users (the old verbatim match never did)', () => {
    const s = session({ permissions: ['read:users', 'write:users'] });
    expect(canWith(s, CAP.USERS_SUSPEND)).toBe(true);
    expect(canWith(s, CAP.COMPANIES_SUSPEND)).toBe(false);
  });

  it('does not treat the action name itself as a grant', () => {
    expect(canWith(session({ permissions: ['users.suspend'] }), CAP.USERS_SUSPEND)).toBe(false);
  });

  it('gates pages on read:<resource>; write alone does not open a page', () => {
    expect(canWith(session({ permissions: ['read:companies'] }), PAGE_CAP.COMPANIES)).toBe(true);
    expect(canWith(session({ permissions: ['write:companies'] }), PAGE_CAP.COMPANIES)).toBe(false);
  });

  it('lets super_admin do everything', () => {
    const s = session({ role: 'super_admin' });
    expect(canWith(s, CAP.TIERS_MANAGE)).toBe(true);
    expect(canWith(s, PAGE_CAP.AUDIT)).toBe(true);
  });

  describe('session without saved permissions (signed in before they were stored)', () => {
    const legacy = (role: string | null) => session({ role, permissions: [], permissionsKnown: false });

    it('shows every page', () => {
      expect(canWith(legacy('moderator'), PAGE_CAP.PAYMENTS)).toBe(true);
    });

    it('keeps actions from a known limited role', () => {
      expect(canWith(legacy('support'), CAP.USERS_SUSPEND)).toBe(false);
    });

    it('allows actions for an opaque token with no role', () => {
      expect(canWith(legacy(null), CAP.USERS_SUSPEND)).toBe(true);
    });
  });
});

describe('can (reads the stored session)', () => {
  const token = (claims: object) =>
    `h.${btoa(JSON.stringify({ exp: Date.now() / 1000 + 3600, ...claims })).replace(/=+$/, '')}.s`;

  beforeEach(() => localStorage.clear());

  it('resolves actions against the login response permissions', () => {
    localStorage.setItem('ilesure_admin_token', token({ role: 'moderator' }));
    localStorage.setItem('ilesure_admin_permissions', JSON.stringify(['read:listings', 'write:listings']));
    expect(can(CAP.LISTINGS_MODERATE)).toBe(true);
    expect(can(CAP.USERS_SUSPEND)).toBe(false);
    expect(can(PAGE_CAP.LISTINGS)).toBe(true);
    expect(can(PAGE_CAP.USERS)).toBe(false);
  });
});
