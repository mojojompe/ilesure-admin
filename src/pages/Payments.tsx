import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, CheckCircle, Clock, Loader, Search, Eye } from 'lucide-react';
import { ClayCard } from '../components/ui/ClayCard';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';
import { adminApi } from '../api/admin';

type PayFilter = 'all' | 'pending' | 'processed' | 'failed';

type PSuccessTab = 'payouts' | 'paystack';

export function Payments() {
  const navigate = useNavigate();
  const [successTab, setSuccessTab] = useState<PSuccessTab>('payouts');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Section tabs */}
      <div className="flex items-center gap-1 bg-white rounded-clay-sm border border-clay-border shadow-clay-sm p-1 w-fit">
        <button onClick={() => setSuccessTab('payouts')}
          className={`px-4 py-2 rounded-clay-sm text-sm font-semibold transition-all ${successTab === 'payouts' ? 'bg-burnt-brown text-white shadow-clay-sm' : 'text-text-secondary hover:bg-clay-border-light'}`}>
          Payout Records
        </button>
        <button onClick={() => setSuccessTab('paystack')}
          className={`px-4 py-2 rounded-clay-sm text-sm font-semibold transition-all ${successTab === 'paystack' ? 'bg-burnt-brown text-white shadow-clay-sm' : 'text-text-secondary hover:bg-clay-border-light'}`}>
          Paystack Transactions
        </button>
      </div>

      {successTab === 'payouts' ? <PayoutsSection /> : <PaystackSection />}
    </div>
  );
}

/* ─── Payout Records (existing) ─────────────── */
function PayoutsSection() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<PayFilter>('all');
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<any | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => { fetchPayments(); }, [filter]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {};
      if (filter !== 'all') params.status = filter;
      const res = await adminApi.payments?.list?.(params) ?? { success: false, data: null };
      if (res.success && res.data) {
        setPayments(Array.isArray(res.data) ? res.data : res.data.payments ?? []);
      }
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkProcessed = async (id: string) => {
    setUpdating(true);
    try { await adminApi.payments?.markProcessed?.(id); await fetchPayments(); setDetail(null); } catch {} finally { setUpdating(false); }
  };

  const filtered = payments.filter(p =>
    `${p.agentName} ${p.description}`.toLowerCase().includes(search.toLowerCase())
  );

  const totalProcessed = payments.filter(p => p.status === 'processed').reduce((s, p) => s + (p.amount || 0), 0);
  const totalPending = payments.filter(p => p.status === 'pending').reduce((s, p) => s + (p.amount || 0), 0);

  const tabs: PayFilter[] = ['all', 'pending', 'processed', 'failed'];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-clay border border-clay-border shadow-clay p-5">
          <p className="text-xs text-text-tertiary font-semibold uppercase tracking-wide mb-1">Total Payout Records</p>
          <p className="text-3xl font-bold text-text-primary">{payments.length}</p>
        </div>
        <div className="bg-white rounded-clay border border-clay-border shadow-clay p-5">
          <p className="text-xs text-text-tertiary font-semibold uppercase tracking-wide mb-1">Pending Payouts</p>
          <p className="text-3xl font-bold text-mustard">₦{totalPending.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-clay border border-clay-border shadow-clay p-5">
          <p className="text-xs text-text-tertiary font-semibold uppercase tracking-wide mb-1">Processed</p>
          <p className="text-3xl font-bold text-status-success">₦{totalProcessed.toLocaleString()}</p>
        </div>
      </div>

      <ClayCard padding="none">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-5 py-3.5 border-b border-clay-border gap-3">
          <h3 className="font-bold text-text-primary text-sm">Payout Records</h3>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex gap-1.5">
              {tabs.map(t => (
                <button key={t} onClick={() => setFilter(t)}
                  className={`px-3 py-1 rounded-pill text-xs font-semibold transition-all ${filter === t ? 'bg-burnt-brown text-white' : 'bg-clay-border-light text-text-secondary hover:bg-clay-border'}`}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
              <input className="clay-input w-44 pl-9 py-1.5 text-sm" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full clay-table">
            <thead>
              <tr>
                <th>Agent / Company</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
                <th className="text-right pr-5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12">
                  <div className="flex items-center justify-center gap-2">
                    <Loader className="w-5 h-5 animate-spin text-mustard" />
                    <span className="text-text-tertiary">Loading...</span>
                  </div>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-text-tertiary">No payment records found</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id || p._id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-clay-sm bg-burnt-brown-pale flex items-center justify-center text-burnt-brown font-bold text-sm">
                        {(p.agentName || 'A').charAt(0)}
                      </div>
                      <p className="text-sm font-semibold text-text-primary">{p.agentName || p.companyName || '—'}</p>
                    </div>
                  </td>
                  <td><span className="text-sm text-text-secondary">{p.description || 'Subscription'}</span></td>
                  <td><span className="font-bold text-mustard text-sm">₦{(p.amount || 0).toLocaleString()}</span></td>
                  <td><span className="text-xs text-text-tertiary">{p.date || p.createdAt?.split('T')[0] || '—'}</span></td>
                  <td><StatusBadge status={(p.status || 'pending') as any} /></td>
                  <td className="text-right pr-4">
                    <button onClick={() => setDetail(p)} className="w-7 h-7 inline-flex items-center justify-center rounded-clay-sm bg-clay-border-light hover:bg-clay-border transition-colors">
                      <Eye className="w-3.5 h-3.5 text-text-secondary" />
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
        title="Payment Record"
        size="sm"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setDetail(null)}>Close</Button>
            {detail?.status === 'pending' && (
              <Button variant="success" size="sm" loading={updating} onClick={() => handleMarkProcessed(detail.id)} icon={<CheckCircle className="w-3.5 h-3.5" />}>
                Mark as Processed
              </Button>
            )}
          </>
        }
      >
        {detail && (
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Agent / Company', value: detail.agentName || detail.companyName || '—' },
              { label: 'Amount', value: `₦${(detail.amount || 0).toLocaleString()}` },
              { label: 'Description', value: detail.description || 'Subscription' },
              { label: 'Date', value: detail.date || detail.createdAt?.split('T')[0] || '—' },
              { label: 'Status', value: detail.status || 'pending' },
              { label: 'Reference', value: detail.reference || '—' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-clay-border-light rounded-clay-sm px-3 py-2">
                <p className="text-[10px] text-text-tertiary font-semibold uppercase tracking-wide">{label}</p>
                <p className="text-sm font-semibold text-text-primary mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </>
  );
}

/* ─── Paystack Transactions ─────────────── */
const PAYSTACK_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  success:    { label: 'Success',    color: 'bg-status-success/10 text-status-success' },
  failed:     { label: 'Failed',     color: 'bg-status-error/10 text-status-error' },
  abandoned:  { label: 'Abandoned',  color: 'bg-mustard/15 text-mustard' },
  reversed:   { label: 'Reversed',   color: 'bg-text-tertiary/10 text-text-tertiary' },
  processing: { label: 'Processing', color: 'bg-status-info/10 text-status-info' },
  pending:    { label: 'Pending',    color: 'bg-mustard/15 text-mustard' },
};

function PaystackStatusBadge({ status }: { status: string }) {
  const cfg = PAYSTACK_STATUS_LABELS[status] || { label: status, color: 'bg-clay-border text-text-secondary' };
  return <span className={`inline-flex items-center rounded-pill px-3 py-1 text-xs font-semibold tracking-wide ${cfg.color}`}>{cfg.label}</span>;
}

function PaystackSection() {
  const [txns, setTxns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>({});
  const [txFilter, setTxFilter] = useState<string>('');
  const [detail, setDetail] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => { fetchTxns(); }, [page, txFilter]);

  const formatDate = (t: any) => {
    const raw = t.created_at || t.paid_at || t.createdAt || t.paidAt;
    if (!raw) return '—';
    const d = new Date(raw);
    return isNaN(d.getTime()) ? String(raw).slice(0, 10) : d.toLocaleDateString();
  };

  const fetchTxns = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, perPage: 20 };
      if (txFilter) params.status = txFilter;
      const res = await adminApi.audit.paystackTransactions(params);
      if (res.success && res.data) {
        setTxns(res.data.transactions ?? (Array.isArray(res.data) ? res.data : []));
        setMeta(res.data.meta ?? res.meta ?? {});
      } else {
        setTxns([]);
        setMeta({});
      }
    } catch {
      setTxns([]);
    } finally {
      setLoading(false);
    }
  };

  const viewDetail = async (id: number) => {
    setDetailLoading(true);
    try {
      const res = await adminApi.audit.paystackTransactionDetail(String(id));
      setDetail(res.data ?? res);
    } catch {
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const statuses = ['', 'success', 'failed', 'abandoned', 'reversed'];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-clay border border-clay-border shadow-clay p-5">
          <p className="text-xs text-text-tertiary font-semibold uppercase tracking-wide mb-1">Total Transactions</p>
          <p className="text-3xl font-bold text-text-primary">{meta.total ?? txns.length}</p>
        </div>
        <div className="bg-white rounded-clay border border-clay-border shadow-clay p-5">
          <p className="text-xs text-text-tertiary font-semibold uppercase tracking-wide mb-1">Page</p>
          <p className="text-3xl font-bold text-mustard">{meta.page ?? page} / {meta.pageCount ?? 1}</p>
        </div>
        <div className="bg-white rounded-clay border border-clay-border shadow-clay p-5">
          <p className="text-xs text-text-tertiary font-semibold uppercase tracking-wide mb-1">Per Page</p>
          <p className="text-3xl font-bold text-status-success">{meta.perPage ?? 20}</p>
        </div>
      </div>

      <ClayCard padding="none">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-5 py-3.5 border-b border-clay-border gap-3">
          <h3 className="font-bold text-text-primary text-sm">Paystack Transactions</h3>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex gap-1.5">
              {statuses.map(s => (
                <button key={s} onClick={() => { setTxFilter(s); setPage(1); }}
                  className={`px-3 py-1 rounded-pill text-xs font-semibold transition-all ${txFilter === s ? 'bg-burnt-brown text-white' : 'bg-clay-border-light text-text-secondary hover:bg-clay-border'}`}>
                  {s || 'All'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full clay-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th className="text-right pr-5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12">
                  <div className="flex items-center justify-center gap-2">
                    <Loader className="w-5 h-5 animate-spin text-mustard" />
                    <span className="text-text-tertiary">Loading...</span>
                  </div>
                </td></tr>
              ) : txns.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-text-tertiary">No transactions found</td></tr>
              ) : txns.map((t: any) => (
                <tr key={t.id}>
                  <td><span className="text-sm font-mono text-text-primary">{t.reference}</span></td>
                  <td><span className="text-sm text-text-secondary">{t.customer?.email || t.customer?.name || '—'}</span></td>
                  <td><span className="font-bold text-mustard text-sm">₦{((t.amount ?? 0) / 100).toLocaleString()}</span></td>
                  <td><PaystackStatusBadge status={t.status} /></td>
                  <td><span className="text-xs text-text-tertiary">{formatDate(t)}</span></td>
                  <td className="text-right pr-4">
                    <button onClick={() => viewDetail(t.id)} className="w-7 h-7 inline-flex items-center justify-center rounded-clay-sm bg-clay-border-light hover:bg-clay-border transition-colors">
                      <Eye className="w-3.5 h-3.5 text-text-secondary" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {meta.pageCount > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-clay-border">
            <span className="text-xs text-text-tertiary">Page {meta.page} of {meta.pageCount}</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 rounded-pill text-xs font-semibold bg-clay-border-light text-text-secondary hover:bg-clay-border disabled:opacity-40">Previous</button>
              <button disabled={page >= (meta.pageCount ?? 1)} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 rounded-pill text-xs font-semibold bg-clay-border-light text-text-secondary hover:bg-clay-border disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </ClayCard>

      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title="Transaction Detail"
        size="sm"
        footer={<Button variant="secondary" size="sm" onClick={() => setDetail(null)}>Close</Button>}
      >
        {detailLoading ? (
          <div className="flex items-center justify-center py-8"><Loader className="w-5 h-5 animate-spin text-mustard" /></div>
        ) : detail ? (
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Reference', value: detail.reference },
              { label: 'Amount', value: `₦${((detail.amount ?? 0) / 100).toLocaleString()}` },
              { label: 'Status', value: detail.status },
              { label: 'Customer', value: detail.customer?.email || detail.customer?.name || '—' },
              { label: 'Channel', value: detail.channel },
              { label: 'Date', value: formatDate(detail) },
              { label: 'Fees', value: detail.fees != null ? `₦${(detail.fees / 100).toLocaleString()}` : '—' },
              { label: 'Currency', value: detail.currency },
            ].map(({ label, value }) => (
              <div key={label} className="bg-clay-border-light rounded-clay-sm px-3 py-2">
                <p className="text-[10px] text-text-tertiary font-semibold uppercase tracking-wide">{label}</p>
                <p className="text-sm font-semibold text-text-primary mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-text-tertiary py-4">Could not load transaction details.</p>
        )}
      </Modal>
    </>
  );
}
