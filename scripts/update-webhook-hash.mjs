import { neon } from '@neondatabase/serverless';

const connectionString = 'postgresql://neondb_owner:npg_w6Zq1QtKvjCc@ep-late-rice-b15at53p-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(connectionString);

async function updateWebhookHash() {
  console.log('Updating webhookSecretHash in Neon PostgreSQL...');

  const rows = await sql`SELECT value FROM settings WHERE key = 'payment-settings';`;
  let settings = rows.length > 0 ? rows[0].value : {};

  settings = {
    ...settings,
    webhookSecretHash: 'myportfoli_flw_live_secret_hash_2026',
    updatedAt: new Date().toISOString(),
  };

  await sql`
    INSERT INTO settings (key, value, updated_at)
    VALUES ('payment-settings', ${JSON.stringify(settings)}, NOW())
    ON CONFLICT (key)
    DO UPDATE SET value = ${JSON.stringify(settings)}, updated_at = NOW();
  `;

  console.log('✓ Successfully saved webhookSecretHash to Neon DB:');
  console.log('  webhookSecretHash:', settings.webhookSecretHash);
}

updateWebhookHash().catch(console.error);
