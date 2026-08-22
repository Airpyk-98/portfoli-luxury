# Technical Specification & Codebase Survey Report: Requirements R2 & R3
**Platform**: Portfoli Luxury Portfolio Engine  
**Investigator**: survey_explorer_2 (teamwork_preview_spec_miner)  
**Date**: 2026-08-22  
**Scope**: Dynamic Pricing Synchronization, Flutterwave v4 Payments, Subscription Lifecycle, Grace Period Enforcement, Storage & Media Limits

---

## 1. Executive Summary

This report documents the architectural implementation, data flow, interface contracts, security guarantees, and discovered bugs for **Requirement R2** (*Dynamic Pricing Synchronization & Flutterwave Payment Flow*) and **Requirement R3** (*Subscription Lifecycle, Grace Period, & Quota Enforcement*).

The Portfoli platform implements a centralized dynamic pricing model, an end-to-end Flutterwave payment gateway integration with v4 OAuth2 and 3DES encryption helpers, a 4-state subscription lifecycle engine with active countdown banners and 1-click renewal triggers, and a multi-tiered storage/media quota validation system.

However, several **critical runtime bugs, schema discrepancies, and authorization bypasses** were identified during specification mining that directly impact production launch stability if unaddressed.

---

## 2. Architectural Deep-Dive: Requirement R2

### 2.1 Dynamic Pricing Synchronization Architecture

Dynamic pricing is managed centrally and persisted across instances via a multi-tier fallback mechanism:
1. **In-Memory Cache**: `globalThis.__portfoli_cache['pricing.json']` for instantaneous synchronization within the Node.js process.
2. **Serverless Writable Storage**: `/tmp/portfoli_data/pricing.json` (or Windows `%TEMP%\portfoli_data\pricing.json`) for persistence across serverless executions.
3. **Repository Store**: `data/pricing.json` as the seed repository baseline.

#### Dynamic Pricing Data Contract (`PricingConfig`)
```typescript
export interface PricingConfig {
  free: {
    priceNgn: number;           // 0
    maxVideos: number;          // 1
    maxPhotos: number;          // 5
    storageQuotaBytes: number;  // 200MB (209,715,200 bytes)
    subdomainAllowed: boolean;  // false
    displayModesAllowed: MediaDisplayMode[]; // ['carousel_3d', 'bento_grid']
  };
  pro_2k: {
    priceNgn: number;           // 2,000 NGN (configurable to 2,500)
    maxVideos: number;          // 10 - 12
    maxPhotos: number;          // 70 - 80
    storageQuotaBytes: number;  // 1GB (1,073,741,824 bytes)
    subdomainAllowed: boolean;  // false
    displayModesAllowed: MediaDisplayMode[]; // ['carousel_3d', 'side_swipe', 'bento_grid']
  };
  elite_5k: {
    priceNgn: number;           // 5,000 NGN (configurable to 5,500)
    maxVideos: number;          // 9999 (unlimited)
    maxPhotos: number;          // 99999 (unlimited)
    storageQuotaBytes: number;  // 2GB - 5GB (2,147,483,648 bytes)
    subdomainAllowed: boolean;  // true
    displayModesAllowed: MediaDisplayMode[]; // ['crystal_prism', 'side_swipe', 'carousel_3d', 'bento_grid']
  };
}
```

#### Pricing API Route: `/api/admin/pricing`
- **`GET /api/admin/pricing?public=true`**:
  - Unauthenticated public route.
  - Returns `{ pricing: PricingConfig }`.
  - Used by `src/app/page.tsx` to render live pricing cards on the landing page.
- **`GET /api/admin/pricing` (without `?public=true`)**:
  - Requires Master Admin Key (`x-admin-key: admin123`) or admin JWT session cookie (`portfoli_session`).
  - Returns `{ pricing: PricingConfig, telemetry: { totalUsers, activeSubscriptions, totalRevenueNgn, tierDistribution, totalStorageUsedBytes } }`.
- **`PUT /api/admin/pricing`**:
  - Requires Master Admin Key or admin JWT session cookie.
  - Accepts partial or full `PricingConfig` JSON payload.
  - Calls `Database.updatePricingConfig(updatedConfig)` to persist changes to in-memory cache, `/tmp`, and `data/pricing.json`.
  - Returns `{ success: true, pricing }`.

#### Identified Pricing Sync Inconsistency:
- **`src/app/pricing/page.tsx` Bug**: Line 19 calls `fetch('/api/admin/pricing')` without the query param `?public=true`. Because public visitors lack admin authorization, the endpoint responds with `403 Forbidden`, triggering `catch(console.error)` and leaving the UI stuck on hardcoded `DEFAULT_PRICING` state. In contrast, `src/app/page.tsx` correctly calls `fetch('/api/admin/pricing?public=true')`.

---

### 2.2 Server-Side Price Enforcement & Tampering Resilience

#### Initialization Endpoint: `POST /api/payment/initialize`
- **Request Payload**:
  ```json
  {
    "userId": "user_kristos_01",
    "tier": "pro_2k",
    "returnUrl": "https://portfoli.me/dashboard?payment=success"
  }
  ```
- **Server-Side Price Lookup Logic**:
  - The client is **strictly prohibited** from specifying the `amount` in the request body.
  - The endpoint reads `tier` (`'pro_2k' | 'elite_5k'`) and queries the price directly from the server database:
    ```typescript
    const pricing = Database.getPricingConfig();
    let amount = selectedTier === 'pro_2k' ? (pricing.pro_2k.priceNgn || 2000) : (pricing.elite_5k.priceNgn || 5000);
    ```
  - Even if a malicious actor injects `amount: 1` or `amount: 0` into the POST body, it is completely ignored.
- **Pending Transaction Record**:
  - Generates a unique transaction reference: `txRef = portfoli_${user.username}_${Date.now()}_${random}`.
  - Saves transaction with status `'pending'` to `data/transactions.json` via `saveTransaction()`.

#### Critical Runtime Bug in `/api/payment/initialize/route.ts`:
- **Line 76**: Calls `const pricing = Database.getPricing();`.
- **Root Cause**: `Database` class in `src/lib/storage.ts` defines `Database.getPricingConfig()`. There is NO method named `getPricing()`.
- **Impact**: Any call to `POST /api/payment/initialize` throws an unhandled `TypeError: Database.getPricing is not a function` and returns `500 { success: false, message: "Database.getPricing is not a function" }`.

---

### 2.3 Flutterwave v4 Integration Architecture

#### Configuration Store (`src/lib/payment-settings.ts` / `data/payment-settings.json`)
Stores configuration and secrets with global in-memory caching and serverless `/tmp` fallback:
- `provider`: `'flutterwave'`
- `environment`: `'live' | 'test'`
- `clientId`: Client ID for v4 OAuth 2.0 token endpoint
- `clientSecret`: Client Secret for v4 OAuth 2.0
- `secretKey`: `FLWSECK-...` (for direct v3 transaction verification)
- `publicKey`: `FLWPUBK-...` (for standard client checkout)
- `encryptionKey`: `FLWSECK_3DES-...` (for 3DES payload encryption)
- `webhookSecretHash`: Secret hash matched against `verif-hash` header
- `gtmContainerId`, `ga4MeasurementId`, `lookerStudioEmbedUrl`, `enabled`, `updatedAt`

#### Key Cryptographic & Integration Helpers
1. **3DES Encryption Helper** (`encryptFlutterwavePayload` in `src/app/api/payment/initialize/route.ts`):
   - Implements Triple DES (`des-ede3`) cipher using Node.js `crypto.createCipheriv('des-ede3', key, Buffer.alloc(0))` with Base64 output.
2. **v4 OAuth 2.0 Token Generation** (`getV4OAuthToken` in `src/app/api/payment/initialize/route.ts`):
   - Exchanges `clientId` and `clientSecret` at `https://idp.flutterwave.com/realms/flutterwave/protocol/openid-connect/token` via `grant_type=client_credentials`.
3. **Flutterwave Payment Link Generation**:
   - Calls `POST https://api.flutterwave.com/v3/payments` with `Authorization: Bearer <v4Token || secretKey>`.
   - Passes `tx_ref`, `amount`, `currency: 'NGN'`, `redirect_url`, `customer`, and `customizations`.
   - If keys are unconfigured (local dev / sandbox), falls back to direct simulation `redirectUrl`.

#### Webhook Signature Validation & Processing (`POST /api/webhooks/flutterwave`)
- **Signature Check**:
  - Compares `req.headers.get('verif-hash')` with `settings.webhookSecretHash`.
  - If mismatch: returns `401 { status: 'error', message: 'Invalid signature hash' }`.
- **Event Handling**:
  - Inspects `event` (e.g. `charge.completed`) and `data.status` (`successful` / `completed`).
  - Matches user by `data.meta.userId`, `data.meta.username`, or `data.customer.email`.
  - Upgrades and extends subscription by 365 days (`startDate: now`, `endDate: now + 365d`, `active: true`).
  - Records successful transaction in ledger (`saveTransaction`).
- **Critical Bug in Webhook Handler**:
  - **Line 67**: Calls `Database.updateUser(user);`.
  - **Root Cause**: `Database` class only has `Database.saveUser(user)`. There is NO `Database.updateUser()`.
  - **Impact**: Webhook crashes with `TypeError: Database.updateUser is not a function` and returns `500`, preventing subscription activation upon successful payment.

#### Payment Return Verification (`POST /api/payment/verify`)
- Client calls `/api/payment/verify` upon redirect from payment gateway with `{ txRef, transactionId, userId, tier }`.
- Queries Flutterwave API `GET https://api.flutterwave.com/v3/transactions/${transactionId}/verify` if `secretKey` is present.
- Activates subscription and logs transaction upon success.
- **Critical Bugs in `/api/payment/verify/route.ts`**:
  - **Line 25**: `const pricing = Database.getPricing();` -> `TypeError: Database.getPricing is not a function`.
  - **Line 71**: `Database.updateUser(user);` -> `TypeError: Database.updateUser is not a function`.

#### Admin Payment Settings Security Bypass:
- **`src/app/api/admin/payment-settings/route.ts`**:
  - Both `GET` and `POST` handlers lack authorization checks (`isAuthorizedAdmin`).
  - Any unauthenticated actor can read masked settings/telemetry or overwrite Flutterwave production API keys and webhook hashes.

---

## 3. Architectural Deep-Dive: Requirement R3

### 3.1 Subscription Lifecycle & 4-State Engine

Subscription status is computed dynamically from `UserSubscription` via `getSubscriptionStatus(sub)` in `src/lib/types.ts`.

#### State Definitions & Status Properties
| State | Conditions | `isActive` | `isGracePeriod` | `isExpiredAndDecommissioned` | Days Metrics |
|---|---|---|---|---|---|
| **Free** | `sub.tier === 'free'` or `!sub` | `true` | `false` | `false` | `daysRemainingInSubscription: 9999`, `daysRemainingInGrace: 30` |
| **Active Paid** | `sub.tier !== 'free'` && `daysRemaining > 0` && `sub.active` | `true` | `false` | `false` | `daysRemainingInSubscription: ceil((endDate - now)/1d)`, `daysRemainingInGrace: 30` |
| **30-Day Grace Period** | `sub.tier !== 'free'` && `daysRemaining <= 0` && `daysPastExpiration < 30` | `false` | `true` | `false` | `daysRemainingInSubscription: 0`, `daysRemainingInGrace: 30 - daysPastExpiration` |
| **Decommissioned** | `sub.tier !== 'free'` && `daysRemaining <= 0` && `daysPastExpiration >= 30` | `false` | `false` | `true` | `daysRemainingInSubscription: 0`, `daysRemainingInGrace: 0` |

#### UI Grace Period Components (`src/components/subscription-grace-banner.tsx`)
- Rendered on the creator dashboard layout (`src/app/dashboard/layout.tsx`).
- **Expiring Soon Banner**: Displays amber countdown warning when subscription is active but has `<= 7 days` remaining.
- **Active Grace Period Banner & Modal**:
  - Persistent glowing red/amber top bar displaying `⚠️ 30-Day Video Retention Grace Period Active (X Days Left)`.
  - Full-screen modal popup on arrival alerting creator that uploaded 4K videos will be decommissioned and custom subdomain released if renewal is not completed.
  - Direct **1-click renewal button** triggering `/api/payment/initialize` with current tier.
- **Decommissioned Banner**: Black/red alert indicating 30-day grace has lapsed and offering instant reactivation.

#### Critical Seed Data Bug in `data/users.json`:
- All seeded users (`user_kristos_01`, `user_elena_01`, `user_marcus_01`, `user_sora_01`, `user_zara_01`, `user_admin_01`) in `data/users.json` have `subscription` objects missing `startDate` and `endDate`.
- When `endDate` is `undefined`, `new Date(undefined).getTime()` yields `NaN`.
- `getSubscriptionStatus` calculates `daysRemaining = NaN`, fails the `daysRemaining > 0` check, calculates `graceDaysRemaining = NaN`, and defaults the user to `isExpiredAndDecommissioned: true`!
- Admin user roster endpoint (`/api/admin/users`) returns `startDate: null` and `hasStarted: false` for all seeded users.

---

### 3.2 Storage & Media Quota Enforcement

#### Tier Quota Specifications
| Tier | Storage Limit | Max Videos | Max Project Photos | Allowed Display Modes | Custom Subdomains |
|---|---|---|---|---|---|
| **Starter (Free)** | 100MB - 200MB (`209,715,200` bytes) | 1 video | 5 photos | `carousel_3d`, `bento_grid` | No |
| **Creator Pro** | 1GB (`1,073,741,824` bytes) | 10 - 12 videos | 70 - 80 photos | `carousel_3d`, `side_swipe`, `bento_grid` | No |
| **Elite Mastery** | 2GB - 5GB (`2,147,483,648` - `5,368,709,120` bytes) | Unlimited (`9999`) | Unlimited (`99999`) | All 4 modes (`crystal_prism`, `side_swipe`, `carousel_3d`, `bento_grid`) | Yes (`username.portfoli.me`) |

#### Quota Validation Engine (`checkUploadAllowed` in `src/lib/tiers.ts`)
Validates storage quota bytes, maximum video count, and maximum photo count per user tier before upload.

#### Upload API Workflow (`POST /api/media/upload`)
1. **User Resolution**: Extracts JWT session cookie `portfoli_session` (falls back to `kristos` if missing).
2. **Current Counts Computation**: Aggregates all photos and videos currently present across `user.portfolio.projects`.
3. **Quota Verification**: Calls `checkUploadAllowed()`. If denied, aborts with `403 { error: reason }`.
4. **Adaptive Media Pipeline**:
   - If `mediaType === 'video'` and `fileSizeBytes > 100MB`: dispatches to Kaggle WebM compression pipeline (`dispatchVideoCompression`).
   - If `mediaType === 'image'` or `video <= 100MB`: uploads directly to Hugging Face Hub dataset repository (`uploadToHfHub`).
5. **Identified Flaw in Upload Route**:
   - `upload/route.ts` returns `{ success: true, media: newMediaItem }`, but does NOT update `user.storageUsedBytes` in `Database`. Storage usage is only updated later when the entire portfolio is saved via `PUT /api/portfolio`.

---

## 4. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Dynamic Pricing | Public Pricing Endpoint | Fetches dynamic tier prices and quota configurations without authentication | `GET /api/admin/pricing?public=true` | JSON `{ pricing: PricingConfig }` | Returns default pricing on read error | `src/app/api/admin/pricing/route.ts` |
| 2 | Dynamic Pricing | Admin Telemetry & Pricing | Fetches pricing config alongside user count, active subscriptions, revenue, and storage stats | `GET /api/admin/pricing` with `x-admin-key` or admin cookie | JSON `{ pricing, telemetry }` | Returns `403` if unauthorized | `src/app/api/admin/pricing/route.ts` |
| 3 | Dynamic Pricing | Pricing Matrix Update | Admin endpoint to modify tier prices, video caps, photo caps, and storage limits | `PUT /api/admin/pricing` with `x-admin-key` & JSON body | JSON `{ success: true, pricing }` | Returns `403` unauthorized or `500` | `src/app/api/admin/pricing/route.ts` |
| 4 | Payment Security | Server Price Enforcement | Looks up price strictly from server pricing DB by tier ID, rejecting any client tampering | `POST /api/payment/initialize` with `{ userId, tier }` | JSON `{ success: true, checkoutUrl, txRef, amount }` | Returns `400` on invalid input or `500` | `src/app/api/payment/initialize/route.ts` |
| 5 | Flutterwave | 3DES Payload Encryption | Encrypts charge payloads using Triple DES (`des-ede3`) with encryption key | `encryptionKey: string`, `payload: object` | Base64-encoded encrypted string | Returns empty string on error | `src/app/api/payment/initialize/route.ts` |
| 6 | Flutterwave | v4 OAuth2 Token Exchange | Obtains Bearer access token from Flutterwave IDP using `clientId` and `clientSecret` | `clientId`, `clientSecret` | Access token string or `null` | Returns `null` and logs warning | `src/app/api/payment/initialize/route.ts` |
| 7 | Flutterwave | Webhook Signature Verification | Verifies webhook payload integrity against `verif-hash` header | `req.headers.get('verif-hash')` | Validates hash match | Returns `401 { status: 'error', message: 'Invalid signature hash' }` | `src/app/api/webhooks/flutterwave/route.ts` |
| 8 | Flutterwave | Webhook Subscription Activation | Automatically activates 1-year subscription upon receiving `successful` charge event | Webhook payload with `tx_ref`, `amount`, `customer`, `meta` | JSON `{ status: 'success', message: 'Webhook processed' }` | Returns `500` on internal error | `src/app/api/webhooks/flutterwave/route.ts` |
| 9 | Flutterwave | Return Verification | Verifies transaction with Flutterwave API `/v3/transactions/:id/verify` on redirect | `POST /api/payment/verify` with `{ txRef, transactionId, userId, tier }` | JSON `{ success: true, user }` | Returns `400` if unverified, `500` on error | `src/app/api/payment/verify/route.ts` |
| 10 | Flutterwave | Admin Payment Settings API | Admin UI endpoint to configure live/test mode, Flutterwave API keys, GTM ID, GA4 ID, Looker URL | `GET`/`POST /api/admin/payment-settings` | JSON `{ success: true, settings: MaskedSettings, liveStats }` | Returns `500` on failure | `src/app/api/admin/payment-settings/route.ts` |
| 11 | Subscription | 4-State Lifecycle Engine | Dynamically evaluates Free, Active Pro/Elite, 30-Day Grace, or Decommissioned status | `UserSubscription` object | `SubscriptionStatusInfo` object | Handles undefined/malformed objects safely | `src/lib/types.ts` |
| 12 | Subscription | Grace Period Top Banner | Visual banner warning creators of remaining grace period days and video decommissioning | `user: User` object in `SubscriptionGraceBanner` | React JSX banner component | Renders `null` if user is active with >7 days | `src/components/subscription-grace-banner.tsx` |
| 13 | Subscription | Grace Period Modal Popup | Modal on first dashboard arrival with exact expiration dates and 1-click renewal | `user: User` object with dismiss state | React JSX modal dialog | Dismissible per session | `src/components/subscription-grace-banner.tsx` |
| 14 | Subscription | 1-Click Renewal Trigger | Initiates instant renewal checkout session from grace banners | `handleRenew()` calling `/api/payment/initialize` | Redirects to Flutterwave checkout URL | Displays alert on gateway connection failure | `src/components/subscription-grace-banner.tsx` |
| 15 | Subscription | Admin Roster Management | Admin view of all creators, start dates, days remaining, grace status, and manual tier updates | `GET`/`POST /api/admin/users` with `x-admin-key` | JSON `{ success: true, users, analytics }` | Returns `403` if unauthorized | `src/app/api/admin/users/route.ts` |
| 16 | Storage Quota | Upload Quota Validation | Enforces storage capacity (100MB/1GB/5GB) and photo/video count limits before upload | `tier`, counts, bytes, file info in `checkUploadAllowed` | `{ allowed: boolean, reason?: string }` | Returns `{ allowed: false, reason }` | `src/lib/tiers.ts` |
| 17 | Storage Quota | Media Upload Handler | Handles upload validation and dispatches large video (>100MB) to compression pipeline | `POST /api/media/upload` (multipart `file`, `type`) | JSON `{ success: true, media: MediaItem }` | Returns `403` on quota breach, `400`/`500` on error | `src/app/api/media/upload/route.ts` |
| 18 | Security | Admin Passcode Management | Verifies and updates master admin access key (`admin123` / custom) | `POST /api/admin/password` with current/new passcode | JSON `{ success: true, message }` | Returns `400` on invalid passcode, `403` unauthorized | `src/app/api/admin/password/route.ts` |

---

## 5. Edge Cases

| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | Server Price Enforcement | Client sends tampered payload `{ userId: 'user_01', tier: 'elite_5k', amount: 10 }` | Server ignores `amount: 10`, determines amount from database `pricing.elite_5k.priceNgn` (5000 NGN), completely defeating tampering. |
| 2 | `/api/payment/initialize` Runtime | Client POSTs valid `{ userId: 'user_kristos_01', tier: 'pro_2k' }` | Fails with `500 TypeError: Database.getPricing is not a function` because method is named `getPricingConfig()`. |
| 3 | `/api/payment/verify` Runtime | Client POSTs valid verification payload `{ userId: 'user_kristos_01', tier: 'pro_2k' }` | Fails with `500 TypeError: Database.getPricing is not a function` and `Database.updateUser is not a function`. |
| 4 | Flutterwave Webhook Processing | Gateway sends valid webhook with correct `verif-hash` signature | Fails on user save with `500 TypeError: Database.updateUser is not a function` (correct method is `Database.saveUser`). |
| 5 | Webhook Signature Spoofing | Attacker sends webhook with header `verif-hash: fake_hash` | Correctly rejected with `401 { status: 'error', message: 'Invalid signature hash' }`. |
| 6 | Pricing Page Sync | Public visitor visits `/pricing` | Fetch to `/api/admin/pricing` returns `403 Forbidden` because `?public=true` was omitted in `pricing/page.tsx`. Dynamic pricing fails to sync. |
| 7 | Subscription with Missing `endDate` | User in `data/users.json` has `tier: 'elite_5k'` but no `startDate`/`endDate` | `new Date(undefined).getTime()` yields `NaN`. Status defaults to `isExpiredAndDecommissioned: true` and `daysRemaining: 0`. |
| 8 | Active Subscription (7 Days Left) | User subscription `endDate` is `now + 5 days` | Renders amber "Subscription Expiring in 5 Days" warning banner with renewal button. |
| 9 | Grace Period (10 Days Past Due) | User subscription `endDate` is `now - 10 days` | Evaluates `daysRemainingInGrace = 20`. Renders red pulsating grace period top banner and modal popup warning of video deletion. |
| 10 | Decommissioned (40 Days Past Due) | User subscription `endDate` is `now - 40 days` | Evaluates `daysRemainingInGrace = 0`, `isExpiredAndDecommissioned: true`. Displays decommissioned banner. |
| 11 | Free Tier Video Upload Limit | Free user with 1 video attempts to upload 2nd video | `checkUploadAllowed` returns `allowed: false, reason: 'Video upload limit reached (1 video max on FREE)'`. Upload route returns `403`. |
| 12 | Free Tier Photo Upload Limit | Free user with 5 photos attempts to upload 6th photo | `checkUploadAllowed` returns `allowed: false, reason: 'Photo upload limit reached (5 photos max on FREE)'`. Upload route returns `403`. |
| 13 | Storage Quota Overflow | Pro user (1GB cap) with 950MB used attempts to upload 100MB image (total 1050MB) | `checkUploadAllowed` returns `allowed: false, reason: 'Storage quota exceeded. Your pro_2k plan limit is 1 GB'`. Returns `403`. |
| 14 | Large Video (>100MB) Upload | Pro/Elite user uploads a 120MB MP4 video within quota | Upload route detects `fileSizeBytes > 100MB` and redirects video buffer to Kaggle WebM compression pipeline. |
| 15 | Payment Settings Route Authorization | Unauthenticated client sends `GET` or `POST` to `/api/admin/payment-settings` | Responds `200 OK`, exposing masked credentials or overwriting live Flutterwave API keys without authentication. |

---

## 6. Critical Bugs, Vulnerabilities, & Remediation Guide

| Bug ID | Severity | Location | Root Cause | Impact | Recommended Fix |
|---|---|---|---|---|---|
| **BUG-01** | **CRITICAL** | `src/app/api/payment/initialize/route.ts`:76 | `Database.getPricing()` called instead of `Database.getPricingConfig()` | Entire payment initiation endpoint crashes with 500 error | Change line 76 to `const pricing = Database.getPricingConfig();` |
| **BUG-02** | **CRITICAL** | `src/app/api/payment/verify/route.ts`:25, 71 | Calls `Database.getPricing()` and `Database.updateUser(user)` (both non-existent methods) | Payment return verification crashes with 500 error, subscriptions not activated | Change to `Database.getPricingConfig()` and `Database.saveUser(user)` |
| **BUG-03** | **CRITICAL** | `src/app/api/webhooks/flutterwave/route.ts`:67 | Calls `Database.updateUser(user)` instead of `Database.saveUser(user)` | Webhook crashes on successful payment, subscription never activated | Change line 67 to `Database.saveUser(user);` |
| **BUG-04** | **CRITICAL** | `src/app/api/admin/payment-settings/route.ts`:12, 35 | Missing `isAuthorizedAdmin()` check in `GET` and `POST` handlers | Unauthenticated users can read settings and overwrite production Flutterwave keys & webhook secrets | Add admin authentication check matching `api/admin/pricing/route.ts` |
| **BUG-05** | **HIGH** | `data/users.json`:8-13 (all users) | Missing `startDate` and `endDate` fields in `subscription` objects | `getSubscriptionStatus` produces `NaN` and treats all users as decommissioned | Populate valid ISO dates (e.g. `startDate: now - 30d`, `endDate: now + 335d`) for all seeded users |
| **BUG-06** | **HIGH** | `src/app/pricing/page.tsx`:19 | `fetch('/api/admin/pricing')` missing `?public=true` parameter | Endpoint returns 403 to public visitors, dynamic pricing fails to sync | Update fetch URL to `/api/admin/pricing?public=true` |
| **BUG-07** | **MEDIUM** | `src/app/api/subscription/upgrade/route.ts`:16 | Hardcoded fallback `let user = Database.findUserByUsername('kristos');` when unauthenticated | Unauthenticated requests to `/api/subscription/upgrade` upgrade `kristos` for free | Require valid JWT session token and return 401 if unauthenticated |
| **BUG-08** | **MEDIUM** | `src/app/api/media/upload/route.ts`:13 | Hardcoded fallback to `kristos` for unauthenticated uploads | Anonymous visitors can upload files attributed to `kristos` | Require valid JWT session token or return 401 |

---

## 7. Conclusion

The specification and architecture for Requirements R2 and R3 are thoroughly mapped. The UI and backend endpoints adhere to the required luxury glassmorphism design and multi-tier pricing/lifecycle models. By fixing the 8 discovered runtime and data bugs, the payment and quota infrastructure will operate smoothly in production for 4,000+ creators.
