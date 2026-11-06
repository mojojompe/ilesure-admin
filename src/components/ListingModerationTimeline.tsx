import { clsx } from 'clsx';

export interface ModerationTimelineEntry {
  action: 'submitted' | 'approved' | 'rejected' | 'changes_requested' | 'edited' | 'archived' | 'status_changed';
  note: string | null;
  actorType: 'admin' | 'lister' | null;
  actorName: string | null;
  fields: string[];
  at: string;
}

const ACTION_LABEL: Record<ModerationTimelineEntry['action'], string> = {
  submitted: 'Listing submitted',
  approved: 'Approved',
  rejected: 'Rejected',
  changes_requested: 'Changes requested',
  edited: 'Lister edited the listing',
  archived: 'Archived',
  status_changed: 'Status changed',
};

const DOT: Record<ModerationTimelineEntry['action'], string> = {
  submitted: 'bg-text-tertiary',
  approved: 'bg-status-success',
  rejected: 'bg-status-error',
  changes_requested: 'bg-mustard',
  edited: 'bg-burnt-brown',
  archived: 'bg-text-tertiary',
  status_changed: 'bg-text-tertiary',
};

const FIELD_LABEL: Record<string, string> = {
  rentAnnual: 'rent', annualRent: 'rent', cautionFee: 'caution fee', agencyFee: 'agency fee',
  securityDeposit: 'security deposit', serviceCharge: 'service charge', shortletPricing: 'shortlet prices',
  shortletRates: 'shortlet prices', propertyType: 'property type', tenancyAgreement: 'tenancy agreement',
  images: 'photos',
};

const humanStatus = (s: string) => s.replace(/_/g, ' ');

function detail(e: ModerationTimelineEntry): string | null {
  if (e.action === 'edited' && e.fields.length) {
    return `Changed: ${[...new Set(e.fields.map(f => FIELD_LABEL[f] || f))].join(', ')}`;
  }
  if (e.action === 'status_changed' && e.fields.length === 2) {
    return `${humanStatus(e.fields[0])} → ${humanStatus(e.fields[1])}`;
  }
  return null;
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/** Moderation history of one listing, oldest first: what admins asked and what the lister changed. */
export function ListingModerationTimeline({ entries }: { entries: ModerationTimelineEntry[] }) {
  if (!entries?.length) {
    return <p className="text-xs text-text-tertiary">No moderation activity yet.</p>;
  }

  return (
    <ol className="relative ml-1.5 border-l border-clay-border">
      {entries.map((e, i) => {
        const who = e.actorName || (e.actorType === 'admin' ? 'Admin' : e.actorType === 'lister' ? 'Lister' : null);
        const extra = detail(e);
        return (
          <li key={`${e.action}-${e.at}-${i}`} className="relative pl-5 pb-4 last:pb-0">
            <span className={clsx('absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ring-2 ring-white', DOT[e.action])} />
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-sm font-semibold text-text-primary">{ACTION_LABEL[e.action] || e.action}</span>
              <span className="text-[11px] text-text-tertiary">
                {formatWhen(e.at)}{who ? ` · ${who}` : ''}
              </span>
            </div>
            {extra && <p className="text-xs text-text-secondary mt-0.5">{extra}</p>}
            {e.note && (
              <p className="mt-1.5 text-sm text-text-primary bg-white rounded-clay-sm px-3 py-2 shadow-clay-sm whitespace-pre-wrap break-words">
                {e.note}
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
