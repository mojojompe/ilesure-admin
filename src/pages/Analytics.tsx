import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { ClayCard } from '../components/ui/ClayCard';
import { adminApi } from '../api/admin';

type DateRange = '3m' | '6m' | '1y';

export function Analytics() {
  const [range, setRange] = useState<DateRange>('1y');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [waitlistTrend, setWaitlistTrend] = useState<any[]>([]);
  const [priceDist, setPriceDist] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<any[]>([]);
  const [tiers, setTiers] = useState<any[]>([]);
  const [corridorDemand, setCorridorDemand] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [waitlistRes, listingsRes, bookingsRes, revenueRes, tiersRes] = await Promise.all([
        adminApi.analytics.waitlist(),
        adminApi.analytics.listings(),
        adminApi.analytics.bookings(),
        adminApi.analytics.revenue(),
        adminApi.analytics.tiers(),
      ]);
      
      if (waitlistRes.success && waitlistRes.data?.trend?.length > 0) {
        setWaitlistTrend(waitlistRes.data.trend);
        setCorridorDemand(waitlistRes.data.corridorDemand || []);
      }
      if (listingsRes.success && listingsRes.data?.priceDistribution?.length > 0) {
        setPriceDist(listingsRes.data.priceDistribution);
      }
      if (bookingsRes.success && bookingsRes.data?.trend?.length > 0) {
        setBookings(bookingsRes.data.trend);
      }
      if (revenueRes.success && revenueRes.data?.revenue?.length > 0) {
        setRevenue(revenueRes.data.revenue);
      }
      if (tiersRes.success && tiersRes.data?.tierDistribution?.length > 0) {
        setTiers(tiersRes.data.tierDistribution);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const rangeOptions: { key: DateRange; label: string }[] = [
    { key: '3m', label: '3 Months' },
    { key: '6m', label: '6 Months' },
    { key: '1y', label: '1 Year' },
  ];

  const sliceData = {
    '3m': (d: any[]) => d.slice(-3),
    '6m': (d: any[]) => d.slice(-6),
    '1y': (d: any[]) => d,
  }[range];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-mustard border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-status-error">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Page Header ─────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Demand Intelligence</h2>
          <p className="text-sm text-text-tertiary mt-0.5">Platform performance, demand patterns, and revenue breakdown</p>
        </div>
        <div className="flex gap-1 p-1 bg-clay-border-light rounded-clay-sm">
          {rangeOptions.map(opt => (
            <button
              key={opt.key}
              onClick={() => setRange(opt.key)}
              className={`px-3 py-1.5 rounded-[10px] text-xs font-semibold transition-all ${range === opt.key ? 'bg-burnt-brown text-white shadow-clay-sm' : 'text-text-secondary hover:text-text-primary'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPIs Row ───────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue (Period)', value: `₦${(revenue.reduce((s: number, d: any) => s + (d.subscription || 0) + (d.transaction || 0), 0) / 1_000_000).toFixed(2)}M` },
          { label: 'Avg. Monthly Bookings', value: bookings.length > 0 ? Math.round(bookings.reduce((s: number, d: any) => s + d.bookings, 0) / bookings.length) : 0 },
          { label: 'Highest Demand Area', value: corridorDemand[0]?.corridor || 'N/A' },
          { label: 'Most Popular Price Band', value: priceDist.length > 0 ? priceDist.reduce((a: any, b: any) => a.count > b.count ? a : b).range : 'N/A' },
        ].map(({ label, value }) => (
          <ClayCard key={label} padding="md">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-mustard flex-shrink-0" />
              <p className="text-[10px] text-text-tertiary font-semibold uppercase tracking-wide">{label}</p>
            </div>
            <p className="text-xl font-bold text-text-primary">{value}</p>
          </ClayCard>
        ))}
      </div>

      {/* ── Row 1: Waitlist Trend + Price Distribution ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <ClayCard className="xl:col-span-2">
          <h3 className="font-bold text-text-primary text-base mb-4">Waitlist Trend</h3>
          {waitlistTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={sliceData(waitlistTrend)} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEntries" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4821A" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#D4821A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F2EDE8" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#A07860' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#A07860' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E7DCD4', boxShadow: '0 8px 24px rgba(139,69,19,0.10)', fontSize: 12 }} />
                <Area type="monotone" dataKey="entries" stroke="#D4821A" strokeWidth={2.5} fill="url(#colorEntries)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-text-tertiary">No waitlist data</div>
          )}
        </ClayCard>

        <ClayCard>
          <h3 className="font-bold text-text-primary text-base mb-4">Listing Price Distribution</h3>
          {priceDist.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={sliceData(priceDist)} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F2EDE8" vertical={false} />
                <XAxis dataKey="range" tick={{ fontSize: 10, fill: '#A07860' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#A07860' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E7DCD4', fontSize: 11 }} />
                <Bar dataKey="count" fill="#8B4513" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-text-tertiary">No price data</div>
          )}
        </ClayCard>
      </div>

      {/* ── Row 2: Bookings + Corridor ────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <ClayCard className="xl:col-span-2">
          <h3 className="font-bold text-text-primary text-base mb-4">Booking Volume</h3>
          {bookings.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={sliceData(bookings)} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F2EDE8" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#A07860' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#A07860' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E7DCD4', fontSize: 12 }} />
                <Bar dataKey="bookings" fill="#D4821A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-text-tertiary">No booking data</div>
          )}
        </ClayCard>

        <ClayCard>
          <h3 className="font-bold text-text-primary text-base mb-4">Corridor Demand</h3>
          {corridorDemand.length > 0 ? (
            <div className="space-y-2">
              {corridorDemand.slice(0, 6).map((entry: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary">{entry.corridor}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-mustard/20 rounded-full overflow-hidden">
                      <div className="h-full bg-mustard rounded-full" style={{ width: `${(entry.demand / corridorDemand[0].demand) * 100}%` }} />
                    </div>
                    <span className="text-xs font-bold text-text-primary w-6 text-right">{entry.demand}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-text-tertiary">No corridor data</div>
          )}
        </ClayCard>
      </div>

      {/* ── Row 3: Revenue + Tier Distribution ─────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <ClayCard className="xl:col-span-2">
          <h3 className="font-bold text-text-primary text-base mb-4">Revenue Breakdown</h3>
          {revenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={sliceData(revenue)} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F2EDE8" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#A07860' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#A07860' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `₦${v / 1000}k`} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E7DCD4', fontSize: 11 }} formatter={(v: number) => [`₦${(v / 1000).toFixed(0)}k`, '']} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Bar dataKey="subscription" name="Subscriptions" fill="#8B4513" radius={[4, 4, 0, 0]} />
                <Bar dataKey="transaction" name="Transactions" fill="#F5A623" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-text-tertiary">No revenue data</div>
          )}
        </ClayCard>

        <ClayCard>
          <h3 className="font-bold text-text-primary text-base mb-4">Agent Tier Split</h3>
          {tiers.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={tiers} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {tiers.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#8B4513'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E7DCD4', fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-text-tertiary">No tier data</div>
          )}
        </ClayCard>
      </div>

    </div>
  );
}