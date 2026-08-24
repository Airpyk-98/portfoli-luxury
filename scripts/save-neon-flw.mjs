import { neon } from '@neondatabase/serverless';

const connectionString = 'postgresql://neondb_owner:npg_w6Zq1QtKvjCc@ep-late-rice-b15at53p-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(connectionString);

async function saveFlutterwaveSettings() {
  console.log('Saving Flutterwave v4 settings to Neon PostgreSQL...');

  const settings = {
    provider: 'flutterwave',
    environment: 'live',
    clientId: 'bd08bd61-4ef5-48aa-bd97-54baa6cb8e94',
    clientSecret: 'LrmNFMn2jzZAkHQQQRYryPbTpejlkDzX',
    secretKey: 'LrmNFMn2jzZAkHQQQRYryPbTpejlkDzX',
    publicKey: 'FLWPUBK_LIVE-bd08bd614ef548aabd9754baa6cb8e94',
    encryptionKey: '+XHci2HLXOgOnVYuxEIhzl1sM/C0asfWv7lhgDVOCUI=',
    webhookSecretHash: 'portfoli_flw_live_secret_hash_2026',
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

  console.log('✓ Successfully saved Flutterwave v4 settings into Neon PostgreSQL!');

  // Verify
  const rows = await sql`SELECT key, value FROM settings WHERE key = 'payment-settings';`;
  console.log('Read back from DB:', rows[0].value.clientId, 'Secret length:', rows[0].value.clientSecret?.length);
}

saveFlutterwaveSettings().catch(err => {
  console.error('Error saving settings to Neon:', err);
  process.exit(1);
});
