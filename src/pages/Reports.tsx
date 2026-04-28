import { useState, useEffect } from 'react';
import { Flag, Trash2, Eye, X, Loader, Search } from 'lucide-react';
import { ClayCard } from '../components/ui/ClayCard';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';
import { adminApi } from '../api/admin';

type ReportFilter = 'all' | 'pending' | 'resolved' | 'actioned';

const REASON_LABELS: Record<string, string> = {
  suspicious: '🔍 Suspicious',
  fake: '❌ Fake listing',
  offensive: '⚠️ Offensive content',
  other: '📌 Other',
};

export function Reports() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ReportFilter>('all');
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<any | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => { fetchReports(); }, [filter]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await adminApi.reports?.list?.({ status: filter !== 'all' ? filter : undefined }) ?? { success: false, data: null };
      if (res.success && res.data) {
        setReports(Array.isArray(res.data) ? res.data : res.data.reports ?? []);
      }
    } catch {
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'dismiss' | 'takedown') => {
    setUpdating(true);
    try { await adminApi.reports?.action?.(id, action); await fetchReports(); setDetail(null); } catch {} finally { setUpdating(false); }
  };

  const filtered = reports.filter(r =>
    `${r.listingTitle} ${r.reporterName} ${r.reason}`.toLowerCase().includes(search.toLowerCase())
  );

  const tabs: ReportFilter[] = ['all', 'pending', 'resolved', 'actioned'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Reports', value: reports.length },
          { label: 'Pending', value: reports.filter(r => r.status === 'pending').length },
          { label: 'Resolved', value: reports.filter(r => r.status === 'resolved').length },
          { label: 'Listings Taken Down', value: reports.filter(r => r.status === 'actioned').length },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-clay border border-clay-border shadow-clay p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-clay-sm bg-red-50 flex items-center justify-center shadow-clay-sm flex-shrink-0">
              <Flag className="w-5 h-5 text-red-500" />
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
          <h3 className="font-bold text-text-primary text-sm">Reported Listings</h3>
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
                <th>Listing</th>
                <th>Reporter</th>
                <th>Reason</th>
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
                <tr><td colSpan={6} className="text-center py-12 text-text-tertiary">No reports found</td></tr>
              ) : filtered.map(r => (
                <tr key={r.id || r._id}>
                  <td><p className="font-medium text-text-primary text-sm">{r.listingTitle || '—'}</p></td>
                  <td><span className="text-sm text-text-secondary">{r.reporterName || '—'}</span></td>
                  <td>
                    <span className="text-xs px-2 py-0.5 rounded-pill bg-red-50 text-red-600 font-medium">
                      {REASON_LABELS[r.reason] || r.reason || '—'}
                    </span>
                  </td>
                  <td><span className="text-xs text-text-tertiary">{r.createdAt?.split('T')[0] || '—'}</span></td>
                  <td><StatusBadge status={(r.status || 'pending') as any} /></td>
                  <td className="text-right pr-4">
                    <button onClick={() => setDetail(r)} className="w-7 h-7 inline-flex items-center justify-center rounded-clay-sm bg-clay-border-light hover:bg-clay-border transition-colors">
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
        title="Report Details"
        size="md"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setDetail(null)}>Close</Button>
            {detail?.status === 'pending' && (
              <>
                <Button variant="danger" size="sm" loading={updating} onClick={() => handleAction(detail.id, 'dismiss')} icon={<X className="w-3.5 h-3.5" />}>Dismiss</Button>
                <Button variant="danger" size="sm" loading={updating} onClick={() => handleAction(detail.id, 'takedown')} icon={<Trash2 className="w-3.5 h-3.5" />}>Take Down Listing</Button>
              </>
            )}
          </>
        }
      >
        {detail && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-100 rounded-clay-sm p-4">
              <p className="text-xs text-red-500 font-semibold uppercase tracking-wide mb-1">Reported Listing</p>
              <p className="font-bold text-text-primary">{detail.listingTitle || '—'}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Reporter', value: detail.reporterName || '—' },
                { label: 'Reason', value: REASON_LABELS[detail.reason] || detail.reason || '—' },
                { label: 'Date', value: detail.createdAt?.split('T')[0] || '—' },
                { label: 'Status', value: detail.status || 'pending' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-clay-border-light rounded-clay-sm px-3 py-2">
                  <p className="text-[10px] text-text-tertiary font-semibold uppercase tracking-wide">{label}</p>
                  <p className="text-sm font-semibold text-text-primary mt-0.5">{value}</p>
                </div>
              ))}
            </div>
            {detail.description && (
              <div className="bg-clay-border-light rounded-clay-sm px-3 py-2">
                <p className="text-[10px] text-text-tertiary font-semibold uppercase tracking-wide mb-1">Description</p>
                <p className="text-sm text-text-primary">{detail.description}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
