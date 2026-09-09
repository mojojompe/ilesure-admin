import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Note01Icon,
  Loading01Icon,
  Search01Icon,
  ArrowLeft01Icon,
  Analytics01Icon,
  Copy01Icon,
  Tick01Icon,
  ViewIcon,
  File01Icon,
  SecurityCheckIcon,
  Time02Icon,
  UserIcon as UserIcon,
  CloudServerIcon,
  Layers01Icon
} from '@hugeicons/react';
import { ClayCard } from '../components/ui/ClayCard';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { adminApi } from '../api/admin';

export interface IAuditEventActor {
  id?: string | null;
  email?: string;
  role?: string;
  ip_address?: string;
  user_agent?: string;
  location?: string;
}

export interface IAuditEventTarget {
  id?: string | null;
  type?: string;
  name?: string;
}

export interface IAuditEvent {
  event_id: string;
  timestamp: string;
  event_type: string;
  status: 'success' | 'failure' | 'rejected' | 'pending';
  severity: 'info' | 'warning' | 'error' | 'critical';
  actor: IAuditEventActor;
  target: IAuditEventTarget;
  context: Record<string, any>;
  changes: Record<string, any> | null;
  [key: string]: any;
}

function normalizeLog(log: any): IAuditEvent {
  const event_id =
    log.event_id || (log._id ? `evt_${String(log._id).slice(-8)}` : 'evt_unknown');
  const timestamp =
    log.timestamp || log.createdAt || new Date().toISOString();

  let status: 'success' | 'failure' | 'rejected' | 'pending' = log.status;
  if (!status) {
    if (typeof log.statusCode === 'number') {
      if (log.statusCode >= 200 && log.statusCode < 400) status = 'success';
      else if (log.statusCode >= 400 && log.statusCode < 500) status = 'rejected';
      else status = 'failure';
    } else {
      status = 'success';
    }
  }

  let severity: 'info' | 'warning' | 'error' | 'critical' = log.severity;
  if (!severity) {
    if (status === 'rejected') severity = 'warning';
    else if (status === 'failure') severity = 'error';
    else severity = 'info';
  }

  const event_type =
    log.event_type ||
    (log.action ? `${log.resource || 'system'}.${log.action}.${status}` : 'system.action.success');

  const actor: IAuditEventActor = log.actor || {
    id: log.actorId?._id || log.actorId || null,
    email: log.actorId?.email || '',
    role:
      log.actorType === 'admin'
        ? 'Admin'
        : log.actorType === 'user'
        ? 'User'
        : log.actorType === 'system'
        ? 'System'
        : 'User',
    ip_address: log.ip || '',
    user_agent: log.userAgent || '',
    location: log.metadata?.location || 'Unknown',
  };

  const target: IAuditEventTarget = log.target || {
    id: log.resourceId || null,
    type: log.resource || 'unknown',
    name: log.metadata?.targetName || log.actorName || log.description || '',
  };

  const context: Record<string, any> = {
    ...(log.metadata || {}),
    ...(log.context || {}),
  };
  if (log.method && !context.method) context.method = log.method;
  if (log.path && !context.path) context.path = log.path;
  if (typeof log.statusCode === 'number' && context.status_code === undefined) context.status_code = log.statusCode;
  if (typeof log.duration === 'number' && context.duration_ms === undefined) context.duration_ms = log.duration;

  const changes = log.changes ?? null;

  return {
    event_id,
    timestamp,
    event_type,
    status,
    severity,
    actor,
    target,
    context,
    changes,
  };
}

export function AuditLogs() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<IAuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [eventType, setEventType] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actorRoleFilter, setActorRoleFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Inspector Modal State
  const [inspectEvent, setInspectEvent] = useState<IAuditEvent | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit: 25 };
      if (eventType) params.event_type = eventType;
      if (severityFilter) params.severity = severityFilter;
      if (statusFilter) params.status = statusFilter;
      if (actorRoleFilter) params.actorType = actorRoleFilter;
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;

      const res = await adminApi.audit.logs(params);
      if (res.success && res.data) {
        const rawLogs = Array.isArray(res.data) ? res.data : res.data.logs ?? [];
        setLogs(rawLogs.map(normalizeLog));
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

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    fetchLogs();
  };

  const handleCopyJson = (event: IAuditEvent) => {
    const cleanOutput = {
      event_id: event.event_id,
      timestamp: event.timestamp,
      event_type: event.event_type,
      status: event.status,
      severity: event.severity,
      actor: event.actor,
      target: event.target,
      context: event.context,
      changes: event.changes,
    };
    navigator.clipboard.writeText(JSON.stringify(cleanOutput, null, 2));
    setCopiedId(event.event_id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatTimestamp = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
    } catch {
      return ts;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/settings')}
            className="w-9 h-9 rounded-clay-sm bg-clay-border-light flex items-center justify-center hover:bg-clay-border transition-colors"
          >
            <ArrowLeft01Icon className="w-4 h-4 text-text-secondary" />
          </button>
          <div className="w-12 h-12 rounded-clay bg-burnt-brown-pale flex items-center justify-center flex-shrink-0 shadow-clay-sm">
            <Note01Icon className="w-6 h-6 text-burnt-brown" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary">Enterprise Audit Logs</h2>
            <p className="text-sm text-text-tertiary mt-0.5">
              Structured SOC 2 compliance event trail for security, identity, and system mutations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
            <SecurityCheckIcon className="w-3.5 h-3.5" /> SOC 2 / Event-Standard Active
          </span>
        </div>
      </div>

      {/* Filters */}
      <ClayCard padding="md" className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-wide">
              Event Type / Action
            </label>
            <input
              type="text"
              placeholder="e.g. auth.login or user.suspend"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full px-3 py-2 bg-clay-border-light border border-clay-border rounded-clay-sm text-sm outline-none focus:border-mustard"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-wide">
              Severity
            </label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full px-3 py-2 bg-clay-border-light border border-clay-border rounded-clay-sm text-sm outline-none focus:border-mustard"
            >
              <option value="">All Severities</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-wide">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-clay-border-light border border-clay-border rounded-clay-sm text-sm outline-none focus:border-mustard"
            >
              <option value="">All Statuses</option>
              <option value="success">Success</option>
              <option value="rejected">Rejected</option>
              <option value="failure">Failure</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-wide">
              Actor Role
            </label>
            <select
              value={actorRoleFilter}
              onChange={(e) => setActorRoleFilter(e.target.value)}
              className="w-full px-3 py-2 bg-clay-border-light border border-clay-border rounded-clay-sm text-sm outline-none focus:border-mustard"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
              <option value="system">System</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-wide">
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2 bg-clay-border-light border border-clay-border rounded-clay-sm text-sm outline-none focus:border-mustard"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-text-tertiary">
            Showing <strong className="text-text-primary">{logs.length}</strong> of{' '}
            <strong className="text-text-primary">{total}</strong> events
          </span>
          <Button
            variant="primary"
            size="sm"
            icon={<Search01Icon className="w-3.5 h-3.5" />}
            onClick={handleSearch}
          >
            Apply Filters
          </Button>
        </div>
      </ClayCard>

      {/* Logs Table */}
      <ClayCard padding="none">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-clay-border">
          <h3 className="font-bold text-text-primary text-sm flex items-center gap-2">
            <Analytics01Icon className="w-4 h-4 text-mustard" />
            Audit Trail ({total})
          </h3>
          <span className="text-xs text-text-tertiary">
            Click any row to inspect & copy the full JSON event
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full clay-table">
            <thead>
              <tr>
                <th>Event ID</th>
                <th>Timestamp</th>
                <th>Event Type</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Actor</th>
                <th>Target</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <div className="flex items-center justify-center gap-2">
                      <Loading01Icon className="w-5 h-5 animate-spin text-mustard" />
                      <span className="text-text-tertiary">Loading audit events...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-text-tertiary">
                    No audit events found
                  </td>
                </tr>
              ) : (
                logs.map((log, i) => {
                  const isSuccess = log.status === 'success';
                  const isRejected = log.status === 'rejected';
                  const isFailure = log.status === 'failure';

                  return (
                    <tr
                      key={log.event_id || i}
                      className="cursor-pointer hover:bg-clay-border-light/40 transition-colors"
                      onClick={() => setInspectEvent(log)}
                    >
                      {/* Event ID */}
                      <td>
                        <span className="font-mono text-xs text-mustard font-semibold bg-mustard/10 px-2 py-1 rounded">
                          {log.event_id}
                        </span>
                      </td>

                      {/* Timestamp */}
                      <td>
                        <div className="flex items-center gap-1.5 text-xs text-text-secondary whitespace-nowrap">
                          <Time02Icon className="w-3.5 h-3.5 text-text-tertiary" />
                          <span>{formatTimestamp(log.timestamp)}</span>
                        </div>
                      </td>

                      {/* Event Type */}
                      <td>
                        <div className="font-mono text-xs font-semibold text-text-primary bg-clay-border-light px-2 py-0.5 rounded inline-block max-w-xs truncate">
                          {log.event_type}
                        </div>
                      </td>

                      {/* Severity */}
                      <td>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-pill text-[11px] font-bold uppercase ${
                            log.severity === 'info'
                              ? 'bg-sky-100 text-sky-800'
                              : log.severity === 'warning'
                              ? 'bg-amber-100 text-amber-800'
                              : log.severity === 'error'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {log.severity}
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-pill text-[11px] font-bold ${
                            isSuccess
                              ? 'bg-emerald-100 text-emerald-800'
                              : isRejected
                              ? 'bg-amber-100 text-amber-800'
                              : isFailure
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>

                      {/* Actor */}
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-clay-sm bg-burnt-brown-pale flex items-center justify-center text-burnt-brown font-bold text-xs flex-shrink-0">
                            {(log.actor?.email || log.actor?.role || 'A').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-text-primary truncate max-w-[140px]">
                                {log.actor?.email || log.actor?.id || 'Anonymous'}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 bg-clay-border-light text-text-tertiary rounded font-semibold uppercase">
                                {log.actor?.role || 'User'}
                              </span>
                            </div>
                            <p className="text-[10px] text-text-tertiary truncate font-mono">
                              {log.actor?.ip_address || '—'} {log.actor?.location ? `(${log.actor.location})` : ''}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Target */}
                      <td>
                        <div className="text-xs">
                          <span className="font-semibold text-text-secondary capitalize">
                            {log.target?.type || 'system'}
                          </span>
                          {log.target?.name && (
                            <p className="text-[11px] text-text-tertiary truncate max-w-[150px]">
                              {log.target.name}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setInspectEvent(log)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-clay-sm bg-clay-border-light hover:bg-mustard hover:text-white transition-colors text-text-secondary"
                          title="Inspect Event JSON"
                        >
                          <File01Icon className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-clay-border">
            <span className="text-xs text-text-tertiary">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 rounded-pill text-xs font-semibold bg-clay-border-light text-text-secondary hover:bg-clay-border disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 rounded-pill text-xs font-semibold bg-clay-border-light text-text-secondary hover:bg-clay-border disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </ClayCard>

      {/* Event Inspector Modal */}
      {inspectEvent && (
        <Modal
          open={Boolean(inspectEvent)}
          onClose={() => setInspectEvent(null)}
          title={`Audit Event: ${inspectEvent.event_id}`}
          size="xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-text-tertiary font-mono">
                ISO Timestamp: {inspectEvent.timestamp}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setInspectEvent(null)}
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={
                    copiedId === inspectEvent.event_id ? (
                      <Tick01Icon className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy01Icon className="w-3.5 h-3.5" />
                    )
                  }
                  onClick={() => handleCopyJson(inspectEvent)}
                >
                  {copiedId === inspectEvent.event_id ? 'Copied JSON!' : 'Copy01Icon Event JSON'}
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Quick Metrics Header */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-clay-border-light/50 border border-clay-border rounded-clay-sm">
                <span className="text-[10px] font-bold text-text-tertiary uppercase">
                  Event Type
                </span>
                <p className="font-mono text-xs font-semibold text-text-primary mt-0.5 truncate">
                  {inspectEvent.event_type}
                </p>
              </div>

              <div className="p-3 bg-clay-border-light/50 border border-clay-border rounded-clay-sm">
                <span className="text-[10px] font-bold text-text-tertiary uppercase">
                  Status & Severity
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs font-bold capitalize text-text-primary">
                    {inspectEvent.status}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-semibold uppercase">
                    {inspectEvent.severity}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-clay-border-light/50 border border-clay-border rounded-clay-sm">
                <span className="text-[10px] font-bold text-text-tertiary uppercase">
                  Actor
                </span>
                <p className="text-xs font-semibold text-text-primary mt-0.5 truncate">
                  {inspectEvent.actor?.email || inspectEvent.actor?.role || 'System'}
                </p>
              </div>

              <div className="p-3 bg-clay-border-light/50 border border-clay-border rounded-clay-sm">
                <span className="text-[10px] font-bold text-text-tertiary uppercase">
                  Target
                </span>
                <p className="text-xs font-semibold text-text-primary mt-0.5 truncate">
                  {inspectEvent.target?.type}
                  {inspectEvent.target?.id ? ` (${inspectEvent.target.id.slice(0, 8)})` : ''}
                </p>
              </div>
            </div>

            {/* Formatted JSON Editor Container */}
            <div className="rounded-clay border border-slate-800 overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 text-slate-300 text-xs font-mono border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <File01Icon className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-200 font-semibold">Audit Event Payload (JSON)</span>
                </div>
                <button
                  onClick={() => handleCopyJson(inspectEvent)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-sans transition-colors border border-slate-700"
                >
                  {copiedId === inspectEvent.event_id ? (
                    <>
                      <Tick01Icon className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy01Icon className="w-3.5 h-3.5" />
                      <span>Copy01Icon JSON</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 bg-slate-950 text-emerald-300 font-mono text-xs overflow-x-auto max-h-[380px] leading-relaxed select-all">
                {JSON.stringify(
                  {
                    event_id: inspectEvent.event_id,
                    timestamp: inspectEvent.timestamp,
                    event_type: inspectEvent.event_type,
                    status: inspectEvent.status,
                    severity: inspectEvent.severity,
                    actor: inspectEvent.actor,
                    target: inspectEvent.target,
                    context: inspectEvent.context,
                    changes: inspectEvent.changes,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        </Modal>
      )}

      <div className="mt-8 text-center pb-6">
        <p className="text-sm font-semibold text-text-tertiary">Sponsored by Waltik Labs</p>
      </div>
    </div>
  );
}