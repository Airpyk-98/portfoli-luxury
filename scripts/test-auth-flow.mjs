import http from 'http';

const testUsername = `testuser_${Date.now()}`;
const testEmail = `${testUsername}@example.com`;
const testPassword = 'Password123!';
const testName = 'Test User Cyber';

async function fetchJson(url, options = {}) {
  const res = await fetch(url, options);
  const text = await res.text();
  try {
    return { status: res.status, headers: res.headers, data: JSON.parse(text) };
  } catch (e) {
    return { status: res.status, headers: res.headers, text };
  }
}

async function runTests() {
  console.log('--- STARTING AUTH & SUBSCRIPTION INTEGRATION TESTS ---');
  const baseUrl = 'http://localhost:3000';

  // 1. Test Registration
  console.log(`\n1. Testing Registration for username: ${testUsername}...`);
  const regRes = await fetchJson(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: testName,
      email: testEmail,
      username: testUsername,
      password: testPassword,
    }),
  });

  console.log(`Registration status: ${regRes.status}`);
  if (regRes.status !== 200 || !regRes.data?.success) {
    console.error('Registration failed:', regRes.data || regRes.text);
    process.exit(1);
  }
  console.log('✓ Registration SUCCESS:', regRes.data.user.username, regRes.data.user.id);

  // Extract set-cookie
  const setCookie = regRes.headers.get('set-cookie');
  console.log('✓ Session Cookie received:', Boolean(setCookie));

  // 2. Test Login
  console.log(`\n2. Testing Login with ${testUsername}...`);
  const loginRes = await fetchJson(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      login: testUsername,
      password: testPassword,
    }),
  });

  console.log(`Login status: ${loginRes.status}`);
  if (loginRes.status !== 200 || !loginRes.data?.success) {
    console.error('Login failed:', loginRes.data || loginRes.text);
    process.exit(1);
  }
  console.log('✓ Login SUCCESS:', loginRes.data.user.username);

  const loginCookie = loginRes.headers.get('set-cookie');

  // 3. Test Portfolio & Session Verification
  console.log('\n3. Testing GET /api/portfolio with session cookie...');
  const portRes = await fetchJson(`${baseUrl}/api/portfolio`, {
    headers: {
      Cookie: loginCookie || setCookie || '',
    },
  });

  console.log(`Portfolio status: ${portRes.status}`);
  if (portRes.status !== 200 || !portRes.data?.user) {
    console.error('Portfolio fetch failed:', portRes.data || portRes.text);
    process.exit(1);
  }
  console.log('✓ Portfolio session SUCCESS. Logged in as:', portRes.data.user.name, `(@${portRes.data.user.username})`);
  console.log('  Subscription tier:', portRes.data.user.subscription.tier, '(Active:', portRes.data.user.subscription.active, ')');

  // 4. Test Payment Initialize
  console.log('\n4. Testing POST /api/payment/initialize for Elite 5k...');
  const payInitRes = await fetchJson(`${baseUrl}/api/payment/initialize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: loginCookie || setCookie || '',
    },
    body: JSON.stringify({
      userId: portRes.data.user.id,
      tier: 'elite_5k',
    }),
  });

  console.log(`Payment initialize status: ${payInitRes.status}`);
  if (payInitRes.status !== 200 || !payInitRes.data?.success) {
    console.error('Payment initialize failed:', payInitRes.data || payInitRes.text);
    process.exit(1);
  }
  console.log('✓ Payment initialize SUCCESS. Checkout URL generated:', Boolean(payInitRes.data.checkoutUrl));
  console.log('  Amount to charge:', payInitRes.data.amount, payInitRes.data.currency);

  console.log('\n--- ALL AUTH & PAYMENT TESTS PASSED PERFECTLY! ---');
  process.exit(0);
}

// Wait for dev server to boot
setTimeout(() => {
  runTests().catch((err) => {
    console.error('Test execution error:', err);
    process.exit(1);
  });
}, 3000);
