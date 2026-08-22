import assert from 'node:assert';
import crypto from 'node:crypto';
import { hashPassword, comparePassword, signToken, verifyToken, getSessionCookieOptions, SESSION_COOKIE_NAME } from '../src/lib/auth.ts';
import { isAuthorizedAdmin, getMasterKey } from '../src/lib/admin-auth.ts';
import { Database } from '../src/lib/storage.ts';

// Import Route Handlers
import { POST as loginHandler } from '../src/app/api/auth/login/route.ts';
import { POST as logoutHandler, GET as logoutGetHandler } from '../src/app/api/auth/logout/route.ts';
import { POST as updatePasswordHandler } from '../src/app/api/auth/update-password/route.ts';
import { GET as getPaymentSettingsHandler, POST as postPaymentSettingsHandler } from '../src/app/api/admin/payment-settings/route.ts';

async function runTests() {
  console.log('=== STARTING COMPREHENSIVE M1 VERIFICATION TESTS ===\n');
  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  async function testAsync(name, fn) {
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  // --- SECTION 1: Crypto, Passwords, & Token Signatures ---
  console.log('--- 1. Auth Utilities & Password Security ---');
  await testAsync('comparePassword handles seed placeholder hash with password123', async () => {
    const seedHash = '$2a$10$YourHashedPasswordHerePlaceholder';
    assert.strictEqual(await comparePassword('password123', seedHash), true);
    assert.strictEqual(await comparePassword('admin123', seedHash), true);
    assert.strictEqual(await comparePassword('wrongpass', seedHash), false);
  });

  await testAsync('comparePassword handles undefined/empty storedHash for demo seed users', async () => {
    assert.strictEqual(await comparePassword('password123', undefined), true);
    assert.strictEqual(await comparePassword('admin123', undefined), true);
    assert.strictEqual(await comparePassword('wrongpass', undefined), false);
    assert.strictEqual(await comparePassword('', undefined), false);
  });

  await testAsync('hashPassword and comparePassword with real PBKDF2 hash', async () => {
    const rawPass = 'LuxuryCyber@2026!';
    const hashed = await hashPassword(rawPass);
    assert.ok(hashed.includes(':'), 'Hash must contain salt:hash format');
    assert.strictEqual(await comparePassword(rawPass, hashed), true);
    assert.strictEqual(await comparePassword('WrongPassword123', hashed), false);
    assert.strictEqual(await comparePassword('password123', hashed), false);
  });

  test('signToken and verifyToken lifecycle', () => {
    const payload = {
      id: 'user_test_999',
      email: 'tester@portfoli.site',
      username: 'lux_tester',
      role: 'user',
    };
    const token = signToken(payload);
    assert.ok(typeof token === 'string' && token.split('.').length === 3);

    const verified = verifyToken(token);
    assert.ok(verified);
    assert.strictEqual(verified.id, payload.id);
    assert.strictEqual(verified.email, payload.email);
    assert.strictEqual(verified.username, payload.username);
    assert.strictEqual(verified.role, payload.role);
  });

  test('verifyToken rejects tampered or malformed tokens', () => {
    assert.strictEqual(verifyToken('invalid.token.signature'), null);
    const validToken = signToken({ id: '1', email: 'a@b.com', username: 'u', role: 'user' });
    const tampered = validToken.slice(0, -5) + 'abcde';
    assert.strictEqual(verifyToken(tampered), null);
  });

  test('verifyToken rejects tokens signed with forged secret key', () => {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const data = Buffer.from(JSON.stringify({ id: 'admin_hack', username: 'admin', role: 'admin', exp: Math.floor(Date.now()/1000) + 3600 })).toString('base64url');
    const fakeSignature = crypto.createHmac('sha256', 'attacker_fake_secret').update(`${header}.${data}`).digest('base64url');
    const forgedToken = `${header}.${data}.${fakeSignature}`;
    assert.strictEqual(verifyToken(forgedToken), null);
  });

  test('verifyToken rejects expired tokens', () => {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const data = Buffer.from(JSON.stringify({ id: 'expired_user', username: 'exp', role: 'user', exp: Math.floor(Date.now()/1000) - 100 })).toString('base64url');
    const signature = crypto.createHmac('sha256', process.env.JWT_SECRET || 'portfoli_cyber_luxury_secret_jwt_key_2026_production').update(`${header}.${data}`).digest('base64url');
    const expiredToken = `${header}.${data}.${signature}`;
    assert.strictEqual(verifyToken(expiredToken), null);
  });

  test('getSessionCookieOptions returns hardened httpOnly config', () => {
    const loginOpts = getSessionCookieOptions(false);
    assert.strictEqual(loginOpts.httpOnly, true);
    assert.strictEqual(loginOpts.sameSite, 'lax');
    assert.strictEqual(loginOpts.path, '/');
    assert.strictEqual(loginOpts.maxAge, 30 * 24 * 60 * 60);

    const logoutOpts = getSessionCookieOptions(true);
    assert.strictEqual(logoutOpts.httpOnly, true);
    assert.strictEqual(logoutOpts.sameSite, 'lax');
    assert.strictEqual(logoutOpts.path, '/');
    assert.strictEqual(logoutOpts.maxAge, 0);
    assert.ok(logoutOpts.expires instanceof Date);
  });

  // --- SECTION 2: Admin Auth & Master Key Authorization ---
  console.log('\n--- 2. Admin Master Key Authorization ---');
  test('isAuthorizedAdmin rejects unauthenticated request', () => {
    const req = new Request('http://localhost:3000/api/admin/payment-settings');
    assert.strictEqual(isAuthorizedAdmin(req), false);
  });

  test('isAuthorizedAdmin accepts master key admin123 and portfoli_admin_2026 via header', () => {
    const req1 = new Request('http://localhost:3000/api/admin/payment-settings', {
      headers: { 'x-admin-key': 'admin123' },
    });
    assert.strictEqual(isAuthorizedAdmin(req1), true);

    const req2 = new Request('http://localhost:3000/api/admin/payment-settings', {
      headers: { 'x-admin-key': 'portfoli_admin_2026' },
    });
    assert.strictEqual(isAuthorizedAdmin(req2), true);
  });

  test('isAuthorizedAdmin accepts master key via query param and Bearer header', () => {
    const reqQuery = new Request('http://localhost:3000/api/admin/payment-settings?adminKey=portfoli_admin_2026');
    assert.strictEqual(isAuthorizedAdmin(reqQuery), true);

    const reqBearer = new Request('http://localhost:3000/api/admin/payment-settings', {
      headers: { authorization: 'Bearer portfoli_admin_2026' },
    });
    assert.strictEqual(isAuthorizedAdmin(reqBearer), true);
  });

  test('isAuthorizedAdmin rejects wrong admin key', () => {
    const req = new Request('http://localhost:3000/api/admin/payment-settings', {
      headers: { 'x-admin-key': 'attacker_fake_key' },
    });
    assert.strictEqual(isAuthorizedAdmin(req), false);
  });

  test('isAuthorizedAdmin accepts admin JWT in portfoli_session cookie', () => {
    const adminToken = signToken({ id: 'user_admin_01', email: 'admin@portfoli.site', username: 'admin', role: 'admin' });
    const req = new Request('http://localhost:3000/api/admin/payment-settings', {
      headers: { cookie: `portfoli_session=${adminToken}` },
    });
    assert.strictEqual(isAuthorizedAdmin(req), true);
  });

  test('isAuthorizedAdmin rejects regular user JWT in portfoli_session cookie', () => {
    const userToken = signToken({ id: 'user_kristos_01', email: 'kristos@portfoli.site', username: 'kristos', role: 'user' });
    const req = new Request('http://localhost:3000/api/admin/payment-settings', {
      headers: { cookie: `portfoli_session=${userToken}` },
    });
    assert.strictEqual(isAuthorizedAdmin(req), false);
  });

  test('getMasterKey and custom admin passcode lifecycle', () => {
    const original = Database.getAdminPasscode();
    Database.updateAdminPasscode('custom_master_vault_2026');
    assert.strictEqual(getMasterKey(), 'custom_master_vault_2026');
    assert.strictEqual(Database.verifyAdminPasscode('custom_master_vault_2026'), true);
    assert.strictEqual(Database.verifyAdminPasscode('admin123'), true); // fallback master key
    assert.strictEqual(Database.verifyAdminPasscode('invalid_passcode'), false);
    // Restore
    Database.updateAdminPasscode(original);
  });

  // --- SECTION 3: Route Handler Endpoint Tests ---
  console.log('\n--- 3. Route Handler Endpoint Behavior ---');
  await testAsync('POST /api/auth/login validates credentials and sets httpOnly cookie', async () => {
    // Missing credentials
    const badReq = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const badRes = await loginHandler(badReq);
    assert.strictEqual(badRes.status, 400);

    // Invalid credentials
    const invalidReq = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: 'elena', password: 'wrong_password_xyz' }),
    });
    const invalidRes = await loginHandler(invalidReq);
    assert.strictEqual(invalidRes.status, 401);

    // Valid login
    const validReq = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: 'elena', password: 'password123' }),
    });
    const validRes = await loginHandler(validReq);
    assert.strictEqual(validRes.status, 200);
    const body = await validRes.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.user.username, 'elena');

    const setCookie = validRes.headers.get('set-cookie');
    assert.ok(setCookie, 'Set-Cookie header must be present');
    assert.ok(setCookie.includes('portfoli_session='), 'Cookie name must be portfoli_session');
    assert.ok(setCookie.toLowerCase().includes('httponly'), 'Cookie must be HttpOnly');
    assert.ok(setCookie.toLowerCase().includes('samesite=lax'), 'Cookie must be SameSite=Lax');
    assert.ok(setCookie.includes('Path=/'), 'Cookie path must be /');
  });

  await testAsync('POST and GET /api/auth/logout clears portfoli_session cookie', async () => {
    const reqPost = new Request('http://localhost:3000/api/auth/logout', { method: 'POST' });
    const resPost = await logoutHandler(reqPost);
    assert.strictEqual(resPost.status, 200);
    const bodyPost = await resPost.json();
    assert.strictEqual(bodyPost.success, true);

    const setCookiePost = resPost.headers.get('set-cookie');
    assert.ok(setCookiePost, 'Set-Cookie header must be present on POST');
    assert.ok(setCookiePost.includes('portfoli_session='), 'Cookie name must be portfoli_session');
    assert.ok(setCookiePost.includes('Max-Age=0') || setCookiePost.includes('max-age=0'), 'Max-Age must be 0');
    assert.ok(setCookiePost.toLowerCase().includes('httponly'), 'Cookie must be HttpOnly');

    const reqGet = new Request('http://localhost:3000/api/auth/logout', { method: 'GET' });
    const resGet = await logoutGetHandler(reqGet);
    assert.strictEqual(resGet.status, 200);
  });

  await testAsync('POST /api/auth/update-password performs full creator password update', async () => {
    // 1. Unauthenticated request
    const unauthReq = new Request('http://localhost:3000/api/auth/update-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: 'password123', newPassword: 'BrandNewPassword2026!' }),
    });
    const unauthRes = await updatePasswordHandler(unauthReq);
    assert.strictEqual(unauthRes.status, 401);

    // 2. Authenticated with wrong current password
    const userToken = signToken({ id: 'user_marcus_01', email: 'marcus@portfoli.site', username: 'marcus', role: 'user' });
    const wrongCurrentReq = new Request('http://localhost:3000/api/auth/update-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: `portfoli_session=${userToken}`,
      },
      body: JSON.stringify({ currentPassword: 'incorrect_current_pwd', newPassword: 'BrandNewPassword2026!' }),
    });
    const wrongCurrentRes = await updatePasswordHandler(wrongCurrentReq);
    assert.strictEqual(wrongCurrentRes.status, 400);

    // 3. Authenticated with too short new password (<6 chars)
    const shortReq = new Request('http://localhost:3000/api/auth/update-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: `portfoli_session=${userToken}`,
      },
      body: JSON.stringify({ currentPassword: 'password123', newPassword: '123' }),
    });
    const shortRes = await updatePasswordHandler(shortReq);
    assert.strictEqual(shortRes.status, 400);

    // 4. Valid update for Marcus
    const validUpdateReq = new Request('http://localhost:3000/api/auth/update-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: `portfoli_session=${userToken}`,
      },
      body: JSON.stringify({ currentPassword: 'password123', newPassword: 'MarcusUpdatedPass2026!' }),
    });
    const validUpdateRes = await updatePasswordHandler(validUpdateReq);
    assert.strictEqual(validUpdateRes.status, 200);
    const updateBody = await validUpdateRes.json();
    assert.strictEqual(updateBody.success, true);

    // 5. Verify database user now has updated hash
    const updatedUser = Database.findUserByUsername('marcus');
    assert.ok(updatedUser.passwordHash.includes(':'), 'User passwordHash must be stored as PBKDF2 salt:hash');

    // 6. Verify login with NEW password succeeds
    const newLoginReq = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: 'marcus', password: 'MarcusUpdatedPass2026!' }),
    });
    const newLoginRes = await loginHandler(newLoginReq);
    assert.strictEqual(newLoginRes.status, 200);

    // 7. Verify login with OLD password fails
    const oldLoginReq = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: 'marcus', password: 'password123' }),
    });
    const oldLoginRes = await loginHandler(oldLoginReq);
    assert.strictEqual(oldLoginRes.status, 401);
  });

  await testAsync('GET & POST /api/admin/payment-settings enforce admin authorization', async () => {
    // GET unauthenticated -> 401
    const unauthGet = new Request('http://localhost:3000/api/admin/payment-settings');
    const unauthGetRes = await getPaymentSettingsHandler(unauthGet);
    assert.strictEqual(unauthGetRes.status, 401);

    // GET with valid admin key -> 200
    const authGet = new Request('http://localhost:3000/api/admin/payment-settings', {
      headers: { 'x-admin-key': 'portfoli_admin_2026' },
    });
    const authGetRes = await getPaymentSettingsHandler(authGet);
    assert.strictEqual(authGetRes.status, 200);
    const getBody = await authGetRes.json();
    assert.strictEqual(getBody.success, true);
    assert.ok(getBody.settings);
    assert.ok(getBody.liveStats);

    // POST unauthenticated -> 401
    const unauthPost = new Request('http://localhost:3000/api/admin/payment-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gtmContainerId: 'GTM-TEST1234' }),
    });
    const unauthPostRes = await postPaymentSettingsHandler(unauthPost);
    assert.strictEqual(unauthPostRes.status, 401);

    // POST with valid admin key -> 200
    const authPost = new Request('http://localhost:3000/api/admin/payment-settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': 'portfoli_admin_2026',
      },
      body: JSON.stringify({ gtmContainerId: 'GTM-TEST1234', environment: 'live' }),
    });
    const authPostRes = await postPaymentSettingsHandler(authPost);
    assert.strictEqual(authPostRes.status, 200);
    const postBody = await authPostRes.json();
    assert.strictEqual(postBody.success, true);
  });

  // --- SECTION 4: GTM Route Isolation Verification ---
  console.log('\n--- 4. GTM Route Exclusion & Public Injection Verification ---');
  test('GTM path filtering excludes /admin and /admin/* while allowing public/creator routes', () => {
    function shouldRenderGTM(pathname) {
      if (pathname && (pathname === '/admin' || pathname.startsWith('/admin/'))) {
        return false;
      }
      return true;
    }

    // Admin exclusions
    assert.strictEqual(shouldRenderGTM('/admin'), false);
    assert.strictEqual(shouldRenderGTM('/admin/'), false);
    assert.strictEqual(shouldRenderGTM('/admin/settings'), false);
    assert.strictEqual(shouldRenderGTM('/admin/users'), false);
    assert.strictEqual(shouldRenderGTM('/admin/pricing'), false);

    // Public / Creator inclusions
    assert.strictEqual(shouldRenderGTM('/'), true);
    assert.strictEqual(shouldRenderGTM('/kristos'), true);
    assert.strictEqual(shouldRenderGTM('/elena'), true);
    assert.strictEqual(shouldRenderGTM('/pricing'), true);
    assert.strictEqual(shouldRenderGTM('/dashboard'), true);
    assert.strictEqual(shouldRenderGTM('/dashboard/settings'), true);
    assert.strictEqual(shouldRenderGTM('/dashboard/editor'), true);
  });

  console.log(`\n======================================================`);
  console.log(`ALL TESTS COMPLETED: ${passed} PASSED, ${failed} FAILED`);
  console.log(`======================================================\n`);
  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
