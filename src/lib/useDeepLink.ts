import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { findDeepLinked, readDeepLink, withoutDeepLink } from './deepLink';

interface DeepLinkOptions<T> {
  /** The rows the page has loaded. */
  rows: readonly T[] | null | undefined;
  /** True while the page is fetching; the record is only looked for once it is not. */
  loading: boolean;
  getId: (row: T) => unknown;
  /** Open the record (show its detail, expand it, select it). */
  onOpen: (row: T) => void;
  /** Apply `q` (and anything else the page needs, e.g. widen a status filter). Runs once. */
  onQuery?: (q: string | null) => void;
}

/**
 * Opens the record an admin alert email linked to (`?q=..&open=..`, see deepLink.ts). Reads
 * the link once on arrival, applies the search, opens the record as soon as it is among the
 * loaded rows, then drops the parameters so a refresh or a later filter change does not
 * reopen it.
 */
export function useDeepLink<T>({ rows, loading, getId, onOpen, onQuery }: DeepLinkOptions<T>): void {
  const [params, setParams] = useSearchParams();
  const link = useRef(readDeepLink(params.toString()));
  const done = useRef(!link.current.open && !link.current.q);

  useEffect(() => {
    const { q, open } = link.current;
    if (q || open) onQuery?.(q);
    // Applied once, on arrival.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (done.current || loading) return;
    const match = findDeepLinked(rows, link.current.open, getId);
    if (!match && link.current.open) return;
    done.current = true;
    if (match) onOpen(match);
    setParams(new URLSearchParams(withoutDeepLink(params.toString())), { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, loading]);
}
