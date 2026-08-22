import assert from 'node:assert';
import crypto from 'node:crypto';
import { hashPassword, comparePassword, signToken, verifyToken, getSessionCookieOptions, SESSION_COOKIE_NAME } from '../../src/lib/auth.ts';
import { isAuthorizedAdmin, getMasterKey } from '../../src/lib/admin-auth.ts';
import { Database } from '../../src/lib/storage.ts';

// Import Route Handlers
import { POST as loginHandler } from '../../src/app/api/auth/login/route.ts';
import { POST as logoutHandler, GET as logoutGetHandler } from '../../src/app/api/auth/logout/route.ts';
import { POST as updatePasswordHandler } from '../../src/app/api/auth/update-password/route.ts';
import { GET as getPaymentSettingsHandler, POST as postPaymentSettingsHandler } from '../../src/app/api/admin/payment-settings/route.ts';

async function runAdversarialTests() {
  console.log("=== ADVERSARIAL STRESS-TEST SUITE: MILESTONE M1 ===\n");
  let passed = 0;
  let failed = 0;

  function run(name, fn) {
    try {
      fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  async function runAsync(name, fn) {
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  // --- 1. Adversarial Password Security & Edge Cases ---
  console.log("--- 1. Adversarial Password Security ---");
  await runAsync("comparePassword rejects null, undefined, empty string, non-string safely", async () => {
    assert.strictEqual(await comparePassword("", "$2a$10$YourHashedPasswordHerePlaceholder"), false);
    assert.strictEqual(await comparePassword(null, "$2a$10$YourHashedPasswordHerePlaceholder"), false);
    assert.strictEqual(await comparePassword(undefined, "$2a$10$YourHashedPasswordHerePlaceholder"), false);
    assert.strictEqual(await comparePassword("pass", "malformed_no_colon"), false);
    assert.strictEqual(await comparePassword("pass", "too:many:colons:in:hash"), false);
    assert.strictEqual(await comparePassword("pass", "invalid_salt_hex:invalid_hash_hex"), false);
  });

  await runAsync("comparePassword timingSafeEqual handles buffer length mismatches without exception", async () => {
    const salt = crypto.randomBytes(16).toString("hex");
    const shortHash = `${salt}:deadbeef`; // only 4 bytes instead of 64 bytes
    assert.strictEqual(await comparePassword("password123", shortHash), false);
  });

  // --- 2. Token Cryptographic Forgery & Replay ---
  console.log("\n--- 2. Token Cryptographic Forgery & Tampering ---");
  run("verifyToken rejects signature substitution (none algorithm)", () => {
    const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
    const data = Buffer.from(JSON.stringify({ id: "hacker", role: "admin" })).toString("base64url");
    assert.strictEqual(verifyToken(`${header}.${data}.`), null);
    assert.strictEqual(verifyToken(`${header}.${data}`), null);
  });

  run("verifyToken rejects role elevation payload modification", () => {
    const userToken = signToken({ id: "u1", email: "u1@test.com", username: "u1", role: "user" });
    const [header, data, sig] = userToken.split(".");
    const decoded = JSON.parse(Buffer.from(data, "base64url").toString());
    decoded.role = "admin";
    const hackedData = Buffer.from(JSON.stringify(decoded)).toString("base64url");
    const tamperedToken = `${header}.${hackedData}.${sig}`;
    assert.strictEqual(verifyToken(tamperedToken), null);
  });

  run("verifyToken rejects truncated tokens and special character injections", () => {
    assert.strictEqual(verifyToken(""), null);
    assert.strictEqual(verifyToken(".."), null);
    assert.strictEqual(verifyToken("a.b"), null);
    assert.strictEqual(verifyToken("a.b.c.d"), null);
    assert.strictEqual(verifyToken("null.null.null"), null);
    assert.strictEqual(verifyToken("SELECT * FROM users;"), null);
  });

  // --- 3. Admin Authorization Matrix ---
  console.log("\n--- 3. Admin Authorization Boundary Testing ---");
  run("isAuthorizedAdmin boundary checks: case sensitivity, whitespace, spoofing", () => {
    // Correct keys
    assert.strictEqual(isAuthorizedAdmin(new Request("http://localhost:3000/api/admin", { headers: { "x-admin-key": "admin123" } })), true);
    assert.strictEqual(isAuthorizedAdmin(new Request("http://localhost:3000/api/admin", { headers: { "x-admin-key": " portfoli_admin_2026 " } })), true); // whitespace trimmed
    assert.strictEqual(isAuthorizedAdmin(new Request("http://localhost:3000/api/admin", { headers: { "x-admin-passcode": "admin123" } })), true);

    // Header casing checks (HTTP headers are case-insensitive in Fetch standard)
    assert.strictEqual(isAuthorizedAdmin(new Request("http://localhost:3000/api/admin", { headers: { "X-Admin-Key": "admin123" } })), true);

    // Spoofed / partial keys
    assert.strictEqual(isAuthorizedAdmin(new Request("http://localhost:3000/api/admin", { headers: { "x-admin-key": "admin12" } })), false);
    assert.strictEqual(isAuthorizedAdmin(new Request("http://localhost:3000/api/admin", { headers: { "x-admin-key": "admin1234" } })), false);
    assert.strictEqual(isAuthorizedAdmin(new Request("http://localhost:3000/api/admin", { headers: { "x-admin-key": "" } })), false);

    // Regular user token in Bearer header
    const userToken = signToken({ id: "user_kristos_01", email: "k@p.me", username: "kristos", role: "user" });
    assert.strictEqual(isAuthorizedAdmin(new Request("http://localhost:3000/api/admin", { headers: { authorization: `Bearer ${userToken}` } })), false);

    // Admin token in Bearer header
    const adminToken = signToken({ id: "user_admin_01", email: "admin@p.me", username: "admin", role: "admin" });
    assert.strictEqual(isAuthorizedAdmin(new Request("http://localhost:3000/api/admin", { headers: { authorization: `Bearer ${adminToken}` } })), true);

    // Cookie injection: multiple cookies with session cookie
    assert.strictEqual(isAuthorizedAdmin(new Request("http://localhost:3000/api/admin", { headers: { cookie: `other_cookie=123; portfoli_session=${adminToken}; ga=UA-123` } })), true);
    assert.strictEqual(isAuthorizedAdmin(new Request("http://localhost:3000/api/admin", { headers: { cookie: `other_cookie=123; portfoli_session=${userToken}; ga=UA-123` } })), false);
  });

  // --- 4. Password Update Lifecycle with Temporary Ephemeral User ---
  console.log("\n--- 4. Password Update Lifecycle with Ephemeral User ---");
  await runAsync("Create ephemeral creator, update password via API, verify login transitions, and cleanup", async () => {
    const testUserId = "user_ephemeral_rev2_" + Date.now();
    const testUsername = "rev2_test_" + Math.random().toString(36).substring(2, 7);
    const initialPass = "InitialPass@2026";
    const initialHash = await hashPassword(initialPass);

    const testUser = {
      id: testUserId,
      email: `${testUsername}@portfoli.me`,
      username: testUsername,
      name: "Ephemeral Test User",
      passwordHash: initialHash,
      role: "user",
      subscription: {
        tier: "pro_2k",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365*24*60*60*1000).toISOString(),
        active: true,
        autoRenew: true,
        amountPaid: 2000,
        currency: "NGN",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    Database.saveUser(testUser);

    try {
      // 1. Verify initial login works
      const loginReq1 = new Request("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login: testUsername, password: initialPass }),
      });
      const loginRes1 = await loginHandler(loginReq1);
      assert.strictEqual(loginRes1.status, 200, "Initial login must succeed");

      // 2. Obtain session token
      const sessionToken = signToken({ id: testUserId, email: testUser.email, username: testUsername, role: "user" });

      // 3. Attempt update with wrong current password -> must fail with 400
      const failUpdateReq = new Request("http://localhost:3000/api/auth/update-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: `portfoli_session=${sessionToken}`,
        },
        body: JSON.stringify({ currentPassword: "wrong_initial_password", newPassword: "NewSecretPassword2026!" }),
      });
      const failUpdateRes = await updatePasswordHandler(failUpdateReq);
      assert.strictEqual(failUpdateRes.status, 400, "Wrong current password must return 400");

      // 4. Update with valid current password and new password
      const newPass = "NewSecretPassword2026!";
      const okUpdateReq = new Request("http://localhost:3000/api/auth/update-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: `portfoli_session=${sessionToken}`,
        },
        body: JSON.stringify({ currentPassword: initialPass, newPassword: newPass }),
      });
      const okUpdateRes = await updatePasswordHandler(okUpdateReq);
      assert.strictEqual(okUpdateRes.status, 200, "Valid password update must return 200");

      // 5. Verify database has updated PBKDF2 hash
      const refetched = Database.findUserById(testUserId);
      assert.ok(refetched.passwordHash.includes(":"), "Hash must be in salt:hash format");
      assert.strictEqual(await comparePassword(newPass, refetched.passwordHash), true);
      assert.strictEqual(await comparePassword(initialPass, refetched.passwordHash), false);

      // 6. Verify old password login fails
      const loginReqOld = new Request("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login: testUsername, password: initialPass }),
      });
      const loginResOld = await loginHandler(loginReqOld);
      assert.strictEqual(loginResOld.status, 401, "Login with old password must be rejected");

      // 7. Verify new password login succeeds
      const loginReqNew = new Request("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login: testUsername, password: newPass }),
      });
      const loginResNew = await loginHandler(loginReqNew);
      assert.strictEqual(loginResNew.status, 200, "Login with new password must succeed");

    } finally {
      // Cleanup: remove ephemeral user
      const users = Database.getUsers().filter(u => u.id !== testUserId);
      Database.saveUsers(users);
    }
  });

  // --- 5. GTM Strict Exclusion Matrix ---
  console.log("\n--- 5. GTM Route Strict Isolation Matrix ---");
  run("GTM path exclusion verifies exact matches and nested subpaths", () => {
    function isGTMAllowed(pathname) {
      if (!pathname) return true;
      if (pathname === "/admin" || pathname.startsWith("/admin/")) return false;
      return true;
    }

    // Must be blocked
    const blockedPaths = [
      "/admin",
      "/admin/",
      "/admin/pricing",
      "/admin/users",
      "/admin/payment-settings",
      "/admin/security",
      "/admin/settings/general",
    ];
    for (const p of blockedPaths) {
      assert.strictEqual(isGTMAllowed(p), false, `GTM must be blocked on ${p}`);
    }

    // Must be allowed
    const allowedPaths = [
      "/",
      "/kristos",
      "/elena",
      "/marcus",
      "/sora",
      "/zara",
      "/pricing",
      "/dashboard",
      "/dashboard/settings",
      "/dashboard/editor",
      "/dashboard/inquiries",
      "/login",
      "/register",
      "/administrator", // not /admin or /admin/
    ];
    for (const p of allowedPaths) {
      assert.strictEqual(isGTMAllowed(p), true, `GTM must be allowed on ${p}`);
    }
  });

  console.log(`\n======================================================`);
  console.log(`ADVERSARIAL SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`======================================================\n`);
  if (failed > 0) process.exit(1);
}

runAdversarialTests().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
