const sandboxClientId = '0cdcb25c-c586-4ed6-bed5-5dbeab11afcf';
const sandboxClientSecret = 'm1FHHwKLK1ea8L6UqdDnpeER0UQSuvAQ';
const sandboxEncryptionKey = 'jg2t/iQ4lnixhzvE14Ub/1y3n4Q1cr+MzF3xpHX0U/Q=';

async function testSandbox() {
  console.log('Testing Flutterwave v4 Sandbox OAuth...');
  const params = new URLSearchParams();
  params.append('client_id', sandboxClientId.trim());
  params.append('client_secret', sandboxClientSecret.trim());
  params.append('grant_type', 'client_credentials');

  const tokenRes = await fetch('https://idp.flutterwave.com/realms/flutterwave/protocol/openid-connect/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  const tokenData = await tokenRes.json();
  console.log('Sandbox token status:', tokenRes.status);
  console.log('Sandbox token keys:', Object.keys(tokenData));
  if (tokenData.access_token) {
    console.log('✓ Received Sandbox access_token:', tokenData.access_token.substring(0, 30) + '...');
    console.log('  f4bAccountId:', tokenData.f4bAccountId);

    // Test Sandbox API base: https://developersandbox-api.flutterwave.com
    console.log('\nTesting Sandbox API endpoints with Bearer token...');
    const endpoints = [
      'https://developersandbox-api.flutterwave.com/charges',
      'https://developersandbox-api.flutterwave.com/customers',
      'https://developersandbox-api.flutterwave.com/payments',
    ];

    for (const ep of endpoints) {
      try {
        const res = await fetch(ep, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokenData.access_token}`,
          },
          body: JSON.stringify({ amount: 2000, currency: 'NGN' }),
        });
        const data = await res.text();
        console.log(`Endpoint ${ep} -> Status: ${res.status}`);
        console.log(`  Response: ${data.substring(0, 150)}`);
      } catch (e) {
        console.log(`Endpoint ${ep} -> Error: ${e.message}`);
      }
    }
  }
}

testSandbox();
