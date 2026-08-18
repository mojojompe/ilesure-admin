import { useState, useEffect } from 'react';
import { ClipboardList, Users, MapPin, Download, Search, MessageSquare, Phone, Mail } from 'lucide-react';
import { ClayCard } from '../components/ui/ClayCard';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { clsx } from 'clsx';
import { adminApi, adminFetchRaw } from '../api/admin';
import toast from 'react-hot-toast';

// SECURITY-FIX (AD-M2): Build a proper CSV string from an array of row objects.
// Escapes quotes/commas/newlines per RFC 4180 so values containing PII (names,
// emails, phones) don't corrupt the file.
function rowsToCsv(rows: any[]): string {
  if (!Array.isArray(rows) || rows.length === 0) return '';
  const headers = Array.from(
    rows.reduce((set: Set<string>, r) => {
      Object.keys(r || {}).forEach((k) => set.add(k));
      return set;
    }, new Set<string>()),
  );
  const escape = (v: any) => {
    if (v === null || v === undefined) return '';
    const s = typeof v === 'object' ? JSON.stringify(v) : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row?.[h])).join(','));
  }
  return lines.join('\r\n');
}

export function WaitlistData() {
  const [search, setSearch] = useState('');
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [corridorDemand, setCorridorDemand] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWaitlist();
  }, []);

  const fetchWaitlist = async () => {
    setLoading(true);
    setError(null);
    try {
      // FIX: the list endpoint defaults to limit=20, so the page only ever received the
      // first 20 rows. This page has no pagination UI — it filters client-side and shows
      // everything it holds — so request the full set instead of a single default page.
      const [waitlistRes, analyticsRes] = await Promise.all([
        adminApi.waitlist.list('?limit=1000'),
        adminApi.analytics.waitlist(),
      ]);

      if (waitlistRes.success && waitlistRes.data?.entries?.length > 0) {
        const formatted = waitlistRes.data.entries.map((e: any) => ({
          id: e._id || e.id,
          fullName: e.fullName,
          email: e.email,
          phone: e.phone,
          university: e.university,
          budgetMin: e.budgetMin || 0,
          budgetMax: e.budgetMax || 0,
          preferredCorridor: e.preferredCorridor || '',
          moveInDate: e.moveInDate || '',
          roommateNeeded: e.roommateNeeded || false,
          contactPreference: e.contactPreference || 'email',
          status: e.status,
          createdAt: e.createdAt ? new Date(e.createdAt).toISOString().split('T')[0] : '',
        }));
        setWaitlist(formatted);
        // FIX: the "Total on Waitlist" tile previously showed waitlist.length, i.e. the size
        // of the page just fetched (always 20), not the real count. The server already
        // reports the true total — use it, and only fall back to what we hold.
        setTotal(
          waitlistRes.data.summary?.total
          ?? waitlistRes.data.pagination?.totalItems
          ?? formatted.length
        );
      }

      if (analyticsRes.success && analyticsRes.data?.corridorDemand?.length > 0) {
        setCorridorDemand(analyticsRes.data.corridorDemand);
      }
    } catch (error) {
      console.error('Failed to fetch waitlist:', error);
      setError('Failed to load waitlist data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    // SECURITY-FIX (AD-M2): The previous version ran the export through the JSON-forcing
    // adminFetch and wrapped the resulting object in a Blob, so the download was a file
    // literally containing "[object Object]", and any error was swallowed. Now we fetch
    // the raw response: if the server returns CSV we stream it through; if it returns
    // JSON rows we build a proper RFC 4180 CSV client-side. Errors are surfaced.
    try {
      const response = await adminFetchRaw('/admin/v1/waitlist/export');
      const contentType = response.headers.get('content-type') || '';

      let csv: string;
      if (contentType.includes('application/json')) {
        const json = await response.json();
        const rows = Array.isArray(json)
          ? json
          : json?.data?.entries || json?.entries || json?.data || [];
        csv = rowsToCsv(rows);
      } else {
        csv = await response.text();
      }

      if (!csv || !csv.trim()) {
        toast.error('No waitlist data available to export');
        return;
      }

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'waitlist.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Failed to export waitlist:', error);
      toast.error(error?.message || 'Failed to export waitlist data');
    }
  };

  const filtered = waitlist.filter(e =>
    e.fullName.toLowerCase().includes(search.toLowerCase()) ||
    e.university?.toLowerCase().includes(search.toLowerCase()) ||
    e.preferredCorridor.toLowerCase().includes(search.toLowerCase())
  );

  const totalBudgetMin = waitlist.reduce((s, e) => s + (e.budgetMin || 0), 0);
  const avgBudget = waitlist.length > 0 ? Math.round(totalBudgetMin / waitlist.length) : 0;
  const needsRoommate = waitlist.filter(e => e.roommateNeeded).length;
  const topCorridor = corridorDemand && corridorDemand.length > 0 ? corridorDemand[0] : { corridor: 'N/A', demand: 0 };

  const channelIcon: Record<string, React.ReactNode> = { whatsapp: <MessageSquare className="w-3.5 h-3.5 text-status-success" />, sms: <Phone className="w-3.5 h-3.5 text-mustard" />, email: <Mail className="w-3.5 h-3.5 text-burnt-brown" /> };

  const getChannelIcon = (channel: string) => channelIcon[channel] || <Mail className="w-3.5 h-3.5 text-burnt-brown" />;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Summary Insights ────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total on Waitlist',   value: total,                   icon: <ClipboardList className="w-5 h-5 text-burnt-brown" />,    bg: 'bg-burnt-brown-pale' },
          { label: 'Need Roommate',        value: needsRoommate,               icon: <Users className="w-5 h-5 text-mustard" />,               bg: 'bg-mustard/10' },
          { label: 'Avg. Min Budget',      value: `₦${(avgBudget / 1000).toFixed(0)}k`, icon: <ClipboardList className="w-5 h-5 text-burnt-brown-light" />, bg: 'bg-burnt-brown-pale' },
          { label: 'Top Corridor',         value: topCorridor.corridor,        icon: <MapPin className="w-5 h-5 text-status-success" />,        bg: 'bg-status-success/10' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-clay border border-clay-border shadow-clay p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-clay-sm flex items-center justify-center shadow-clay-sm flex-shrink-0 ${s.bg}`}>{s.icon}</div>
            <div>
              <div className="text-xl font-bold text-text-primary truncate">{s.value}</div>
              <div className="text-xs text-text-tertiary">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Corridor Demand Chart ────────────────────────── */}
      <ClayCard padding="none">
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-clay-border">
          <div>
            <h3 className="font-bold text-text-primary text-base">Demand by Corridor</h3>
            <p className="text-xs text-text-tertiary mt-0.5">Total waitlist entries per area cluster</p>
          </div>
          <Button variant="secondary" size="sm" icon={<Download className="w-3.5 h-3.5" />} onClick={handleExport}>Export CSV</Button>
        </div>
        <div className="p-6">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={corridorDemand} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F2EDE8" vertical={false} />
              <XAxis dataKey="corridor" tick={{ fontSize: 11, fill: '#A07860' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#A07860' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #E7DCD4', boxShadow: '0 8px 24px rgba(139,69,19,0.10)', fontSize: 12 }}
                cursor={{ fill: 'rgba(212,130,26,0.06)' }}
              />
              <Bar dataKey="demand" name="Demand Entries" fill="#8B4513" radius={[6, 6, 0, 0]}>
                {corridorDemand.map((_, index) => (
                  <rect key={index} fill={index === 0 ? '#D4821A' : '#8B4513'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ClayCard>

      {/* ── Top Demand Insight Cards ─────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Top corridors */}
        <ClayCard padding="md">
          <h4 className="font-bold text-text-primary text-sm mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-mustard" /> Top Requested Corridors
          </h4>
          <div className="space-y-2.5">
            {corridorDemand.slice(0, 4).map((d, i) => (
              <div key={d.corridor} className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-pill bg-burnt-brown text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-medium text-text-primary">{d.corridor}</span>
                    <span className="text-xs font-bold text-burnt-brown">{d.demand}</span>
                  </div>
                  <div className="h-1.5 bg-clay-border-light rounded-pill overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-burnt-brown to-mustard rounded-pill" style={{ width: `${(d.demand / corridorDemand[0].demand) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ClayCard>

        {/* Budget bands */}
        <ClayCard padding="md">
          <h4 className="font-bold text-text-primary text-sm mb-3">Budget Distribution</h4>
          <div className="space-y-2">
            {[
              { label: '< ₦200k',     count: waitlist.filter(e => e.budgetMax < 200000).length },
              { label: '₦200–350k',   count: waitlist.filter(e => e.budgetMin >= 200000 && e.budgetMax <= 350000).length },
              { label: '₦350–500k',   count: waitlist.filter(e => e.budgetMin >= 350000 && e.budgetMax <= 500000).length },
              { label: '> ₦500k',     count: waitlist.filter(e => e.budgetMin > 500000).length },
            ].map(({ label, count }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-xs text-text-secondary">{label}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-clay-border-light rounded-pill overflow-hidden">
                    <div className="h-full bg-mustard rounded-pill" style={{ width: `${(count / waitlist.length) * 100}%` }} />
                  </div>
                  <span className="text-xs font-bold text-text-primary w-4 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </ClayCard>

        {/* Contact preferences */}
        <ClayCard padding="md">
          <h4 className="font-bold text-text-primary text-sm mb-3">Preferred Contact</h4>
          <div className="space-y-3">
            {(['whatsapp', 'email', 'sms'] as const).map(ch => {
              const count = waitlist.filter(e => e.contactPreference === ch).length;
              const pct = waitlist.length > 0 ? Math.round((count / waitlist.length) * 100) : 0;
              return (
                <div key={ch} className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-clay-sm bg-clay-border-light flex items-center justify-center flex-shrink-0">
                    {channelIcon[ch]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-medium text-text-primary capitalize">{ch === 'whatsapp' ? 'WhatsApp' : ch === 'sms' ? 'SMS' : ch}</span>
                      <span className="text-xs font-bold text-burnt-brown">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-clay-border-light rounded-pill overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-burnt-brown to-mustard rounded-pill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ClayCard>
      </div>

      {/* ── Waitlist Table ───────────────────────────────── */}
      <ClayCard padding="none">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-clay-border">
          <h3 className="font-bold text-text-primary text-sm">All Waitlist Entries</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="pl-8 pr-4 py-1.5 bg-clay-border-light border border-clay-border rounded-pill text-xs placeholder:text-text-tertiary outline-none focus:border-mustard focus:ring-2 focus:ring-mustard/20 transition-all w-48"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full clay-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>University</th>
                <th>Budget Range</th>
                <th>Corridors</th>
                <th>Move-in</th>
                <th>Roommate</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(entry => (
                <tr key={entry.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-pill bg-mustard/15 flex items-center justify-center text-mustard text-xs font-bold flex-shrink-0">
                        {entry.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{entry.fullName}</p>
                        <p className="text-[11px] text-text-tertiary">{entry.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td><span className="text-sm text-text-secondary truncate max-w-[140px] block">{entry.university}</span></td>
                  <td><span className="text-sm text-burnt-brown font-semibold">₦{(entry.budgetMin / 1000).toFixed(0)}k–{(entry.budgetMax / 1000).toFixed(0)}k</span></td>
                  <td>
                    <span className="text-[10px] bg-burnt-brown-pale text-burnt-brown px-2 py-0.5 rounded-pill font-semibold">{entry.preferredCorridor}</span>
                  </td>
                  <td><span className="text-xs text-text-secondary">{entry.moveInDate}</span></td>
                  <td>
                    <span className={clsx('text-xs font-semibold rounded-pill px-2 py-0.5', entry.roommateNeeded ? 'bg-mustard/10 text-mustard' : 'bg-clay-border text-text-tertiary')}>
                      {entry.roommateNeeded ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1 text-xs text-text-secondary">
                      {getChannelIcon(entry.contactPreference)}
                      <span className="capitalize">{entry.contactPreference === 'whatsapp' ? 'WhatsApp' : entry.contactPreference === 'sms' ? 'SMS' : entry.contactPreference}</span>
                    </div>
                  </td>
                  <td><StatusBadge status={entry.status as any} /></td>
                  <td><span className="text-xs text-text-tertiary">{entry.createdAt}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-t border-clay-border bg-off-white rounded-b-clay">
          <p className="text-xs text-text-tertiary">Showing {filtered.length} of {waitlist.length} entries</p>
          <Button variant="secondary" size="sm" icon={<Download className="w-3.5 h-3.5" />} onClick={handleExport}>Export All to CSV</Button>
        </div>
      </ClayCard>
    </div>
  );
}
