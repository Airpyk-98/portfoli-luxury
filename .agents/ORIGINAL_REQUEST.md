# Original User Request

## 2026-08-22T09:00:58Z

Perform end-to-end behavioral testing, automated verification, security auditing, and real-world user/admin simulation for the Portfoli Luxury portfolio platform prior to production launch to over 4,000 users.

Working directory: c:\Users\DELL\Documents\antigravity\quirky-kepler
Integrity mode: development

## Requirements

### R1. Authentication & Role-Based Authorization Auditing
- Verify multi-user isolation, credential validation, JWT session cookie protection, and password updating.
- Verify that administrative endpoints (/api/admin/*) strictly reject unauthenticated requests and correctly authenticate valid master keys (dmin123 and custom saved keys).
- Verify that Google Tag Manager is rendered on all creator and public pages (/, /[username], /pricing, /dashboard/*) and strictly excluded from /admin.

### R2. Dynamic Pricing Synchronization & Flutterwave Payment Flow
- Verify that changing pricing values in /admin immediately reflects on the landing page, /pricing, modals, and checkout triggers.
- Verify that payment initialization (/api/payment/initialize) queries prices strictly from the server database, rejecting client tampering.
- Verify Flutterwave v4 OAuth 2.0 token generation, 3DES encryption key helper, webhook signature validation (erif-hash), and return verification (/api/payment/verify).

### R3. Subscription Lifecycle, Grace Period, & Quota Enforcement
- Test subscription transitions across all states: Free, Active Pro/Elite, 30-Day Grace Period, and Decommissioned.
- Verify that grace period banners and modal popups accurately display the remaining day countdown and direct 1-click renewal.
- Verify that storage limits (100MB, 1GB, 5GB) and media limits (photos/videos) are strictly enforced during upload operations (/api/media/upload).

### R4. Portfolio Rendering, Media Display Modes, & Custom Subdomains
- Verify responsive rendering of all 5 luxury display modes: 3D Crystal Prism, Carousel 3D, Fluid Horizontal Swipe, Bento Matrix, and Side-Swipe.
- Verify custom subdomain mapping (subdomain.portfoli.me) and standard route mapping (portfoli.me/[username]).
- Verify inquiry submission from public visitor to creator dashboard.

## Acceptance Criteria

### Automated & Functional Verification
- [ ] Next.js production build (
pm run build) completes with 0 errors and 0 type issues.
- [ ] Automated end-to-end API test script executes and verifies status 200 on all public, creator, and admin endpoints.
- [ ] Direct price tampering test confirms server-side price enforcement.
- [ ] User roster management API (/api/admin/users) returns accurate subscription start dates, days left, and storage metrics.
- [ ] GTM script injection test confirms inclusion on public pages and absence on /admin.
