# ilesure-admin (Admin Console) — Detailed Audit Findings

**Date:** 2026-08-12 · Vite/React + antd + recharts (privileged internal tool) · Read-only, no code modified.
See the root [PROJECT_AUDIT.md](../PROJECT_AUDIT.md) for the cross-layer summary.

> This is the highest-privilege client (Users, Payments, Reports, Audit Logs, Push/Email broadcast). **All Critical/High findings are here.** Client-side gates are *not* a security boundary — data protection depends entirely on the backend enforcing auth + per-role authorization on every `/admin/v1/*` route.

**Totals (ADMIN): Critical 2 · High 3 · Medium 2 · Low 3.**

---

## CRITICAL

### AD-C1. Spoofable auth guard decoupled from the JWT
- **Category:** Admin-auth / Route-protection · **Location:** `src/App.tsx:26`, `src/pages/Login.tsx:30`
- **Defect:** Every privileged route is gated on `localStorage.getItem('ilesure_admin_auth') === 'true'` — a boolean flag set at login. It never reads or validates the actual JWT.
- **Impact:** Anyone can run `localStorage.setItem('ilesure_admin_auth','true')` in DevTools to load the **entire admin UI** — Users, Payments, Reports, Audit Logs, broadcast Push/Email. There is zero client-side defense-in-depth; whether real data is exposed depends 100% on the backend rejecting the (absent/invalid) token on each call.
- **Fix:** Gate on a validated token (verify presence + expiry, ideally a `/admin/v1/auth/me` check), not a standalone flag.

### AD-C2. Logout never clears the JWT
- **Category:** Admin-auth · **Location:** `src/components/Sidebar.tsx:35-39`, `src/api/auth.ts:45`
- **Defect:** Logout removes only the `ilesure_admin_auth` flag; `removeAdminToken()` exists but is **invoked nowhere** (dead code). The valid Bearer token stays in `localStorage`.
- **Impact:** On a shared machine, the next person's requests attach the prior admin's token (`src/api/admin.ts:5-9`) → concrete privileged token reuse after "logout".
- **Fix:** Call `removeAdminToken()` (clear the token) on logout; ideally also revoke server-side (backend has no revocation — A-C2).

---

## HIGH

### AD-H1. Admin JWT stored in localStorage (XSS-stealable)
- **Category:** Token-storage / XSS · **Location:** `src/api/auth.ts:37-43`
- **Defect/Impact:** The admin token lives in `localStorage`; any XSS or compromised dependency exfiltrates it → full admin-account takeover with no revocation path.
- **Fix:** httpOnly+Secure+SameSite cookie set by the backend; keep only non-sensitive display data in JS-readable storage.

### AD-H2. No 401 / session-expiry handling
- **Category:** Admin-auth · **Location:** `src/api/admin.ts:13-22`
- **Defect:** `adminFetch` never checks `response.status`/`.ok`; it unconditionally calls `response.json()`. Combined with AD-C1's persistent flag, an expired session never logs out — the UI stays "authenticated" forever.
- **Impact:** Broken session lifecycle; stale/expired sessions appear valid; errors are swallowed.
- **Fix:** On 401/403, clear auth and redirect to login; surface API errors.

### AD-H3. No client-side RBAC — every destructive action exposed to any authenticated admin
- **Category:** RBAC · **Location:** `src/types/index.ts:133-136` (`super_admin|support|moderator` + `permissions[]`), `src/components/TopHeader.tsx:60` (hardcodes "Super Admin")
- **Defect:** The role/permission model exists but is never enforced in the UI. Every action — suspend user, approve/reject company & listing, mark-payment-processed, resolve-dispute, delete tier/ad, broadcast — is shown to any authenticated admin.
- **Impact:** No least-privilege separation; safe **only if** the backend enforces per-role authorization (which it currently does **not** — backend A-M2: all admin routes gate solely on token type, ignoring role/permissions). Together these two = any admin token performs every admin action.
- **Fix:** Enforce role/permissions in the UI *and* (authoritatively) on every backend admin route.

---

## MEDIUM
- **AD-M1** Money/dispute actions fire with **no confirmation** — Payments `markProcessed` (`src/pages/Payments.tsx:66`) and Bookings `resolve` (`src/pages/Bookings.tsx:39`) have no confirm modal (inconsistent with Users suspend, which does). Fix: confirm destructive/irreversible actions.
- **AD-M2** Broken CSV export downloads `[object Object]` and exports PII — `src/pages/WaitlistData.tsx:60-73`: `adminFetch` forces `.json()`, then the object is wrapped as `Blob([...], 'text/csv')`; errors swallowed. Fix: fetch as text/blob; handle errors.

## LOW
- **AD-L1** `src/pages/Tiers.tsx` bypasses the shared `adminApi` and uses axios + a manually-attached token (no 401 handling) — inconsistent client, drift risk.
- **AD-L2** Unsanitized URLs passed into `href`/`window.open` — `src/pages/Ads.tsx:150`, `src/pages/VerificationQueue.tsx:226` (low-likelihood `javascript:` sink from stored data).
- **AD-L3** `API_DOCUMENTATION.md` committed in the repo — discloses the full admin API surface if the repo/build is ever public.

---

## Verified OK (admin)
- **No committed `.env`, no hardcoded secrets**; `.env` is gitignored.
- **No `dangerouslySetInnerHTML` anywhere** — React escaping mitigates stored-XSS from user-generated content (reports, tickets, names, listing descriptions) rendered in the panel.

**Not verifiable from the frontend (backend must confirm):** per-endpoint auth + per-role authorization on all `/admin/v1/*` routes, JWT expiry/rotation. The backend audit finds admin RBAC is **not** enforced (A-M2) — so AD-H3 is currently a real privilege gap, not just a UI inconsistency.
