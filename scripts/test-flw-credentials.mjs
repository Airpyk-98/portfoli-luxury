const clientId = 'bd08bd61-4ef5-48aa-bd97-54baa6cb8e94';
const clientSecret = 'LrmNFMn2jzZAkHQQQRYryPbTpejlkDzX';
const encryptionKey = '+XHci2HLXOgOnVYuxEIhzl1sM/C0asfWv7lhgDVOCUI=';

async function testFlutterwaveAuth() {
  console.log('--- TESTING FLUTTERWAVE V4 OAUTH2 AUTHENTICATION ---');
  console.log('Client ID:', clientId);

  // 1. Request v4 OAuth token
  const params = new URLSearchParams();
  params.append('client_id', clientId.trim());
  params.append('client_secret', clientSecret.trim());
  params.append('grant_type', 'client_credentials');

  try {
    console.log('Requesting OAuth token from Flutterwave IDP...');
    const tokenRes = await fetch('https://idp.flutterwave.com/realms/flutterwave/protocol/openid-connect/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const tokenData = await tokenRes.json();
    console.log('Token response status:', tokenRes.status);
    console.log('Token response keys:', Object.keys(tokenData));

    if (tokenData.access_token) {
      console.log('✓ SUCCESS: Received v4 OAuth access token!');
      console.log('Access token prefix:', tokenData.access_token.substring(0, 25) + '...');

      // 2. Test Creating Standard Hosted Payment
      console.log('\n--- TESTING PAYMENT INITIALIZATION ---');
      const payRes = await fetch('https://api.flutterwave.com/v3/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenData.access_token}`,
        },
        body: JSON.stringify({
          tx_ref: `test_${Date.now()}`,
          amount: 2000,
          currency: 'NGN',
          redirect_url: 'https://portfoli.site/dashboard?payment=success',
          customer: {
            email: 'test@portfoli.site',
            name: 'Test Customer',
          },
          customizations: {
            title: 'portfoli — Luxury Portfolio Subscription',
            description: '1-Year Subscription',
          },
        }),
      });

      const payData = await payRes.json();
      console.log('Payment API status:', payRes.status);
      console.log('Payment API response:', payData);

      if (payData.status === 'success' && payData.data?.link) {
        console.log('✓ SUCCESS: Generated Hosted Checkout Link:', payData.data.link);
      }
    } else {
      console.error('Failed to get token:', tokenData);
    }
  } catch (err) {
    console.error('Error during Flutterwave test:', err);
  }
}

testFlutterwaveAuth();
