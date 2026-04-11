import {
  Building2, Users, Clock, Wallet, Home, Eye, FileCheck,
  CheckCircle, Layers, ClipboardList, ArrowRight,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend,
} from 'recharts';
import { KpiCard } from '../components/ui/KpiCard';
import { ClayCard } from '../components/ui/ClayCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import {
  mockActivity, mockListings, waitlistTrendData, revenueData,
} from '../data/mockData';
import { Link } from 'react-router-dom';

const formatNaira = (v: number) =>
  v >= 1_000_000 ? `₦${(v / 1_000_000).toFixed(1)}M` : `₦${(v / 1000).toFixed(0)}k`;

const activityIconMap: Record<string, React.ReactNode> = {
  listing:      <Building2 className="w-4 h-4 text-burnt-brown" />,
  verification: <FileCheck className="w-4 h-4 text-mustard" />,
  booking:      <CheckCircle className="w-4 h-4 text-status-success" />,
  user:         <Users className="w-4 h-4 text-status-info" />,
  waitlist:     <ClipboardList className="w-4 h-4 text-burnt-brown-light" />,
};
const activityBgMap: Record<string, string> = {
  listing: 'bg-burnt-brown/10', verification: 'bg-mustard/10',
  booking: 'bg-status-success/10', user: 'bg-status-info/10', waitlist: 'bg-burnt-brown-pale',
};

export function Dashboard() {
  // Quick metric calculations
  const pendingListings = mockListings.filter(l => l.status === 'pending_approval').length;
  const totalRevenue = revenueData.reduce((s, d) => s + d.subscription + d.transaction, 0);

  return (
    <div className="space-y-8 animate-fade-in">

      {/* ── Welcome Banner ─────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-burnt-brown to-burnt-brown-dark rounded-clay p-6 text-white shadow-clay-lg">
        {/* decorative circles */}
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-6 right-20 w-24 h-24 rounded-full bg-mustard-light/10" />
        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-white/60 text-sm font-medium mb-1">Good evening 👋</p>
            <h2 className="text-2xl font-bold tracking-tight">Welcome back, Admin</h2>
            <p className="text-white/60 text-sm mt-1">Here's what's happening on IleSure today.</p>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <div className="text-right">
              <div className="text-white/50 text-xs">Platform Status</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
                <span className="text-sm font-semibold text-white">All systems operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Grid ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <KpiCard
          label="Total Listings"
          value={mockListings.length}
          trend={12}
          trendDirection="up"
          subtitle="2 pending approval"
          iconBg="bg-burnt-brown-pale"
          icon={<Building2 className="w-6 h-6 text-burnt-brown" />}
        />
        <KpiCard
          label="Active Users"
          value="3,890"
          trend={8}
          trendDirection="up"
          subtitle="Students & Agents"
          iconBg="bg-mustard/10"
          icon={<Users className="w-6 h-6 text-mustard" />}
        />
        <KpiCard
          label="Pending Approvals"
          value={pendingListings + 3}
          trend={3}
          trendDirection="down"
          subtitle={`${pendingListings} listings · 3 verifications`}
          iconBg="bg-status-warning/10"
          icon={<Clock className="w-6 h-6 text-mustard" />}
        />
        <KpiCard
          label="Total Revenue"
          value={formatNaira(totalRevenue)}
          trend={21}
          trendDirection="up"
          subtitle="Subscriptions + transactions"
          iconBg="bg-status-success/10"
          icon={<Wallet className="w-6 h-6 text-status-success" />}
        />
      </div>

      {/* ── Charts Row ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Waitlist Trend — takes 2/3 width */}
        <ClayCard className="xl:col-span-2" padding="none">
          <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-clay-border">
            <div>
              <h3 className="font-bold text-text-primary text-base">Waitlist Trend</h3>
              <p className="text-xs text-text-tertiary mt-0.5">Monthly student demand entries</p>
            </div>
            <Link to="/waitlist" className="text-xs font-semibold text-mustard hover:text-burnt-brown flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={waitlistTrendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEntries" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4821A" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#D4821A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F2EDE8" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#A07860' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#A07860' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #E7DCD4', boxShadow: '0 8px 24px rgba(139,69,19,0.10)', fontSize: 12 }}
                  labelStyle={{ fontWeight: 700, color: '#1C0A00' }}
                />
                <Area type="monotone" dataKey="entries" stroke="#D4821A" strokeWidth={2.5} fill="url(#colorEntries)" dot={{ fill: '#D4821A', r: 3 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ClayCard>

        {/* Revenue Breakdown — 1/3 width */}
        <ClayCard padding="none">
          <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-clay-border">
            <div>
              <h3 className="font-bold text-text-primary text-base">Revenue</h3>
              <p className="text-xs text-text-tertiary mt-0.5">Last 8 months</p>
            </div>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueData.slice(-5)} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F2EDE8" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#A07860' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#A07860' }} axisLine={false} tickLine={false} tickFormatter={v => `₦${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #E7DCD4', boxShadow: '0 8px 24px rgba(139,69,19,0.10)', fontSize: 11 }}
                  formatter={(v: number) => [`₦${(v / 1000).toFixed(0)}k`, '']}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Bar dataKey="subscription" name="Subscriptions" fill="#8B4513" radius={[4, 4, 0, 0]} />
                <Bar dataKey="transaction" name="Transactions" fill="#F5A623" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ClayCard>
      </div>

      {/* ── Bottom Row ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Recent Listings — 2/3 */}
        <ClayCard className="xl:col-span-2" padding="none">
          <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-clay-border">
            <h3 className="font-bold text-text-primary text-base">Recent Listings</h3>
            <Link to="/listings" className="text-xs font-semibold text-mustard hover:text-burnt-brown flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-clay-border-light">
            {mockListings.slice(0, 5).map((listing) => (
              <div key={listing.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-mustard-pale transition-colors duration-100">
                {/* Icon */}
                <div className="w-9 h-9 rounded-clay-sm bg-burnt-brown-pale flex items-center justify-center flex-shrink-0 shadow-clay-sm">
                  <Home className="w-4 h-4 text-burnt-brown" />
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">{listing.title}</p>
                  <p className="text-xs text-text-tertiary truncate">{listing.areaCluster} · {listing.agentName}</p>
                </div>
                {/* Price */}
                <div className="text-sm font-bold text-burnt-brown whitespace-nowrap hidden md:block">
                  ₦{(listing.annualRent / 1000).toFixed(0)}k/yr
                </div>
                {/* Status */}
                <StatusBadge status={listing.status as any} showIcon={false} />
              </div>
            ))}
          </div>
        </ClayCard>

        {/* Activity Feed — 1/3 */}
        <ClayCard padding="none">
          <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-clay-border">
            <h3 className="font-bold text-text-primary text-base">Recent Activity</h3>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
              <span className="text-xs text-text-tertiary">Live</span>
            </div>
          </div>
          <div className="p-4 space-y-3 max-h-72 overflow-y-auto">
            {mockActivity.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-clay-sm flex items-center justify-center flex-shrink-0 shadow-clay-sm ${activityBgMap[item.type]}`}>
                  {activityIconMap[item.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-text-primary leading-tight">{item.title}</p>
                  <p className="text-xs text-text-tertiary mt-0.5 leading-tight">{item.description}</p>
                  <p className="text-[10px] text-text-tertiary/70 mt-1">{item.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </ClayCard>
      </div>

      {/* ── Quick Stats Row ────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Waitlist Size',        value: '234',  icon: <ClipboardList className="w-4 h-4 text-mustard" />, bg: 'bg-mustard/10' },
          { label: 'New Users This Week',  value: '48',   icon: <Users className="w-4 h-4 text-burnt-brown" />,     bg: 'bg-burnt-brown-pale' },
          { label: 'Bookings This Month',  value: '31',   icon: <CheckCircle className="w-4 h-4 text-status-success" />, bg: 'bg-status-success/10' },
          { label: 'Active Companies',     value: '12',   icon: <Layers className="w-4 h-4 text-burnt-brown-light" />, bg: 'bg-burnt-brown-pale' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-clay border border-clay-border shadow-clay p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-clay-sm flex items-center justify-center flex-shrink-0 shadow-clay-sm ${stat.bg}`}>
              {stat.icon}
            </div>
            <div>
              <div className="text-xl font-bold text-text-primary">{stat.value}</div>
              <div className="text-[11px] text-text-tertiary leading-tight">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
