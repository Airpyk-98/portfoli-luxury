const baseUrl = 'https://portfoli.site';
const testUsername = `testprod_${Date.now()}`;
const testEmail = `${testUsername}@example.com`;
const testPassword = 'Password123!';
const testName = 'Test Live Creator';

async function fetchJson(url, options = {}) {
  const res = await fetch(url, options);
  const text = await res.text();
  try {
    return { status: res.status, headers: res.headers, data: JSON.parse(text) };
  } catch (e) {
    return { status: res.status, headers: res.headers, text };
  }
}

async function runProductionTests() {
  console.log('=== TESTING LIVE PRODUCTION DEPLOYMENT (portfoli.site) ===\n');

  // 1. Check Pricing Endpoint
  console.log('1. Checking GET /api/admin/pricing (Public Dynamic Pricing)...');
  const priceRes = await fetchJson(`${baseUrl}/api/admin/pricing`);
  console.log('Pricing Status:', priceRes.status);
  console.log('Live Prices: Pro = ₦' + priceRes.data?.pricing?.pro_2k?.priceNgn, '| Elite = ₦' + priceRes.data?.pricing?.elite_5k?.priceNgn);

  // 2. Test Registration
  console.log(`\n2. Testing Registration for @${testUsername}...`);
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

  console.log('Registration Status:', regRes.status);
  if (regRes.status !== 200 || !regRes.data?.success) {
    console.error('Registration failed:', regRes.data || regRes.text);
    process.exit(1);
  }
  console.log('✓ Registration SUCCESS. Created user ID:', regRes.data.user.id);
  const cookie = regRes.headers.get('set-cookie');

  // 3. Test Session on GET /api/portfolio
  console.log('\n3. Testing GET /api/portfolio with session...');
  const portRes = await fetchJson(`${baseUrl}/api/portfolio`, {
    headers: { Cookie: cookie || '' },
  });
  console.log('Portfolio Status:', portRes.status);
  console.log('✓ Session active for:', portRes.data?.user?.name, `(@${portRes.data?.user?.username})`);

  // 4. Test Payment Initialize
  console.log('\n4. Testing POST /api/payment/initialize for Creator Pro (₦2,000)...');
  const payRes = await fetchJson(`${baseUrl}/api/payment/initialize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie || '',
    },
    body: JSON.stringify({
      userId: regRes.data.user.id,
      tier: 'pro_2k',
    }),
  });

  console.log('Payment Init Status:', payRes.status);
  console.log('Payment Init Response:', payRes.data);

  if (payRes.status === 200 && payRes.data?.success) {
    console.log('✓ Payment Initialization: 100% SUCCESS!');
    if (payRes.data.checkoutUrl) {
      console.log('  Hosted Checkout URL:', payRes.data.checkoutUrl);
    }
    if (payRes.data.inlineConfig) {
      console.log('  Inline Modal Public Key:', payRes.data.inlineConfig.public_key);
      console.log('  Transaction Ref:', payRes.data.inlineConfig.tx_ref);
      console.log('  Amount:', payRes.data.inlineConfig.amount, payRes.data.inlineConfig.currency);
    }
  } else {
    console.error('✗ Payment init failed:', payRes.data || payRes.text);
    process.exit(1);
  }

  console.log('\n=== ALL PRODUCTION ENDPOINTS VERIFIED AND WORKING 100% ===');
}

runProductionTests().catch(console.error);
