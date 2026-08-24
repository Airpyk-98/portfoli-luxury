const clientId = 'bd08bd61-4ef5-48aa-bd97-54baa6cb8e94';
const clientSecret = 'LrmNFMn2jzZAkHQQQRYryPbTpejlkDzX';
const secretKey = 'LrmNFMn2jzZAkHQQQRYryPbTpejlkDzX';
const encryptionKey = '+XHci2HLXOgOnVYuxEIhzl1sM/C0asfWv7lhgDVOCUI=';

async function testOfficialFlutterwaveFlow() {
  console.log('=== OFFICIAL FLUTTERWAVE API AUDIT & LIVE VERIFICATION ===\n');

  // Test 1: OAuth 2.0 Token Generation (v4)
  console.log('1. Testing v4 OAuth 2.0 Authentication (idp.flutterwave.com)...');
  const params = new URLSearchParams();
  params.append('client_id', clientId.trim());
  params.append('client_secret', clientSecret.trim());
  params.append('grant_type', 'client_credentials');

  const tokenRes = await fetch('https://idp.flutterwave.com/realms/flutterwave/protocol/openid-connect/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  console.log('OAuth Token HTTP Status:', tokenRes.status);
  const tokenData = await tokenRes.json();
  if (tokenData.access_token) {
    console.log('✓ Token Generation: SUCCESS');
    console.log('  Scope:', tokenData.scope);
    console.log('  f4bAccountId:', tokenData.f4bAccountId);
    console.log('  Expires In:', tokenData.expires_in, 'seconds');
  } else {
    console.error('✗ Token Generation Failed:', tokenData);
  }

  // Test 2: Standard v3 / v4 API Endpoint compatibility
  console.log('\n2. Testing Payment Creation Endpoints...');

  // Try with v4 OAuth Bearer on v4 production base
  const v4BaseRes = await fetch('https://f4bexperience.flutterwave.com/charges', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenData.access_token}`,
    },
    body: JSON.stringify({}),
  });
  console.log('f4bexperience.flutterwave.com/charges status:', v4BaseRes.status);
  const v4BaseData = await v4BaseRes.json();
  console.log('f4bexperience response:', v4BaseData.error?.message || v4BaseData.message);

  // Test 3: Check secret key format
  console.log('\n3. Secret Key format analysis:');
  console.log('  Length:', secretKey.length, 'characters');
  console.log('  Is v3 format (FLWSECK-...):', secretKey.startsWith('FLWSECK'));
  console.log('  Is v4 client secret:', secretKey.length === 32 && !secretKey.startsWith('FLW'));

  console.log('\n=== AUDIT COMPLETE ===');
}

testOfficialFlutterwaveFlow().catch(console.error);
