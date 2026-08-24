const clientId = 'bd08bd61-4ef5-48aa-bd97-54baa6cb8e94';
const clientSecret = 'LrmNFMn2jzZAkHQQQRYryPbTpejlkDzX';

async function testV4Charge() {
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
  console.log('Access token acquired:', Boolean(access_token));

  // Try creating charge with v4
  const payload = {
    amount: 2000,
    currency: 'NGN',
    reference: `tx_portfoli_${Date.now()}`,
    redirect_url: 'https://portfoli.site/dashboard?payment=success',
    customer: {
      email: 'test@portfoli.site',
      name: 'Portfoli Creator',
    },
    customizations: {
      title: 'portfoli — Luxury Portfolio Subscription',
      description: '1-Year Subscription',
    },
  };

  const ep = 'https://f4bexperience.flutterwave.com/charges';
  const res = await fetch(ep, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${access_token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  console.log('Charge creation status:', res.status);
  console.log('Response body:', JSON.stringify(data, null, 2));
}

testV4Charge();
