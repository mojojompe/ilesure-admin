import { describe, it, expect } from 'vitest';
import {
  addRecipient,
  removeRecipient,
  isValidEmail,
  withDefaultEvents,
  ALERT_EVENTS,
  MAX_ALERT_RECIPIENTS,
} from './alertRecipients';

describe('alert recipient list', () => {
  it('adds a trimmed, lower-cased address', () => {
    expect(addRecipient([], '  Ops@Example.COM ')).toEqual({ ok: true, recipients: ['ops@example.com'] });
  });

  it('refuses a malformed address, an empty one and a duplicate', () => {
    expect(addRecipient([], 'not-an-email').ok).toBe(false);
    expect(addRecipient([], 'a@b').ok).toBe(false);
    expect(addRecipient([], '   ').ok).toBe(false);
    const dup = addRecipient(['ops@example.com'], 'OPS@example.com');
    expect(dup).toEqual({ ok: false, error: 'ops@example.com is already a recipient.' });
  });

  it('refuses an eleventh recipient', () => {
    const full = Array.from({ length: MAX_ALERT_RECIPIENTS }, (_, i) => `r${i}@example.com`);
    const res = addRecipient(full, 'one.more@example.com');
    expect(res.ok).toBe(false);
  });

  it('removes exactly the given address', () => {
    expect(removeRecipient(['a@example.com', 'b@example.com'], 'a@example.com')).toEqual(['b@example.com']);
  });

  it('accepts sub-domains and plus addressing', () => {
    expect(isValidEmail('alerts+ops@mail.example.com')).toBe(true);
    expect(isValidEmail('two@@example.com')).toBe(false);
    expect(isValidEmail('space in@example.com')).toBe(false);
  });

  it('fills every switch the server omitted with its default', () => {
    const events = withDefaultEvents({ supportTickets: false });
    expect(events.supportTickets).toBe(false);
    for (const e of ALERT_EVENTS) if (e.key !== 'supportTickets') expect(events[e.key]).toBe(e.defaultOn);
  });

  it('defaults every approval queue on and renter sign-ups off', () => {
    const events = withDefaultEvents(null);
    for (const key of ['newAccountsAwaitingApproval', 'kycCompleted', 'upgradeRequests', 'bookingsNeedingAttention', 'manualPayouts'] as const) {
      expect(events[key]).toBe(true);
    }
    expect(events.newRenters).toBe(false);
  });

  it('lists each switch once', () => {
    const keys = ALERT_EVENTS.map((e) => e.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
