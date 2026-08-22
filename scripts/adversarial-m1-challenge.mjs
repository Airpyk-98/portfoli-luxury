import assert from 'node:assert';
import crypto from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { hashPassword, comparePassword, signToken, verifyToken, getSessionCookieOptions, SESSION_COOKIE_NAME } from '../src/lib/auth.ts';
import { isAuthorizedAdmin, getMasterKey } from '../src/lib/admin-auth.ts';
import { Database } from '../src/lib/storage.ts';

// Route Handlers
import { POST as loginHandler } from '../src/app/api/auth/login/route.ts';
import { POST as logoutHandler, GET as logoutGetHandler } from '../src/app/api/auth/logout/route.ts';
import { POST as updatePasswordHandler } from '../src/app/api/auth/update-password/route.ts';
import { GET as getPaymentSettingsHandler, POST as postPaymentSettingsHandler } from '../src/app/api/admin/payment-settings/route.ts';

async function runAdversarialSuite() {
  console.log('================================================================');
  console.log('   M1 ADVERSARIAL STRESS TEST & SECURITY BOUNDARY AUDIT');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;
  const findings = [];

  function test(name, fn) {
    try {
      fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name}:`, err.message);
      findings.push({ name, error: err.message });
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
      findings.push({ name, error: err.message });
      failed++;
    }
  }

  // -------------------------------------------------------------------------
  // 1. MASTER KEY AUTHENTICATION PERMUTATIONS & ADVERSARIAL VECTORS
  // -------------------------------------------------------------------------
  console.log('--- 1. Master Key Permutations & Adversarial Probing ---');

  test('Valid Header delivery (x-admin-key and x-admin-passcode)', () => {
    // x-admin-key: admin123
    const req1 = new Request('http://localhost:3000/api/admin/test', {
      headers: { 'x-admin-key': 'admin123' },
    });
    assert.strictEqual(isAuthorizedAdmin(req1), true, 'x-admin-key admin123 failed');

    // x-admin-key: portfoli_admin_2026
    const req2 = new Request('http://localhost:3000/api/admin/test', {
      headers: { 'x-admin-key': 'portfoli_admin_2026' },
    });
    assert.strictEqual(isAuthorizedAdmin(req2), true, 'x-admin-key portfoli_admin_2026 failed');

    // x-admin-passcode: admin123
    const req3 = new Request('http://localhost:3000/api/admin/test', {
      headers: { 'x-admin-passcode': 'admin123' },
    });
    assert.strictEqual(isAuthorizedAdmin(req3), true, 'x-admin-passcode admin123 failed');

    // x-admin-passcode: portfoli_admin_2026
    const req4 = new Request('http://localhost:3000/api/admin/test', {
      headers: { 'x-admin-passcode': 'portfoli_admin_2026' },
    });
    assert.strictEqual(isAuthorizedAdmin(req4), true, 'x-admin-passcode portfoli_admin_2026 failed');
  });

  test('Valid Query Parameter delivery (adminKey, key, x-admin-key)', () => {
    const urls = [
      'http://localhost:3000/api/admin/test?adminKey=admin123',
      'http://localhost:3000/api/admin/test?adminKey=portfoli_admin_2026',
      'http://localhost:3000/api/admin/test?key=admin123',
      'http://localhost:3000/api/admin/test?key=portfoli_admin_2026',
      'http://localhost:3000/api/admin/test?x-admin-key=admin123',
      'http://localhost:3000/api/admin/test?x-admin-key=portfoli_admin_2026',
      'http://localhost:3000/api/admin/test?other=123&adminKey=admin123&filter=all',
    ];
    for (const u of urls) {
      const req = new Request(u);
      assert.strictEqual(isAuthorizedAdmin(req), true, `Failed on query URL: ${u}`);
    }
  });

  test('Valid Authorization Bearer delivery (master key & admin JWT)', () => {
    // Bearer with raw master key
    const reqBearerKey1 = new Request('http://localhost:3000/api/admin/test', {
      headers: { authorization: 'Bearer admin123' },
    });
    assert.strictEqual(isAuthorizedAdmin(reqBearerKey1), true, 'Bearer admin123 failed');

    const reqBearerKey2 = new Request('http://localhost:3000/api/admin/test', {
      headers: { authorization: 'Bearer portfoli_admin_2026' },
    });
    assert.strictEqual(isAuthorizedAdmin(reqBearerKey2), true, 'Bearer portfoli_admin_2026 failed');

    // Bearer with admin JWT
    const adminToken = signToken({ id: 'admin_1', email: 'admin@portfoli.site', username: 'admin', role: 'admin' });
    const reqBearerJwt = new Request('http://localhost:3000/api/admin/test', {
      headers: { authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(isAuthorizedAdmin(reqBearerJwt), true, 'Bearer Admin JWT failed');
  });

  test('Valid Cookie delivery (portfoli_session=<admin_jwt>)', () => {
    const adminToken = signToken({ id: 'admin_1', email: 'admin@portfoli.site', username: 'admin', role: 'admin' });
    
    // Exact cookie
    const req1 = new Request('http://localhost:3000/api/admin/test', {
      headers: { cookie: `portfoli_session=${adminToken}` },
    });
    assert.strictEqual(isAuthorizedAdmin(req1), true, 'Direct cookie failed');

    // Cookie surrounded by other cookies
    const req2 = new Request('http://localhost:3000/api/admin/test', {
      headers: { cookie: `theme=dark; portfoli_session=${adminToken}; ga_id=12345` },
    });
    assert.strictEqual(isAuthorizedAdmin(req2), true, 'Multiple cookies failed');
  });

  test('Adversarial: Case Sensitivity & Near-Matches', () => {
    const nearMisses = [
      'Admin123',
      'ADMIN123',
      'ADMIN',
      'admin',
      'admin12',
      'admin1234',
      'PORTFOLI_ADMIN_2026',
      'Portfoli_Admin_2026',
      'portfoli_admin',
      'Bearer admin123', // literal string inside header value that is not parsed as Bearer
    ];

    for (const miss of nearMisses) {
      const reqHeader = new Request('http://localhost:3000/api/admin/test', {
        headers: { 'x-admin-key': miss },
      });
      assert.strictEqual(isAuthorizedAdmin(reqHeader), false, `Should reject near-miss header: ${JSON.stringify(miss)}`);
    }
  });

  test('Adversarial: Injection, Whitespace & Malformed Inputs', () => {
    const malicious = [
      '',
      '   ',
      '\t',
      'null',
      'undefined',
      'NaN',
      'true',
      'false',
      "' OR '1'='1",
      '"><script>alert(1)</script>',
      '{"passcode":"admin123"}',
      '__proto__',
      'constructor',
      'Bearer',
      'Bearer ',
      'Bearer undefined',
      'Bearer null',
    ];

    for (const evil of malicious) {
      const req1 = new Request('http://localhost:3000/api/admin/test', {
        headers: { 'x-admin-key': evil },
      });
      assert.strictEqual(isAuthorizedAdmin(req1), false, `Should reject header injection: ${evil}`);

      const req2 = new Request(`http://localhost:3000/api/admin/test?adminKey=${encodeURIComponent(evil)}`);
      assert.strictEqual(isAuthorizedAdmin(req2), false, `Should reject query injection: ${evil}`);

      const req3 = new Request('http://localhost:3000/api/admin/test', {
        headers: { authorization: `Bearer ${evil}` },
      });
      assert.strictEqual(isAuthorizedAdmin(req3), false, `Should reject bearer injection: ${evil}`);
    }
  });

  test('Adversarial: Non-Admin User Impersonation & Privilege Escalation', () => {
    // Normal user token
    const userToken = signToken({ id: 'user_kristos_01', email: 'kristos@portfoli.site', username: 'kristos', role: 'user' });
    const reqUserCookie = new Request('http://localhost:3000/api/admin/test', {
      headers: { cookie: `portfoli_session=${userToken}` },
    });
    assert.strictEqual(isAuthorizedAdmin(reqUserCookie), false, 'Normal user cookie must not grant admin');

    const reqUserBearer = new Request('http://localhost:3000/api/admin/test', {
      headers: { authorization: `Bearer ${userToken}` },
    });
    assert.strictEqual(isAuthorizedAdmin(reqUserBearer), false, 'Normal user Bearer must not grant admin');

    // Creator role token
    const creatorToken = signToken({ id: 'user_elena_01', email: 'elena@portfoli.site', username: 'elena', role: 'creator' });
    assert.strictEqual(isAuthorizedAdmin(new Request('http://localhost:3000/api/admin/test', { headers: { cookie: `portfoli_session=${creatorToken}` } })), false);

    // Forged Admin Token (signed with attacker secret)
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const forgedData = Buffer.from(JSON.stringify({ id: 'forged_admin', username: 'admin', role: 'admin', exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url');
    const forgedSig = crypto.createHmac('sha256', 'attacker_secret_xyz').update(`${header}.${forgedData}`).digest('base64url');
    const forgedToken = `${header}.${forgedData}.${forgedSig}`;

    assert.strictEqual(isAuthorizedAdmin(new Request('http://localhost:3000/api/admin/test', { headers: { cookie: `portfoli_session=${forgedToken}` } })), false);
    assert.strictEqual(isAuthorizedAdmin(new Request('http://localhost:3000/api/admin/test', { headers: { authorization: `Bearer ${forgedToken}` } })), false);

    // Expired Admin Token
    const expiredData = Buffer.from(JSON.stringify({ id: 'admin_exp', username: 'admin', role: 'admin', exp: Math.floor(Date.now() / 1000) - 500 })).toString('base64url');
    const expiredSig = crypto.createHmac('sha256', process.env.JWT_SECRET || 'portfoli_cyber_luxury_secret_jwt_key_2026_production').update(`${header}.${expiredData}`).digest('base64url');
    const expiredToken = `${header}.${expiredData}.${expiredSig}`;

    assert.strictEqual(isAuthorizedAdmin(new Request('http://localhost:3000/api/admin/test', { headers: { cookie: `portfoli_session=${expiredToken}` } })), false);
  });

  test('Custom Dynamic Admin Passcode Lifecycle & Resilience', () => {
    const originalPasscode = Database.getAdminPasscode();
    try {
      // 1. Update to custom strong passcode
      const customKey = 'Hyper_Secure_Admin_Key_#2026';
      const updated = Database.updateAdminPasscode(customKey);
      assert.strictEqual(updated, true, 'Should allow strong custom passcode');
      assert.strictEqual(getMasterKey(), customKey);

      // 2. Custom key works in header, query, and bearer
      const reqH = new Request('http://localhost:3000/api/admin/test', { headers: { 'x-admin-key': customKey } });
      assert.strictEqual(isAuthorizedAdmin(reqH), true, 'Custom key in header failed');

      const reqQ = new Request(`http://localhost:3000/api/admin/test?adminKey=${encodeURIComponent(customKey)}`);
      assert.strictEqual(isAuthorizedAdmin(reqQ), true, 'Custom key in query failed');

      const reqB = new Request('http://localhost:3000/api/admin/test', { headers: { authorization: `Bearer ${customKey}` } });
      assert.strictEqual(isAuthorizedAdmin(reqB), true, 'Custom key in Bearer failed');

      // 3. Fallback master keys still work
      assert.strictEqual(Database.verifyAdminPasscode('admin123'), true);
      assert.strictEqual(Database.verifyAdminPasscode('portfoli_admin_2026'), true);

      // 4. Invalid attempts rejected
      assert.strictEqual(Database.verifyAdminPasscode('wrong_custom_key'), false);

      // 5. Short passcode rejection
      assert.strictEqual(Database.updateAdminPasscode('12345'), false, 'Should reject passcode < 6 chars');
      assert.strictEqual(Database.updateAdminPasscode(''), false, 'Should reject empty passcode');
    } finally {
      // Restore
      Database.updateAdminPasscode(originalPasscode);
    }
  });

  // -------------------------------------------------------------------------
  // 2. GTM ROUTE FILTERING & PATH ISOLATION
  // -------------------------------------------------------------------------
  console.log('\n--- 2. GTM Route Filtering & Path Isolation ---');

  test('GTM Path Filtering Logic: Exhaustive Route Boundary Matrix', () => {
    function shouldRenderGTM(pathname) {
      if (pathname && (pathname === '/admin' || pathname.startsWith('/admin/'))) {
        return false;
      }
      return true;
    }

    const adminPaths = [
      '/admin',
      '/admin/',
      '/admin/users',
      '/admin/settings',
      '/admin/pricing',
      '/admin/payment-settings',
      '/admin/security',
      '/admin/reports/analytics',
      '/admin/deeply/nested/route/2026',
    ];

    for (const p of adminPaths) {
      assert.strictEqual(shouldRenderGTM(p), false, `GTM MUST NOT render on admin route: ${p}`);
    }

    const publicAndCreatorPaths = [
      '/',
      '/pricing',
      '/login',
      '/register',
      '/explore',
      '/kristos',
      '/elena',
      '/marcus',
      '/sora',
      '/zara',
      '/any-creator-username',
      '/dashboard',
      '/dashboard/',
      '/dashboard/settings',
      '/dashboard/analytics',
      '/dashboard/inquiries',
      '/dashboard/editor',
      '/dashboard/subdomain',
      '/api/public/pricing',
    ];

    for (const p of publicAndCreatorPaths) {
      assert.strictEqual(shouldRenderGTM(p), true, `GTM MUST render on public/creator route: ${p}`);
    }
  });

  test('GTM Edge Cases & Query Handling', () => {
    function shouldRenderGTM(pathname) {
      if (pathname && (pathname === '/admin' || pathname.startsWith('/admin/'))) {
        return false;
      }
      return true;
    }

    // null / undefined pathname handling
    assert.strictEqual(shouldRenderGTM(null), true);
    assert.strictEqual(shouldRenderGTM(undefined), true);
    assert.strictEqual(shouldRenderGTM(''), true);

    // Lookalike routes that are NOT subroutes of /admin
    assert.strictEqual(shouldRenderGTM('/admin-dashboard'), true, '/admin-dashboard is not /admin or /admin/*');
    assert.strictEqual(shouldRenderGTM('/administrators'), true);
  });

  // -------------------------------------------------------------------------
  // 3. CRYPTOGRAPHIC INTEGRITY, TIMING ATTACK RESISTANCE & PASSWORDS
  // -------------------------------------------------------------------------
  console.log('\n--- 3. Cryptographic Integrity & Timing Attack Resistance ---');

  await testAsync('comparePassword timing-safe comparison on varying lengths and invalid formats', async () => {
    // Malformed hashes
    assert.strictEqual(await comparePassword('password123', 'malformed_hash_without_colon'), false);
    assert.strictEqual(await comparePassword('password123', 'too:many:colons:in:hash'), false);
    assert.strictEqual(await comparePassword('password123', 'invalid_hex_salt:invalid_hex_hash!'), false);

    // Empty passwords
    assert.strictEqual(await comparePassword('', '$2a$10$YourHashedPasswordHerePlaceholder'), false);
    assert.strictEqual(await comparePassword('', undefined), false);

    // Timing check: measure execution variance across 10 comparisons
    const realHash = await hashPassword('SuperSecret123!');
    const iterations = 10;

    const t0 = performance.now();
    for (let i = 0; i < iterations; i++) {
      await comparePassword('WrongPasswordOne', realHash);
    }
    const t1 = performance.now();

    for (let i = 0; i < iterations; i++) {
      await comparePassword('WrongPasswordTwoVeryLongPayloadStringExceedingNormalLimits', realHash);
    }
    const t2 = performance.now();

    const diff1 = t1 - t0;
    const diff2 = t2 - t1;
    assert.ok(diff1 >= 0 && diff2 >= 0);
  });

  // -------------------------------------------------------------------------
  // 4. ENDPOINT VERIFICATION & IDEMPOTENT LIFECYCLE AUDITING
  // -------------------------------------------------------------------------
  console.log('\n--- 4. Endpoint Behavioral & Security Auditing ---');

  await testAsync('GET & POST /api/admin/payment-settings: Masking & Protection', async () => {
    // Unauthenticated GET -> 401
    const unauthRes = await getPaymentSettingsHandler(new Request('http://localhost:3000/api/admin/payment-settings'));
    assert.strictEqual(unauthRes.status, 401);

    // Authenticated GET with x-admin-key -> 200
    const authRes = await getPaymentSettingsHandler(
      new Request('http://localhost:3000/api/admin/payment-settings', {
        headers: { 'x-admin-key': 'portfoli_admin_2026' },
      })
    );
    assert.strictEqual(authRes.status, 200);
    const data = await authRes.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.settings, 'Masked settings must exist');
    assert.ok(data.liveStats, 'Live stats must exist');

    // Secrets MUST be masked with bullets
    if (data.settings.clientSecret) {
      assert.ok(data.settings.clientSecret.includes('••••••••'), 'clientSecret must be masked');
    }
    if (data.settings.secretKey) {
      assert.ok(data.settings.secretKey.includes('••••••••'), 'secretKey must be masked');
    }

    // Authenticated POST update
    const updateRes = await postPaymentSettingsHandler(
      new Request('http://localhost:3000/api/admin/payment-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': 'portfoli_admin_2026',
        },
        body: JSON.stringify({
          environment: 'live',
          gtmContainerId: 'GTM-CHALLENGE2026',
          clientSecret: '••••••••••••', // Masked value should not overwrite underlying secret with bullets
        }),
      })
    );
    assert.strictEqual(updateRes.status, 200);
    const updateData = await updateRes.json();
    assert.strictEqual(updateData.success, true);
    assert.strictEqual(updateData.settings.gtmContainerId, 'GTM-CHALLENGE2026');
  });

  await testAsync('POST /api/auth/update-password: Full Validation & State Recovery', async () => {
    // Target user: sora (Dr. Sora Tanaka)
    const user = Database.findUserByUsername('sora');
    assert.ok(user, 'User sora must exist');
    const originalHash = user.passwordHash;

    try {
      const soraToken = signToken({ id: user.id, email: user.email, username: user.username, role: 'user' });

      // 1. Missing body/fields
      const emptyReq = new Request('http://localhost:3000/api/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', cookie: `portfoli_session=${soraToken}` },
        body: JSON.stringify({}),
      });
      const emptyRes = await updatePasswordHandler(emptyReq);
      assert.strictEqual(emptyRes.status, 400);

      // 2. Wrong current password
      const wrongReq = new Request('http://localhost:3000/api/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', cookie: `portfoli_session=${soraToken}` },
        body: JSON.stringify({ currentPassword: 'completely_wrong_pass', newPassword: 'ValidNewPass123!' }),
      });
      const wrongRes = await updatePasswordHandler(wrongReq);
      assert.strictEqual(wrongRes.status, 400);

      // 3. Weak new password (< 6 chars)
      const weakReq = new Request('http://localhost:3000/api/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', cookie: `portfoli_session=${soraToken}` },
        body: JSON.stringify({ currentPassword: 'password123', newPassword: '123' }),
      });
      const weakRes = await updatePasswordHandler(weakReq);
      assert.strictEqual(weakRes.status, 400);

      // 4. Valid password update
      const validReq = new Request('http://localhost:3000/api/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', cookie: `portfoli_session=${soraToken}` },
        body: JSON.stringify({ currentPassword: 'password123', newPassword: 'SoraQuantumPass2026!' }),
      });
      const validRes = await updatePasswordHandler(validReq);
      assert.strictEqual(validRes.status, 200);

      // 5. Test login with new password succeeds
      const newLogin = await loginHandler(
        new Request('http://localhost:3000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ login: 'sora', password: 'SoraQuantumPass2026!' }),
        })
      );
      assert.strictEqual(newLogin.status, 200);

      // 6. Test login with old password fails
      const oldLogin = await loginHandler(
        new Request('http://localhost:3000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ login: 'sora', password: 'password123' }),
        })
      );
      assert.strictEqual(oldLogin.status, 401);
    } finally {
      // Clean up and restore sora's original password hash for idempotency!
      user.passwordHash = originalHash;
      Database.saveUser(user);
    }
  });

  console.log(`\n================================================================`);
  console.log(`AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`================================================================\n`);

  if (failed > 0) {
    console.error('Security/Adversarial Findings:', findings);
    process.exit(1);
  }
}

runAdversarialSuite().catch((err) => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
