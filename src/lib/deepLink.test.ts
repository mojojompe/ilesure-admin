import { describe, it, expect } from 'vitest';
import { readDeepLink, withoutDeepLink, findDeepLinked } from './deepLink';

describe('deep links from admin alert emails', () => {
  it('reads the search and the record id the server builds', () => {
    // As adminAlertService.recordPath writes it.
    expect(readDeepLink('?q=ada%40example.com&open=64f0a1')).toEqual({ q: 'ada@example.com', open: '64f0a1' });
    expect(readDeepLink('q=Obi+Homes&open=abc')).toEqual({ q: 'Obi Homes', open: 'abc' });
  });

  it('treats missing or blank parameters as absent', () => {
    expect(readDeepLink('')).toEqual({ q: null, open: null });
    expect(readDeepLink('?q=%20&open=')).toEqual({ q: null, open: null });
  });

  it('drops only its own parameters', () => {
    expect(withoutDeepLink('?q=x&open=y&tab=pending')).toBe('tab=pending');
    expect(withoutDeepLink('?q=x&open=y')).toBe('');
  });

  it('finds the linked row by id, whatever the id type', () => {
    const rows = [{ id: 'a' }, { id: 'b' }];
    expect(findDeepLinked(rows, 'b', (r) => r.id)).toEqual({ id: 'b' });
    expect(findDeepLinked(rows, 'c', (r) => r.id)).toBeNull();
    expect(findDeepLinked(rows, null, (r) => r.id)).toBeNull();
    expect(findDeepLinked([{ _id: { toString: () => 'x' } }], 'x', (r) => r._id)).not.toBeNull();
  });
});
