import React from 'react';
import { clsx } from 'clsx';

interface ClayCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'default' | 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  glass?: boolean;
}

const paddingMap = {
  none:    '',
  sm:      'p-4',
  md:      'p-5',
  default: 'p-6',
  lg:      'p-8',
};

export function ClayCard({
  children,
  className = '',
  padding = 'default',
  hover = false,
  glass = false,
}: ClayCardProps) {
  return (
    <div
      className={clsx(
        'rounded-clay border overflow-hidden transition-all duration-200',
        glass
          ? 'bg-white/80 backdrop-blur-xl border-white/60 shadow-clay'
          : 'bg-white border-clay-border shadow-clay',
        hover && 'hover:shadow-clay-hover hover:-translate-y-0.5 cursor-pointer',
        paddingMap[padding],
        className,
      )}
      style={glass ? undefined : { backgroundImage: 'linear-gradient(160deg, #FFFFFF 0%, #FAF6F3 100%)' }}
    >
      {children}
    </div>
  );
}
