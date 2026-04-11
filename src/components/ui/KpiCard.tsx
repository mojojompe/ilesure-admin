import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { clsx } from 'clsx';
import React from 'react';

interface KpiCardProps {
  label: string;
  value: string | number;
  trend?: number;
  trendDirection?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  iconBg?: string;
  subtitle?: string;
}

export function KpiCard({ label, value, trend, trendDirection = 'neutral', icon, iconBg = 'bg-burnt-brown-pale', subtitle }: KpiCardProps) {
  const TrendIcon = trendDirection === 'up' ? TrendingUp : trendDirection === 'down' ? TrendingDown : Minus;
  const trendColor = trendDirection === 'up' ? 'text-status-success' : trendDirection === 'down' ? 'text-status-error' : 'text-text-tertiary';

  return (
    <div className="bg-white rounded-clay border border-clay-border shadow-clay p-6 hover:shadow-clay-hover hover:-translate-y-0.5 transition-all duration-200 ease-out group">
      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        {/* 3D Icon container */}
        <div className={clsx(
          'w-12 h-12 rounded-clay-sm flex items-center justify-center shadow-clay-sm',
          'group-hover:scale-110 transition-transform duration-200',
          iconBg,
        )}>
          {icon}
        </div>
        {/* Trend */}
        {trend !== undefined && (
          <div className={clsx('flex items-center gap-1 text-xs font-semibold rounded-pill px-2 py-1', trendColor,
            trendDirection === 'up' ? 'bg-status-success/10' : trendDirection === 'down' ? 'bg-status-error/10' : 'bg-clay-border'
          )}>
            <TrendIcon className="w-3 h-3" />
            {Math.abs(trend)}{typeof trend === 'number' && '%'}
          </div>
        )}
      </div>
      {/* Value */}
      <div className="text-3xl font-bold text-text-primary tracking-tight mb-1">{value}</div>
      {/* Label */}
      <div className="text-sm font-medium text-text-secondary">{label}</div>
      {subtitle && <div className="text-xs text-text-tertiary mt-1">{subtitle}</div>}
    </div>
  );
}
