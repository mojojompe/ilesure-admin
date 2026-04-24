import { useState, useEffect } from 'react';
import {
  Building2, Users, Clock, Wallet, Home, FileCheck,
  CheckCircle, Layers, ClipboardList, ArrowRight, AlertCircle,
} from 'lucide-react';
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

export function Dashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [recentListings, setRecentListings] = useState<any[]>([]);
  const [waitlistTrend, setWaitlistTrend] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
  const pendingListings = kpis?.pendingApprovals ?? 0;

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
            <p className="text-white/60 text-sm mt-1">Here's what's happening on iléSure today.</p>
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
          value={kpis?.totalListings ?? 0}
          trend={kpis?.trends?.listings ?? 0}
          trendDirection={kpis?.trends?.listings >= 0 ? 'up' : 'down'}
          subtitle={`${kpis?.pendingApprovals ?? 0} pending approval`}
          iconBg="bg-burnt-brown-pale"
          icon={<Building2 className="w-6 h-6 text-burnt-brown" />}
        />
        <KpiCard
          label="Active Users"
          value={kpis?.activeUsers ?? 0}
          trend={kpis?.trends?.users ?? 0}
          trendDirection={kpis?.trends?.users >= 0 ? 'up' : 'down'}
          subtitle="Students & Agents"
          iconBg="bg-mustard/10"
          icon={<Users className="w-6 h-6 text-mustard" />}
        />
        <KpiCard
          label="Pending Approvals"
          value={kpis?.pendingApprovals ?? 0}
          trend={0}
          trendDirection="neutral"
          subtitle={`${kpis?.pendingApprovals ?? 0} listings`}
          iconBg="bg-status-warning/10"
          icon={<Clock className="w-6 h-6 text-mustard" />}
        />
        <KpiCard
          label="Total Revenue"
          value={formatNaira(kpis?.totalRevenue ?? 0)}
          trend={0}
          trendDirection="neutral"
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
          {waitlistTrend.length > 0 ? (
            <div className="p-6">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={waitlistTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
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
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <ClipboardList className="w-10 h-10 text-text-tertiary mb-3" />
              <p className="text-sm text-text-tertiary">No waitlist data yet</p>
            </div>
          )}
        </ClayCard>

        {/* Revenue Breakdown — 1/3 width */}
        <ClayCard padding="none">
          <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-clay-border">
            <div>
              <h3 className="font-bold text-text-primary text-base">Revenue</h3>
              <p className="text-xs text-text-tertiary mt-0.5">Last 8 months</p>
            </div>
          </div>
          {revenue.length > 0 ? (
            <div className="p-6">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={revenue.slice(-5)} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
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
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <Wallet className="w-10 h-10 text-text-tertiary mb-3" />
              <p className="text-sm text-text-tertiary">No revenue data yet</p>
            </div>
          )}
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
          {recentListings.length > 0 ? (
            <div className="divide-y divide-clay-border-light">
              {recentListings.map((listing: any) => (
                <div key={listing.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-mustard-pale transition-colors duration-100">
                  <div className="w-9 h-9 rounded-clay-sm bg-burnt-brown-pale flex items-center justify-center flex-shrink-0 shadow-clay-sm">
                    <Home className="w-4 h-4 text-burnt-brown" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">{listing.title}</p>
                    <p className="text-xs text-text-tertiary truncate">{listing.areaCluster} · {listing.agentName}</p>
                  </div>
                  <div className="text-sm font-bold text-burnt-brown whitespace-nowrap hidden md:block">
                    ₦{((listing.annualRent || listing.rentAnnual) / 1000).toFixed(0)}k/yr
                  </div>
                  <StatusBadge status={listing.status as any} showIcon={false} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <Home className="w-10 h-10 text-text-tertiary mb-3" />
              <p className="text-sm text-text-tertiary">No listings yet</p>
            </div>
          )}
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
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <AlertCircle className="w-10 h-10 text-text-tertiary mb-3" />
            <p className="text-sm text-text-tertiary">No recent activity</p>
          </div>
        </ClayCard>
      </div>

      {/* ── Quick Stats Row ────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Waitlist Size', value: quickStats?.waitlistSize ?? 0, icon: <ClipboardList className="w-4 h-4 text-mustard" />, bg: 'bg-mustard/10' },
          { label: 'New Users This Week', value: quickStats?.newUsersThisWeek ?? 0, icon: <Users className="w-4 h-4 text-burnt-brown" />, bg: 'bg-burnt-brown-pale' },
          { label: 'Bookings This Month', value: quickStats?.bookingsThisMonth ?? 0, icon: <CheckCircle className="w-4 h-4 text-status-success" />, bg: 'bg-status-success/10' },
          { label: 'Active Companies', value: quickStats?.activeCompanies ?? 0, icon: <Layers className="w-4 h-4 text-burnt-brown-light" />, bg: 'bg-burnt-brown-pale' },
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
