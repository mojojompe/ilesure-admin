import { Fragment, type ReactNode } from 'react';
import { Search01Icon } from '@hugeicons/react';
import { clsx } from 'clsx';
import { Button } from '../../components/ui/Button';
import type { AccountModeration } from './useAccountModeration';
import type { AccountKind, AccountOf } from './kinds';

export interface StatCard {
  label: string;
  value: number;
  icon: ReactNode;
  bg: string;
}

export function StatCards({ cards }: { cards: StatCard[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map(s => (
        <div key={s.label} className="bg-white rounded-clay border border-clay-border shadow-clay p-4 flex items-center gap-3">
          <div className={`w-10 h-10 rounded-clay-sm flex items-center justify-center shadow-clay-sm flex-shrink-0 ${s.bg}`}>{s.icon}</div>
          <div>
            <div className="text-2xl font-bold text-text-primary">{s.value}</div>
            <div className="text-xs text-text-tertiary">{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SearchField({ value, onChange, placeholder, className }: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}) {
  return (
    <div className={clsx('relative', className)}>
      <Search01Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-4 py-2 bg-clay-border-light border border-clay-border rounded-pill text-sm placeholder:text-text-tertiary outline-none focus:border-mustard focus:ring-2 focus:ring-mustard/20 transition-all"
      />
    </div>
  );
}

export interface Column<T> {
  header: ReactNode;
  cell: (row: T) => ReactNode;
  headerClassName?: string;
  className?: string;
}

/**
 * Table + pager for one account-moderation list. The page passes its columns and,
 * optionally, a row click handler and an expanded-row renderer.
 */
export function AccountTable<K extends AccountKind>({
  list,
  columns,
  noun,
  onRowClick,
  renderExpanded,
}: {
  list: AccountModeration<K, any>;
  columns: Column<AccountOf<K>>[];
  /** Plural noun for the empty state and the "Showing x–y of n" line. */
  noun: string;
  onRowClick?: (row: AccountOf<K>) => void;
  renderExpanded?: (row: AccountOf<K>) => ReactNode;
}) {
  const span = columns.length;
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full clay-table">
          <thead>
            <tr>{columns.map((c, i) => <th key={i} className={c.headerClassName}>{c.header}</th>)}</tr>
          </thead>
          <tbody>
            {list.loading ? (
              <tr>
                <td colSpan={span} className="text-center py-12">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-mustard border-t-transparent rounded-full animate-spin" />
                    <span className="text-text-tertiary">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : list.rows.length === 0 ? (
              <tr>
                <td colSpan={span} className="text-center py-12">
                  <p className="text-text-tertiary">No {noun} found</p>
                </td>
              </tr>
            ) : list.rows.map(row => {
              const expanded = renderExpanded?.(row);
              return (
                <Fragment key={row.id}>
                  <tr className={onRowClick ? 'cursor-pointer' : undefined} onClick={onRowClick ? () => onRowClick(row) : undefined}>
                    {columns.map((c, i) => <td key={i} className={c.className}>{c.cell(row)}</td>)}
                  </tr>
                  {expanded && (
                    <tr className="bg-mustard-pale/40">
                      <td colSpan={span} className="px-6 py-4">{expanded}</td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-3 border-t border-clay-border bg-off-white rounded-b-clay flex items-center justify-between gap-3">
        <p className="text-xs text-text-tertiary">
          Showing {list.range.first}–{list.range.last} of {list.total} {noun}
        </p>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" disabled={list.loading || list.page <= 1} onClick={() => list.setPage(list.page - 1)}>
            Previous
          </Button>
          <span className="text-xs text-text-tertiary">Page {list.page} of {list.totalPages}</span>
          <Button variant="secondary" size="sm" disabled={list.loading || list.page >= list.totalPages} onClick={() => list.setPage(Math.min(list.page + 1, list.totalPages))}>
            Next
          </Button>
        </div>
      </div>
    </>
  );
}
