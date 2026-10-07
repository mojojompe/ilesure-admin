/**
 * Deep links into a console page: `?q=<search>&open=<record id>`.
 *
 * Admin alert emails (the server's adminAlertService.recordPath) link straight to the record
 * that needs action, e.g. /agents?q=ada%40example.com&open=<userId>. A page that supports it
 * pre-fills its search with `q` (so the record is found even past the first page) and opens
 * the record whose id is `open` once it has loaded. See useDeepLink.
 */

export const DEEP_LINK_QUERY = 'q';
export const DEEP_LINK_OPEN = 'open';

export interface DeepLink {
  q: string | null;
  open: string | null;
}

/** Reads `q` and `open` from a location search string ("?q=..&open=.." or "q=..&open=.."). */
export function readDeepLink(search: string): DeepLink {
  const params = new URLSearchParams(search);
  const clean = (v: string | null) => (v && v.trim() ? v.trim() : null);
  return { q: clean(params.get(DEEP_LINK_QUERY)), open: clean(params.get(DEEP_LINK_OPEN)) };
}

/** The search string with the deep-link parameters removed, other parameters kept. */
export function withoutDeepLink(search: string): string {
  const params = new URLSearchParams(search);
  params.delete(DEEP_LINK_QUERY);
  params.delete(DEEP_LINK_OPEN);
  return params.toString();
}

/** The loaded row the link points at, or null while it is not (yet) among them. */
export function findDeepLinked<T>(rows: readonly T[] | null | undefined, open: string | null, getId: (row: T) => unknown): T | null {
  if (!open || !rows) return null;
  return rows.find((row) => String(getId(row) ?? '') === open) ?? null;
}
