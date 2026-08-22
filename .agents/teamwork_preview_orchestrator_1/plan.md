# Project Plan: Portfoli Luxury Platform Audit & Verification

## Objective
Verify, audit, and fix all aspects of the Portfoli Luxury portfolio platform covering R1-R4, ensure zero-error Next.js production build, enforce security/pricing/quota constraints, and build full automated E2E test suites.

## Phases
1. **Phase 0: Survey & Scope Mapping**
   - Survey Auth, RBAC, Admin security, GTM inclusion/exclusion (R1).
   - Survey Pricing synchronization, Flutterwave OAuth2/3DES/webhook, Subscription lifecycle & storage/media limits (R2, R3).
   - Survey 5 luxury display modes, Subdomain routing, Public inquiries, Next.js build status, Test harness (R4, Build & E2E).
   - Produce `PROJECT.md` and `TEST_INFRA.md`.

2. **Phase 1: Dual Track Execution**
   - **Track A (Implementation & Fixes)**:
     - M1: Auth & Role-Based Authorization + GTM isolation
     - M2: Dynamic Pricing Sync & Flutterwave v4 Payment Security
     - M3: Subscription Transitions, Grace Period, Storage/Media Limits
     - M4: Portfolio Rendering (5 display modes), Subdomain Routing, Public Inquiries
   - **Track B (E2E Testing Suite Track)**:
     - Test infra, runner, mock server / fixtures
     - Tier 1: Feature Coverage (>=5 per feature)
     - Tier 2: Boundary & Corner Cases (>=5 per feature)
     - Tier 3: Cross-Feature Interactions & Tampering Security
     - Tier 4: Real-World Creator & Visitor Workflows
     - Publish `TEST_READY.md`

3. **Phase 2: Final Verification & Adversarial Hardening**
   - Run 100% E2E test suite against all endpoints and routes
   - Tier 5 White-box adversarial testing & gap closure
   - Next.js production build (`npm run build`) verification (0 errors, 0 type issues)
   - Final Forensic Audit & Sentinel Reporting
