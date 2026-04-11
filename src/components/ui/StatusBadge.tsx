import { clsx } from 'clsx';
import { CheckCircle, Clock, XCircle, AlertCircle, Shield, Star, Award, Crown, Minus } from 'lucide-react';

type StatusType =
  | 'available' | 'active'
  | 'pending_approval' | 'pending'
  | 'needs_roommate'
  | 'fully_booked'
  | 'rejected'
  | 'verified'
  | 'more_info'
  | 'suspended'
  | 'notified'
  | 'matched'
  | 'waiting'
  | 'free' | 'basic' | 'premium' | 'enterprise';

const config: Record<StatusType, { label: string; className: string; icon?: React.ComponentType<{ className?: string }> }> = {
  available:        { label: 'Available',          className: 'bg-status-success/10 text-status-success',    icon: CheckCircle },
  active:           { label: 'Active',             className: 'bg-status-success/10 text-status-success',    icon: CheckCircle },
  pending_approval: { label: 'Pending Approval',   className: 'bg-mustard/15 text-mustard',                  icon: Clock },
  pending:          { label: 'Pending',            className: 'bg-mustard/15 text-mustard',                  icon: Clock },
  needs_roommate:   { label: 'Needs Roommate',     className: 'bg-[#F5A623]/15 text-[#D4821A]',             icon: AlertCircle },
  fully_booked:     { label: 'Fully Booked',       className: 'bg-text-tertiary/10 text-text-tertiary',      icon: Minus },
  rejected:         { label: 'Rejected',           className: 'bg-status-error/10 text-status-error',        icon: XCircle },
  verified:         { label: 'Verified',           className: 'bg-status-success/10 text-status-success',    icon: Shield },
  more_info:        { label: 'Needs More Info',    className: 'bg-mustard/15 text-mustard',                  icon: AlertCircle },
  suspended:        { label: 'Suspended',          className: 'bg-status-error/10 text-status-error',        icon: XCircle },
  notified:         { label: 'Notified',           className: 'bg-status-info/10 text-status-info',          icon: CheckCircle },
  matched:          { label: 'Matched',            className: 'bg-status-success/10 text-status-success',    icon: CheckCircle },
  waiting:          { label: 'Waiting',            className: 'bg-mustard/15 text-mustard',                  icon: Clock },
  free:             { label: 'Free',               className: 'bg-clay-border text-text-secondary',          icon: Minus },
  basic:            { label: 'Basic',              className: 'bg-status-info/10 text-status-info',          icon: Star },
  premium:          { label: 'Premium',            className: 'bg-burnt-brown/10 text-burnt-brown',          icon: Award },
  enterprise:       { label: 'Enterprise',         className: 'bg-mustard/15 text-mustard-light',            icon: Crown },
};

interface StatusBadgeProps {
  status: StatusType;
  showIcon?: boolean;
  className?: string;
}

export function StatusBadge({ status, showIcon = true, className }: StatusBadgeProps) {
  const { label, className: baseClass, icon: Icon } = config[status] || { label: status, className: 'bg-clay-border text-text-secondary' };
  return (
    <span className={clsx('inline-flex items-center gap-1 rounded-pill px-3 py-1 text-xs font-semibold tracking-wide whitespace-nowrap', baseClass, className)}>
      {showIcon && Icon && <Icon className="w-3 h-3" />}
      {label}
    </span>
  );
}
