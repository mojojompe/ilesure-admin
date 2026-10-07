/**
 * Admin alert settings: the recipient list and the event switches, as the console edits them.
 *
 * The server is the authority (it lower-cases, de-duplicates, validates and caps the list the
 * same way, see platformSettingsService.normalizeAlertRecipients); this mirrors those rules so
 * an admin finds out about a typo while typing, not after pressing Save.
 */

export const MAX_ALERT_RECIPIENTS = 10;

export type AlertEventKey =
  | 'newAccountsAwaitingApproval'
  | 'kycCompleted'
  | 'newListings'
  | 'verificationRequests'
  | 'bookingsNeedingAttention'
  | 'manualPayouts'
  | 'agentReports'
  | 'supportTickets'
  | 'upgradeRequests'
  | 'criticalAlerts'
  | 'newRenters'
  | 'newUserRegistrations'
  | 'waitlist';

export type AlertEvents = Record<AlertEventKey, boolean>;

export interface AlertSettings {
  recipients: string[];
  events: AlertEvents;
  maxRecipients?: number;
  envFallbackConfigured?: boolean;
}

/**
 * Every switch the Notifications tab shows, in display order: things to act on first, then
 * information. `defaultOn` mirrors the server's default for a switch never saved
 * (PlatformSettings ADMIN_ALERT_EVENT_DEFAULTS): every admin queue on, renter sign-ups off.
 */
export const ALERT_EVENTS: ReadonlyArray<{ key: AlertEventKey; title: string; desc: string; defaultOn: boolean }> = [
  { key: 'newAccountsAwaitingApproval', title: 'New Accounts to Approve', desc: 'An agent, landlord or company signs up (web or mobile) and is waiting for approval. Links to their record.', defaultOn: true },
  { key: 'kycCompleted', title: 'Identity Verification (KYC)', desc: 'An agent, landlord or company verifies NIN or BVN (and when they become fully verified, ready to approve), or a check is refused for a name mismatch or failure. Refusals: at most one email per person per hour.', defaultOn: true },
  { key: 'newListings', title: 'Listings to Review', desc: 'A listing is submitted for approval, or a live listing is changed and needs re-approval', defaultOn: true },
  { key: 'verificationRequests', title: 'Verification Documents', desc: 'An agent or company submits verification documents', defaultOn: true },
  { key: 'bookingsNeedingAttention', title: 'Bookings Needing Attention', desc: 'A tenant says the apartment does not match the listing, or an inspection is marked failed or missed', defaultOn: true },
  { key: 'manualPayouts', title: 'Manual Payouts', desc: 'A tenant paid a lister who has no payout account, so the lister must be paid by hand', defaultOn: true },
  { key: 'agentReports', title: 'Agent & Listing Reports', desc: 'A renter reports an agent or a listing', defaultOn: true },
  { key: 'supportTickets', title: 'Support Tickets', desc: 'Someone contacts support', defaultOn: true },
  { key: 'upgradeRequests', title: 'Feature Requests', desc: 'Someone submits a feature request to the Feature Upgrades board (at most three emails an hour per person)', defaultOn: true },
  { key: 'criticalAlerts', title: 'Critical System Alerts', desc: 'Payments flagged for review, failed refunds or payouts, and unhandled server errors', defaultOn: true },
  { key: 'newRenters', title: 'New Renter Sign-ups', desc: 'A student or renter creates an account. Nothing to approve; they are already counted in the weekly summary. Off by default.', defaultOn: false },
  { key: 'newUserRegistrations', title: 'Weekly Summary', desc: 'Monday 8am (Lagos): new users by role, companies, listings, bookings and payments for the past week', defaultOn: true },
  { key: 'waitlist', title: 'Waitlist Signups', desc: 'Someone joins the waitlist', defaultOn: true },
];

export const DEFAULT_ALERT_EVENTS: AlertEvents = ALERT_EVENTS.reduce(
  (acc, e) => ({ ...acc, [e.key]: e.defaultOn }),
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

/** Fills in any switch the server did not send (an older backend) with its default, so every toggle renders. */
export function withDefaultEvents(events: Partial<AlertEvents> | null | undefined): AlertEvents {
  return { ...DEFAULT_ALERT_EVENTS, ...(events || {}) };
}
