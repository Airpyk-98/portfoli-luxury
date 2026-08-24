const clientId = 'bd08bd61-4ef5-48aa-bd97-54baa6cb8e94';
const clientSecret = 'LrmNFMn2jzZAkHQQQRYryPbTpejlkDzX';

async function testV4Endpoints() {
  const params = new URLSearchParams();
  params.append('client_id', clientId.trim());
  params.append('client_secret', clientSecret.trim());
  params.append('grant_type', 'client_credentials');

  const tokenRes = await fetch('https://idp.flutterwave.com/realms/flutterwave/protocol/openid-connect/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  const { access_token } = await tokenRes.json();
  console.log('Got v4 token:', Boolean(access_token));

  const endpoints = [
    'https://api.flutterwave.com/v3/payments',
    'https://api.flutterwave.com/v4/charges',
    'https://api.flutterwave.com/v4/payments',
    'https://developersandbox-api.flutterwave.com/charges',
    'https://f4bexperience.flutterwave.com/charges',
    'https://f4bexperience.flutterwave.com/payments',
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({
          amount: 2000,
          currency: 'NGN',
          redirect_url: 'https://portfoli.site/dashboard',
        }),
      });
      const data = await res.text();
      console.log(`Endpoint: ${ep} -> Status: ${res.status}`);
      console.log(`  Response: ${data.substring(0, 150)}`);
    } catch (e) {
      console.log(`Endpoint: ${ep} -> Error: ${e.message}`);
    }
  }
}

testV4Endpoints();
