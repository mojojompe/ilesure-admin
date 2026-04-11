import { clsx } from 'clsx';
import React from 'react';

type Variant = 'primary' | 'secondary' | 'mustard' | 'success' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:   'bg-gradient-to-br from-burnt-brown to-burnt-brown-dark text-white shadow-clay-sm hover:shadow-clay hover:brightness-110 active:scale-95',
  secondary: 'bg-transparent text-burnt-brown border-2 border-burnt-brown hover:bg-burnt-brown-pale active:scale-95',
  mustard:   'bg-gradient-to-br from-mustard-light to-mustard text-white shadow-clay-sm hover:shadow-clay hover:brightness-110 active:scale-95',
  success:   'bg-status-success text-white hover:opacity-90 active:scale-95',
  danger:    'bg-status-error text-white hover:opacity-90 active:scale-95',
  ghost:     'bg-transparent text-burnt-brown hover:bg-burnt-brown-pale active:scale-95',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-4 py-1.5 text-xs gap-1.5',
  md: 'px-6 py-2.5 text-sm gap-2',
  lg: 'px-8 py-3 text-base gap-2.5',
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center font-semibold rounded-pill transition-all duration-150 select-none',
        variantClasses[variant],
        sizeClasses[size],
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
        className,
      )}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon}
      {children}
      {!loading && iconRight}
    </button>
  );
}
