import { useState, useEffect } from 'react';
import {
  Send,
  Mail,
  Globe,
  Users,
  UserCog,
  List,
  X,
  Eye,
  Copy,
  Check,
  RotateCcw,
  Clock,
  AlertTriangle,
  FileText,
  User as UserIcon,
} from 'lucide-react';
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
  body?: string;
  recipientType: RecipientType | 'single';
  recipientCount: number;
  status: 'pending' | 'sent' | 'failed';
  errorMessage?: string;
  sentBy: { fullName?: string; email?: string; role?: string };
  recipientUser?: { fullName?: string; email?: string };
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

  // Details Modal State
  const [selectedBroadcast, setSelectedBroadcast] = useState<BroadcastRecord | null>(null);
  const [copiedMessage, setCopiedMessage] = useState(false);

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
      const sentCount = res.data?.sent ?? 0;
      const failedCount = res.data?.failed ?? 0;
      if (res.success && sentCount > 0) {
        setResult({
          success: true,
          message: failedCount > 0
            ? `Sent to ${sentCount} recipient(s), but ${failedCount} failed.`
            : `Successfully sent to ${sentCount} recipient(s)`,
        });
        setSubject('');
        setBody('');
        setRecipientType('all');
        setHistoryPage(1);
        fetchHistory(1);
      } else {
        const fallbackMsg = failedCount > 0
          ? `All ${failedCount} recipient deliveries failed.`
          : 'Failed to send broadcast email';
        setResult({
          success: false,
          message: res.error?.message || fallbackMsg,
        });
        setHistoryPage(1);
        fetchHistory(1);
      }
    } catch (e: any) {
      setResult({ success: false, message: e?.message || 'Failed to send email' });
    } finally {
      setSending(false);
    }
  };

  const handleCopyText = (text?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  const formatRecipientLabel = (type: string) => {
    const opt = RECIPIENT_OPTIONS.find((r) => r.value === type);
    if (opt) return opt.label;
    if (type === 'agents_companies') return 'Agents & Companies';
    if (type === 'single') return 'Single User';
    return type;
  };

  return (
    <div className="space-y-6">
      {/* Result Banner */}
      {result && (
        <div
          className={clsx(
            'px-5 py-3 rounded-clay-sm border flex items-center gap-3',
            result.success
              ? 'bg-status-success/10 border-status-success/20 text-status-success'
              : 'bg-status-error/10 border-status-error/20 text-status-error'
          )}
        >
          <span className="text-sm font-semibold">{result.message}</span>
          <button
            className="ml-auto text-current opacity-60 hover:opacity-100"
            onClick={() => setResult(null)}
          >
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
              {RECIPIENT_OPTIONS.map((ro) => (
                <button
                  key={ro.value}
                  onClick={() => setRecipientType(ro.value as RecipientType)}
                  className={clsx(
                    'flex items-center gap-1.5 px-3 py-2 rounded-clay-sm text-xs font-semibold border transition-all',
                    recipientType === ro.value
                      ? 'bg-burnt-brown text-white border-burnt-brown shadow-clay-sm'
                      : 'bg-white text-text-secondary border-clay-border hover:border-burnt-brown/30'
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
            <label className="block text-xs font-bold text-text-tertiary uppercase tracking-wider mb-2">
              Subject *
            </label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Important Update for All Students"
              maxLength={200}
              className="w-full px-4 py-2.5 bg-clay-border-light border border-clay-border rounded-clay-sm text-sm placeholder:text-text-tertiary outline-none focus:border-mustard focus:ring-2 focus:ring-mustard/20 transition-all"
            />
            <span className="text-[10px] text-text-tertiary mt-1 block text-right">
              {subject.length}/200
            </span>
          </div>

          {/* Body */}
          <div>
            <label className="block text-xs font-bold text-text-tertiary uppercase tracking-wider mb-2">
              Message Body *
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
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
          <span className="text-xs text-text-tertiary">
            Click any row to view full email details & message body
          </span>
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
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {historyLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-mustard border-t-transparent rounded-full animate-spin" />
                      <span className="text-text-tertiary">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <p className="text-text-tertiary">No broadcasts sent yet</p>
                  </td>
                </tr>
              ) : (
                history.map((record) => (
                  <tr
                    key={record._id}
                    onClick={() => setSelectedBroadcast(record)}
                    className="cursor-pointer hover:bg-clay-border-light/40 transition-colors"
                  >
                    <td className="text-xs text-text-secondary whitespace-nowrap">
                      {new Date(record.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="text-sm font-medium text-text-primary max-w-[220px] truncate">
                      {record.subject}
                    </td>
                    <td>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-clay-border-light rounded-pill text-xs font-semibold text-text-secondary capitalize">
                        {formatRecipientLabel(record.recipientType)}
                      </span>
                    </td>
                    <td className="text-sm font-semibold text-text-secondary">
                      {record.recipientCount}
                    </td>
                    <td>
                      <StatusBadge status={record.status as any} />
                    </td>
                    <td className="text-sm text-text-secondary">
                      <div className="min-w-0">
                        <p className="font-semibold text-xs text-text-primary truncate max-w-[130px]">
                          {record.sentBy?.fullName || 'Super Admin'}
                        </p>
                        {record.sentBy?.email && (
                          <p className="text-[10px] text-text-tertiary truncate max-w-[130px]">
                            {record.sentBy.email}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedBroadcast(record)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-clay-sm bg-clay-border-light hover:bg-mustard hover:text-white transition-colors text-text-secondary"
                        title="View Broadcast Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
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
                onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 text-xs font-semibold rounded-pill border border-clay-border text-text-secondary hover:bg-clay-border-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                disabled={historyPage >= historyPages}
                onClick={() => setHistoryPage((p) => p + 1)}
                className="px-3 py-1.5 text-xs font-semibold rounded-pill border border-clay-border text-text-secondary hover:bg-clay-border-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </ClayCard>

      {/* Broadcast Details Modal */}
      {selectedBroadcast && (
        <Modal
          open={Boolean(selectedBroadcast)}
          onClose={() => setSelectedBroadcast(null)}
          title="Broadcast Details"
          size="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-text-tertiary">
                ID: {selectedBroadcast._id}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedBroadcast(null)}
                >
                  Close
                </Button>
                <Button
                  variant="mustard"
                  size="sm"
                  icon={<RotateCcw className="w-3.5 h-3.5" />}
                  onClick={() => {
                    setSubject(selectedBroadcast.subject);
                    setBody(selectedBroadcast.body || '');
                    if (selectedBroadcast.recipientType !== 'single') {
                      setRecipientType(selectedBroadcast.recipientType as RecipientType);
                    }
                    setSelectedBroadcast(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  Use as Template
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Header Subject Banner */}
            <div className="p-4 rounded-clay-lg bg-clay-border-light/60 border border-clay-border flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-clay bg-burnt-brown-pale flex items-center justify-center text-burnt-brown flex-shrink-0 shadow-clay-sm">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-primary">
                    {selectedBroadcast.subject}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-text-tertiary">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {new Date(selectedBroadcast.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <StatusBadge status={selectedBroadcast.status as any} />
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-white border border-clay-border rounded-clay-sm shadow-sm">
                <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wide">
                  Recipient Group
                </span>
                <p className="text-xs font-semibold text-text-primary mt-1 truncate">
                  {formatRecipientLabel(selectedBroadcast.recipientType)}
                </p>
              </div>

              <div className="p-3 bg-white border border-clay-border rounded-clay-sm shadow-sm">
                <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wide">
                  Total Recipients
                </span>
                <p className="text-sm font-bold text-mustard mt-0.5">
                  {selectedBroadcast.recipientCount}{' '}
                  <span className="text-xs font-normal text-text-tertiary">delivered</span>
                </p>
              </div>

              <div className="p-3 bg-white border border-clay-border rounded-clay-sm shadow-sm">
                <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wide">
                  Sent By
                </span>
                <p className="text-xs font-semibold text-text-primary mt-1 truncate">
                  {selectedBroadcast.sentBy?.fullName || 'Super Admin'}
                </p>
                {selectedBroadcast.sentBy?.email && (
                  <p className="text-[10px] text-text-tertiary truncate">
                    {selectedBroadcast.sentBy.email}
                  </p>
                )}
              </div>

              <div className="p-3 bg-white border border-clay-border rounded-clay-sm shadow-sm">
                <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wide">
                  Delivery Status
                </span>
                <p className="text-xs font-semibold text-text-primary mt-1 capitalize">
                  {selectedBroadcast.status}
                </p>
              </div>
            </div>

            {/* Error banner if any */}
            {selectedBroadcast.errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-clay-sm flex items-start gap-2.5 text-rose-800 text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold">Delivery Warning / Error:</strong>
                  <p className="mt-0.5">{selectedBroadcast.errorMessage}</p>
                </div>
              </div>
            )}

            {/* Email Body Card */}
            <div className="border border-clay-border rounded-clay-lg overflow-hidden bg-white shadow-sm">
              <div className="flex items-center justify-between px-4 py-2.5 bg-clay-border-light/70 border-b border-clay-border">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-burnt-brown" />
                  <span className="text-xs font-bold text-text-primary">Email Message Body</span>
                </div>
                <button
                  onClick={() => handleCopyText(selectedBroadcast.body)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white hover:bg-clay-border text-text-secondary text-xs transition-colors border border-clay-border"
                >
                  {copiedMessage ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-medium">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Text</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-5 max-h-[320px] overflow-y-auto">
                <div className="whitespace-pre-wrap font-sans text-sm text-text-secondary leading-relaxed bg-off-white/60 p-4 rounded-clay-sm border border-clay-border/50">
                  {selectedBroadcast.body || (
                    <span className="italic text-text-tertiary">No message content stored</span>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-clay-border flex items-center justify-between text-[11px] text-text-tertiary">
                  <span>Template: iléSure Official Responsive HTML</span>
                  <span>Recipient Variable: {'{{name}}'}</span>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Preview & Send Modal */}
      <Modal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        title="Preview Email Broadcast"
        size="lg"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setShowPreview(false)}>
              Cancel
            </Button>
            <Button
              variant="mustard"
              size="sm"
              icon={<Send className="w-4 h-4" />}
              loading={sending}
              onClick={async () => {
                await handleSend();
                setShowPreview(false);
              }}
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
                <p className="text-sm font-bold text-text-primary">
                  {subject || 'Email Subject'}
                </p>
                <p className="text-sm text-text-secondary mt-1 whitespace-pre-wrap">
                  {body || 'Email body...'}
                </p>
                <p className="text-[10px] text-text-tertiary mt-2">
                  Recipients:{' '}
                  {RECIPIENT_OPTIONS.find((r) => r.value === recipientType)?.label ||
                    recipientType}
                  {' · '}Personalised with {'{{name}}'} · iléSure branded template
                </p>
              </div>
            </div>
          </div>
          <div className="bg-mustard/5 rounded-clay-sm px-4 py-3 border border-mustard/20">
            <p className="text-xs text-text-tertiary">
              <strong className="text-burnt-brown">Note:</strong> This will send a broadcast
              email to all users in the selected group. Emails are sent via Brevo transactional
              API. Failed individual sends will not stop the broadcast.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
