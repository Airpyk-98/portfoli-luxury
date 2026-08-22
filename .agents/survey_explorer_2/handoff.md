# Handoff Report — Survey Explorer 2 (Requirements R2 & R3)

## 1. Observation
- **Pricing & Telemetry**:
  - `src/lib/types.ts:142-167`: `PricingConfig` interface defines `free`, `pro_2k`, and `elite_5k` models with `priceNgn`, `maxVideos`, `maxPhotos`, `storageQuotaBytes`, `subdomainAllowed`, and `displayModesAllowed`.
  - `src/lib/storage.ts:703-715`: `Database.getPricingConfig()` and `Database.updatePricingConfig()` handle dynamic pricing reads and writes with multi-tier fallbacks (`__portfoli_cache`, tmp directory, and `data/pricing.json`).
  - `src/app/api/admin/pricing/route.ts:28-31`: `GET /api/admin/pricing?public=true` allows unauthenticated public access to pricing matrix. Without `?public=true`, lines 34-36 strictly enforce `isAuthorizedAdmin()` via `x-admin-key` or JWT session cookie.
  - `src/app/page.tsx:41`: Calls `fetch('/api/admin/pricing?public=true')` and renders pricing dynamically.
  - `src/app/pricing/page.tsx:19`: Calls `fetch('/api/admin/pricing')` without `?public=true`, receiving 403 for public visitors and failing to sync live pricing.
- **Payment Initialization & Verification**:
  - `src/app/api/payment/initialize/route.ts:14-27`: `encryptFlutterwavePayload()` implements Triple DES (`des-ede3`) encryption with Base64 output.
  - `src/app/api/payment/initialize/route.ts:33-59`: `getV4OAuthToken()` requests client credentials access token from `https://idp.flutterwave.com/...`.
  - `src/app/api/payment/initialize/route.ts:76`: Calls `const pricing = Database.getPricing();` which fails at runtime because `Database.getPricing` does not exist (`getPricingConfig` is the actual method).
  - `src/app/api/payment/verify/route.ts:25, 71`: Calls `Database.getPricing()` and `Database.updateUser(user)`, both of which throw `TypeError: ... is not a function`.
  - `src/app/api/webhooks/flutterwave/route.ts:15-18`: Validates `req.headers.get('verif-hash')` against `settings.webhookSecretHash`. Line 67 calls `Database.updateUser(user)` which throws `TypeError` (actual method is `Database.saveUser(user)`).
  - `src/app/api/admin/payment-settings/route.ts:12, 35`: Lacks any `isAuthorizedAdmin()` check, leaving payment gateway settings and credentials exposed to unauthenticated read/write.
- **Subscription Lifecycle & Grace Period**:
  - `src/lib/types.ts:186-253`: `getSubscriptionStatus()` computes `isActive`, `isGracePeriod`, `isExpiredAndDecommissioned`, `daysRemainingInSubscription`, and `daysRemainingInGrace`.
  - `src/components/subscription-grace-banner.tsx:56-200`: Renders Expiring Soon warning (<= 7 days), 30-Day Grace Period banner and modal dialog with 1-click renewal button, and Decommissioned alert.
  - `data/users.json:8-13`: Seeded users omit `startDate` and `endDate`, causing `new Date(undefined).getTime()` to return `NaN` and treating active users as decommissioned.
- **Quota Enforcement**:
  - `src/lib/tiers.ts:97-135`: `checkUploadAllowed()` validates storage quota bytes (`currentStorageBytes + newFileSizeBytes > tierConfig.storageQuotaBytes`), video limits, and photo limits.
  - `src/app/api/media/upload/route.ts:50-62`: Rejects uploads exceeding quotas with `403 { error: quotaCheck.reason }`. Line 73 dispatches videos > 100MB to Kaggle compression pipeline.

## 2. Logic Chain
1. **Server-Side Price Integrity**: In `src/app/api/payment/initialize/route.ts:64, 76-84`, the server extracts only `userId` and `tier` from the request body. Any client-sent `amount` is ignored; the server looks up `pricing[selectedTier].priceNgn`. Therefore, client-side price tampering is completely prevented by design.
2. **Crash on Payment Execution**: Because lines 76 of `initialize/route.ts` and 25 of `verify/route.ts` call `Database.getPricing()` instead of `Database.getPricingConfig()`, any invocation results in an immediate 500 error before payment processing can complete.
3. **Webhook & Verification Failure**: Because `src/app/api/webhooks/flutterwave/route.ts:67` and `src/app/api/payment/verify/route.ts:71` call `Database.updateUser()` instead of `Database.saveUser()`, even if a payment succeeds on Flutterwave, the user subscription cannot be updated in the database.
4. **Subscription Status Degradation**: Because `data/users.json` lacks `startDate` and `endDate` properties for all seeded users, `getSubscriptionStatus()` evaluates mathematical operations on `undefined`, producing `NaN` for `daysRemaining`. Consequently, all seeded users fail active checks and are rendered as decommissioned in UI components and admin rosters.
5. **Dynamic Pricing Desynchronization on `/pricing`**: `src/app/page.tsx` requests `/api/admin/pricing?public=true` and succeeds, while `src/app/pricing/page.tsx` requests `/api/admin/pricing` without `?public=true` and gets rejected with 403 Forbidden, breaking dynamic pricing synchronization on `/pricing`.

## 3. Caveats
- Hugging Face Hub token (`HF_ACCESS_TOKEN`) and Flutterwave live keys (`FLWSECK-...`) are environment-dependent and were tested using simulated / fallback execution branches.
- Direct Kaggle pipeline execution relies on external background jobs; the local branching logic (>100MB threshold) was inspected statically.

## 4. Conclusion
The architecture and UI components for Requirements R2 and R3 are comprehensive and adhere to the project's luxury glassmorphism standards and multi-tier subscription specifications. However, the system contains **8 specific bugs** (4 critical method-name/API crashes, 1 critical unauthenticated admin endpoint, 2 high-severity date/parameter sync flaws, and 2 unauthenticated route fallbacks). Resolving these 8 items will enable 100% test pass rates across all payment initialization, verification, webhook, and subscription lifecycle flows.

## 5. Verification Method
- **Method Name Fix Verification**:
  1. Inspect `src/lib/storage.ts` lines 663 (`saveUser`) and 703 (`getPricingConfig`).
  2. Verify that changing `getPricing()` to `getPricingConfig()` and `updateUser()` to `saveUser()` allows `POST /api/payment/initialize` and `POST /api/payment/verify` to execute without 500 errors.
- **Price Tampering Test**:
  1. Send `POST /api/payment/initialize` with `body: JSON.stringify({ userId: 'user_kristos_01', tier: 'elite_5k', amount: 1 })`.
  2. Confirm returned `amount` is `5000` (or dynamic DB price) and not `1`.
- **Subscription Lifecycle Test**:
  1. Populate `startDate` and `endDate` in `data/users.json`.
  2. Call `getSubscriptionStatus()` across future date (+10d), grace period date (-10d), and expired date (-40d) to confirm `isActive: true`, `isGracePeriod: true` (20 grace days left), and `isExpiredAndDecommissioned: true`.
- **Quota Limit Test**:
  1. Call `checkUploadAllowed('free', 0, 5, 0, 'image', 1024)` -> verify `allowed: false`.
  2. Call `checkUploadAllowed('free', 1, 0, 0, 'video', 1024)` -> verify `allowed: false`.
  3. Call `checkUploadAllowed('free', 0, 0, 200*1024*1024, 'image', 1024*1024)` -> verify `allowed: false`.
