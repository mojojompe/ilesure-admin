import {
  AnalyticsUpIcon,
  AnalyticsDownIcon,
  MinusSignIcon
} from '@hugeicons/react';
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
  accentColor?: string;
}

const gradients: Record<string, string> = {
  brown:   'from-burnt-brown-xpale to-white',
  mustard: 'from-mustard-pale to-white',
  green:   'from-green-50 to-white',
  blue:    'from-blue-50 to-white',
};

export function KpiCard({
  label,
  value,
  trend,
  trendDirection = 'neutral',
  icon,
  iconBg = 'bg-burnt-brown-pale',
  subtitle,
  accentColor = 'brown',
}: KpiCardProps) {
  const TrendIcon = trendDirection === 'up' ? AnalyticsUpIcon : trendDirection === 'down' ? AnalyticsDownIcon : MinusSignIcon;
  const trendColor = trendDirection === 'up' ? 'text-status-success' : trendDirection === 'down' ? 'text-status-error' : 'text-text-tertiary';
  const trendBg = trendDirection === 'up' ? 'bg-status-success/10 border-status-success/20' : trendDirection === 'down' ? 'bg-status-error/10 border-status-error/20' : 'bg-clay-border border-clay-border-dark';
  const gradientClass = gradients[accentColor] ?? gradients['brown'];

  return (
    <div className={clsx(
      'relative bg-gradient-to-br rounded-clay border border-clay-border/60 p-6 overflow-hidden',
      'hover:-translate-y-1 transition-all duration-250 ease-out cursor-default',
      'shadow-kpi hover:shadow-kpi-hover',
      gradientClass,
    )}>
      {/* Subtle top-right shimmer orb */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br from-white/60 to-transparent pointer-events-none" />

      {/* Top row */}
      <div className="flex items-start justify-between mb-5 relative">
        <div className={clsx(
          'w-12 h-12 rounded-[14px] flex items-center justify-center shadow-clay-sm',
          'group-hover:scale-110 transition-transform duration-200',
          iconBg,
        )}>
          {icon}
        </div>

        {trend !== undefined && (
          <div className={clsx(
            'flex items-center gap-1 text-[11px] font-bold rounded-pill px-2.5 py-1 border',
            trendColor, trendBg,
          )}>
            <TrendIcon className="w-3 h-3" />
            {Math.abs(trend)}{typeof trend === 'number' && '%'}
          </div>
        )}
      </div>

      {/* Value */}
      <div className="text-[32px] font-extrabold text-text-primary tracking-tight leading-none mb-1.5">
        {value}
      </div>

      {/* Label */}
      <div className="text-sm font-semibold text-text-secondary">{label}</div>

      {/* Subtitle */}
      {subtitle && (
        <div className="flex items-center gap-1.5 mt-2">
          <div className="w-1.5 h-1.5 rounded-full bg-mustard-light" />
          <div className="text-[11px] text-text-tertiary font-medium">{subtitle}</div>
        </div>
      )}
    </div>
  );
}
