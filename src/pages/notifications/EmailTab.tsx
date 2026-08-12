import { useState, useEffect } from 'react';
import { Send, Mail, Globe, Users, UserCog, List, X } from 'lucide-react';
import { ClayCard } from '../../components/ui/ClayCard';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { clsx } from 'clsx';
import { adminApi } from '../../api/admin';
import { can, CAP } from '../../lib/rbac';

type RecipientType = 'all' | 'students' | 'landlords' | 'agents_companies' | 'waitlist';

interface BroadcastRecord {
  _id: string;
  subject: string;
  recipientType: RecipientType | 'single';
  recipientCount: number;
  status: 'pending' | 'sent' | 'failed';
  errorMessage?: string;
  sentBy: { fullName: string; email: string };
  createdAt: string;
}

const RECIPIENT_OPTIONS = [
  { value: 'all', label: 'All Verified + Waitlist', icon: Globe },
  { value: 'students', label: 'Students', icon: Users },
  { value: 'landlords', label: 'Landlords', icon: Users },
  { value: 'agents_companies', label: 'Agents & Companies', icon: UserCog },
  { value: 'waitlist', label: 'Waitlist Only', icon: List },
];

export function EmailTab() {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [recipientType, setRecipientType] = useState<RecipientType>('all');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const [history, setHistory] = useState<BroadcastRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyPages, setHistoryPages] = useState(0);

  const fetchHistory = async (page = historyPage) => {
    setHistoryLoading(true);
    try {
      const res = await adminApi.emails.history(`?page=${page}&limit=20`);
      if (res.success && res.data) {
        setHistory(res.data.records || []);
        setHistoryTotal(res.data.pagination?.total || 0);
        setHistoryPages(res.data.pagination?.pages || 0);
      }
    } catch {
      // ignore
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(historyPage);
  }, [historyPage]);

  // SECURITY-FIX (AD-H3): email broadcast is a privileged action; require the
  // notifications.broadcast capability (defense-in-depth; backend authoritative).
  const canBroadcast = can(CAP.NOTIFICATIONS_BROADCAST);
  const canSend = canBroadcast && subject.trim().length > 0 && body.trim().length > 0;

  const handleSend = async () => {
    if (!canSend) return;
    setSending(true);
    setResult(null);
    try {
      const res = await adminApi.emails.broadcast({
        subject: subject.trim(),
        body: body.trim(),
        recipientType,
      });
      setResult({
        success: res.success,
        message: res.success
          ? `Sent to ${res.data?.recipientCount || 0} recipient(s)`
          : res.error?.message || 'Failed to send',
      });
      if (res.success) {
        setSubject('');
        setBody('');
        setRecipientType('all');
        setHistoryPage(1);
        fetchHistory(1);
      }
    } catch (e: any) {
      setResult({ success: false, message: e?.message || 'Failed to send email' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Result Banner */}
      {result && (
        <div className={clsx(
          'px-5 py-3 rounded-clay-sm border flex items-center gap-3',
          result.success
            ? 'bg-status-success/10 border-status-success/20 text-status-success'
            : 'bg-status-error/10 border-status-error/20 text-status-error',
        )}>
          <span className="text-sm font-semibold">{result.message}</span>
          <button className="ml-auto text-current opacity-60 hover:opacity-100" onClick={() => setResult(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Compose Card */}
      <ClayCard>
        <div className="space-y-5">
          {/* Recipient Group */}
          <div>
            <label className="block text-xs font-bold text-text-tertiary uppercase tracking-wider mb-3">
              Recipient Group *
            </label>
            <div className="flex flex-wrap gap-2">
              {RECIPIENT_OPTIONS.map(ro => (
                <button
                  key={ro.value}
                  onClick={() => setRecipientType(ro.value as RecipientType)}
                  className={clsx(
                    'flex items-center gap-1.5 px-3 py-2 rounded-clay-sm text-xs font-semibold border transition-all',
                    recipientType === ro.value
                      ? 'bg-burnt-brown text-white border-burnt-brown shadow-clay-sm'
                      : 'bg-white text-text-secondary border-clay-border hover:border-burnt-brown/30',
                  )}
                >
                  <ro.icon className="w-3.5 h-3.5" />
                  {ro.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-bold text-text-tertiary uppercase tracking-wider mb-2">Subject *</label>
            <input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="e.g. Important Update for All Students"
              maxLength={200}
              className="w-full px-4 py-2.5 bg-clay-border-light border border-clay-border rounded-clay-sm text-sm placeholder:text-text-tertiary outline-none focus:border-mustard focus:ring-2 focus:ring-mustard/20 transition-all"
            />
            <span className="text-[10px] text-text-tertiary mt-1 block text-right">{subject.length}/200</span>
          </div>

          {/* Body */}
          <div>
            <label className="block text-xs font-bold text-text-tertiary uppercase tracking-wider mb-2">Message Body *</label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder={'Hello {{name}},\n\nYour message here...'}
              rows={8}
              className="w-full px-4 py-2.5 bg-clay-border-light border border-clay-border rounded-clay-sm text-sm placeholder:text-text-tertiary outline-none focus:border-mustard focus:ring-2 focus:ring-mustard/20 transition-all resize-none"
            />
            <p className="text-[10px] text-text-tertiary mt-1">
              Use {'{{name}}'} to personalise with each recipient&apos;s name. Separate paragraphs with a blank line.
            </p>
          </div>

          <div className="bg-burnt-brown-pale/50 rounded-clay-sm px-4 py-3 border border-burnt-brown/20">
            <p className="text-xs text-text-tertiary">
              <strong className="text-burnt-brown">Note:</strong> Emails use the iléSure branded template.
              Your message will be sent as a nicely formatted email with the app logo and footer.
              Each recipient receives a personalised copy with their name replacing {'{{name}}'}.
            </p>
          </div>
        </div>
      </ClayCard>

      {/* Send button */}
      <div className="flex justify-end">
        <Button
          variant="mustard"
          icon={<Send className="w-4 h-4" />}
          onClick={() => setShowPreview(true)}
          disabled={!canSend}
        >
          Preview & Send
        </Button>
      </div>

      {/* Sent History */}
      <ClayCard>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-text-primary">Sent History</h2>
            <p className="text-xs text-text-tertiary mt-0.5">{historyTotal} broadcast(s) total</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full clay-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Subject</th>
                <th>Recipient Group</th>
                <th>Count</th>
                <th>Status</th>
                <th>Sent By</th>
              </tr>
            </thead>
            <tbody>
              {historyLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-mustard border-t-transparent rounded-full animate-spin" />
                      <span className="text-text-tertiary">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <p className="text-text-tertiary">No broadcasts sent yet</p>
                  </td>
                </tr>
              ) : history.map(record => (
                <tr key={record._id}>
                  <td className="text-xs text-text-secondary whitespace-nowrap">
                    {new Date(record.createdAt).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </td>
                  <td className="text-sm font-medium text-text-primary max-w-[200px] truncate">
                    {record.subject}
                  </td>
                  <td>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-clay-border-light rounded-pill text-xs font-semibold text-text-secondary capitalize">
                      {record.recipientType === 'agents_companies' ? 'Agents & Companies'
                        : record.recipientType === 'single' ? 'Single User'
                        : record.recipientType}
                    </span>
                  </td>
                  <td className="text-sm text-text-secondary">{record.recipientCount}</td>
                  <td>
                    <StatusBadge status={record.status as any} />
                  </td>
                  <td className="text-sm text-text-secondary">
                    <div className="truncate max-w-[120px]">{record.sentBy?.fullName || record.sentBy?.email || '—'}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {historyPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-clay-border mt-4">
            <span className="text-xs text-text-tertiary">
              Page {historyPage} of {historyPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={historyPage <= 1}
                onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 text-xs font-semibold rounded-pill border border-clay-border text-text-secondary hover:bg-clay-border-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                disabled={historyPage >= historyPages}
                onClick={() => setHistoryPage(p => p + 1)}
                className="px-3 py-1.5 text-xs font-semibold rounded-pill border border-clay-border text-text-secondary hover:bg-clay-border-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </ClayCard>

      {/* Preview & Send Modal */}
      <Modal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        title="Preview Email Broadcast"
        size="lg"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setShowPreview(false)}>Cancel</Button>
            <Button
              variant="mustard"
              size="sm"
              icon={<Send className="w-4 h-4" />}
              loading={sending}
              onClick={async () => { await handleSend(); setShowPreview(false); }}
            >
              Send Now
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-clay-border-light rounded-clay-lg p-5 border border-clay-border">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-pill bg-gradient-to-br from-burnt-brown-light to-burnt-brown flex items-center justify-center text-white flex-shrink-0 shadow-clay-sm">
                <Mail className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-text-primary">{subject || 'Email Subject'}</p>
                <p className="text-sm text-text-secondary mt-1 whitespace-pre-wrap">{body || 'Email body...'}</p>
                <p className="text-[10px] text-text-tertiary mt-2">
                  Recipients: {RECIPIENT_OPTIONS.find(r => r.value === recipientType)?.label || recipientType}
                  {' · '}Personalised with {'{{name}}'} · iléSure branded template
                </p>
              </div>
            </div>
          </div>
          <div className="bg-mustard/5 rounded-clay-sm px-4 py-3 border border-mustard/20">
            <p className="text-xs text-text-tertiary">
              <strong className="text-burnt-brown">Note:</strong> This will send a broadcast email to all users in the selected group.
              Emails are sent via Brevo transactional API. Failed individual sends will not stop the broadcast.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
