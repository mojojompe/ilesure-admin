import { API_ENDPOINTS } from '../lib/config';

export interface AdminLoginData {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  success: boolean;
  data?: {
    adminToken: string;
    admin: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
  };
  error?: {
    code: string;
    message: string;
  };
}

export async function adminLogin(data: AdminLoginData): Promise<AdminLoginResponse> {
  const response = await fetch(API_ENDPOINTS.auth.login, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return response.json();
}

const TOKEN_KEY = 'ilesure_admin_token';
const AUTH_FLAG_KEY = 'ilesure_admin_auth';

// SECURITY-FIX TODO (AD-H1): The admin JWT is stored in localStorage, which is
// readable by any JavaScript on the page and therefore stealable via XSS or a
// compromised dependency (full admin-account takeover, no revocation path). The
// proper fix is for the backend to set the token in an httpOnly + Secure + SameSite
// cookie and keep only non-sensitive display data in JS-readable storage. That
// migration is out of scope for this pass; the critical fixes here are the real
// token-based auth gate (AD-C1) and clearing the token on logout (AD-C2).

export function setAdminToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getAdminToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function removeAdminToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export interface AdminTokenPayload {
  exp?: number;
  role?: string;
  permissions?: string[];
  [key: string]: any;
}

// SECURITY-FIX (AD-C1): Decode a JWT payload (the middle, base64url segment) WITHOUT
// verifying the signature — signature verification is the backend's responsibility.
// The client only needs the claims (exp, role, permissions) to gate the UI and to
// detect an expired session. Returns null if the token is missing or malformed.
export function decodeAdminToken(token: string | null = getAdminToken()): AdminTokenPayload | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    // base64url -> base64, restore padding, then UTF-8 safe decode
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    if (pad) base64 += '='.repeat(4 - pad);
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(json) as AdminTokenPayload;
  } catch {
    return null;
  }
}

// SECURITY-FIX (AD-C1): The route guard must gate on a real, non-expired JWT — not on
// the spoofable `ilesure_admin_auth` boolean flag. Returns true only when a token is
// present, decodes, and (if it carries an `exp` claim) has not expired.
export function isAdminAuthenticated(): boolean {
  const payload = decodeAdminToken();
  if (!payload) return false;
  if (typeof payload.exp === 'number' && payload.exp <= Date.now() / 1000) {
    return false;
  }
  return true;
}

// Non-sensitive claim accessors used for client-side RBAC (see src/lib/rbac.ts).
export function getAdminRole(): string | null {
  return decodeAdminToken()?.role ?? null;
}

export function getAdminPermissions(): string[] {
  const perms = decodeAdminToken()?.permissions;
  return Array.isArray(perms) ? perms : [];
}

// SECURITY-FIX (AD-C2 / AD-H2): Clear the WHOLE admin session — the JWT and the UI
// convenience flag. Used by logout and by the 401/403 handler in adminFetch so an
// expired/invalid session cannot linger as "authenticated".
export function clearAdminSession(): void {
  removeAdminToken();
  localStorage.removeItem(AUTH_FLAG_KEY);
}