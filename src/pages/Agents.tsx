import { useState, useEffect } from 'react';
import { UserCheck, Shield, Home, Search, Eye, Ban, CheckCircle, Loader } from 'lucide-react';
import { ClayCard } from '../components/ui/ClayCard';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';
import { adminApi } from '../api/admin';

export function Agents() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<any | null>(null);

  useEffect(() => { fetchAgents(); }, []);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await adminApi.agents?.list?.() ?? { success: false, data: null };
      if (res.success && res.data) {
        setAgents(Array.isArray(res.data) ? res.data : res.data.agents ?? []);
      }
    } catch {
      // API not yet live — show empty state
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (agent: any) => {
    try { await adminApi.agents?.suspend?.(agent.id); await fetchAgents(); setDetail(null); } catch {}
  };
  const handleActivate = async (agent: any) => {
    try { await adminApi.agents?.activate?.(agent.id); await fetchAgents(); setDetail(null); } catch {}
  };

  const filtered = agents.filter(a =>
    `${a.fullName} ${a.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const summaryStats = [
    { label: 'Total Agents', value: agents.length, icon: <UserCheck className="w-5 h-5 text-burnt-brown" />, bg: 'bg-burnt-brown-pale' },
    { label: 'Verified', value: agents.filter((a: any) => a.status === 'verified').length, icon: <Shield className="w-5 h-5 text-status-success" />, bg: 'bg-status-success/10' },
    { label: 'Pending Review', value: agents.filter((a: any) => a.status === 'pending').length, icon: <Shield className="w-5 h-5 text-mustard" />, bg: 'bg-mustard/10' },
    { label: 'Total Listings', value: agents.reduce((s: number, a: any) => s + (a.listingsCount || 0), 0), icon: <Home className="w-5 h-5 text-burnt-brown-light" />, bg: 'bg-burnt-brown-pale' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryStats.map(s => (
          <div key={s.label} className="bg-white rounded-clay border border-clay-border shadow-clay p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-clay-sm flex items-center justify-center shadow-clay-sm flex-shrink-0 ${s.bg}`}>{s.icon}</div>
            <div>
              <div className="text-2xl font-bold text-text-primary">{s.value}</div>
              <div className="text-xs text-text-tertiary">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <ClayCard padding="none">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-clay-border">
          <h3 className="font-bold text-text-primary text-sm">All Agents</h3>
          <div className="relative w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <input
              className="clay-input w-full pl-9 py-1.5 text-sm"
              placeholder="Search agents..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full clay-table">
            <thead>
              <tr>
                <th>Agent</th>
                <th>Email</th>
                <th>Tier</th>
                <th>Listings</th>
                <th>Status</th>
                <th>Verified</th>
                <th className="text-right pr-5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12">
                  <div className="flex items-center justify-center gap-2">
                    <Loader className="w-5 h-5 animate-spin text-mustard" />
                    <span className="text-text-tertiary">Loading agents...</span>
                  </div>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-text-tertiary">No agents found</td></tr>
              ) : filtered.map(agent => (
                <tr key={agent.id || agent._id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-clay-sm bg-gradient-to-br from-burnt-brown-light to-burnt-brown flex items-center justify-center text-white font-bold text-sm shadow-clay-sm flex-shrink-0">
                        {(agent.fullName || agent.name || 'A').charAt(0)}
                      </div>
                      <p className="font-semibold text-text-primary text-sm">{agent.fullName || agent.name}</p>
                    </div>
                  </td>
                  <td><span className="text-sm text-text-secondary">{agent.email}</span></td>
                  <td><StatusBadge status={agent.tier as any} /></td>
                  <td><span className="text-sm font-semibold text-text-primary">{agent.listingsCount ?? 0}</span></td>
                  <td><StatusBadge status={agent.status as any} /></td>
                  <td>
                    {agent.isVerified
                      ? <span className="flex items-center gap-1 text-status-success text-xs font-semibold"><CheckCircle className="w-3.5 h-3.5" /> KYC</span>
                      : <span className="text-xs text-text-tertiary">Pending</span>}
                  </td>
                  <td className="text-right pr-4">
                    <button onClick={() => setDetail(agent)} className="w-7 h-7 inline-flex items-center justify-center rounded-clay-sm bg-clay-border-light hover:bg-clay-border transition-colors" title="View">
                      <Eye className="w-3.5 h-3.5 text-text-secondary" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ClayCard>

      {/* Detail modal */}
      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title="Agent Profile"
        size="md"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setDetail(null)}>Close</Button>
            {detail?.status === 'active'
              ? <Button variant="danger" size="sm" onClick={() => detail && handleSuspend(detail)} icon={<Ban className="w-3.5 h-3.5" />}>Suspend Agent</Button>
              : <Button variant="success" size="sm" onClick={() => detail && handleActivate(detail)}>Activate Agent</Button>}
          </>
        }
      >
        {detail && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-clay-border">
              <div className="w-14 h-14 rounded-clay-sm bg-gradient-to-br from-burnt-brown-light to-burnt-brown flex items-center justify-center text-white text-2xl font-bold shadow-clay">
                {(detail.fullName || detail.name || 'A').charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-text-primary text-lg">{detail.fullName || detail.name}</h3>
                <div className="flex gap-2 mt-1">
                  <StatusBadge status={detail.status as any} />
                  <StatusBadge status={detail.tier as any} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Email', value: detail.email },
                { label: 'Phone', value: detail.phone },
                { label: 'Listings', value: String(detail.listingsCount ?? 0) },
                { label: 'Tier', value: detail.tier },
                { label: 'KYC Status', value: detail.isVerified ? 'Verified' : 'Pending' },
                { label: 'Joined', value: detail.joinDate || detail.createdAt?.split('T')[0] || '—' },
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
