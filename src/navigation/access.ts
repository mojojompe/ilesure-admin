import type { ComponentType, ReactNode } from 'react';
import type { Capability } from '../lib/rbac';

/**
 * One admin page: its URL, sidebar label/icon/group, the element it renders, and the
 * capabilities that grant access (any one of them). Routes, the sidebar and the route
 * guard are all derived from a list of these (see routeTable.tsx).
 */
export interface NavEntry {
  /** Absolute path, e.g. '/' or '/users'. '/' becomes the index route. */
  path: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  element: ReactNode;
  /** Sidebar group title. Ignored for footer entries. */
  section: string;
  /** 'footer' entries render in the sidebar's bottom block (Settings). Default 'main'. */
  placement?: 'main' | 'footer';
  /** Any one of these grants access. Omitted/empty = every signed-in admin. */
  requires?: readonly Capability[];
}

export type CanFn = (capability: Capability) => boolean;

export interface SidebarSection<E extends NavEntry = NavEntry> {
  title: string;
  items: E[];
}

export function canAccess(entry: Pick<NavEntry, 'requires'>, can: CanFn): boolean {
  return !entry.requires || entry.requires.length === 0 || entry.requires.some(can);
}

/** What the router should show at an entry's URL for the current admin. */
export function routeDecision(entry: Pick<NavEntry, 'requires'>, can: CanFn): 'render' | 'forbidden' {
  return canAccess(entry, can) ? 'render' : 'forbidden';
}

/**
 * Sidebar groups in table order with inaccessible items removed (and groups left empty
 * by that dropped), plus the footer items.
 */
export function deriveSidebar<E extends NavEntry>(
  entries: readonly E[],
  can: CanFn,
): { sections: SidebarSection<E>[]; footer: E[] } {
  const sections: SidebarSection<E>[] = [];
  const footer: E[] = [];
  for (const entry of entries) {
    if (!canAccess(entry, can)) continue;
    if (entry.placement === 'footer') {
      footer.push(entry);
      continue;
    }
    let section = sections.find((s) => s.title === entry.section);
    if (!section) {
      section = { title: entry.section, items: [] };
      sections.push(section);
    }
    section.items.push(entry);
  }
  return { sections, footer };
}

/** Whether `pathname` is inside the entry's page ('/' only matches exactly). */
export function isActivePath(entryPath: string, pathname: string): boolean {
  return entryPath === '/' ? pathname === '/' : pathname === entryPath || pathname.startsWith(`${entryPath}/`);
}
