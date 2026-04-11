import { clsx } from 'clsx';
import React from 'react';

interface ClayCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function ClayCard({ children, className, hover = false, onClick, padding = 'md' }: ClayCardProps) {
  const paddings = { none: '', sm: 'p-4', md: 'p-6', lg: 'p-8' };
  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-white rounded-clay border border-clay-border shadow-clay',
        hover && 'hover:shadow-clay-hover hover:-translate-y-0.5 transition-all duration-200 ease-out cursor-pointer',
        onClick && 'cursor-pointer',
        paddings[padding],
        className,
      )}
    >
      {children}
    </div>
  );
}
