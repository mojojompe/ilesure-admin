import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import {
  CustomerSupportIcon,
  ViewIcon,
  Loading01Icon,
  Search01Icon,
  SentIcon,
} from '@hugeicons/react';
import { ClayCard } from '../components/ui/ClayCard';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { adminApi, type SupportTicket, type SupportTicketStatus } from '../api/admin';
import { can, CAP } from '../lib/rbac';
import toast from 'react-hot-toast';
import { errorMessage } from '../api/errors';
import { useDeepLink } from '../lib/useDeepLink';

type Filter = 'all' | SupportTicketStatus;

const STATUS_META: Record<SupportTicketStatus, { label: string; className: string }> = {
  open: { label: 'Open', className: 'bg-mustard/15 text-mustard' },
  in_progress: { label: 'In progress', className: 'bg-blue-50 text-blue-600' },
  resolved: { label: 'Resolved', className: 'bg-status-success/10 text-status-success' },
  closed: { label: 'Closed', className: 'bg-text-tertiary/10 text-text-tertiary' },
};
const STATUSES = Object.keys(STATUS_META) as SupportTicketStatus[];
const TABS: Filter[] = ['all', ...STATUSES];

function StatusPill({ status }: { status: SupportTicketStatus }) {
  const meta = STATUS_META[status] ?? STATUS_META.open;
  return <span className={clsx('text-xs px-2 py-0.5 rounded-pill font-semibold', meta.className)}>{meta.label}</span>;
}

const formatDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleString() : '—');

export function Support() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [summary, setSummary] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [detail, setDetail] = useState<SupportTicket | null>(null);
  const [reply, setReply] = useState('');
  const [replyStatus, setReplyStatus] = useState<SupportTicketStatus>('in_progress');
  const [busy, setBusy] = useState(false);

  const canReply = can(CAP.SUPPORT_REPLY);

  // The new-ticket alert email links here with ?q=<email>&open=<ticketId> (lib/deepLink.ts).
  useDeepLink({
    rows: tickets,
    loading,
    getId: (t) => t.id,
    onOpen: (t) => openTicket(t),
    onQuery: (q) => { if (q) { setSearch(q); setQuery(q); } },
  });

  useEffect(() => { fetchTickets(); }, [filter, query]);

  // Search runs on the server (name, email, subject), a short pause after typing stops.
  useEffect(() => {
    const t = setTimeout(() => setQuery(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: '200' };
      if (filter !== 'all') params.status = filter;
      if (query) params.q = query;
      const res = await adminApi.support.list(params);
      setTickets(res.data?.tickets ?? []);
      setSummary(res.data?.summary ?? {});
    } catch (error) {
      toast.error(errorMessage(error, 'Failed to load support tickets'));
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const openTicket = (t: SupportTicket) => {
    setDetail(t);
    setReply('');
    setReplyStatus('in_progress');
  };

  const applyUpdate = (updated: SupportTicket) => {
    setDetail(updated);
    setTickets((rows) => rows.map((r) => (r.id === updated.id ? updated : r)));
    fetchTickets();
  };

  const handleStatus = async (status: SupportTicketStatus) => {
    if (!detail || status === detail.status) return;
    setBusy(true);
    try {
      const res = await adminApi.support.setStatus(detail.id, status);
      applyUpdate(res.data);
      toast.success(`Marked ${STATUS_META[status].label.toLowerCase()}`);
    } catch (error) {
      toast.error(errorMessage(error, 'Failed to update status'));
    } finally {
      setBusy(false);
    }
  };

  const handleReply = async () => {
    if (!detail || !reply.trim()) return;
    setBusy(true);
    try {
      const res = await adminApi.support.reply(detail.id, reply.trim(), replyStatus);
      applyUpdate(res.data);
      setReply('');
      toast.success(`Reply emailed to ${detail.email}`);
    } catch (error) {
      toast.error(errorMessage(error, 'Failed to send reply'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Tickets', value: summary.total ?? 0 },
          { label: 'Open', value: summary.open ?? 0 },
          { label: 'In Progress', value: summary.in_progress ?? 0 },
          { label: 'Resolved', value: summary.resolved ?? 0 },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-clay border border-clay-border shadow-clay p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-clay-sm bg-mustard/10 flex items-center justify-center shadow-clay-sm flex-shrink-0">
              <CustomerSupportIcon className="w-5 h-5 text-mustard" />
            </div>
            <div>
              <div className="text-2xl font-bold text-text-primary">{s.value}</div>
              <div className="text-xs text-text-tertiary">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <ClayCard padding="none">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-5 py-3.5 border-b border-clay-border gap-3">
          <h3 className="font-bold text-text-primary text-sm">Support Tickets</h3>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex gap-1.5 flex-wrap">
              {TABS.map((t) => (
                <button key={t} onClick={() => setFilter(t)}
                  className={`px-3 py-1 rounded-pill text-xs font-semibold transition-all ${filter === t ? 'bg-burnt-brown text-white' : 'bg-clay-border-light text-text-secondary hover:bg-clay-border'}`}>
                  {t === 'all' ? 'All' : STATUS_META[t].label}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search01Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
              <input className="clay-input w-52 pl-9 py-1.5 text-sm" placeholder="Name, email or subject" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full clay-table">
            <thead>
              <tr>
                <th>From</th>
                <th>Subject</th>
                <th>Received</th>
                <th>Replies</th>
                <th>Status</th>
                <th className="text-right pr-5">Open</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12">
                  <div className="flex items-center justify-center gap-2">
                    <Loading01Icon className="w-5 h-5 animate-spin text-mustard" />
                    <span className="text-text-tertiary">Loading...</span>
                  </div>
                </td></tr>
              ) : tickets.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-text-tertiary">No support tickets found</td></tr>
              ) : tickets.map((t) => (
                <tr key={t.id} className="cursor-pointer" onClick={() => openTicket(t)}>
                  <td>
                    <p className="font-medium text-text-primary text-sm">{t.name}</p>
                    <p className="text-xs text-text-tertiary">{t.email}</p>
                  </td>
                  <td>
                    <p className="text-sm text-text-primary">{t.subject}</p>
                    <p className="text-xs text-text-tertiary truncate max-w-xs">{t.message}</p>
                  </td>
                  <td><span className="text-xs text-text-tertiary">{formatDate(t.createdAt)}</span></td>
                  <td><span className="text-sm text-text-secondary">{t.replies.length}</span></td>
                  <td><StatusPill status={t.status} /></td>
                  <td className="text-right pr-4">
                    <button aria-label="Open ticket" onClick={(e) => { e.stopPropagation(); openTicket(t); }} className="w-7 h-7 inline-flex items-center justify-center rounded-clay-sm bg-clay-border-light hover:bg-clay-border transition-colors">
                      <ViewIcon className="w-3.5 h-3.5 text-text-secondary" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ClayCard>

      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title="Support Ticket"
        size="lg"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setDetail(null)}>Close</Button>
            {canReply && (
              <Button size="sm" loading={busy} disabled={!reply.trim()} onClick={handleReply} icon={<SentIcon className="w-3.5 h-3.5" />}>
                Send reply
              </Button>
            )}
          </>
        }
      >
        {detail && (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-text-primary">{detail.subject}</p>
                <p className="text-sm text-text-secondary">{detail.name} · <a className="underline" href={`mailto:${detail.email}`}>{detail.email}</a></p>
                <p className="text-xs text-text-tertiary mt-0.5">Received {formatDate(detail.createdAt)}</p>
              </div>
              {canReply ? (
                <select
                  aria-label="Ticket status"
                  className="clay-input py-1.5 text-sm w-36"
                  value={detail.status}
                  disabled={busy}
                  onChange={(e) => handleStatus(e.target.value as SupportTicketStatus)}
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
                </select>
              ) : (
                <StatusPill status={detail.status} />
              )}
            </div>

            <div className="bg-clay-border-light rounded-clay-sm px-3 py-2">
              <p className="text-[10px] text-text-tertiary font-semibold uppercase tracking-wide mb-1">Message</p>
              <p className="text-sm text-text-primary whitespace-pre-wrap">{detail.message}</p>
            </div>

            {detail.replies.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] text-text-tertiary font-semibold uppercase tracking-wide">Replies sent</p>
                {detail.replies.map((r, i) => (
                  <div key={i} className="border border-clay-border rounded-clay-sm px-3 py-2">
                    <p className="text-xs text-text-tertiary mb-1">{r.adminName || 'Admin'} · {formatDate(r.sentAt)}</p>
                    <p className="text-sm text-text-primary whitespace-pre-wrap">{r.message}</p>
                  </div>
                ))}
              </div>
            )}

            {canReply ? (
              <div className="space-y-2">
                <label className="text-[10px] text-text-tertiary font-semibold uppercase tracking-wide" htmlFor="support-reply">
                  Reply by email to {detail.email}
                </label>
                <textarea
                  id="support-reply"
                  className="clay-input w-full min-h-[120px] text-sm"
                  placeholder="Write your reply..."
                  maxLength={5000}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                />
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <span>After sending, mark as</span>
                  <select className="clay-input py-1 text-xs w-32" value={replyStatus} onChange={(e) => setReplyStatus(e.target.value as SupportTicketStatus)}>
                    {STATUSES.map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
                  </select>
                </div>
              </div>
            ) : (
              <p className="text-xs text-text-tertiary">Your admin role can view tickets but not reply to them.</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
