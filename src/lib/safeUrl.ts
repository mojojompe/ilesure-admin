// SECURITY-FIX (AD-L2): Sanitize stored/attacker-controllable URLs before they reach
// href / window.open / anchor-download sinks. Only http(s) is allowed; dangerous
// schemes such as javascript:, data:, vbscript: and file: are rejected so a poisoned
// stored URL cannot execute script or exfiltrate when an admin clicks/opens it.
export function safeUrl(url: unknown): string | null {
  if (typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    // Resolve relative to the current origin so relative / protocol-relative URLs
    // are normalised before the scheme check.
    const parsed = new URL(trimmed, window.location.origin);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href;
    }
    return null;
  } catch {
    return null;
  }
}
