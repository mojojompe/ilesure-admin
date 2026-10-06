import { useEffect, useState } from 'react';
import { Cancel01Icon, Mail01Icon, SentIcon, FloppyDiskIcon } from '@hugeicons/react';
import { ClayCard } from '../../components/ui/ClayCard';
import { Button } from '../../components/ui/Button';
import { adminApi, errorMessage, errorDetails } from '../../api/admin';
import { can, CAP } from '../../lib/rbac';
import {
  ALERT_EVENTS,
  MAX_ALERT_RECIPIENTS,
  addRecipient,
  removeRecipient,
  withDefaultEvents,
  type AlertEvents,
} from './alertRecipients';

interface RecipientResult {
  email: string;
  ok: boolean;
  error?: string;
}

/**
 * Settings -> Notifications: who receives admin alert emails and which events send one.
 *
 * These were four per-admin switches that nothing read and no way to name a recipient. They
 * are now one platform-wide setting the server's alert service uses, so saving needs
 * write:settings; an admin without it sees the settings read-only.
 */
export function NotificationsPanel({ onToast }: { onToast: (message: string, type?: 'success' | 'error') => void }) {
  const canEdit = can(CAP.SETTINGS_MANAGE);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [recipients, setRecipients] = useState<string[]>([]);
  const [events, setEvents] = useState<AlertEvents>(withDefaultEvents(null));
  const [maxRecipients, setMaxRecipients] = useState(MAX_ALERT_RECIPIENTS);
  const [envFallback, setEnvFallback] = useState(false);
  const [draft, setDraft] = useState('');
  const [draftError, setDraftError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<RecipientResult[] | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await adminApi.settings.getNotifications();
        if (cancelled) return;
        setRecipients(res.data?.recipients || []);
        setEvents(withDefaultEvents(res.data?.events));
        setMaxRecipients(res.data?.maxRecipients || MAX_ALERT_RECIPIENTS);
        setEnvFallback(Boolean(res.data?.envFallbackConfigured));
      } catch (err) {
        if (!cancelled) setLoadError(errorMessage(err, 'Could not load notification settings.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAdd = () => {
    const result = addRecipient(recipients, draft, maxRecipients);
    if (!result.ok) {
      setDraftError(result.error);
      return;
    }
    setRecipients(result.recipients);
    setDraft('');
    setDraftError(null);
    setDirty(true);
  };

  const handleRemove = (email: string) => {
    setRecipients(removeRecipient(recipients, email));
    setDirty(true);
  };

  const toggle = (key: keyof AlertEvents) => {
    if (!canEdit) return;
    setEvents((prev) => ({ ...prev, [key]: !prev[key] }));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const res = await adminApi.settings.updateNotifications({ recipients, events });
      setRecipients(res.data?.recipients || recipients);
      setEvents(withDefaultEvents(res.data?.events));
      setDirty(false);
      onToast('Notification settings saved');
    } catch (err) {
      const message = errorMessage(err, 'Failed to save notification settings.');
      setSaveError(message);
      onToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestError(null);
    setTestResults(null);
    try {
      const res = await adminApi.settings.testNotifications();
      setTestResults(res.data?.results || []);
      onToast(res.message || 'Test email sent');
    } catch (err) {
      // A 502 still carries the per-recipient outcome; show it rather than only the headline.
      const results = errorDetails(err).results;
      if (Array.isArray(results)) setTestResults(results as RecipientResult[]);
      const message = errorMessage(err, 'Failed to send the test email.');
      setTestError(message);
      onToast(message, 'error');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <ClayCard padding="md">
        <p className="text-sm text-text-tertiary">Loading notification settings…</p>
      </ClayCard>
    );
  }

  if (loadError) {
    return (
      <ClayCard padding="md">
        <p className="text-sm text-status-error">{loadError}</p>
      </ClayCard>
    );
  }

  return (
    <ClayCard padding="md" className="space-y-6">
      <h3 className="text-base font-bold text-text-primary border-b border-clay-border pb-3">Email Notifications</h3>

      {!canEdit && (
        <p className="text-xs text-text-tertiary bg-clay-border-light rounded-clay-sm px-3 py-2">
          These settings apply to the whole platform. You need the settings permission to change them.
        </p>
      )}

      {/* ── Recipients ─────────────────────────────────── */}
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
            <Mail01Icon className="w-4 h-4 text-mustard" /> Alert recipients
          </h4>
          <p className="text-xs text-text-tertiary mt-0.5">
            Every address below receives the alerts switched on further down. Up to {maxRecipients} addresses.
          </p>
        </div>

        {recipients.length === 0 ? (
          <p className="text-sm text-text-secondary bg-clay-border-light rounded-clay-sm px-3 py-2">
            {envFallback
              ? 'No recipients yet. Alerts currently go to the fallback address configured on the server (ADMIN_EMAIL).'
              : 'No recipients yet. No admin alert emails will be sent until you add one.'}
          </p>
        ) : (
          <ul className="space-y-2">
            {recipients.map((email) => (
              <li key={email} className="flex items-center justify-between gap-3 px-3 py-2 rounded-clay-sm border border-clay-border-light">
                <span className="text-sm text-text-primary break-all">{email}</span>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => handleRemove(email)}
                    aria-label={`Remove ${email}`}
                    className="flex-shrink-0 p-1 rounded text-text-tertiary hover:text-status-error hover:bg-clay-border-light transition-colors"
                  >
                    <Cancel01Icon className="w-4 h-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        {canEdit && (
          <div className="space-y-1.5">
            <div className="flex gap-2">
              <input
                type="email"
                value={draft}
                placeholder="name@company.com"
                aria-label="Add alert recipient"
                onChange={(e) => {
                  setDraft(e.target.value);
                  if (draftError) setDraftError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAdd();
                  }
                }}
                className="flex-1 min-w-0 px-4 py-2.5 bg-clay-border-light border border-clay-border rounded-clay-sm text-sm outline-none focus:border-mustard transition-colors"
              />
              <Button variant="secondary" size="sm" onClick={handleAdd} disabled={recipients.length >= maxRecipients}>
                Add
              </Button>
            </div>
            {draftError && <p className="text-status-error text-xs">{draftError}</p>}
          </div>
        )}
      </div>

      {/* ── Event switches ─────────────────────────────── */}
      <div className="space-y-2">
        <h4 className="text-sm font-bold text-text-primary">Send an email when…</h4>
        <div className="space-y-1">
          {ALERT_EVENTS.map((item) => (
            <label
              key={item.key}
              className={`flex items-start gap-3 p-3 rounded-clay-sm transition-colors ${canEdit ? 'hover:bg-clay-border-light cursor-pointer' : 'opacity-80'}`}
            >
              <button
                type="button"
                role="switch"
                aria-checked={events[item.key]}
                aria-label={item.title}
                disabled={!canEdit}
                className="mt-0.5 relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-mustard focus:ring-offset-2 disabled:cursor-not-allowed"
                style={{ backgroundColor: events[item.key] ? '#D4821A' : '#E7DCD4' }}
                onClick={() => toggle(item.key)}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${events[item.key] ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
              <div>
                <p className="text-sm font-semibold text-text-primary">{item.title}</p>
                <p className="text-xs text-text-tertiary">{item.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {saveError && <p className="text-status-error text-sm">{saveError}</p>}

      {/* ── Test results ───────────────────────────────── */}
      {(testResults || testError) && (
        <div className="space-y-2 bg-clay-border-light rounded-clay-sm px-3 py-3">
          <p className="text-xs font-bold text-text-secondary uppercase tracking-wide">Test email</p>
          {testError && <p className="text-status-error text-sm">{testError}</p>}
          {testResults && testResults.length > 0 && (
            <ul className="space-y-1">
              {testResults.map((r) => (
                <li key={r.email} className="text-sm flex flex-wrap items-baseline gap-x-2">
                  <span className={r.ok ? 'text-status-success font-semibold' : 'text-status-error font-semibold'}>
                    {r.ok ? '✓ Sent' : '✕ Failed'}
                  </span>
                  <span className="text-text-primary break-all">{r.email}</span>
                  {!r.ok && r.error && <span className="text-xs text-text-tertiary break-all">{r.error}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {canEdit && (
        <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 pt-4 border-t border-clay-border">
          <Button
            variant="secondary"
            icon={<SentIcon className="w-4 h-4" />}
            onClick={handleTest}
            loading={testing}
            disabled={testing || dirty}
            title={dirty ? 'Save your changes first; the test uses the saved recipients' : undefined}
          >
            Send test email
          </Button>
          <Button variant="primary" icon={<FloppyDiskIcon className="w-4 h-4" />} onClick={handleSave} loading={saving} disabled={saving}>
            Save Notifications
          </Button>
        </div>
      )}
      {canEdit && dirty && <p className="text-xs text-text-tertiary text-right -mt-3">Unsaved changes. The test email uses the saved recipients.</p>}
    </ClayCard>
  );
}

export default NotificationsPanel;
