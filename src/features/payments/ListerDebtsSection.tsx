import { useCallback, useEffect, useState } from 'react';
import { Loading01Icon } from '@hugeicons/react';
import { Modal as AntModal } from 'antd';
import toast from 'react-hot-toast';
import { ClayCard } from '../../components/ui/ClayCard';
import { Button } from '../../components/ui/Button';
import { formatDateTime } from '../../utils/format';
import { adminApi } from '../../api/admin';
import { can, CAP } from '../../lib/rbac';
import { errorMessage } from '../../api/errors';

type DebtFilter = 'outstanding' | 'recovered' | 'written_off' | 'all';

interface ListerDebt {
  id: string;
  reference?: string;
  reason: 'refund' | 'chargeback';
  context?: string;
  amount: number;
  ownerType: string;
  ownerName: string;
  ownerEmail?: string;
  ownerPhone?: string;
  listingTitle?: string;
  status: 'outstanding' | 'recovered' | 'written_off';
  resolvedAt?: string;
  resolvedBy?: string;
  note?: string;
  createdAt: string;
}

const FILTERS: { key: DebtFilter; label: string }[] = [
  { key: 'outstanding', label: 'Outstanding' },
  { key: 'recovered', label: 'Recovered' },
  { key: 'written_off', label: 'Written off' },
  { key: 'all', label: 'All' },
];

const STATUS_CLASS: Record<ListerDebt['status'], string> = {
  outstanding: 'bg-status-error/10 text-status-error',
  recovered: 'bg-status-success/10 text-status-success',
  written_off: 'bg-clay-border-light text-text-secondary',
};

/**
 * Lister debts: when a tenant's payment is refunded or charged back after the lister was
 * settled, the tenant is repaid from the platform's balance and the lister owes their settled
 * share back. This is the list finance recovers from, and where a debt is closed.
 */
export function ListerDebtsSection() {
  const [debts, setDebts] = useState<ListerDebt[]>([]);
  const [outstanding, setOutstanding] = useState({ count: 0, amount: 0 });
  const [filter, setFilter] = useState<DebtFilter>('outstanding');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const canResolve = can(CAP.PAYMENTS_PROCESS);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.payments.listerDebts({ status: filter, page, limit: 20 });
      setDebts(res.data?.debts || []);
      setOutstanding(res.data?.outstanding || { count: 0, amount: 0 });
      setTotalPages(res.data?.pagination?.totalPages || 1);
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to load lister debts'));
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => { load(); }, [load]);

  const resolve = (debt: ListerDebt, status: 'recovered' | 'written_off') => {
    const recovered = status === 'recovered';
    AntModal.confirm({
      title: recovered ? 'Mark as recovered?' : 'Write this debt off?',
      content: recovered
        ? `Confirm that ${debt.ownerName} has repaid ₦${debt.amount.toLocaleString()} for ${debt.reference || 'this payment'}. This cannot be undone.`
        : `₦${debt.amount.toLocaleString()} owed by ${debt.ownerName} will be closed as not recovered. This cannot be undone.`,
      okText: recovered ? 'Mark recovered' : 'Write off',
      okButtonProps: { danger: !recovered },
      onOk: async () => {
        try {
          await adminApi.payments.resolveListerDebt(debt.id, status);
          toast.success(recovered ? 'Debt marked as recovered' : 'Debt written off');
          load();
        } catch (err) {
          toast.error(errorMessage(err, 'Failed to update the debt'));
        }
      },
    });
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-clay border border-clay-border shadow-clay p-5">
          <p className="text-xs text-text-tertiary font-semibold uppercase tracking-wide mb-1">Outstanding Debts</p>
          <p className={`text-3xl font-bold ${outstanding.count > 0 ? 'text-status-error' : 'text-text-primary'}`}>{outstanding.count}</p>
        </div>
        <div className="bg-white rounded-clay border border-clay-border shadow-clay p-5">
          <p className="text-xs text-text-tertiary font-semibold uppercase tracking-wide mb-1">Owed by Listers</p>
          <p className="text-3xl font-bold text-mustard">₦{outstanding.amount.toLocaleString()}</p>
          <p className="text-[11px] text-text-tertiary mt-1">Settled to listers before the payment was refunded or charged back</p>
        </div>
      </div>

      <ClayCard padding="none">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-5 py-3.5 border-b border-clay-border gap-3">
          <h3 className="font-bold text-text-primary text-sm">Lister Debts</h3>
          <div className="flex gap-1.5">
            {FILTERS.map(f => (
              <button key={f.key} onClick={() => { setFilter(f.key); setPage(1); }}
                className={`px-3 py-1 rounded-pill text-xs font-semibold transition-all ${filter === f.key ? 'bg-burnt-brown text-white' : 'bg-clay-border-light text-text-secondary hover:bg-clay-border'}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full clay-table">
            <thead>
              <tr>
                <th>Owed by</th>
                <th>Payment</th>
                <th>Reason</th>
                <th>Amount</th>
                <th>Recorded</th>
                <th>Status</th>
                <th className="text-right pr-5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12">
                  <div className="flex items-center justify-center gap-2">
                    <Loading01Icon className="w-5 h-5 animate-spin text-mustard" />
                    <span className="text-text-tertiary">Loading...</span>
                  </div>
                </td></tr>
              ) : debts.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-text-tertiary">No lister debts found</td></tr>
              ) : debts.map(d => (
                <tr key={d.id}>
                  <td>
                    <p className="text-sm font-semibold text-text-primary">{d.ownerName}</p>
                    <p className="text-xs text-text-tertiary">{[d.ownerType === 'company' ? 'Company' : null, d.ownerEmail, d.ownerPhone].filter(Boolean).join(' · ')}</p>
                  </td>
                  <td>
                    <p className="text-sm text-text-secondary">{d.listingTitle || '—'}</p>
                    <p className="text-xs text-text-tertiary font-mono">{d.reference || '—'}</p>
                  </td>
                  <td>
                    <p className="text-sm text-text-secondary capitalize">{d.reason}</p>
                    {d.context && <p className="text-xs text-text-tertiary">{d.context.replace(/_/g, ' ')}</p>}
                  </td>
                  <td><span className="font-bold text-mustard text-sm">₦{d.amount.toLocaleString()}</span></td>
                  <td><span className="text-xs text-text-tertiary">{formatDateTime(d.createdAt)}</span></td>
                  <td>
                    <span className={`inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-semibold ${STATUS_CLASS[d.status]}`}>
                      {d.status.replace('_', ' ')}
                    </span>
                    {d.resolvedBy && <p className="text-[11px] text-text-tertiary mt-1">by {d.resolvedBy}</p>}
                  </td>
                  <td className="text-right pr-4">
                    {d.status === 'outstanding' && canResolve && (
                      <div className="flex justify-end gap-2">
                        <Button size="sm" onClick={() => resolve(d, 'recovered')}>Recovered</Button>
                        <Button size="sm" variant="secondary" onClick={() => resolve(d, 'written_off')}>Write off</Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-clay-border">
            <span className="text-xs text-text-tertiary">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <Button size="sm" variant="secondary" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </ClayCard>
    </>
  );
}
