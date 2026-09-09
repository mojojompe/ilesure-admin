import { clsx } from 'clsx';
import {
  Tick01Icon,
  Time02Icon,
  CancelCircleIcon,
  Alert01Icon,
  SecurityCheckIcon,
  StarIcon,
  Award01Icon,
  CrownIcon,
  MinusSignIcon
} from '@hugeicons/react';

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
  | 'cancelled' | 'completed' | 'confirmed' | 'refunded' | 'expired' | 'processed' | 'failed'| 'hidden' | 'inactive'
  // BUGFIX (QA-ADM-039 / QA-ADM-040): these are real values the API returns and they had
  // no entry here, so Listings showed a raw unstyled "archived" beside styled badges, and
  // Payments/Bookings did the same for "abandoned", "disputed" and "unpaid".
  | 'archived' | 'abandoned' | 'disputed' | 'unpaid' | 'paid' | 'draft'
  | 'free' | 'basic' | 'premium' | 'enterprise';

const config: Record<StatusType, { label: string; className: string; icon?: React.ComponentType<{ className?: string }> }> = {
  available:        { label: 'Available',          className: 'bg-status-success/10 text-status-success',    icon: Tick01Icon },
  active:           { label: 'Active',             className: 'bg-status-success/10 text-status-success',    icon: Tick01Icon },
  pending_approval: { label: 'Pending Approval',   className: 'bg-mustard/15 text-mustard',                  icon: Time02Icon },
  pending:          { label: 'Pending',            className: 'bg-mustard/15 text-mustard',                  icon: Time02Icon },
  needs_roommate:   { label: 'Needs Roommate',     className: 'bg-[#F5A623]/15 text-[#D4821A]',             icon: Alert01Icon },
  fully_booked:     { label: 'Fully Booked',       className: 'bg-text-tertiary/10 text-text-tertiary',      icon: MinusSignIcon },
  rejected:         { label: 'Rejected',           className: 'bg-status-error/10 text-status-error',        icon: CancelCircleIcon },
  verified:         { label: 'Verified',           className: 'bg-status-success/10 text-status-success',    icon: SecurityCheckIcon },
  more_info:        { label: 'Needs More Info',    className: 'bg-mustard/15 text-mustard',                  icon: Alert01Icon },
  suspended:        { label: 'Suspended',          className: 'bg-status-error/10 text-status-error',        icon: CancelCircleIcon },
  notified:         { label: 'Notified',           className: 'bg-status-info/10 text-status-info',          icon: Tick01Icon },
  matched:          { label: 'Matched',            className: 'bg-status-success/10 text-status-success',    icon: Tick01Icon },
  waiting:          { label: 'Waiting',            className: 'bg-mustard/15 text-mustard',                  icon: Time02Icon },
  cancelled:        { label: 'Cancelled',          className: 'bg-status-error/10 text-status-error',        icon: CancelCircleIcon },
  completed:        { label: 'Completed',          className: 'bg-status-success/10 text-status-success',    icon: Tick01Icon },
  confirmed:        { label: 'Confirmed',          className: 'bg-status-info/10 text-status-info',          icon: Tick01Icon },
  refunded:         { label: 'Refunded',           className: 'bg-purple-500/10 text-purple-600',            icon: CancelCircleIcon },
  expired:          { label: 'Expired',            className: 'bg-text-tertiary/10 text-text-tertiary',      icon: Time02Icon },
  processed:        { label: 'Processed',          className: 'bg-status-success/10 text-status-success',    icon: Tick01Icon },
  failed:           { label: 'Failed',             className: 'bg-status-error/10 text-status-error',        icon: CancelCircleIcon },
  hidden:           { label: 'Hidden',             className: 'bg-text-tertiary/10 text-text-tertiary',      icon: MinusSignIcon },
  inactive:         { label: 'Inactive',           className: 'bg-text-tertiary/10 text-text-tertiary',      icon: CancelCircleIcon },
  free:             { label: 'Free',               className: 'bg-clay-border text-text-secondary',          icon: MinusSignIcon },
  basic:            { label: 'Basic',              className: 'bg-status-info/10 text-status-info',          icon: StarIcon },
  premium:          { label: 'Premium',            className: 'bg-burnt-brown/10 text-burnt-brown',          icon: Award01Icon },
  enterprise:       { label: 'Enterprise',         className: 'bg-mustard/15 text-mustard-light',            icon: CrownIcon },
  archived:         { label: 'Archived',           className: 'bg-text-tertiary/10 text-text-tertiary',      icon: MinusSignIcon },
  abandoned:        { label: 'Abandoned',          className: 'bg-text-tertiary/10 text-text-tertiary',      icon: MinusSignIcon },
  disputed:         { label: 'Disputed',           className: 'bg-status-error/10 text-status-error',        icon: Alert01Icon },
  unpaid:           { label: 'Unpaid',             className: 'bg-mustard/15 text-mustard',                  icon: Time02Icon },
  paid:             { label: 'Paid',               className: 'bg-status-success/10 text-status-success',    icon: Tick01Icon },
  draft:            { label: 'Draft',              className: 'bg-clay-border text-text-secondary',          icon: MinusSignIcon },
};

/**
 * BUGFIX (QA-ADM-039 / QA-ADM-040): the fallback rendered the raw API value verbatim —
 * a bare lowercase "archived" sitting next to styled badges. A value we have not enumerated
 * should still look like a badge and read like a label, so it is title-cased here. Adding
 * the value to `config` above remains the right fix; this only stops the next unmapped
 * status from looking broken.
 */
function humanise(raw: string): string {
  return String(raw)
    .replace(/[_-]+/g, ' ')
    .replace(/\w/g, (c) => c.toUpperCase());
}

interface StatusBadgeProps {
  status: StatusType;
  showIcon?: boolean;
  className?: string;
}

export function StatusBadge({ status, showIcon = true, className }: StatusBadgeProps) {
  const { label, className: baseClass, icon: Icon } = config[status] || {
    label: humanise(status),
    className: 'bg-clay-border text-text-secondary',
    icon: undefined,
  };
  return (
    <span className={clsx('inline-flex items-center gap-1 rounded-pill px-3 py-1 text-xs font-semibold tracking-wide whitespace-nowrap', baseClass, className)}>
      {showIcon && Icon && <Icon className="w-3 h-3" />}
      {label}
    </span>
  );
}
