import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { deriveSidebar, routeDecision, isActivePath, type NavEntry, type CanFn } from './access';
import { NAV_TABLE } from './routeTable';
import { RouteGuard } from './RouteGuard';
import { can, PAGE_CAP, type Capability } from '../lib/rbac';

const Icon = () => null;
const entry = (path: string, section: string, requires?: Capability[], placement?: 'footer'): NavEntry =>
  ({ path, label: path, icon: Icon, element: <p>{`page ${path}`}</p>, section, requires, placement });

const FIXTURE = [
  entry('/', 'Core'),
  entry('/users', 'People', [PAGE_CAP.USERS]),
  entry('/agents', 'People', [PAGE_CAP.AGENTS]),
  entry('/ads', 'Growth', [PAGE_CAP.ADS]),
  entry('/notifications', 'Growth', [PAGE_CAP.NOTIFICATIONS_SEND, PAGE_CAP.EMAILS_READ]),
  entry('/settings', 'Account', undefined, 'footer'),
];

const allow = (...caps: string[]): CanFn => cap => caps.includes(cap);
const paths = (r: ReturnType<typeof deriveSidebar>) => ({
  sections: r.sections.map(s => [s.title, s.items.map(i => i.path)]),
  footer: r.footer.map(i => i.path),
});

describe('deriveSidebar', () => {
  it('keeps table order and groups for an admin who can do everything', () => {
    expect(paths(deriveSidebar(FIXTURE, () => true))).toEqual({
      sections: [['Core', ['/']], ['People', ['/users', '/agents']], ['Growth', ['/ads', '/notifications']]],
      footer: ['/settings'],
    });
  });

  it('hides items the admin cannot access and drops groups left empty', () => {
    expect(paths(deriveSidebar(FIXTURE, allow(PAGE_CAP.USERS)))).toEqual({
      sections: [['Core', ['/']], ['People', ['/users']]],
      footer: ['/settings'],
    });
  });

  it('treats `requires` as any-of', () => {
    const r = deriveSidebar(FIXTURE, allow(PAGE_CAP.EMAILS_READ));
    expect(r.sections.find(s => s.title === 'Growth')?.items.map(i => i.path)).toEqual(['/notifications']);
  });
});

describe('route guard decisions', () => {
  it('renders open pages and pages the admin holds a capability for; forbids the rest', () => {
    const check = allow(PAGE_CAP.USERS);
    expect(routeDecision(FIXTURE[0], check)).toBe('render');
    expect(routeDecision(FIXTURE[1], check)).toBe('render');
    expect(routeDecision(FIXTURE[2], check)).toBe('forbidden');
  });

  it('shows a permission message instead of the page on a forbidden route', () => {
    render(<MemoryRouter><RouteGuard entry={FIXTURE[2]} check={allow()} /></MemoryRouter>);
    expect(screen.getByText('No access to /agents')).toBeTruthy();
    expect(screen.queryByText('page /agents')).toBeNull();
  });

  it('renders the page when allowed', () => {
    render(<MemoryRouter><RouteGuard entry={FIXTURE[2]} check={allow(PAGE_CAP.AGENTS)} /></MemoryRouter>);
    expect(screen.getByText('page /agents')).toBeTruthy();
  });

  it('matches active paths without prefix bleed', () => {
    expect(isActivePath('/', '/')).toBe(true);
    expect(isActivePath('/', '/users')).toBe(false);
    expect(isActivePath('/agents', '/agents')).toBe(true);
    expect(isActivePath('/agents', '/agent-reviews')).toBe(false);
  });
});

describe('the real NAV_TABLE', () => {
  it('keeps the existing URLs, labels and sidebar order', () => {
    const r = deriveSidebar(NAV_TABLE, () => true);
    expect(r.sections.map(s => [s.title, s.items.map(i => i.label)])).toEqual([
      ['Core', ['Dashboard', 'Listings', 'Verification']],
      ['People', ['Users', 'Agents', 'Reviews', 'Companies']],
      ['Operations', ['Bookings', 'Payments', 'Feature Upgrades', 'Reports', 'Waitlist']],
      ['Growth', ['Analytics', 'Tiers', 'Notifications', 'Ads', 'Audit Logs']],
    ]);
    expect(r.footer.map(i => i.path)).toEqual(['/settings']);
    expect(NAV_TABLE).toHaveLength(18);
    expect(new Set(NAV_TABLE.map(e => e.path)).size).toBe(18);
  });

  it('leaves Dashboard, Feature Upgrades and Settings open to every admin', () => {
    const r = deriveSidebar(NAV_TABLE, () => false);
    expect([...r.sections.flatMap(s => s.items), ...r.footer].map(i => i.path)).toEqual(['/', '/upgrade-requests', '/settings']);
  });
});

describe('with rbac.can and a real session', () => {
  const token = (claims: object) =>
    `h.${btoa(JSON.stringify({ exp: Date.now() / 1000 + 3600, ...claims })).replace(/=+$/, '')}.s`;
  const visible = () => {
    const r = deriveSidebar(NAV_TABLE, can);
    return [...r.sections.flatMap(s => s.items), ...r.footer].map(i => i.path);
  };

  beforeEach(() => localStorage.clear());

  it('super_admin sees every page', () => {
    localStorage.setItem('ilesure_admin_token', token({ role: 'super_admin' }));
    expect(visible()).toHaveLength(18);
  });

  it('a moderator sees only the pages its saved login permissions allow', () => {
    localStorage.setItem('ilesure_admin_token', token({ role: 'moderator' }));
    localStorage.setItem('ilesure_admin_permissions', JSON.stringify(['read:listings', 'write:listings']));
    expect(visible()).toEqual(['/', '/listings', '/upgrade-requests', '/settings']);
  });

  it('a moderator session without saved permissions keeps every page (backend enforces)', () => {
    localStorage.setItem('ilesure_admin_token', token({ role: 'moderator' }));
    expect(visible()).toHaveLength(18);
  });
});
