import { useState, useEffect } from 'react';
import {
  Building04Icon,
  UserMultipleIcon,
  Time02Icon,
  Wallet02Icon,
  Home01Icon,
  Task01Icon,
  Tick01Icon,
  Layers01Icon,
  ClipboardIcon,
  ArrowRight01Icon,
  Alert01Icon,
  SparklesIcon,
  AnalyticsUpIcon
} from '@hugeicons/react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend,
} from 'recharts';
import { KpiCard } from '../components/ui/KpiCard';
import { ClayCard } from '../components/ui/ClayCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Link } from 'react-router-dom';
import { adminApi } from '../api/admin';

const formatNaira = (v: number) =>
  v >= 1_000_000 ? `₦${(v / 1_000_000).toFixed(1)}M` : `₦${(v / 1000).toFixed(0)}k`;

function formatAnnualRent(value: number | undefined | null): string {
  const n = Number(value);
  if (value === undefined || value === null || Number.isNaN(n) || n === 0) return '—';
  return `₦${(n / 1000).toFixed(0)}k/yr`;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function Dashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [recentListings, setRecentListings] = useState<any[]>([]);
  const [waitlistTrend, setWaitlistTrend] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const res = await adminApi.activity.list('?limit=5');
      if (res.success && res.data?.activities) setActivities(res.data.activities);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const dashboardRes = await adminApi.analytics.dashboard();
      if (dashboardRes.success && dashboardRes.data) {
        setDashboardData(dashboardRes.data);
        setRecentListings(dashboardRes.data.recentListings || []);
        setWaitlistTrend(dashboardRes.data.waitlistTrend || []);
        setRevenue(dashboardRes.data.revenue || []);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickStats = dashboardData?.quickStats;
  const kpis = dashboardData?.kpis;

  const CHART_TOOLTIP_STYLE = {
    borderRadius: 14,
    border: '1px solid #E7DCD4',
    boxShadow: '0 12px 32px rgba(107,58,31,0.12)',
    fontSize: 12,
    fontFamily: '"Plus Jakarta Sans", sans-serif',
  };

  return (
    <div className="space-y-7 animate-fade-in">

      {/* ── Welcome Banner ─────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-[24px] p-7 text-white"
        style={{ background: 'linear-gradient(135deg, #5C2E0F 0%, #7D4525 45%, #9B5B35 100%)' }}>

        {/* Dot-grid texture */}
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />

        {/* Floating orbs */}
        <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full opacity-10 orb pointer-events-none"
          style={{ background: 'radial-gradient(circle, #E8941E 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-1/3 w-36 h-36 rounded-full opacity-8 orb orb-delay pointer-events-none"
          style={{ background: 'radial-gradient(circle, #C97B1C 0%, transparent 70%)' }} />

        <div className="flex items-center justify-between relative z-10 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <SparklesIcon className="w-4 h-4 text-mustard-light" />
              <p className="text-white/60 text-sm font-medium">{getGreeting()}</p>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">Welcome back, Admin 👋</h2>
            <p className="text-white/50 text-sm mt-1.5">Here's what's happening on iléSure today.</p>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {/* Quick action links */}
            <Link to="/verification"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/18 border border-white/12
                text-white/80 hover:text-white text-sm font-semibold transition-all duration-150">
              <Task01Icon className="w-4 h-4" />
              Review Queue
            </Link>
            <div className="text-right">
              <div className="text-white/40 text-[11px] font-semibold uppercase tracking-widest">Platform Status</div>
              <div className="flex items-center gap-1.5 mt-0.5 justify-end">
                <span className="w-2 h-2 rounded-full bg-status-success animate-pulse-dot" />
                <span className="text-sm font-bold text-white">All systems live</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Grid ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          label="Total Listings"
          value={loading ? '—' : (kpis?.totalListings ?? 0)}
          trend={kpis?.trends?.listings ?? 0}
          trendDirection={kpis?.trends?.listings >= 0 ? 'up' : 'down'}
          subtitle={`${kpis?.pendingApprovals ?? 0} pending approval`}
          iconBg="bg-burnt-brown-pale"
          accentColor="brown"
          icon={<Building04Icon className="w-6 h-6 text-burnt-brown" />}
        />
        <KpiCard
          label="Active UserMultipleIcon"
          value={loading ? '—' : (kpis?.activeUsers ?? 0)}
          trend={kpis?.trends?.users ?? 0}
          trendDirection={kpis?.trends?.users >= 0 ? 'up' : 'down'}
          subtitle="All roles · active status"
          iconBg="bg-mustard/10"
          accentColor="mustard"
          icon={<UserMultipleIcon className="w-6 h-6 text-mustard" />}
        />
        <KpiCard
          label="Pending Approvals"
          value={loading ? '—' : (kpis?.pendingApprovals ?? 0)}
          trendDirection="neutral"
          subtitle="Awaiting review"
          iconBg="bg-status-warning/10"
          accentColor="mustard"
          icon={<Time02Icon className="w-6 h-6 text-mustard" />}
        />
        <KpiCard
          label="Total Revenue"
          value={loading ? '—' : formatNaira(kpis?.totalRevenue ?? 0)}
          trendDirection="neutral"
          subtitle="Subscriptions + bookings"
          iconBg="bg-status-success/10"
          accentColor="green"
          icon={<Wallet02Icon className="w-6 h-6 text-status-success" />}
        />
      </div>

      {/* ── Charts Row ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Waitlist Trend, 2/3 */}
        <ClayCard className="xl:col-span-2" padding="none">
          <div className="section-header">
            <div>
              <h3 className="font-bold text-text-primary text-base">Waitlist Trend</h3>
              <p className="text-[12px] text-text-tertiary mt-0.5">Monthly student demand entries</p>
            </div>
            <Link to="/waitlist"
              className="flex items-center gap-1 text-[12px] font-bold text-mustard hover:text-burnt-brown transition-colors">
              View all <ArrowRight01Icon className="w-3.5 h-3.5" />
            </Link>
          </div>
          {waitlistTrend.length > 0 ? (
            <div className="p-6">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={waitlistTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEntries" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C97B1C" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#C97B1C" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F2EDE8" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#A07860' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#A07860' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} labelStyle={{ fontWeight: 700, color: '#1C0A00' }} />
                  <Area type="monotone" dataKey="entries" stroke="#C97B1C" strokeWidth={2.5}
                    fill="url(#colorEntries)" dot={{ fill: '#C97B1C', r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5, strokeWidth: 2, stroke: '#FFFFFF' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-14 h-14 rounded-[18px] bg-burnt-brown-pale flex items-center justify-center mb-3">
                <ClipboardIcon className="w-7 h-7 text-burnt-brown-light" />
              </div>
              <p className="text-sm font-semibold text-text-secondary">No waitlist data yet</p>
              <p className="text-xs text-text-tertiary mt-1">Data will appear once students join</p>
            </div>
          )}
        </ClayCard>

        {/* Revenue Breakdown, 1/3 */}
        <ClayCard padding="none">
          <div className="section-header">
            <div>
              <h3 className="font-bold text-text-primary text-base">Revenue</h3>
              <p className="text-[12px] text-text-tertiary mt-0.5">Last 5 months</p>
            </div>
            <Link to="/payments"
              className="flex items-center gap-1 text-[12px] font-bold text-mustard hover:text-burnt-brown transition-colors">
              Details <ArrowRight01Icon className="w-3.5 h-3.5" />
            </Link>
          </div>
          {revenue.length > 0 ? (
            <div className="p-6">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={revenue.slice(-5)} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F2EDE8" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#A07860' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#A07860' }} axisLine={false} tickLine={false}
                    tickFormatter={v => `₦${v / 1000}k`} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE}
                    formatter={(v: number) => [`₦${(v / 1000).toFixed(0)}k`, '']} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  <Bar dataKey="subscription" name="Subscriptions" fill="#6B3A1F" radius={[5, 5, 0, 0]} />
                  <Bar dataKey="transaction" name="Transactions" fill="#E8941E" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-14 h-14 rounded-[18px] bg-mustard-pale flex items-center justify-center mb-3">
                <Wallet02Icon className="w-7 h-7 text-mustard" />
              </div>
              <p className="text-sm font-semibold text-text-secondary">No revenue data yet</p>
            </div>
          )}
        </ClayCard>
      </div>

      {/* ── Bottom Row ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Recent Listings, 2/3 */}
        <ClayCard className="xl:col-span-2" padding="none">
          <div className="section-header">
            <h3 className="font-bold text-text-primary text-base">Recent Listings</h3>
            <Link to="/listings"
              className="flex items-center gap-1 text-[12px] font-bold text-mustard hover:text-burnt-brown transition-colors">
              View all <ArrowRight01Icon className="w-3.5 h-3.5" />
            </Link>
          </div>
          {recentListings.length > 0 ? (
            <div className="divide-y divide-clay-border-light">
              {recentListings.map((listing: any) => (
                <div key={listing.id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-mustard-pale transition-colors duration-100 group">
                  <div className="w-10 h-10 rounded-[12px] bg-burnt-brown-pale flex items-center justify-center flex-shrink-0 shadow-clay-sm
                    group-hover:bg-burnt-brown-pale group-hover:scale-105 transition-transform duration-150">
                    <Home01Icon className="w-5 h-5 text-burnt-brown" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text-primary truncate">{listing.title}</p>
                    <p className="text-[12px] text-text-tertiary truncate mt-0.5">{listing.areaCluster} · {listing.agentName}</p>
                  </div>
                  <div className="text-sm font-bold text-burnt-brown whitespace-nowrap hidden md:block">
                    {formatAnnualRent(listing.annualRent ?? listing.rentAnnual)}
                  </div>
                  <StatusBadge status={listing.status as any} showIcon={false} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-14 h-14 rounded-[18px] bg-burnt-brown-pale flex items-center justify-center mb-3">
                <Home01Icon className="w-7 h-7 text-burnt-brown-light" />
              </div>
              <p className="text-sm font-semibold text-text-secondary">No listings yet</p>
            </div>
          )}
        </ClayCard>

        {/* Activity Feed, 1/3 */}
        <ClayCard padding="none">
          <div className="section-header">
            <h3 className="font-bold text-text-primary text-base">Recent Activity</h3>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-status-success/10 border border-status-success/20">
              <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse-dot" />
              <span className="text-[11px] font-semibold text-status-success">Live</span>
            </div>
          </div>
          {activities.length > 0 ? (
            <div className="divide-y divide-clay-border-light max-h-[320px] overflow-y-auto">
              {activities.map((act: any) => (
                <div key={act.id} className="px-6 py-4 hover:bg-mustard-pale transition-colors duration-100">
                  <p className="text-sm text-text-primary leading-relaxed">{act.description}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-[11px] font-semibold text-text-tertiary">{act.user}</p>
                    <p className="text-[10px] text-text-tertiary">{new Date(act.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-14 h-14 rounded-[18px] bg-clay-border-light flex items-center justify-center mb-3">
                <Alert01Icon className="w-7 h-7 text-text-tertiary" />
              </div>
              <p className="text-sm font-semibold text-text-secondary">No recent activity</p>
            </div>
          )}
        </ClayCard>
      </div>

      {/* ── Quick Stats Strip ───────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Waitlist Size', value: quickStats?.waitlistSize ?? 0, icon: <ClipboardIcon className="w-5 h-5 text-mustard" />, bg: 'bg-mustard/10', trend: <AnalyticsUpIcon className="w-3 h-3 text-mustard" /> },
          { label: 'New UserMultipleIcon This Week', value: quickStats?.newUsersThisWeek ?? 0, icon: <UserMultipleIcon className="w-5 h-5 text-burnt-brown" />, bg: 'bg-burnt-brown-pale', trend: <AnalyticsUpIcon className="w-3 h-3 text-status-success" /> },
          { label: 'Bookings This Month', value: quickStats?.bookingsThisMonth ?? 0, icon: <Tick01Icon className="w-5 h-5 text-status-success" />, bg: 'bg-status-success/10', trend: null },
          { label: 'Active Companies', value: quickStats?.activeCompanies ?? 0, icon: <Layers01Icon className="w-5 h-5 text-burnt-brown-light" />, bg: 'bg-burnt-brown-pale', trend: null },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-clay border border-clay-border shadow-clay p-5 flex items-center gap-3.5 hover:shadow-clay-hover hover:-translate-y-0.5 transition-all duration-200">
            <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0 shadow-clay-sm ${stat.bg}`}>
              {stat.icon}
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <div className="text-2xl font-extrabold text-text-primary">{loading ? '—' : stat.value}</div>
                {stat.trend}
              </div>
              <div className="text-[11px] text-text-tertiary font-medium leading-tight mt-0.5">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
