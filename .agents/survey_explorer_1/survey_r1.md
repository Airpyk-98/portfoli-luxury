# Survey Report: Requirement R1 (Authentication, RBAC, Admin Security, & GTM Integration)

**Date**: 2026-08-22  
**Auditor**: `survey_explorer_1` (teamwork_preview_spec_miner)  
**Workspace**: `c:\Users\DELL\Documents\antigravity\quirky-kepler`  
**Target Specification**: Requirement R1 from `ORIGINAL_REQUEST.md` & `DISPATCH.md`

---

## Executive Summary

This report delivers a comprehensive specification discovery and source-level security audit for **Requirement R1** (Authentication, Multi-user Isolation, Role-Based Access Control, Master Admin Security, and Google Tag Manager Integration) across the Portfoli Luxury portfolio platform.

Key findings:
1. **Authentication & Session Security**: Custom JWT implementation (`HS256`, 30-day expiration). The session cookie `portfoli_session` is currently configured with `httpOnly: false`, leaving it accessible to client-side scripts. Hardcoded demo password bypasses (`password123`, `admin123`, and `Placeholder` hash matches) exist in `src/lib/auth.ts` and `src/app/api/auth/login/route.ts`.
2. **User Password Update**: Password update in the creator settings page (`src/app/dashboard/settings/page.tsx`) is currently simulated on the client via `setTimeout` without calling any backend endpoint.
3. **Multi-User Isolation & Demo Fallbacks**: Endpoints such as `PUT /api/portfolio`, `POST /api/subscription/upgrade`, and `POST /api/media/upload` fall back to mutating demo user `'kristos'` (`user_kristos_01`) when no valid session token is provided.
4. **Admin Endpoints & Master Key Verification**: `/api/admin/pricing`, `/api/admin/users`, and `/api/admin/password` strictly check authorization via header `x-admin-key` (`Database.verifyAdminPasscode`) or admin JWT cookie (`role === 'admin'`). However, `/api/admin/payment-settings` has **zero authorization checks** for both `GET` and `POST`.
5. **Master Passcodes**: Supported master keys are the active configured key from `data/admin-config.json` (`portfoli_admin_2026`), default `'admin123'`, and custom keys saved via `/api/admin/password`.
6. **Admin User Roster Metrics (`/api/admin/users`)**: Returns full user list with subscription countdown, grace period, and storage metrics. Due to missing `startDate` and `endDate` fields in `data/users.json`, date calculations evaluate to `NaN` and mark paid users as expired. Furthermore, TypeScript type discrepancies (`u.displayName`, `u.avatarUrl`, `u.customSubdomain`) cause compiler errors.
7. **Google Tag Manager (GTM)**: Rendered globally via `<GTMScript />` in `src/app/layout.tsx` for public and creator pages (`/`, `/[username]`, `/pricing`, `/dashboard/*`), with strict exclusion from `/admin` via `pathname.startsWith('/admin')`.

---

## Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Auth | User Registration | Creates new user account, initializes default luxury glassmorphic portfolio, assigns free subscription, generates JWT session | JSON: `{ name, email, username, password }` | HTTP 200: `{ success: true, user: {...} }` + `portfoli_session` cookie | HTTP 400 (missing fields/reserved username), HTTP 409 (username/email taken), HTTP 500 | `src/app/api/auth/register/route.ts` |
| 2 | Auth | User Login | Authenticates existing user by email or username, verifies password/PBKDF2 hash, issues JWT session cookie | JSON: `{ login, password }` | HTTP 200: `{ success: true, user: {...} }` + `portfoli_session` cookie | HTTP 400 (missing fields), HTTP 401 (invalid credentials), HTTP 500 | `src/app/api/auth/login/route.ts` |
| 3 | Auth | Username Availability | Checks whether a username handle is valid, formatted, not reserved, and available | Query Param: `?username=<string>` | HTTP 200: `{ available: boolean, cleanUsername: string, message: string }` | HTTP 200 with `available: false` + reason | `src/app/api/auth/check-username/route.ts` |
| 4 | Auth | Password Hashing | PBKDF2 password hashing using Node `crypto` (`crypto.randomBytes(16)` salt, 1000 iterations, SHA-512, 64-byte key) | `password: string` | Promise `<string>` formatted as `${salt}:${hash}` | N/A (standard crypto sync) | `src/lib/auth.ts` |
| 5 | Auth | Password Verification | Compares plaintext password against PBKDF2 hash or checks demo credentials | `password: string, storedHash: string` | Promise `<boolean>` (`true` if match) | Returns `false` on malformed salt/hash or mismatch | `src/lib/auth.ts` |
| 6 | Session | JWT Signing | Generates HS256 JWT containing `{ id, email, username, role, exp }` (30 days validity) | `payload: { id, email, username, role }` | Base64URL-encoded JWT string: `header.payload.signature` | Uses `process.env.JWT_SECRET` with fallback | `src/lib/auth.ts` |
| 7 | Session | JWT Verification | Decodes HS256 JWT, validates HMAC-SHA256 signature and `exp` timestamp | `token: string` | Decoded payload `{ id, email, username, role, exp }` or `null` | Returns `null` on invalid signature, malformed token, or expired token | `src/lib/auth.ts` |
| 8 | Session | Session Cookie Set | Sets `portfoli_session` cookie upon login/registration | JWT token | Cookie: `portfoli_session`, `maxAge=2592000`, `sameSite='lax'`, `path='/'`, `secure=(NODE_ENV==='production')`, `httpOnly=false` | N/A | `src/app/api/auth/login/route.ts`, `register/route.ts` |
| 9 | Creator | Current Portfolio & Session | Fetches active user profile, portfolio configuration, subscription state, storage used | Cookie: `portfoli_session` or Query `?username=<slug>` | HTTP 200: `{ portfolio, user, isDemo? }` | HTTP 401 (invalid session token), HTTP 404 (user/portfolio not found) | `src/app/api/portfolio/route.ts` |
| 10 | Creator | Portfolio Update | Updates portfolio theme, projects, services, bio, avatar, and recalculates storage usage | Cookie: `portfoli_session`, JSON: `UserPortfolio` | HTTP 200: `{ success: true, portfolio: UserPortfolio }` | HTTP 500 (update failed / server error) | `src/app/api/portfolio/route.ts` |
| 11 | Creator | Inquiries Management | Retrieves customer inquiries dispatched to creator portfolio | Cookie: `portfoli_session` | HTTP 200: `{ inquiries: Inquiry[] }` | HTTP 500 | `src/app/api/inquiries/route.ts` |
| 12 | Public | Inquiry Dispatch | Allows public visitors to send project inquiries to a creator portfolio | JSON: `{ portfolioUserId, portfolioUsername, senderName, senderEmail, senderSubject, message, serviceInterest }` | HTTP 200: `{ success: true, inquiry: Inquiry }` | HTTP 400 (missing senderName, senderEmail, or message), HTTP 500 | `src/app/api/inquiries/route.ts` |
| 13 | Admin | Master Passcode Verification | Verifies master administrative passcode against active passcode, 'admin123', or 'portfoli_admin_2026' | `passcode: string` | `boolean` (`true` if valid) | Returns `false` for empty or incorrect passcode | `src/lib/storage.ts` |
| 14 | Admin | Passcode Update | Updates master administrative passcode in `data/admin-config.json` | Header: `x-admin-key` or Admin Cookie, Body: `{ currentPassword, newPassword }` | HTTP 200: `{ success: true, message: string }` | HTTP 400 (current password incorrect / new < 6 chars), HTTP 403 (unauthorized), HTTP 500 | `src/app/api/admin/password/route.ts` |
| 15 | Admin | Pricing & Telemetry Fetch | Retrieves system pricing config and platform-wide analytics (user count, active subs, revenue, storage) | Header: `x-admin-key` or Admin Cookie, or `?public=true` | HTTP 200: `{ pricing, telemetry: {...} }` or `{ pricing }` (if public) | HTTP 403 (Master Admin authorization required) | `src/app/api/admin/pricing/route.ts` |
| 16 | Admin | Pricing Update | Modifies tier pricing values, quotas (max videos/photos), storage quotas, and display mode permissions | Header: `x-admin-key` or Admin Cookie, Body: `Partial<PricingConfig>` | HTTP 200: `{ success: true, pricing: PricingConfig }` | HTTP 403 (unauthorized), HTTP 500 | `src/app/api/admin/pricing/route.ts` |
| 17 | Admin | User Roster Management | Lists all platform users with subscription start/end dates, countdown, grace period, and storage metrics | Header: `x-admin-key` or Admin Cookie | HTTP 200: `{ success: true, users: [...], analytics: {...} }` | HTTP 403 (unauthorized), HTTP 500 | `src/app/api/admin/users/route.ts` |
| 18 | Admin | User Subscription Override | Admin action to change a user's subscription tier or extend subscription duration by N days | Header: `x-admin-key` or Admin Cookie, Body: `{ userId, action: 'update_tier'\|'extend_days', tier?, extendDays? }` | HTTP 200: `{ success: true, user: User }` | HTTP 400 (missing userId), HTTP 403 (unauthorized), HTTP 404 (user not found), HTTP 500 | `src/app/api/admin/users/route.ts` |
| 19 | Admin | Payment & Telemetry Settings | Retrieves masked payment credentials, webhook URL, GTM container ID, and GA4 ID | None (Unauthenticated) | HTTP 200: `{ success: true, settings: MaskedSettings, liveStats, webhookEndpoint }` | HTTP 500 | `src/app/api/admin/payment-settings/route.ts` |
| 20 | Admin | Save Payment & Telemetry Settings | Updates Flutterwave keys, webhook secret hash, GTM container ID, GA4 ID, Looker Studio URL | None (Unauthenticated) | HTTP 200: `{ success: true, message: string, settings: MaskedSettings }` | HTTP 500 | `src/app/api/admin/payment-settings/route.ts` |
| 21 | GTM | Script Injection on Public Pages | Dynamically injects Google Tag Manager container script and noscript iframe on creator and public pages | Reads `gtmContainerId` from `/api/admin/payment-settings` | Injected `<Script id="google-tag-manager" strategy="afterInteractive">` + `<noscript><iframe>` | Does nothing if `gtmContainerId` is empty | `src/components/gtm-script.tsx` |
| 22 | GTM | Strict Exclusion from `/admin` | Suppresses Google Tag Manager and GA4 script injection on all admin routes | `usePathname()` | Returns `null` when `pathname.startsWith('/admin')` | None | `src/components/gtm-script.tsx` |
| 23 | Routing | Subdomain Routing Rewrite | Rewrites root request on custom subdomains (`subdomain.portfoli.me` or `subdomain.localhost`) to `/[username]` | Host header & NextRequest | `NextResponse.rewrite('/[subdomain]')` | Excludes static assets, `/api`, and ignored subdomains (`www`, `admin`, `api`, `app`, `mail`) | `src/middleware.ts` |

---

## Edge Cases

| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | User Login | Missing login or password | Returns HTTP 400: `{"error": "Username/email and password required."}` |
| 2 | User Login | Non-existent user | Returns HTTP 401: `{"error": "Invalid credentials."}` |
| 3 | User Login | Any user + password `'password123'` or `'admin123'` | Bypasses PBKDF2 check and authenticates successfully as that user. |
| 4 | User Registration | Reserved usernames (`admin`, `api`, `dashboard`, `pricing`, `login`, `register`, `settings`, `static`) | Returns HTTP 400: `{"error": "This username is reserved."}` |
| 5 | User Registration | Duplicate username (case-insensitive) | Returns HTTP 409: `{"error": "Username is already taken."}` |
| 6 | User Registration | Duplicate email (case-insensitive) | Returns HTTP 409: `{"error": "Email is already registered."}` |
| 7 | Session Verification | Expired JWT token (`exp < Date.now() / 1000`) | `verifyToken` returns `null`; `/api/portfolio` returns HTTP 401: `{"error": "Invalid session"}` |
| 8 | Session Verification | Tampered signature or invalid base64 string | `verifyToken` catches error / signature mismatch and returns `null` |
| 9 | Session Cookie | Cookie `httpOnly` flag | Configured as `httpOnly: false`. `document.cookie` can read and delete `portfoli_session` on the client. |
| 10 | Creator Settings | User password update form | Simulated with client-side `setTimeout` (800ms); does not persist to backend or update user hash. |
| 11 | Portfolio PUT | Unauthenticated PUT request | Falls back to `userId = 'user_kristos_01'`, updating Kristos's portfolio without authentication. |
| 12 | Admin Password Endpoint | Request with missing or invalid `x-admin-key` and non-admin cookie | Returns HTTP 403: `{"error": "Master administrative authorization required."}` |
| 13 | Admin Password Update | New passcode `< 6` characters | Returns HTTP 400: `{"error": "New passcode must be at least 6 characters long."}` |
| 14 | Admin Password Update | Incorrect `currentPassword` | Returns HTTP 400: `{"error": "Current admin passcode is incorrect."}` |
| 15 | Admin User Roster | Unauthenticated request to `/api/admin/users` | Returns HTTP 403: `{"error": "Master Admin authorization required."}` |
| 16 | Admin User Roster | Users in `data/users.json` missing `startDate` and `endDate` | Date diff calculates as `NaN`, `hasStarted` is `false`, `daysRemainingInSubscription` is 0, user categorized as `isExpiredAndDecommissioned`. |
| 17 | Admin Payment Settings | Unauthenticated GET or POST to `/api/admin/payment-settings` | Returns HTTP 200 and allows modifying payment keys and webhook secrets without any credentials. |
| 18 | GTM Script Injection | Route `/admin` or `/admin/settings` | `pathname.startsWith('/admin')` returns `true`, component returns `null` (GTM script not injected). |
| 19 | GTM Script Injection | Public page (`/`, `/kristos`, `/pricing`, `/dashboard`) | Injects GTM script tag and noscript iframe with configured `gtmContainerId`. |
| 20 | Subdomain Middleware | Request to `kristos.localhost:3000/` or `kristos.portfoli.me/` | Rewrites path to `/kristos` while preserving host header. |

---

## Detailed Component & Architecture Analysis

### 1. Authentication & RBAC Architecture

#### A. Password Storage & Validation (`src/lib/auth.ts`)
- **Algorithm**: PBKDF2 with SHA-512 via `crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512')`.
- **Salt**: 16 random bytes hex-encoded (`crypto.randomBytes(16).toString('hex')`).
- **Format**: `${salt}:${hash}`.
- **Vulnerability / Bypass Identified**:
  ```ts
  // In src/lib/auth.ts:
  export async function comparePassword(password: string, storedHash: string): Promise<boolean> {
    if (storedHash.includes('Placeholder') || password === 'password123' || password === 'admin123') {
      return true;
    }
    ...
  }

  // In src/app/api/auth/login/route.ts:
  if (user.passwordHash.includes('Placeholder') || password === 'password123' || password === 'admin123') {
    isValid = true;
  }
  ```
  *Risk*: Any user in the system can be logged into using password `'password123'` or `'admin123'`, or if their stored hash contains `'Placeholder'`.

#### B. JWT Session Creation & Verification (`src/lib/auth.ts`)
- **Algorithm**: HMAC-SHA256 (custom JWT implementation without third-party library runtime dependencies).
- **Secret**: `process.env.JWT_SECRET || 'portfoli_cyber_luxury_secret_jwt_key_2026_production'`.
- **Payload Schema**:
  ```ts
  {
    id: string;        // e.g. "user_kristos_01"
    email: string;     // e.g. "kristos@portfoli.me"
    username: string;  // e.g. "kristos"
    role: string;      // "user" | "admin"
    exp: number;       // Unix epoch timestamp (current + 30 days)
  }
  ```
- **Verification**: Re-computes HMAC-SHA256 on `header.data` using `JWT_SECRET`, checks signature equality, and verifies `payload.exp >= Math.floor(Date.now() / 1000)`.

#### C. Session Cookie Configuration
- **Cookie Name**: `portfoli_session`
- **Settings in `login/route.ts` & `register/route.ts`**:
  ```ts
  response.cookies.set('portfoli_session', token, {
    httpOnly: false,                            // Security issue: should be true
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60,                  // 30 days in seconds
    path: '/',
  });
  ```
- **Defect**: `httpOnly: false` makes the session cookie vulnerable to theft via Cross-Site Scripting (XSS). Requirement R1 requires standard `httpOnly: true` protection.

---

### 2. Admin Security & RBAC Enforcement

#### A. Master Passcode Authentication Mechanism
- **Passcode Storage**: `data/admin-config.json` containing `{"passcode": "portfoli_admin_2026", "updatedAt": "..."}`.
- **Passcode Verification**:
  ```ts
  static verifyAdminPasscode(passcode: string): boolean {
    if (!passcode) return false;
    const active = this.getAdminPasscode();
    return passcode === active || passcode === 'admin123' || passcode === 'portfoli_admin_2026';
  }
  ```
- **Accepted Keys**:
  1. Active configured key from `data/admin-config.json` (defaults to `'admin123'` if unconfigured).
  2. Default `'admin123'`.
  3. Legacy fallback `'portfoli_admin_2026'`.

#### B. Admin Authorization Verification Helper
Used across `/api/admin/pricing`, `/api/admin/users`, and `/api/admin/password`:
```ts
function isAuthorizedAdmin(req: Request, token?: string): boolean {
  const adminKey = req.headers.get('x-admin-key');
  if (adminKey && Database.verifyAdminPasscode(adminKey)) {
    return true;
  }
  if (token) {
    const payload = verifyToken(token);
    if (payload && (payload.role === 'admin' || payload.username === 'admin')) {
      return true;
    }
  }
  return false;
}
```

#### C. Endpoint-by-Endpoint Security Audit

1. **`/api/admin/password`** (`POST`):
   - Authorization: Required (`x-admin-key` or Admin Cookie).
   - Validates `currentPassword` matches `Database.verifyAdminPasscode`.
   - Validates `newPassword.length >= 6`.
   - Updates `admin-config.json`.

2. **`/api/admin/pricing`** (`GET`, `PUT`):
   - `GET`: Public access permitted only when `?public=true`. All telemetry metrics require admin authorization.
   - `PUT`: Requires admin authorization. Updates pricing values and quotas.

3. **`/api/admin/users`** (`GET`, `POST`):
   - `GET`: Requires admin authorization. Returns user list and platform analytics.
   - `POST`: Requires admin authorization. Allows updating user tier (`update_tier`) or extending active days (`extend_days`).

4. **`/api/admin/payment-settings`** (`GET`, `POST`):
   - **VULNERABILITY**: Has NO authorization checks on either `GET` or `POST`. Anyone can read masked payment keys and live revenue stats, and anyone can send a POST request to overwrite Flutterwave credentials and webhook secret hashes.

---

### 3. Admin User Roster & Subscription Metrics (`/api/admin/users`)

#### A. Analytics Object Structure
```ts
analytics: {
  totalUsers: number,
  paidSubscribers: number,
  freeUsers: number,
  inGracePeriod: number,
  expiredCount: number,
  totalStorageUsedBytes: number,
  totalRevenue: number,
  conversionRate: number
}
```

#### B. User Item Output Schema
```ts
{
  id: string,
  name: string,
  username: string,
  email: string,
  role: string,
  avatarUrl: string,
  storageUsedBytes: number,
  customSubdomain: string,
  createdAt: string,
  subscription: {
    tier: 'free' | 'pro_2k' | 'elite_5k',
    startDate: string | null,
    endDate: string | null,
    active: boolean,
    amountPaid: number,
    currency: 'NGN',
    autoRenew: boolean
  },
  statusInfo: {
    isActive: boolean,
    isGracePeriod: boolean,
    isExpiredAndDecommissioned: boolean,
    daysRemainingInSubscription: number,
    daysRemainingInGrace: number,
    hasStarted: boolean
  }
}
```

#### C. Identified Defects in User Roster
1. **Missing Dates in Data File**: `data/users.json` lacks `startDate` and `endDate` fields in `subscription` objects.
2. **`NaN` Subscription Calculation**: `getSubscriptionStatus` calculates `new Date(sub.endDate).getTime() - Date.now()`. When `sub.endDate` is undefined, `diffMs` is `NaN`, rendering `daysRemainingInSubscription: 0`, `isActive: false`, `isExpiredAndDecommissioned: true`.
3. **Missing `storageUsedBytes` in Seed Data**: `storageUsedBytes` is omitted on user objects in `data/users.json`, defaulting to 0 unless dynamically calculated from project media.
4. **TypeScript Property Errors in Route**:
   - `u.displayName` (should be `u.portfolio?.displayName`)
   - `u.avatarUrl` (should be `u.portfolio?.avatarUrl`)
   - `u.customSubdomain` (should be `u.portfolio?.customSubdomain`)

---

### 4. Google Tag Manager (GTM) Integration

#### A. Implementation in `src/components/gtm-script.tsx`
- Injected globally via `RootLayout` in `src/app/layout.tsx`.
- Fetches `gtmContainerId` and `ga4MeasurementId` from `/api/admin/payment-settings`.
- **GTM Script Strategy**: `strategy="afterInteractive"`.
- **GTM Tag Markup**:
  - Script: `https://www.googletagmanager.com/gtm.js?id=${gtmId}` with standard `dataLayer` initialization.
  - Noscript: `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden" />`.

#### B. Strict `/admin` Exclusion
- Evaluates `const pathname = usePathname();`.
- Exclusion check:
  ```ts
  if (pathname && pathname.startsWith('/admin')) {
    return null;
  }
  ```
- **Coverage**: Blocks GTM on `/admin`, `/admin/`, and any sub-routes under `/admin`.
- **Inclusion**: Active on `/`, `/[username]`, `/pricing`, `/dashboard`, `/dashboard/*`, `/login`, `/register`.

#### C. Architectural Concern
- Public pages depend on calling `/api/admin/payment-settings` to retrieve `gtmContainerId`.
- Because `/api/admin/payment-settings` contains sensitive payment configuration, making it publicly accessible creates a data exposure risk. A dedicated public config endpoint or parameter (e.g. `?public=true` or `/api/telemetry/config`) should serve `gtmContainerId` and `ga4MeasurementId` without leaking merchant secrets.

---

### 5. Multi-User Isolation & Demo Fallbacks

| Endpoint | Method | Authenticated Behavior | Unauthenticated / Invalid Session Behavior | Risk / Status |
|----------|--------|------------------------|-------------------------------------------|---------------|
| `/api/portfolio` | `GET` | Returns logged-in user's portfolio and user data | Falls back to `'kristos'` demo user with `isDemo: true` | Low (read-only demo fallback) |
| `/api/portfolio` | `PUT` | Updates portfolio of logged-in user (`payload.id`) | Falls back to `userId = 'user_kristos_01'` and mutates Kristos's portfolio | **High**: Unauthenticated mutation of demo account |
| `/api/inquiries` | `GET` | Fetches inquiries matching `payload.id` | Falls back to `userId = 'user_kristos_01'` | Medium: Leaks Kristos inquiries to unauthenticated visitors |
| `/api/inquiries` | `POST` | Dispatches inquiry to specified `portfolioUserId` | Dispatches to `user_kristos_01` if none provided | Normal (public contact form) |
| `/api/media/upload` | `POST` | Validates storage quotas against logged-in user's tier and usage | Falls back to `user = 'kristos'` | **High**: Unauthenticated users can consume Kristos storage quota |
| `/api/subscription/upgrade` | `POST` | Upgrades logged-in user's subscription tier | Falls back to `user = 'kristos'` | **High**: Unauthenticated users can modify Kristos subscription |

---

## TypeScript Compilation Errors Affecting R1 & Build

Running `npx tsc --noEmit` identified the following build-blocking type errors:

1. **`src/app/admin/page.tsx`** (Lines 937, 954, 963, 978, 1152, 1160, 1168):
   - Property `helperText` does not exist on `GlassInputProps` (expected `helper`).
2. **`src/app/api/admin/users/route.ts`** (Lines 68, 72, 74):
   - Properties `displayName`, `avatarUrl`, and `customSubdomain` do not exist on `User` type (they reside on `User.portfolio`).
3. **`src/app/api/payment/initialize/route.ts`** (Lines 76, 151):
   - `Database.getPricing` does not exist on `Database` (expected `Database.getPricingConfig()`).
   - `u.displayName` does not exist on `User`.
4. **`src/app/api/payment/verify/route.ts`** (Lines 25, 71):
   - `Database.getPricing` does not exist on `Database` (expected `Database.getPricingConfig()`).
   - `Database.updateUser` does not exist on `Database` (expected `Database.saveUser`).
5. **`src/app/api/webhooks/flutterwave/route.ts`** (Line 67):
   - `Database.updateUser` does not exist on `Database` (expected `Database.saveUser`).

---

## Summary of Actionable Items for Implementers

1. **Fix Session Cookie Security**: Update `response.cookies.set('portfoli_session', ...)` to `httpOnly: true`. Implement a backend logout route (`/api/auth/logout`) to clear cookies securely.
2. **Remove Authentication Bypasses**: Remove `password === 'password123' || password === 'admin123' || storedHash.includes('Placeholder')` from `src/lib/auth.ts` and `src/app/api/auth/login/route.ts`.
3. **Implement Creator Password Update Endpoint**: Replace the simulated client-side `setTimeout` in `src/app/dashboard/settings/page.tsx` with a real `PUT /api/auth/password` or `PUT /api/portfolio` password update handler.
4. **Secure `/api/admin/payment-settings`**: Add `isAuthorizedAdmin` check to `GET` and `POST` in `src/app/api/admin/payment-settings/route.ts`. Provide a public telemetry endpoint for `GTMScript` to fetch only `gtmContainerId` and `ga4MeasurementId`.
5. **Fix User Roster Dates & Storage Metrics**:
   - Seed `startDate` and `endDate` in `data/users.json` for paid users so `getSubscriptionStatus` calculates accurate remaining days.
   - Fix property accesses (`u.portfolio?.displayName`, `u.portfolio?.avatarUrl`, `u.portfolio?.customSubdomain`) in `src/app/api/admin/users/route.ts`.
6. **Enforce Strict Authentication on Mutating Endpoints**: Require valid session token on `PUT /api/portfolio`, `POST /api/subscription/upgrade`, and `POST /api/media/upload`, rejecting unauthenticated requests with HTTP 401 instead of mutating `'kristos'`.
7. **Fix TypeScript Compiler Errors**: Correct `GlassInput` `helper` props in `src/app/admin/page.tsx`, and fix `Database.getPricingConfig()` and `Database.saveUser()` method calls.
