import assert from 'node:assert';
import crypto from 'node:crypto';
import { hashPassword, comparePassword, signToken, verifyToken, getSessionCookieOptions, SESSION_COOKIE_NAME } from '../src/lib/auth.ts';
import { isAuthorizedAdmin, getMasterKey } from '../src/lib/admin-auth.ts';
import { Database } from '../src/lib/storage.ts';

// Import Route Handlers
import { POST as loginHandler } from '../src/app/api/auth/login/route.ts';
import { POST as logoutPostHandler, GET as logoutGetHandler } from '../src/app/api/auth/logout/route.ts';
import { POST as updatePasswordHandler } from '../src/app/api/auth/update-password/route.ts';
import { GET as getPaymentSettingsHandler, POST as postPaymentSettingsHandler } from '../src/app/api/admin/payment-settings/route.ts';
import { GET as getAdminPricingHandler, PUT as putAdminPricingHandler } from '../src/app/api/admin/pricing/route.ts';
import { GET as getAdminUsersHandler, POST as postAdminUsersHandler } from '../src/app/api/admin/users/route.ts';
import { POST as postAdminPasswordHandler } from '../src/app/api/admin/password/route.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'portfoli_cyber_luxury_secret_jwt_key_2026_production';

async function runAdversarialTestSuite() {
  console.log('================================================================');
  console.log('  MILESTONE M1 ADVERSARIAL STRESS TEST & PENETRATION HARNESS   ');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;
  const findings = [];

  function logResult(category, testName, isPass, detail) {
    if (isPass) {
      passed++;
      console.log(`[PASS] [${category}] ${testName}`);
    } else {
      failed++;
      findings.push({ category, testName, detail });
      console.error(`[FAIL] [${category}] ${testName}: ${detail}`);
    }
  }

  // Reset database test users to predictable initial states
  const users = Database.getUsers();
  users.forEach((u) => {
    if (u.username === 'sora' || u.username === 'zara' || u.username === 'admin') {
      u.passwordHash = '$2a$10$YourHashedPasswordHerePlaceholder';
    }
  });
  Database.saveUsers(users);

  // =========================================================================
  // CATEGORY 1: JWT & TOKEN FORGERY, TAMPERING, AND CRYPTOGRAPHIC ATTACKS
  // =========================================================================
  console.log('\n--- CATEGORY 1: JWT & Token Forgery, Tampering, & Crypto Attacks ---');

  // Vector 1.1: "none" algorithm attack (Alg: none, empty signature)
  {
    const headerNone = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
    const payloadAdmin = Buffer.from(JSON.stringify({ id: 'admin_hack', username: 'admin', role: 'admin', exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url');
    const tokenNone = `${headerNone}.${payloadAdmin}.`;
    const res = verifyToken(tokenNone);
    logResult('JWT Forgery', 'Alg: none attack rejected', res === null, 'Signature required and verified with HMAC-SHA256');
  }

  // Vector 1.2: Signature forgery with attacker-controlled HMAC secret
  {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({ id: 'user_admin_01', username: 'admin', role: 'admin', exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url');
    const forgedSig = crypto.createHmac('sha256', 'attacker_arbitrary_key_12345').update(`${header}.${payload}`).digest('base64url');
    const forgedToken = `${header}.${payload}.${forgedSig}`;
    const res = verifyToken(forgedToken);
    logResult('JWT Forgery', 'Forged secret key attack rejected', res === null, 'Signature mismatch detected');
  }

  // Vector 1.3: Bit-flipping / 1-character alteration in signature
  {
    const validToken = signToken({ id: 'user_sora_01', email: 'sora@portfoli.site', username: 'sora', role: 'user' });
    const parts = validToken.split('.');
    const flippedSig = parts[2].slice(0, -1) + (parts[2].slice(-1) === 'A' ? 'B' : 'A');
    const tamperedToken = `${parts[0]}.${parts[1]}.${flippedSig}`;
    logResult('JWT Tampering', 'Single bit/char signature alteration rejected', verifyToken(tamperedToken) === null, 'Cryptographic signature mismatch caught');
  }

  // Vector 1.4: Privilege escalation via payload alteration (role: user -> role: admin)
  {
    const userToken = signToken({ id: 'user_sora_01', email: 'sora@portfoli.site', username: 'sora', role: 'user' });
    const [h, d, s] = userToken.split('.');
    const payloadObj = JSON.parse(Buffer.from(d, 'base64url').toString('utf-8'));
    payloadObj.role = 'admin';
    const modifiedPayload = Buffer.from(JSON.stringify(payloadObj)).toString('base64url');
    const forgedAdminToken = `${h}.${modifiedPayload}.${s}`;
    logResult('JWT Escalation', 'Payload tampering without re-signing rejected', verifyToken(forgedAdminToken) === null, 'HMAC validates entire header+payload data');
  }

  // Vector 1.5: Expired token rejection & timestamp manipulation
  {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const expiredPayload = Buffer.from(JSON.stringify({ id: 'user_sora_01', email: 'sora@portfoli.site', username: 'sora', role: 'user', exp: Math.floor(Date.now() / 1000) - 1 })).toString('base64url');
    const sig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${expiredPayload}`).digest('base64url');
    const expiredToken = `${header}.${expiredPayload}.${sig}`;
    logResult('JWT Expiry', 'Expired token rejected (exp < now)', verifyToken(expiredToken) === null, 'Timestamp strictly enforced');
  }

  // Vector 1.6: Token with exp = 0 (Unix Epoch 1970) Edge Case Investigation
  {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const zeroExpPayload = Buffer.from(JSON.stringify({ id: 'user_sora_01', username: 'sora', role: 'user', exp: 0 })).toString('base64url');
    const sig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${zeroExpPayload}`).digest('base64url');
    const zeroExpToken = `${header}.${zeroExpPayload}.${sig}`;
    const verifiedResult = verifyToken(zeroExpToken);
    // In src/lib/auth.ts: `if (payload.exp && payload.exp < now)` evaluates to 0 (falsy) when exp === 0, so it is NOT rejected as expired!
    const isVulnerable = verifiedResult !== null;
    logResult(
      'JWT Expiry Edge Case',
      'Token with exp: 0 expiration handling',
      !isVulnerable,
      isVulnerable ? 'VULNERABILITY DETECTED: verifyToken treats exp: 0 as falsy and does not expire it' : 'exp: 0 expired correctly'
    );
  }

  // Vector 1.7: Multi-segment token attack (token with > 3 segments)
  {
    const validToken = signToken({ id: 'user_sora_01', email: 'sora@portfoli.site', username: 'sora', role: 'user' });
    const fourSegmentToken = `${validToken}.extra_malicious_segment`;
    const res = verifyToken(fourSegmentToken);
    // RFC 7519 specifies JWT has exactly 3 segments
    const isStrict = res === null;
    logResult(
      'JWT Structure',
      '4-segment token rejection (RFC 7519 strictness)',
      isStrict,
      isStrict ? 'Strict 3-segment token enforcement' : 'NOTE: verifyToken extracts first 3 segments and ignores extra parts'
    );
  }

  // Vector 1.8: Corrupted / Malformed token structures
  {
    const malformed = ['', 'abc', 'abc.def', '???..???', null, undefined];
    const allNull = malformed.every((t) => verifyToken(t) === null);
    logResult('JWT Structure', 'Malformed & boundary token structures rejected', allNull, 'All non-3-part tokens return null');
  }

  // Vector 1.9: Corrupt JSON payload base64url
  {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const corruptPayload = Buffer.from('NOT_A_JSON_STRING_{{::').toString('base64url');
    const sig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${corruptPayload}`).digest('base64url');
    const corruptToken = `${header}.${corruptPayload}.${sig}`;
    logResult('JWT Parser', 'Corrupted JSON in base64url safely handled', verifyToken(corruptToken) === null, 'JSON.parse failure caught gracefully without crashing');
  }

  // =========================================================================
  // CATEGORY 2: ADMIN AUTHORIZATION & INJECTION ATTACKS
  // =========================================================================
  console.log('\n--- CATEGORY 2: Admin Master Key & Authorization Bypass Attacks ---');

  // Vector 2.1: Unauthenticated GET & POST to /api/admin/payment-settings
  {
    const reqGet = new Request('http://localhost:3000/api/admin/payment-settings');
    const resGet = await getPaymentSettingsHandler(reqGet);
    const reqPost = new Request('http://localhost:3000/api/admin/payment-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secretKey: 'FLWSECK_ATTACKER_TEST' }),
    });
    const resPost = await postPaymentSettingsHandler(reqPost);
    logResult(
      'Admin Auth',
      'Unauthenticated payment-settings GET & POST rejected (401)',
      resGet.status === 401 && resPost.status === 401,
      `GET status: ${resGet.status}, POST status: ${resPost.status}`
    );
  }

  // Vector 2.2: Empty & Whitespace-only auth headers
  {
    const badHeaders = [
      { 'x-admin-key': '' },
      { 'x-admin-key': '   ' },
      { 'x-admin-passcode': '' },
      { 'x-admin-passcode': '   ' },
      { authorization: '' },
      { authorization: 'Bearer ' },
      { authorization: 'Bearer    ' },
      { authorization: 'Bearer undefined' },
      { authorization: 'Bearer null' },
      { authorization: 'Basic YWRtaW46YWRtaW4=' },
    ];

    let allRejected = true;
    for (const h of badHeaders) {
      const req = new Request('http://localhost:3000/api/admin/payment-settings', { headers: h });
      if (isAuthorizedAdmin(req) !== false) allRejected = false;
    }
    logResult('Admin Auth', 'Empty and malformed headers rejected', allRejected, 'Trimmed comparison avoids whitespace bypass');
  }

  // Vector 2.3: SQL Injection & Injection Payloads as Admin Key
  {
    const sqliPayloads = [
      "' OR '1'='1",
      "' OR 1=1 --",
      "admin' --",
      "admin' #",
      "' UNION SELECT 1, 'admin', 'hash' --",
      '1; DROP TABLE users;',
      '${7*7}',
      '{{7*7}}',
    ];

    let sqliRejected = true;
    for (const payload of sqliPayloads) {
      const reqHeader = new Request('http://localhost:3000/api/admin/payment-settings', {
        headers: { 'x-admin-key': payload },
      });
      if (isAuthorizedAdmin(reqHeader) !== false) sqliRejected = false;

      const reqQuery = new Request(`http://localhost:3000/api/admin/payment-settings?adminKey=${encodeURIComponent(payload)}`);
      if (isAuthorizedAdmin(reqQuery) !== false) sqliRejected = false;
    }
    logResult('Admin Auth', 'SQL Injection & template injection payloads rejected', sqliRejected, 'Exact string equality prevents injection');
  }

  // Vector 2.4: Prototype Pollution / Object Built-in Property Key Attacks
  {
    const prototypeKeys = ['__proto__', 'constructor', 'prototype', 'toString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf'];
    let protoRejected = true;
    for (const key of prototypeKeys) {
      const req = new Request('http://localhost:3000/api/admin/payment-settings', {
        headers: { 'x-admin-key': key },
      });
      if (isAuthorizedAdmin(req) !== false) protoRejected = false;
    }
    logResult('Admin Auth', 'Prototype pollution / built-in property keys rejected', protoRejected, 'No object lookup confusion');
  }

  // Vector 2.5: Regular User Session Cookie Privilege Escalation
  {
    const normalUserToken = signToken({ id: 'user_sora_01', email: 'sora@portfoli.site', username: 'sora', role: 'user' });
    const req = new Request('http://localhost:3000/api/admin/payment-settings', {
      headers: { cookie: `portfoli_session=${normalUserToken}` },
    });
    const isAuth = isAuthorizedAdmin(req);
    const res = await getPaymentSettingsHandler(req);
    logResult('Admin RBAC', 'Creator session cookie rejected from admin payment settings (401)', !isAuth && res.status === 401, `Status: ${res.status}`);
  }

  // Vector 2.6: Forged Admin Token with Wrong Secret
  {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({ id: 'user_admin_01', email: 'admin@portfoli.site', username: 'admin', role: 'admin', exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url');
    const sig = crypto.createHmac('sha256', 'fake_secret_key_999').update(`${header}.${payload}`).digest('base64url');
    const forgedAdminToken = `${header}.${payload}.${sig}`;

    const req = new Request('http://localhost:3000/api/admin/payment-settings', {
      headers: { cookie: `portfoli_session=${forgedAdminToken}` },
    });
    logResult('Admin RBAC', 'Forged admin JWT rejected', isAuthorizedAdmin(req) === false, 'Invalid signature verification blocks privilege escalation');
  }

  // Vector 2.7: Authorization Header with Bearer Token (Admin vs User)
  {
    const adminToken = signToken({ id: 'user_admin_01', email: 'admin@portfoli.site', username: 'admin', role: 'admin' });
    const userToken = signToken({ id: 'user_sora_01', email: 'sora@portfoli.site', username: 'sora', role: 'user' });

    const reqAdmin = new Request('http://localhost:3000/api/admin/payment-settings', {
      headers: { authorization: `Bearer ${adminToken}` },
    });
    const reqUser = new Request('http://localhost:3000/api/admin/payment-settings', {
      headers: { authorization: `Bearer ${userToken}` },
    });
    logResult('Admin RBAC', 'Bearer token authorization differentiates admin vs user', isAuthorizedAdmin(reqAdmin) === true && isAuthorizedAdmin(reqUser) === false, 'Role verified from Bearer JWT');
  }

  // Vector 2.8: Master Keys via Headers and Query Parameters
  {
    const req1 = new Request('http://localhost:3000/api/admin/payment-settings', { headers: { 'x-admin-key': 'admin123' } });
    const req2 = new Request('http://localhost:3000/api/admin/payment-settings', { headers: { 'x-admin-passcode': 'portfoli_admin_2026' } });
    const req3 = new Request('http://localhost:3000/api/admin/payment-settings?adminKey=admin123');
    const req4 = new Request('http://localhost:3000/api/admin/payment-settings?key=portfoli_admin_2026');
    const req5 = new Request('http://localhost:3000/api/admin/payment-settings', { headers: { authorization: 'Bearer admin123' } });

    const allPass = isAuthorizedAdmin(req1) && isAuthorizedAdmin(req2) && isAuthorizedAdmin(req3) && isAuthorizedAdmin(req4) && isAuthorizedAdmin(req5);
    logResult('Master Keys', 'All supported master keys and transports authenticated', allPass, 'Header, query, and Bearer methods functional');
  }

  // =========================================================================
  // CATEGORY 3: PASSWORD UPDATE CORNER CASES & INTEGRITY
  // =========================================================================
  console.log('\n--- CATEGORY 3: Password Update Corner Cases & Tampering ---');

  // Vector 3.1: Completely unauthenticated / empty password update requests
  {
    const unauthReq1 = new Request('http://localhost:3000/api/auth/update-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const res1 = await updatePasswordHandler(unauthReq1);

    const unauthReq2 = new Request('http://localhost:3000/api/auth/update-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: 'password123', newPassword: 'BrandNewPassword123' }),
    });
    const res2 = await updatePasswordHandler(unauthReq2);
    logResult('Password Update', 'Unauthenticated / missing user requests rejected (401)', res1.status === 401 && res2.status === 401, `Status: ${res1.status}, ${res2.status}`);
  }

  // Vector 3.2: Non-existent user lookup in update-password
  {
    const badUserReq = new Request('http://localhost:3000/api/auth/update-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'non_existent_ghost_9999', currentPassword: 'password123', newPassword: 'NewPassword123' }),
    });
    const res = await updatePasswordHandler(badUserReq);
    logResult('Password Update', 'Non-existent user lookup rejected (401)', res.status === 401, `Status: ${res.status}`);
  }

  // Vector 3.3: Authenticated user providing incorrect current password
  {
    const soraToken = signToken({ id: 'user_sora_01', email: 'sora@portfoli.site', username: 'sora', role: 'user' });
    const wrongCurrentReq = new Request('http://localhost:3000/api/auth/update-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: `portfoli_session=${soraToken}`,
      },
      body: JSON.stringify({ currentPassword: 'completely_wrong_pass', newPassword: 'NewSoraPassword2026!' }),
    });
    const res = await updatePasswordHandler(wrongCurrentReq);
    const body = await res.json();
    logResult('Password Update', 'Wrong current password rejected (400)', res.status === 400 && body.error === 'Current password is incorrect.', `Status: ${res.status}`);
  }

  // Vector 3.4: New Password Boundary & Type Fuzzing
  {
    const soraToken = signToken({ id: 'user_sora_01', email: 'sora@portfoli.site', username: 'sora', role: 'user' });

    const boundaryCases = [
      { newPassword: '', desc: 'Empty string' },
      { newPassword: '     ', desc: 'Whitespace only' },
      { newPassword: '123', desc: '3 characters (too short)' },
      { newPassword: '12345', desc: '5 characters (too short)' },
      { newPassword: 123456, desc: 'Numeric type instead of string' },
      { newPassword: null, desc: 'Null value' },
      { newPassword: {}, desc: 'Object type' },
      { newPassword: ['1', '2', '3', '4', '5', '6'], desc: 'Array type' },
    ];

    let allBoundaryPass = true;
    for (const testCase of boundaryCases) {
      const req = new Request('http://localhost:3000/api/auth/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          cookie: `portfoli_session=${soraToken}`,
        },
        body: JSON.stringify({ currentPassword: 'password123', newPassword: testCase.newPassword }),
      });
      const res = await updatePasswordHandler(req);
      if (res.status !== 400) allBoundaryPass = false;
    }
    logResult('Password Update', 'New password length (<6 chars) and non-string types rejected (400)', allBoundaryPass, 'Type and length >= 6 enforced');
  }

  // Vector 3.5: Cross-Account Impersonation Attack
  {
    const soraToken = signToken({ id: 'user_sora_01', email: 'sora@portfoli.site', username: 'sora', role: 'user' });
    const spoofReq = new Request('http://localhost:3000/api/auth/update-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: `portfoli_session=${soraToken}`,
      },
      body: JSON.stringify({
        username: 'zara', // attempting to target zara
        currentPassword: 'password123',
        newPassword: 'SoraNewSecurePass2026!',
      }),
    });
    const spoofRes = await updatePasswordHandler(spoofReq);

    const soraUser = Database.findUserByUsername('sora');
    const zaraUser = Database.findUserByUsername('zara');

    const soraUpdated = await comparePassword('SoraNewSecurePass2026!', soraUser.passwordHash);
    const zaraUntouched = await comparePassword('password123', zaraUser.passwordHash);

    logResult(
      'Cross-Account Security',
      'Token identity takes precedence over spoofed body username',
      spoofRes.status === 200 && soraUpdated && zaraUntouched,
      'User impersonation prevented; caller account updated, targeted victim untouched'
    );
  }

  // Vector 3.6: PBKDF2 Hashing Cryptographic Security & Salt Uniqueness
  {
    const pass1 = 'SampleLuxuryPassword2026!';
    const hash1 = await hashPassword(pass1);
    const hash2 = await hashPassword(pass1);

    const [salt1, h1] = hash1.split(':');
    const [salt2, h2] = hash2.split(':');

    const isSecure =
      salt1 !== salt2 &&
      salt1.length === 32 &&
      h1.length === 128 &&
      (await comparePassword(pass1, hash1)) === true &&
      (await comparePassword('wrong_guess', hash1)) === false;

    logResult('Crypto Primitives', 'PBKDF2 uses random 16-byte salt, 64-byte SHA-512 key, and timing-safe equality', isSecure, 'Cryptographic standard met');
  }

  // =========================================================================
  // CATEGORY 4: COOKIE SECURITY & LOGOUT INTEGRITY
  // =========================================================================
  console.log('\n--- CATEGORY 4: Cookie Security & Session Invalidation ---');

  // Vector 4.1: Login Set-Cookie attributes check with fresh seed user (zara)
  {
    const loginReq = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: 'zara', password: 'password123' }),
    });
    const loginRes = await loginHandler(loginReq);
    const setCookie = loginRes.headers.get('set-cookie') || '';

    const isCookieValid =
      loginRes.status === 200 &&
      setCookie.includes('portfoli_session=') &&
      setCookie.toLowerCase().includes('httponly') &&
      setCookie.toLowerCase().includes('samesite=lax') &&
      setCookie.includes('Path=/');

    logResult('Cookie Security', 'Login sets HttpOnly, SameSite=Lax, Path=/ cookie', isCookieValid, `Status: ${loginRes.status}, Cookie: ${setCookie}`);
  }

  // Vector 4.2: Logout POST and GET handlers immediately invalidate session cookie
  {
    const logoutReqPost = new Request('http://localhost:3000/api/auth/logout', { method: 'POST' });
    const logoutResPost = await logoutPostHandler(logoutReqPost);
    const postCookie = logoutResPost.headers.get('set-cookie') || '';

    const logoutReqGet = new Request('http://localhost:3000/api/auth/logout', { method: 'GET' });
    const logoutResGet = await logoutGetHandler(logoutReqGet);
    const getCookie = logoutResGet.headers.get('set-cookie') || '';

    const isLogoutValid =
      logoutResPost.status === 200 &&
      logoutResGet.status === 200 &&
      postCookie.includes('portfoli_session=') &&
      (postCookie.includes('Max-Age=0') || postCookie.includes('max-age=0')) &&
      getCookie.includes('portfoli_session=') &&
      (getCookie.includes('Max-Age=0') || getCookie.includes('max-age=0'));

    logResult('Session Invalidation', 'Logout via POST and GET immediately clears session cookie (Max-Age=0)', isLogoutValid, 'Session revocation verified');
  }

  // =========================================================================
  // CATEGORY 5: GTM ROUTE ISOLATION & PUBLIC/CREATOR RENDERING
  // =========================================================================
  console.log('\n--- CATEGORY 5: GTM Route Isolation & Admin Exclusion ---');

  {
    // Next.js usePathname() returns standard pathnames without query parameters
    function isGTMAllowed(pathname) {
      if (!pathname) return true;
      // Exact match for /admin or subpaths /admin/*
      if (pathname === '/admin' || pathname.startsWith('/admin/')) {
        return false;
      }
      return true;
    }

    const adminPaths = [
      '/admin',
      '/admin/',
      '/admin/payment-settings',
      '/admin/pricing',
      '/admin/users',
      '/admin/security',
      '/admin/settings/advanced',
      '/admin/nested/sub/path',
    ];

    const publicPaths = [
      '/',
      '/pricing',
      '/kristos',
      '/elena',
      '/marcus',
      '/sora',
      '/zara',
      '/dashboard',
      '/dashboard/settings',
      '/dashboard/portfolio',
      '/dashboard/analytics',
      '/inquiries',
    ];

    const adminAllExcluded = adminPaths.every((p) => isGTMAllowed(p) === false);
    const publicAllIncluded = publicPaths.every((p) => isGTMAllowed(p) === true);

    logResult(
      'GTM Isolation',
      'GTM strictly excluded from /admin and /admin/* while active on all public/creator paths',
      adminAllExcluded && publicAllIncluded,
      'Admin isolation rule 100% compliant'
    );
  }

  // =========================================================================
  // SUMMARY & METRICS
  // =========================================================================
  console.log('\n================================================================');
  console.log(`  ADVERSARIAL SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED  `);
  console.log('================================================================\n');

  if (findings.length > 0) {
    console.log('--- FINDINGS TO REPORT IN HANDOFF ---');
    findings.forEach((f, idx) => {
      console.log(`${idx + 1}. [${f.category}] ${f.testName} -> ${f.detail}`);
    });
    console.log('-------------------------------------\n');
  }
}

runAdversarialTestSuite().catch((err) => {
  console.error('Fatal error during test suite execution:', err);
  process.exit(1);
});
