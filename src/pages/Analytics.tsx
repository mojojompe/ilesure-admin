import { useState } from 'react';
import { Calendar } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { ClayCard } from '../components/ui/ClayCard';
import {
  waitlistTrendData, corridorDemandData, priceDistributionData,
  bookingTrendData, tierDistributionData, revenueData,
} from '../data/mockData';

type DateRange = '3m' | '6m' | '1y';

const CustomTooltipStyle = {
  borderRadius: 12,
  border: '1px solid #E7DCD4',
  boxShadow: '0 8px 24px rgba(139,69,19,0.10)',
  fontSize: 12,
};

export function Analytics() {
  const [range, setRange] = useState<DateRange>('1y');

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

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Page Header ─────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Demand Intelligence</h2>
          <p className="text-sm text-text-tertiary mt-0.5">Platform performance, demand patterns, and revenue breakdown</p>
        </div>
        {/* Date range toggle */}
        <div className="flex gap-1 p-1 bg-clay-border-light rounded-clay-sm">
          {rangeOptions.map(opt => (
            <button
              key={opt.key}
              onClick={() => setRange(opt.key)}
              className={`px-3 py-1.5 rounded-[10px] text-xs font-semibold transition-all duration-150 ${range === opt.key ? 'bg-burnt-brown text-white shadow-clay-sm' : 'text-text-secondary hover:text-text-primary'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Row 1: Waitlist Trend + Price Distribution ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Waitlist Trend */}
        <ClayCard padding="none">
          <div className="px-6 pt-5 pb-3 border-b border-clay-border">
            <h3 className="font-bold text-text-primary text-base">Waitlist Trend</h3>
            <p className="text-xs text-text-tertiary mt-0.5">New student demand entries over time</p>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={sliceData(waitlistTrendData)} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="wlGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#D4821A" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#D4821A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F2EDE8" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#A07860' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#A07860' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={CustomTooltipStyle} labelStyle={{ fontWeight: 700 }} />
                <Area type="monotone" dataKey="entries" name="Waitlist Entries" stroke="#D4821A" strokeWidth={2.5} fill="url(#wlGrad)" dot={{ fill: '#D4821A', r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ClayCard>

        {/* Price Distribution */}
        <ClayCard padding="none">
          <div className="px-6 pt-5 pb-3 border-b border-clay-border">
            <h3 className="font-bold text-text-primary text-base">Listing Price Distribution</h3>
            <p className="text-xs text-text-tertiary mt-0.5">Frequency of listings by annual rent band</p>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={priceDistributionData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F2EDE8" vertical={false} />
                <XAxis dataKey="range" tick={{ fontSize: 10, fill: '#A07860' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#A07860' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={CustomTooltipStyle} cursor={{ fill: 'rgba(212,130,26,0.06)' }} />
                <Bar dataKey="count" name="Listings" radius={[5, 5, 0, 0]} fill="#8B4513">
                  {priceDistributionData.map((_, i) => (
                    <Cell key={i} fill={i === 2 ? '#F5A623' : i === 1 || i === 3 ? '#D4821A' : '#8B4513'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ClayCard>
      </div>

      {/* ── Row 2: Bookings Trend + Corridor Demand ─────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Booking Trend */}
        <ClayCard padding="none">
          <div className="px-6 pt-5 pb-3 border-b border-clay-border">
            <h3 className="font-bold text-text-primary text-base">Booking Volume</h3>
            <p className="text-xs text-text-tertiary mt-0.5">Monthly confirmed bookings</p>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={sliceData(bookingTrendData)} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="bookGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#8B4513" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#8B4513" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F2EDE8" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#A07860' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#A07860' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={CustomTooltipStyle} labelStyle={{ fontWeight: 700 }} />
                <Line type="monotone" dataKey="bookings" name="Bookings" stroke="#8B4513" strokeWidth={2.5} dot={{ fill: '#8B4513', r: 4, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ClayCard>

        {/* Corridor Demand */}
        <ClayCard padding="none">
          <div className="px-6 pt-5 pb-3 border-b border-clay-border">
            <h3 className="font-bold text-text-primary text-base">Corridor Demand Heatmap</h3>
            <p className="text-xs text-text-tertiary mt-0.5">Waitlist entries by area cluster</p>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={corridorDemandData} layout="vertical" margin={{ top: 4, right: 20, left: 60, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F2EDE8" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#A07860' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="corridor" tick={{ fontSize: 11, fill: '#6B4C3B' }} axisLine={false} tickLine={false} width={60} />
                <Tooltip contentStyle={CustomTooltipStyle} cursor={{ fill: 'rgba(212,130,26,0.06)' }} />
                <Bar dataKey="demand" name="Demand" radius={[0, 5, 5, 0]}>
                  {corridorDemandData.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? '#D4821A' : i === 1 ? '#A0522D' : '#8B4513'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ClayCard>
      </div>

      {/* ── Row 3: Revenue + Tier Distribution ──────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue — 2/3 */}
        <ClayCard padding="none" className="xl:col-span-2">
          <div className="px-6 pt-5 pb-3 border-b border-clay-border">
            <h3 className="font-bold text-text-primary text-base">Revenue Breakdown</h3>
            <p className="text-xs text-text-tertiary mt-0.5">Subscription vs transaction fee income (₦)</p>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={sliceData(revenueData)} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F2EDE8" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#A07860' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#A07860' }} axisLine={false} tickLine={false} tickFormatter={v => `₦${v / 1000}k`} />
                <Tooltip contentStyle={CustomTooltipStyle} formatter={(v: number) => [`₦${(v / 1000).toFixed(0)}k`, '']} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Bar dataKey="subscription" name="Subscriptions" fill="#8B4513" radius={[4, 4, 0, 0]} />
                <Bar dataKey="transaction" name="Transactions"   fill="#F5A623" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ClayCard>

        {/* Tier Distribution Pie — 1/3 */}
        <ClayCard padding="none">
          <div className="px-6 pt-5 pb-3 border-b border-clay-border">
            <h3 className="font-bold text-text-primary text-base">Agent Tier Split</h3>
            <p className="text-xs text-text-tertiary mt-0.5">Distribution across subscription tiers</p>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={tierDistributionData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {tierDistributionData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={CustomTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div className="grid grid-cols-2 gap-1.5 mt-2">
              {tierDistributionData.map(({ name, value, color }) => (
                <div key={name} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                  <span className="text-[11px] text-text-secondary">{name}</span>
                  <span className="text-[11px] font-bold text-text-primary ml-auto">{value}%</span>
                </div>
              ))}
            </div>
          </div>
        </ClayCard>
      </div>

      {/* ── Summary Stats Footer ─────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue (Period)', value: `₦${(revenueData.reduce((s, d) => s + d.subscription + d.transaction, 0) / 1_000_000).toFixed(2)}M` },
          { label: 'Avg. Monthly Bookings',  value: Math.round(bookingTrendData.reduce((s, d) => s + d.bookings, 0) / bookingTrendData.length) },
          { label: 'Highest Demand Area',    value: corridorDemandData[0].corridor },
          { label: 'Most Popular Price Band',value: priceDistributionData.reduce((a, b) => a.count > b.count ? a : b).range },
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
    </div>
  );
}
