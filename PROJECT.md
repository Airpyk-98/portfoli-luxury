# Project: Portfoli Luxury Platform Audit, Security Hardening & Automated Verification

## Architecture
Portfoli Luxury is a Next.js 14 App Router platform designed for luxury creators, models, and photographers.
- **Frontend / Presentation**: React 18, Tailwind CSS, Framer Motion, Lucide React, Glassmorphism design tokens.
- **5 Display Modes**: 3D Crystal Prism, Carousel 3D, Fluid Horizontal Swipe, Bento Matrix, Side-Swipe.
- **Routing & Subdomains**: Next.js Edge Middleware (`src/middleware.ts`) rewriting `*.portfoli.site` to `/[username]`.
- **Backend / APIs**: Next.js Route Handlers (`src/app/api/*`) for auth, admin, inquiries, media uploads, pricing, and payments.
- **Data Layer**: File-backed database (`src/lib/storage.ts`) with caching for `users.json`, `pricing.json`, `inquiries.json`, and `payment-settings.json`.
- **Payment & External**: Flutterwave v4 OAuth2, 3DES encryption helper (`des-ede3`), Webhook signature validation (`verif-hash`).
- **Analytics**: Google Tag Manager (`src/components/gtm-script.tsx`) loaded conditionally across public & creator routes, excluded from `/admin`.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Multi-user isolation & credential validation | Secure JWT cookie auth (`httpOnly`, `sameSite`, `secure`), logout endpoint | M1 | Survey Explorer 1 / R1 |
| 2 | Admin Master Key Authentication | Master keys (`admin123`, `portfoli_admin_2026`, custom saved keys) on `/api/admin/*` | M1 | Survey Explorer 1 / R1 |
| 3 | Admin Payment Settings Security | Protect `/api/admin/payment-settings` with `isAuthorizedAdmin()` | M1 | Survey Explorer 1, 2 / R1 |
| 4 | Creator Password Update | Endpoint `/api/auth/update-password` with bcrypt/scrypt hash update | M1 | Survey Explorer 1 / R1 |
| 5 | GTM Script Injection & Admin Exclusion | Inject GTM on public/creator pages, strictly exclude on `/admin` | M1 | Survey Explorer 1 / R1 |
| 6 | Dynamic Pricing Synchronization | Synchronize live pricing to landing page, `/pricing`, modals, checkout triggers | M2 | Survey Explorer 2 / R2 |
| 7 | Server-Side Price Enforcement | `/api/payment/initialize` looks up DB price, strictly rejects client price tampering | M2 | Survey Explorer 2 / R2 |
| 8 | Flutterwave v4 OAuth2 & 3DES Key Helper | v4 token exchange, Triple DES encryption helper, fix `Database.getPricing` crash | M2 | Survey Explorer 2 / R2 |
| 9 | Flutterwave Webhook & Payment Verification | `verif-hash` header signature verification, `/api/payment/verify`, fix `updateUser` bug | M2 | Survey Explorer 2 / R2 |
| 10 | Subscription Lifecycle & Grace Period | Free, Active Pro/Elite, 30-Day Grace Period countdown, 1-click renewal | M3 | Survey Explorer 2 / R3 |
| 11 | Seed User Data Integrity | Fix `startDate`/`endDate` in `data/users.json` to prevent `NaN` metrics | M3 | Survey Explorer 1, 2 / R3 |
| 12 | Media & Storage Quota Limits | Enforce Free 200MB, Pro 1GB, Elite 5GB, photo/video limits in `/api/media/upload` | M3 | Survey Explorer 2 / R3 |
| 13 | 5 Luxury Display Modes | 3D Crystal Prism, Carousel 3D, Fluid Horizontal Swipe, Bento Matrix, Side-Swipe | M4 | Survey Explorer 3 / R4 |
| 14 | Custom Subdomain Mapping | `subdomain.portfoli.site` -> `/[username]` via Next.js middleware | M4 | Survey Explorer 3 / R4 |
| 15 | Public Inquiry Pipeline | `POST /api/inquiries`, validation, persistence, and creator dashboard inbox | M4 | Survey Explorer 3 / R4 |
| 16 | TypeScript & Production Build Cleanliness | Fix 15 type errors in `admin/page.tsx`, `users/route.ts`, etc. (`tsc --noEmit` & `npm run build`) | M4 | Survey Explorer 3 / AC |
| 17 | Comprehensive Automated E2E Test Suite | Automated test runner covering Tiers 1-4 + Tier 5 adversarial checks | M5 | Survey Explorer 3 / AC |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Authentication, RBAC & GTM Security | Fix JWT cookie attributes (`httpOnly: true`), logout route, password update endpoint, admin auth on `/api/admin/payment-settings`, GTM check | none | IN_PROGRESS |
| M2 | Dynamic Pricing & Flutterwave v4 Payment Security | Fix `/pricing` public fetch, fix `Database.getPricing` to `getPricingConfig`, fix `updateUser` to `saveUser`, secure `/api/payment/initialize` price enforcement, 3DES helper, webhook `verif-hash` | M1 | PLANNED |
| M3 | Subscription Lifecycle, Grace Period & Storage Quota | Fix `data/users.json` start/end dates, verify 4 subscription states, grace countdown & 1-click renewal, upload quota validation | M1 | PLANNED |
| M4 | Luxury Display Modes, Subdomains, Inquiries & TypeScript Fixes | Verify 5 display modes, subdomain routing in middleware, inquiries inbox, resolve all 15 TypeScript type errors across code | none | PLANNED |
| M5 | Automated E2E Test Suite (Tiers 1-5), 100% Pass & Production Build Verification | Build comprehensive E2E test runner (`scripts/test-e2e-api.mjs`), verify 100% pass across all endpoints, adversarial hardening, verify clean `npm run build` | M1, M2, M3, M4 | PLANNED |

## Interface Contracts
### `Database` (`src/lib/storage.ts`)
- `getPricingConfig(): PricingConfig`
- `updatePricingConfig(config: PricingConfig): void`
- `findUserByUsername(username: string): User | undefined`
- `findUserById(id: string): User | undefined`
- `saveUser(user: User): void`
- `getUsers(): User[]`
- `saveInquiry(inquiry: Inquiry): void`
- `getInquiries(): Inquiry[]`
- `getPaymentSettings(): PaymentSettings`
- `savePaymentSettings(settings: PaymentSettings): void`

### `User` Type (`src/lib/types.ts`)
- `id: string`
- `username: string`
- `email: string`
- `passwordHash?: string`
- `tier: 'free' | 'pro_2k' | 'elite_5k'`
- `startDate?: string`
- `endDate?: string`
- `portfolio?: Portfolio`
- `name?: string`
- `createdAt?: string`

### `AdminAuth` (`src/lib/admin-auth.ts`)
- `isAuthorizedAdmin(req: Request): boolean` (checks header `x-admin-key`, query param, or `portfoli_session` admin cookie)
- `getMasterKey(): string` (returns saved master key or default `admin123`)

## Code Layout
- `src/app/api/auth/*` — Auth endpoints (`login`, `logout`, `update-password`)
- `src/app/api/admin/*` — Admin endpoints (`pricing`, `users`, `payment-settings`, `password`)
- `src/app/api/payment/*` — Payment initialization and return verification
- `src/app/api/webhooks/*` — Webhooks (Flutterwave `verif-hash`)
- `src/app/api/media/*` — File and media upload with tier quotas
- `src/app/api/inquiries/*` — Visitor inquiries
- `src/components/displays/*` — 5 Luxury display mode components
- `src/components/gtm-script.tsx` — GTM conditional injector
- `src/lib/*` — Storage, types, auth, tiers, tokens
- `scripts/*` — Automated E2E verification test runner
