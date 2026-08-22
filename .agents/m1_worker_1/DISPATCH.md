## 2026-08-22T09:07:35Z

### Milestone M1 Dispatch: Authentication, RBAC, Admin Master Key Auth, Creator Password Updating, & GTM Script Isolation

Your Working Directory: c:\Users\DELL\Documents\antigravity\quirky-kepler\.agents\m1_worker_1
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
- `src/app/api/auth/update-password/route.ts` (create if needed)
- `src/app/api/admin/payment-settings/route.ts`
- `src/components/gtm-script.tsx`

**Requirements to Implement**:
1. **JWT Session Cookie Protection**:
   - Ensure the `portfoli_session` cookie is configured with `httpOnly: true`, `sameSite: 'lax'`, `path: '/'`, `secure: process.env.NODE_ENV === 'production'`.
   - Implement `POST /api/auth/logout` that properly clears the cookie.
2. **Authentication Security & Creator Password Updates**:
   - Support secure authentication and implement `POST /api/auth/update-password` allowing logged-in creators to change their password, updating `passwordHash` in the user record in `data/users.json` / storage.
3. **Admin Master Key Security on Payment Settings**:
   - In `src/app/api/admin/payment-settings/route.ts`, enforce `isAuthorizedAdmin(req)` on BOTH `GET` and `POST` handlers, rejecting unauthenticated requests with 401/403.
   - Support master key auth (`admin123`, `portfoli_admin_2026`, and custom saved keys).
4. **Google Tag Manager Verification**:
   - Verify `src/components/gtm-script.tsx` injects GTM container script on public and creator routes (`/`, `/[username]`, `/pricing`, `/dashboard/*`) and strictly suppresses/excludes GTM on `/admin` and sub-routes.
5. **Run verification script**:
   - Write a Node test verification script to execute tests against these endpoints/functions and document results in `handoff.md`.
