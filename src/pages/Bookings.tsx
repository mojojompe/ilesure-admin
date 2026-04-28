import { useState, useEffect } from 'react';
import { Calendar, Check, X, Loader, Search, Eye } from 'lucide-react';
import { ClayCard } from '../components/ui/ClayCard';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';
import { adminApi } from '../api/admin';

type BookingStatus = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

export function Bookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<BookingStatus>('all');
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<any | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => { fetchBookings(); }, [filter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await adminApi.bookings?.list?.({ status: filter !== 'all' ? filter : undefined }) ?? { success: false, data: null };
      if (res.success && res.data) {
        setBookings(Array.isArray(res.data) ? res.data : res.data.bookings ?? []);
      }
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id: string, action: string) => {
    setUpdating(true);
    try { await adminApi.bookings?.resolve?.(id, action); await fetchBookings(); setDetail(null); } catch {} finally { setUpdating(false); }
  };

  const filtered = bookings.filter(b =>
    `${b.listingTitle} ${b.tenantName} ${b.agentName}`.toLowerCase().includes(search.toLowerCase())
  );

  const tabs: BookingStatus[] = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

  const summary = [
    { label: 'Total', value: bookings.length },
    { label: 'Pending', value: bookings.filter(b => b.status === 'pending').length },
    { label: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed').length },
    { label: 'Completed', value: bookings.filter(b => b.status === 'completed').length },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summary.map(s => (
          <div key={s.label} className="bg-white rounded-clay border border-clay-border shadow-clay p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-clay-sm bg-burnt-brown-pale flex items-center justify-center shadow-clay-sm flex-shrink-0">
              <Calendar className="w-5 h-5 text-burnt-brown" />
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
          <h3 className="font-bold text-text-primary text-sm">All Bookings</h3>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex gap-1.5">
              {tabs.map(t => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`px-3 py-1 rounded-pill text-xs font-semibold transition-all ${
                    filter === t ? 'bg-burnt-brown text-white' : 'bg-clay-border-light text-text-secondary hover:bg-clay-border'
                  }`}
                >
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
                <th>Tenant</th>
                <th>Agent</th>
                <th>Price</th>
                <th>Move-in</th>
                <th>Status</th>
                <th>Payment</th>
                <th className="text-right pr-5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-12">
                  <div className="flex items-center justify-center gap-2">
                    <Loader className="w-5 h-5 animate-spin text-mustard" />
                    <span className="text-text-tertiary">Loading...</span>
                  </div>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-text-tertiary">No bookings found</td></tr>
              ) : filtered.map(b => (
                <tr key={b.id || b._id}>
                  <td><p className="font-medium text-text-primary text-sm">{b.listingTitle || b.listing?.title}</p></td>
                  <td>
                    <p className="text-sm text-text-primary">{b.tenantName || b.userName}</p>
                    <p className="text-xs text-text-tertiary">{b.tenantPhone || b.userPhone}</p>
                  </td>
                  <td><span className="text-sm text-text-secondary">{b.agentName || '—'}</span></td>
                  <td><span className="font-bold text-mustard text-sm">₦{(b.price || 0).toLocaleString()}</span></td>
                  <td><span className="text-sm text-text-secondary">{b.moveInDate}</span></td>
                  <td><StatusBadge status={b.status as any} /></td>
                  <td><StatusBadge status={(b.paymentStatus || 'pending') as any} /></td>
                  <td className="text-right pr-4">
                    <button onClick={() => setDetail(b)} className="w-7 h-7 inline-flex items-center justify-center rounded-clay-sm bg-clay-border-light hover:bg-clay-border transition-colors" title="View">
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
        title="Booking Details"
        size="md"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setDetail(null)}>Close</Button>
            {detail?.status === 'pending' && (
              <>
                <Button variant="success" size="sm" loading={updating} onClick={() => handleResolve(detail.id, 'confirm')} icon={<Check className="w-3.5 h-3.5" />}>Confirm</Button>
                <Button variant="danger" size="sm" loading={updating} onClick={() => handleResolve(detail.id, 'cancel')} icon={<X className="w-3.5 h-3.5" />}>Cancel</Button>
              </>
            )}
          </>
        }
      >
        {detail && (
          <div className="space-y-4">
            <p className="font-semibold text-text-primary">{detail.listingTitle || detail.listing?.title}</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Tenant', value: detail.tenantName || detail.userName },
                { label: 'Phone', value: detail.tenantPhone || detail.userPhone || '—' },
                { label: 'Agent', value: detail.agentName || '—' },
                { label: 'Price', value: `₦${(detail.price || 0).toLocaleString()}` },
                { label: 'Move-in Date', value: detail.moveInDate || '—' },
                { label: 'Payment', value: detail.paymentStatus || 'pending' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-clay-border-light rounded-clay-sm px-3 py-2">
                  <p className="text-[10px] text-text-tertiary font-semibold uppercase tracking-wide">{label}</p>
                  <p className="text-sm font-semibold text-text-primary mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
