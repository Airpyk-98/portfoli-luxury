## 2026-08-22T09:41:00Z

### Milestone M1 Replacement Worker: Authentication, RBAC, Admin Master Key Auth, Creator Password Updating, & GTM Script Isolation

Your Working Directory: c:\Users\DELL\Documents\antigravity\quirky-kepler\.agents\m1_worker_2
Workspace Directory: c:\Users\DELL\Documents\antigravity\quirky-kepler
Original Request: c:\Users\DELL\Documents\antigravity\quirky-kepler\.agents\ORIGINAL_REQUEST.md
Master Project Plan: c:\Users\DELL\Documents\antigravity\quirky-kepler\PROJECT.md

**MANDATORY INTEGRITY WARNING**:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

**File Ownership**:
You have exclusive write ownership over:
- `src/lib/auth.ts`
- `src/lib/admin-auth.ts`
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/logout/route.ts`
- `src/app/api/auth/update-password/route.ts`
- `src/app/api/admin/payment-settings/route.ts`
- `src/components/gtm-script.tsx`

**Requirements to Implement**:
1. **JWT Session Cookie Protection**:
   - Ensure the `portfoli_session` cookie is configured with `httpOnly: true`, `sameSite: 'lax'`, `path: '/'`, `secure: process.env.NODE_ENV === 'production'`.
   - Implement `POST /api/auth/logout` that properly clears the session cookie (expires/maxAge: 0).
2. **Authentication Security & Creator Password Updates**:
   - Ensure secure credential validation and authentication.
   - Implement `POST /api/auth/update-password` allowing logged-in creators (or authenticated with current password) to change their password, updating `passwordHash` in the user record in database/storage.
3. **Admin Master Key Security on Payment Settings**:
   - In `src/app/api/admin/payment-settings/route.ts`, enforce `isAuthorizedAdmin(req)` on BOTH `GET` and `POST` handlers, rejecting unauthenticated requests with 401/403.
   - Support master key auth (`admin123`, `portfoli_admin_2026`, and custom saved keys).
4. **Google Tag Manager Verification**:
   - Ensure `src/components/gtm-script.tsx` injects GTM container script on public and creator routes (`/`, `/[username]`, `/pricing`, `/dashboard/*`) and strictly suppresses/excludes GTM on `/admin` and `/admin/*`.
5. **Verification**:
   - Run verification tests to confirm your fixes work properly without regressions.
   - Deliver your handoff report to `handoff.md`.
