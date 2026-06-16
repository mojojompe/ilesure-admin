import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScrollText, Loader, Search, ArrowLeft, Activity } from 'lucide-react';
import { ClayCard } from '../components/ui/ClayCard';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { adminApi } from '../api/admin';

export function AuditLogs() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [actorType, setActorType] = useState('');
  const [action, setAction] = useState('');
  const [resource, setResource] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit: 25 };
      if (actorType) params.actorType = actorType;
      if (action) params.action = action;
      if (resource) params.resource = resource;
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;
      const res = await adminApi.audit.logs(params);
      if (res.success && res.data) {
        setLogs(Array.isArray(res.data) ? res.data : res.data.logs ?? []);
        setTotalPages(res.data.pagination?.totalPages ?? res.data.pageCount ?? 1);
        setTotal(res.data.pagination?.totalItems ?? res.data.total ?? 0);
      } else {
        setLogs([]);
      }
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, [page]);

  const handleSearch = () => { setPage(1); fetchLogs(); };

  const actorTypes = ['', 'admin', 'user', 'agent', 'system'];
  const actions = ['', 'create', 'update', 'delete', 'login', 'logout', 'approve', 'reject', 'suspend', 'archive'];
  const resources = ['', 'listing', 'user', 'agent', 'company', 'booking', 'payment', 'verification', 'waitlist', 'report', 'setting'];

  const formatDuration = (ms?: number) => {
    if (ms === undefined || ms === null) return '—';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/settings')} className="w-9 h-9 rounded-clay-sm bg-clay-border-light flex items-center justify-center hover:bg-clay-border transition-colors">
          <ArrowLeft className="w-4 h-4 text-text-secondary" />
        </button>
        <div className="w-12 h-12 rounded-clay bg-burnt-brown-pale flex items-center justify-center flex-shrink-0 shadow-clay-sm">
          <ScrollText className="w-6 h-6 text-burnt-brown" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-text-primary">Audit Logs</h2>
          <p className="text-sm text-text-tertiary mt-0.5">Track all actions performed across the platform</p>
        </div>
      </div>

      {/* Filters */}
      <ClayCard padding="md" className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-wide">Actor Type</label>
            <select value={actorType} onChange={e => setActorType(e.target.value)}
              className="w-full px-3 py-2 bg-clay-border-light border border-clay-border rounded-clay-sm text-sm outline-none focus:border-mustard">
              {actorTypes.map(a => <option key={a} value={a}>{a || 'All'}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-wide">Action</label>
            <select value={action} onChange={e => setAction(e.target.value)}
              className="w-full px-3 py-2 bg-clay-border-light border border-clay-border rounded-clay-sm text-sm outline-none focus:border-mustard">
              {actions.map(a => <option key={a} value={a}>{a || 'All'}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-wide">Resource</label>
            <select value={resource} onChange={e => setResource(e.target.value)}
              className="w-full px-3 py-2 bg-clay-border-light border border-clay-border rounded-clay-sm text-sm outline-none focus:border-mustard">
              {resources.map(r => <option key={r} value={r}>{r || 'All'}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-wide">From</label>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
              className="w-full px-3 py-2 bg-clay-border-light border border-clay-border rounded-clay-sm text-sm outline-none focus:border-mustard" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-wide">To</label>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
              className="w-full px-3 py-2 bg-clay-border-light border border-clay-border rounded-clay-sm text-sm outline-none focus:border-mustard" />
          </div>
        </div>
        <div className="flex justify-end">
          <Button variant="primary" size="sm" icon={<Search className="w-3.5 h-3.5" />} onClick={handleSearch}>Apply Filters</Button>
        </div>
      </ClayCard>

      {/* Logs Table */}
      <ClayCard padding="none">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-clay-border">
          <h3 className="font-bold text-text-primary text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-mustard" />
            Activity Log <span className="text-text-tertiary font-normal">({total})</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full clay-table">
            <thead>
              <tr>
                <th>Actor</th>
                <th>Action</th>
                <th>Resource</th>
                <th>Resource ID</th>
                <th>IP</th>
                <th>Duration</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12">
                  <div className="flex items-center justify-center gap-2">
                    <Loader className="w-5 h-5 animate-spin text-mustard" />
                    <span className="text-text-tertiary">Loading...</span>
                  </div>
                </td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-text-tertiary">No audit logs found</td></tr>
              ) : logs.map((log: any, i: number) => (
                <tr key={log._id || i}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-clay-sm bg-burnt-brown-pale flex items-center justify-center text-burnt-brown font-bold text-xs">
                        {(log.actorId?.name || log.actorType || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{log.actorId?.name || log.actorType}</p>
                        <p className="text-[10px] text-text-tertiary">{log.actorId?.email || ''}</p>
                      </div>
                    </div>
                  </td>
                  <td><span className="text-sm font-semibold">{log.action}</span></td>
                  <td><span className="text-xs text-text-secondary">{log.resource}</span></td>
                  <td><span className="text-xs font-mono text-text-tertiary">{(log.resourceId || '').slice(0, 12)}...</span></td>
                  <td><span className="text-xs text-text-tertiary">{log.ip || '—'}</span></td>
                  <td><span className="text-xs text-text-tertiary">{formatDuration(log.duration)}</span></td>
                  <td><span className="text-xs text-text-tertiary">{log.createdAt ? new Date(log.createdAt).toLocaleString() : '—'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-clay-border">
            <span className="text-xs text-text-tertiary">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 rounded-pill text-xs font-semibold bg-clay-border-light text-text-secondary hover:bg-clay-border disabled:opacity-40">Previous</button>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 rounded-pill text-xs font-semibold bg-clay-border-light text-text-secondary hover:bg-clay-border disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </ClayCard>

      <div className="mt-8 text-center pb-6">
        <p className="text-sm font-semibold text-text-tertiary">Sponsored by Waltik Labs</p>
      </div>
    </div>
  );
}