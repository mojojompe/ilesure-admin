/**
 * BUGFIX (QA-ADM-040): the Payments and Bookings tables printed whatever the API sent for
 * a date, which is an ISO-8601 instant, cells read "2026-09-04T22:50:43.723Z". Where a
 * fallback existed it was `String.split('T')[0]`, which is not a format so much as a
 * truncation, and silently produces garbage for anything that is not an ISO string.
 */
export function formatDate(raw?: string | number | Date | null): string {
  if (raw === undefined || raw === null || raw === '') return '—';
  const d = new Date(raw as any);
  if (Number.isNaN(d.getTime())) return String(raw);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

/** Same, with the time, for audit trails and payment timestamps where the hour matters. */
export function formatDateTime(raw?: string | number | Date | null): string {
  if (raw === undefined || raw === null || raw === '') return '—';
  const d = new Date(raw as any);
  if (Number.isNaN(d.getTime())) return String(raw);
  return d.toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}
