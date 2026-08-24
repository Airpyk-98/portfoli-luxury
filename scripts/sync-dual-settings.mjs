import { neon } from '@neondatabase/serverless';

const connectionString = 'postgresql://neondb_owner:npg_w6Zq1QtKvjCc@ep-late-rice-b15at53p-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(connectionString);

async function syncDualSettings() {
  console.log('Syncing Dual Live & Test configurations to Neon PostgreSQL...');

  const liveConfig = {
    clientId: 'bd08bd61-4ef5-48aa-bd97-54baa6cb8e94',
    clientSecret: 'LrmNFMn2jzZAkHQQQRYryPbTpejlkDzX',
    secretKey: 'LrmNFMn2jzZAkHQQQRYryPbTpejlkDzX',
    publicKey: 'FLWPUBK-12c95a21380df8ff3cc01a7e077d4ebc-X',
    encryptionKey: '+XHci2HLXOgOnVYuxEIhzl1sM/C0asfWv7lhgDVOCUI=',
    webhookSecretHash: 'myportfoli_flw_live_secret_hash_2026',
  };

  const testConfig = {
    clientId: '0cdcb25c-c586-4ed6-bed5-5dbeab11afcf',
    clientSecret: 'm1FHHwKLK1ea8L6UqdDnpeER0UQSuvAQ',
    secretKey: 'm1FHHwKLK1ea8L6UqdDnpeER0UQSuvAQ',
    publicKey: 'FLWPUBK_TEST-0cdcb25c-c586-4ed6-bed5-5dbeab11afcf',
    encryptionKey: 'jg2t/iQ4lnixhzvE14Ub/1y3n4Q1cr+MzF3xpHX0U/Q=',
    webhookSecretHash: 'myportfoli_flw_test_secret_hash_2026',
  };

  const settings = {
    provider: 'flutterwave',
    environment: 'live',
    live: liveConfig,
    test: testConfig,
    clientId: liveConfig.clientId,
    clientSecret: liveConfig.clientSecret,
    secretKey: liveConfig.secretKey,
    publicKey: liveConfig.publicKey,
    encryptionKey: liveConfig.encryptionKey,
    webhookSecretHash: liveConfig.webhookSecretHash,
    gtmContainerId: 'GTM-MSFTWV9X',
    ga4MeasurementId: '',
    lookerStudioEmbedUrl: '',
    enabled: true,
    updatedAt: new Date().toISOString(),
  };

  await sql`
    INSERT INTO settings (key, value, updated_at)
    VALUES ('payment-settings', ${JSON.stringify(settings)}, NOW())
    ON CONFLICT (key)
    DO UPDATE SET value = ${JSON.stringify(settings)}, updated_at = NOW();
  `;

  console.log('✓ Successfully synced separate Live and Test credentials in Neon DB:');
  console.log('  Live Client ID:', settings.live.clientId);
  console.log('  Live Public Key:', settings.live.publicKey);
  console.log('  Live Webhook Hash:', settings.live.webhookSecretHash);
  console.log('  Test Client ID:', settings.test.clientId);
  console.log('  Test Encryption Key:', settings.test.encryptionKey);
  console.log('  Test Webhook Hash:', settings.test.webhookSecretHash);
}

syncDualSettings().catch(console.error);
