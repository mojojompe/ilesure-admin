import { useState, useEffect } from 'react';
import { Search, Filter, Download, ChevronDown, ChevronUp, Eye, Home, MapPin, User } from 'lucide-react';
import { ClayCard } from '../components/ui/ClayCard';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';
import { Listing } from '../types';
import { clsx } from 'clsx';
import { adminApi } from '../api/admin';

type FilterStatus = 'all' | 'pending_approval' | 'active' | 'needs_roommate' | 'fully_booked' | 'rejected';

const propertyTypeLabel: Record<string, string> = {
  self_con: 'Self-con', '1_bed': '1-Bed Flat', '2_bed': '2-Bed Flat', '3_bed': '3-Bed Flat',
  mini_flat: 'Mini Flat', hostel_room: 'Hostel Room', shared_apartment: 'Shared Apt', shortlet: 'Shortlet',
};

export function Listings() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionModal, setActionModal] = useState<{ type: 'approve' | 'reject' | 'changes'; listing: Listing } | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchListings();
  }, [statusFilter]);

  const fetchListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      
      const response = await adminApi.listings.list(`?${params.toString()}`);
      const listingsData = response.data?.listings || response.data || [];
      
      if (response.success && listingsData.length > 0) {
        const formattedListings = listingsData.map((l: any) => ({
          id: l._id || l.id,
          title: l.title,
          propertyType: l.propertyType,
          agentName: l.landlordId?.fullName || l.landlordId?.agentName || l.agentName || 'Unknown',
          agentId: l.landlordId?._id || '',
          isCompany: l.isCompany || false,
          companyName: l.companyName,
          address: l.address || '',
          areaCluster: l.areaCluster || '',
          city: l.city || '',
          landmark: l.landmark,
          annualRent: l.annualRent || 0,
          cautionFee: l.cautionFee || 0,
          agencyFee: l.agencyFee || 0,
          totalMoveinCost: l.totalMoveinCost || 0,
          status: l.status,
          submittedDate: l.submittedDate || l.createdAt ? new Date(l.submittedDate || l.createdAt).toISOString().split('T')[0] : '',
          approvedDate: l.approvedDate,
          furnishing: l.furnishing,
          genderRestriction: l.genderRestriction,
          powerSource: l.powerSource,
          waterSource: l.waterSource,
          hasWifi: l.hasWifi,
          securityType: l.securityType,
          distanceFromLCU: l.distanceFromLCU,
          images: l.images || [],
          interestCount: l.interestCount || 0,
          canBeShared: l.canBeShared || false,
        }));
        setListings(formattedListings);
      }
    } catch (error) {
      console.error('Failed to fetch listings:', error);
      setError('Failed to fetch listings');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (type: 'approve' | 'reject' | 'changes', listing: Listing) => {
    setAdminNote('');
    setActionModal({ type, listing });
  };

  const confirmAction = async () => {
    if (!actionModal) return;
    const { type, listing } = actionModal;
    
    try {
      switch (type) {
        case 'approve':
          await adminApi.listings.approve(listing.id);
          break;
        case 'reject':
          await adminApi.listings.reject(listing.id, adminNote);
          break;
        case 'changes':
          await adminApi.listings.requestChanges(listing.id, adminNote);
          break;
      }
      await fetchListings();
      setActionModal(null);
    } catch (error) {
      console.error('Failed to perform action:', error);
    }
  };

  const filtered = listings.filter(l => {
    const matchSearch = l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.agentName.toLowerCase().includes(search.toLowerCase()) ||
      l.areaCluster.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusTabs: { key: FilterStatus; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: listings.length },
    { key: 'pending_approval', label: 'Pending', count: listings.filter(l => l.status === 'pending_approval').length },
    { key: 'active', label: 'Active', count: listings.filter(l => l.status === 'active').length },
    { key: 'needs_roommate', label: 'Needs Roommate', count: listings.filter(l => l.status === 'needs_roommate').length },
    { key: 'fully_booked', label: 'Fully Booked', count: listings.filter(l => l.status === 'fully_booked').length },
    { key: 'rejected', label: 'Rejected', count: listings.filter(l => l.status === 'rejected').length },
  ];

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Filter Tabs ─────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {statusTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={clsx(
              'flex items-center gap-2 rounded-pill px-4 py-1.5 text-xs font-semibold transition-all duration-150',
              statusFilter === tab.key
                ? 'bg-burnt-brown text-white shadow-clay-sm'
                : 'bg-white text-text-secondary border border-clay-border hover:border-burnt-brown hover:text-burnt-brown',
            )}
          >
            {tab.label}
            <span className={clsx('rounded-pill px-1.5 py-0.5 text-[10px] font-bold',
              statusFilter === tab.key ? 'bg-white/20 text-white' : 'bg-clay-border text-text-tertiary'
            )}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Toolbar ────────────────────────────────────── */}
      <ClayCard padding="sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title, agent, or area..."
              className="w-full pl-9 pr-4 py-2 bg-clay-border-light border border-clay-border rounded-pill text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-mustard focus:ring-2 focus:ring-mustard/20 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="secondary" size="sm" icon={<Filter className="w-3.5 h-3.5" />} onClick={() => alert('Filter mocked')}>Filter</Button>
            <Button variant="ghost" size="sm" icon={<Download className="w-3.5 h-3.5" />} onClick={() => alert('Export mocked')}>Export</Button>
          </div>
        </div>
      </ClayCard>

      {/* ── Listings Table ──────────────────────────────── */}
      <ClayCard padding="none">
        <div className="overflow-x-auto">
          <table className="w-full clay-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Agent / Company</th>
                <th>Type</th>
                <th>Rent / yr</th>
                <th>Area</th>
                <th>Status</th>
                <th>Submitted</th>
                <th className="text-right pr-5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-mustard border-t-transparent rounded-full animate-spin" />
                      <span className="text-text-tertiary">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <p className="text-status-error">{error}</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <p className="text-text-tertiary">No listings found</p>
                  </td>
                </tr>
              ) : filtered.map((listing) => (
                <>
                  <tr
                    key={listing.id}
                    className="cursor-pointer"
                    onClick={() => setExpandedId(expandedId === listing.id ? null : listing.id)}
                  >
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-clay-sm bg-burnt-brown-pale flex items-center justify-center flex-shrink-0">
                          <Home className="w-4 h-4 text-burnt-brown" />
                        </div>
                        <div>
                          <p className="font-semibold text-text-primary text-sm leading-tight max-w-[180px] truncate">{listing.title}</p>
                          <p className="text-[11px] text-text-tertiary">{listing.landmark || listing.city}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-text-tertiary flex-shrink-0" />
                        <span className="text-sm text-text-secondary max-w-[140px] truncate">{listing.agentName}</span>
                        {listing.isCompany && (
                          <span className="text-[10px] bg-burnt-brown/10 text-burnt-brown px-1.5 py-0.5 rounded-pill font-semibold">Co.</span>
                        )}
                      </div>
                    </td>
                    <td><span className="text-sm text-text-secondary">{propertyTypeLabel[listing.propertyType]}</span></td>
                    <td><span className="font-bold text-burnt-brown">₦{(listing.annualRent / 1000).toFixed(0)}k</span></td>
                    <td>
                      <div className="flex items-center gap-1 text-sm text-text-secondary">
                        <MapPin className="w-3 h-3 text-text-tertiary flex-shrink-0" />
                        {listing.areaCluster}
                      </div>
                    </td>
                    <td><StatusBadge status={listing.status as any} /></td>
                    <td><span className="text-xs text-text-tertiary">{listing.submittedDate}</span></td>
                    <td className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                        {listing.status === 'pending_approval' && (
                          <>
                            <button onClick={() => handleAction('approve', listing)} className="btn-success btn-sm rounded-pill text-xs px-3 py-1 font-semibold bg-status-success text-white hover:opacity-90 transition-opacity active:scale-95">Approve</button>
                            <button onClick={() => handleAction('changes', listing)} className="btn-mustard btn-sm rounded-pill text-xs px-3 py-1 font-semibold bg-gradient-to-br from-mustard-light to-mustard text-white hover:opacity-90 transition-opacity active:scale-95">Changes</button>
                            <button onClick={() => handleAction('reject', listing)} className="btn-danger btn-sm rounded-pill text-xs px-2.5 py-1 font-semibold bg-status-error text-white hover:opacity-90 transition-opacity active:scale-95">Reject</button>
                          </>
                        )}
                        <button
                          onClick={() => setExpandedId(expandedId === listing.id ? null : listing.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-clay-sm bg-clay-border-light hover:bg-clay-border transition-colors"
                          title="Expand"
                        >
                          {expandedId === listing.id
                            ? <ChevronUp className="w-3.5 h-3.5 text-text-secondary" />
                            : <ChevronDown className="w-3.5 h-3.5 text-text-secondary" />}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Row */}
                  {expandedId === listing.id && (
                    <tr key={`${listing.id}-expanded`} className="bg-mustard-pale/50">
                      <td colSpan={8} className="px-6 py-5">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {[
                            { label: 'Annual Rent', value: `₦${listing.annualRent.toLocaleString()}` },
                            { label: 'Caution Fee', value: `₦${listing.cautionFee.toLocaleString()}` },
                            { label: 'Agency Fee', value: `₦${listing.agencyFee.toLocaleString()}` },
                            { label: 'Total Move-in Cost', value: `₦${listing.totalMoveinCost.toLocaleString()}` },
                            { label: 'Furnishing', value: listing.furnishing.replace('_', ' ') },
                            { label: 'Gender Restriction', value: listing.genderRestriction.replace('_', ' ') },
                            { label: 'Power', value: listing.powerSource },
                            { label: 'Water', value: listing.waterSource },
                            { label: 'WiFi Available', value: listing.hasWifi ? 'Yes' : 'No' },
                            { label: 'Security', value: listing.securityType },
                            { label: 'Dist. from LCU', value: listing.distanceFromLCU || 'N/A' },
                            { label: 'Interest Count', value: `${listing.interestCount} interested` },
                          ].map(({ label, value }) => (
                            <div key={label} className="bg-white rounded-clay-sm px-3 py-2 shadow-clay-sm">
                              <p className="text-[10px] text-text-tertiary font-semibold uppercase tracking-wide">{label}</p>
                              <p className="text-sm font-semibold text-text-primary mt-0.5 capitalize">{value}</p>
                            </div>
                          ))}
                        </div>
                        {listing.status === 'pending_approval' && (
                          <div className="flex gap-3 mt-4">
                            <Button variant="success" size="sm" onClick={() => handleAction('approve', listing)}>Approve Listing</Button>
                            <Button variant="mustard" size="sm" onClick={() => handleAction('changes', listing)}>Request Changes</Button>
                            <Button variant="danger" size="sm" onClick={() => handleAction('reject', listing)}>Reject</Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Eye className="w-8 h-8 text-clay-border" />
                      <p className="text-text-tertiary font-medium">No listings found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-clay-border bg-off-white rounded-b-clay">
          <p className="text-xs text-text-tertiary">Showing {filtered.length} of {listings.length} listings</p>
          <div className="flex gap-1">
            {[1, 2, 3].map(p => (
              <button key={p} className={clsx('w-7 h-7 rounded-clay-sm text-xs font-semibold transition-colors',
                p === 1 ? 'bg-burnt-brown text-white' : 'bg-clay-border-light text-text-secondary hover:bg-clay-border'
              )}>{p}</button>
            ))}
          </div>
        </div>
      </ClayCard>

      {/* ── Action Modals ───────────────────────────────── */}
      <Modal
        open={!!actionModal}
        onClose={() => setActionModal(null)}
        size="sm"
        title={
          actionModal?.type === 'approve' ? 'Approve Listing' :
          actionModal?.type === 'reject' ? 'Reject Listing' :
          'Request Changes'
        }
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setActionModal(null)}>Cancel</Button>
            <Button
              variant={actionModal?.type === 'approve' ? 'success' : actionModal?.type === 'reject' ? 'danger' : 'mustard'}
              size="sm"
              onClick={confirmAction}
            >
              {actionModal?.type === 'approve' ? 'Confirm Approval' : actionModal?.type === 'reject' ? 'Confirm Rejection' : 'Send Request'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-text-secondary mb-4">
          {actionModal?.type === 'approve' && `You're about to approve "${actionModal.listing.title}". This listing will go live immediately.`}
          {actionModal?.type === 'reject' && `You're about to reject "${actionModal?.listing.title}". The agent will be notified.`}
          {actionModal?.type === 'changes' && `Specify what changes are needed for "${actionModal?.listing.title}".`}
        </p>
        <textarea
          rows={3}
          value={adminNote}
          onChange={e => setAdminNote(e.target.value)}
          placeholder={actionModal?.type === 'approve' ? 'Optional note to agent...' : 'Required: describe the issue or changes needed...'}
          className="w-full clay-input resize-none text-sm"
        />
      </Modal>
    </div>
  );
}
