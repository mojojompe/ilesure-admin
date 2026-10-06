/**
 * Admin alert settings: the recipient list and the event switches, as the console edits them.
 *
 * The server is the authority (it lower-cases, de-duplicates, validates and caps the list the
 * same way, see platformSettingsService.normalizeAlertRecipients); this mirrors those rules so
 * an admin finds out about a typo while typing, not after pressing Save.
 */

export const MAX_ALERT_RECIPIENTS = 10;

export type AlertEventKey =
  | 'newListings'
  | 'verificationRequests'
  | 'newUserRegistrations'
  | 'criticalAlerts'
  | 'supportTickets'
  | 'agentReports'
  | 'waitlist';

export type AlertEvents = Record<AlertEventKey, boolean>;

export interface AlertSettings {
  recipients: string[];
  events: AlertEvents;
  maxRecipients?: number;
  envFallbackConfigured?: boolean;
}

/** Every switch the Notifications tab shows, in display order. */
export const ALERT_EVENTS: ReadonlyArray<{ key: AlertEventKey; title: string; desc: string }> = [
  { key: 'newListings', title: 'New Listings', desc: 'A listing is submitted for approval, or a live listing is changed and needs re-approval' },
  { key: 'verificationRequests', title: 'Verification Requests', desc: 'An agent or company submits verification documents' },
  { key: 'newUserRegistrations', title: 'Weekly Summary', desc: 'Monday 8am (Lagos): new users by role, companies, listings, bookings and payments for the past week' },
  { key: 'criticalAlerts', title: 'Critical System Alerts', desc: 'Payments flagged for review, failed refunds or payouts, and unhandled server errors' },
  { key: 'supportTickets', title: 'Support Tickets', desc: 'Someone contacts support' },
  { key: 'agentReports', title: 'Agent & Listing Reports', desc: 'A renter reports an agent or a listing' },
  { key: 'waitlist', title: 'Waitlist Signups', desc: 'Someone joins the waitlist' },
];

export const DEFAULT_ALERT_EVENTS: AlertEvents = ALERT_EVENTS.reduce(
  (acc, e) => ({ ...acc, [e.key]: true }),
  {} as AlertEvents
);

const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: string): boolean {
  const email = normalizeEmail(value);
  return email.length > 0 && email.length <= 254 && EMAIL_PATTERN.test(email);
}

export type AddRecipientResult = { ok: true; recipients: string[] } | { ok: false; error: string };

/** Adds one typed address to the list, or explains why it cannot be added. */
export function addRecipient(list: readonly string[], input: string, max = MAX_ALERT_RECIPIENTS): AddRecipientResult {
  const email = normalizeEmail(input);
  if (!email) return { ok: false, error: 'Enter an email address.' };
  if (!isValidEmail(email)) return { ok: false, error: `"${input.trim()}" is not a valid email address.` };
  if (list.includes(email)) return { ok: false, error: `${email} is already a recipient.` };
  if (list.length >= max) return { ok: false, error: `At most ${max} recipients are allowed.` };
  return { ok: true, recipients: [...list, email] };
}

export function removeRecipient(list: readonly string[], email: string): string[] {
  return list.filter((r) => r !== email);
}

/** Fills in any switch the server did not send (an older backend), so every toggle renders. */
export function withDefaultEvents(events: Partial<AlertEvents> | null | undefined): AlertEvents {
  return { ...DEFAULT_ALERT_EVENTS, ...(events || {}) };
}
