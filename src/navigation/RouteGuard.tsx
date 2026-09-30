import { Link } from 'react-router-dom';
import { SecurityCheckIcon } from '@hugeicons/react';
import { can } from '../lib/rbac';
import { routeDecision, type CanFn, type NavEntry } from './access';

/** Renders the entry's page, or a permission message when the admin can't access it. */
export function RouteGuard({ entry, check = can }: { entry: NavEntry; check?: CanFn }) {
  if (routeDecision(entry, check) === 'render') return <>{entry.element}</>;
  return <PermissionDenied label={entry.label} />;
}

export function PermissionDenied({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center py-20 px-4">
      <div className="text-center max-w-md bg-white rounded-clay border border-clay-border shadow-clay p-8">
        <div className="w-14 h-14 rounded-full bg-burnt-brown-pale flex items-center justify-center mx-auto mb-4 shadow-clay-sm">
          <SecurityCheckIcon className="w-7 h-7 text-burnt-brown" />
        </div>
        <h1 className="text-lg font-bold text-text-primary mb-2">No access to {label}</h1>
        <p className="text-sm text-text-tertiary mb-6">
          Your admin role doesn't include permission to view this page. Ask a super admin if you need it.
        </p>
        <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-burnt-brown text-white rounded-pill text-sm font-semibold shadow-clay hover:bg-burnt-brown-dark transition-colors">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
