# E2E Test Infra: Portfoli Luxury Platform

## Test Philosophy
- Requirement-driven, opaque-box and API-level behavioral testing.
- Independent of internal implementation quirks, verifying true protocol, security, and rendering guarantees.
- Methodology: Multi-tier testing (Feature coverage, Boundaries & Corner cases, Cross-feature interactions & Price Tampering, Real-world creator/visitor scenarios, Adversarial hardening).

## Feature Inventory & Test Mapping
| # | Feature | Requirement Source | Tier 1 (Feature) | Tier 2 (Boundary) | Tier 3 (Cross/Security) | Tier 4 (Scenario) |
|---|---------|-------------------|:----------------:|:-----------------:|:-----------------------:|:-----------------:|
| 1 | Multi-user isolation & JWT cookies | R1 §1 | >=5 tests | >=5 tests | ✓ | ✓ |
| 2 | Admin Master Key Authentication | R1 §2 | >=5 tests | >=5 tests | ✓ | ✓ |
| 3 | GTM Script Injection & Admin Exclusion | R1 §3 | >=5 tests | >=5 tests | ✓ | ✓ |
| 4 | Dynamic Pricing Sync across Pages | R2 §1 | >=5 tests | >=5 tests | ✓ | ✓ |
| 5 | Server-Side Price Enforcement | R2 §2 | >=5 tests | >=5 tests | ✓ (Tamper) | ✓ |
| 6 | Flutterwave v4 Token / 3DES / Webhook | R2 §3 | >=5 tests | >=5 tests | ✓ | ✓ |
| 7 | Subscription Lifecycle & Grace Period | R3 §1, §2 | >=5 tests | >=5 tests | ✓ | ✓ |
| 8 | Media & Storage Quota Limits | R3 §3 | >=5 tests | >=5 tests | ✓ | ✓ |
| 9 | 5 Luxury Display Modes Rendering | R4 §1 | >=5 tests | >=5 tests | ✓ | ✓ |
| 10 | Custom Subdomains vs Route Mapping | R4 §2 | >=5 tests | >=5 tests | ✓ | ✓ |
| 11 | Public Inquiries Submission & Inbox | R4 §3 | >=5 tests | >=5 tests | ✓ | ✓ |
| 12 | Admin User Roster Metrics | AC §4 | >=5 tests | >=5 tests | ✓ | ✓ |

## Test Architecture
- **E2E API Test Runner**: `scripts/run-e2e-api-tests.mjs` or `scripts/test-e2e-api.mjs`.
- **Pass / Fail Semantics**: Zero failures (exit code 0). Every test case validates status code, payload schema, security headers, and data persistence.
- **Adversarial Tests (Tier 5)**:
  1. Price tampering attempts: `POST /api/payment/initialize` with injected low prices (`amount: 1`, `amount: 0`, `amount: -100`).
  2. Unauthenticated admin access: `POST /api/admin/payment-settings` and `POST /api/admin/pricing` with missing or invalid keys.
  3. Session hijacking / cookie attribute verification: `httpOnly`, `sameSite`, `secure`.
  4. Quota overflow: `POST /api/media/upload` exceeding bytes/photos/videos limits.
  5. Inactive/decommissioned user behavior vs active subscriber renewal.

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Expected Outcome |
|---|----------|--------------------|------------------|
| 1 | Creator Onboarding & Luxury Profile Setup | Auth, Portfolio update, Display mode selection | User created, profile saved, displayed on `/[username]` |
| 2 | Dynamic Pricing Change & Visitor Checkout | Admin pricing update, `/pricing` sync, `/api/payment/initialize` | New price synced to frontend, server enforces new price |
| 3 | Subscription Expiration & 1-Click Grace Renewal | Grace period countdown, renewal payment verify, active restore | Grace banner shown, payment verified, subscription extended |
| 4 | Visitor Inquiry to Creator Inbox | Public portfolio view, `POST /api/inquiries`, dashboard fetch | Inquiry stored, visible in creator inbox with `mailto:` link |
| 5 | Storage Limit Reached & Pro Tier Upgrade | Free user uploads 5 photos -> rejected on 6th -> upgrades | Quota 403 on limit, allowed after tier upgrade |
