const clientId = 'bd08bd61-4ef5-48aa-bd97-54baa6cb8e94';
const clientSecret = 'LrmNFMn2jzZAkHQQQRYryPbTpejlkDzX';

async function testF4BEndpoints() {
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

  const endpoints = [
    { ep: 'https://f4bexperience.flutterwave.com/customers', method: 'POST', body: { email: 'customer@portfoli.site', name: 'Portfoli Customer' } },
    { ep: 'https://f4bexperience.flutterwave.com/payment-links', method: 'POST', body: { amount: 2000, currency: 'NGN', name: 'Subscription' } },
    { ep: 'https://f4bexperience.flutterwave.com/checkouts', method: 'POST', body: { amount: 2000, currency: 'NGN' } },
  ];

  for (const item of endpoints) {
    try {
      const res = await fetch(item.ep, {
        method: item.method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify(item.body),
      });
      const data = await res.text();
      console.log(`${item.ep} -> Status: ${res.status}`);
      console.log(`  Response: ${data.substring(0, 200)}`);
    } catch (e) {
      console.log(`${item.ep} -> Error: ${e.message}`);
    }
  }
}

testF4BEndpoints();
