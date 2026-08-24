import { neon } from '@neondatabase/serverless';

const connectionString = 'postgresql://neondb_owner:npg_w6Zq1QtKvjCc@ep-late-rice-b15at53p-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(connectionString);

async function updatePublicKey() {
  console.log('Updating Flutterwave Public Key in Neon PostgreSQL...');

  const pubKey = 'FLWPUBK-12c95a21380df8ff3cc01a7e077d4ebc-X';

  const rows = await sql`SELECT value FROM settings WHERE key = 'payment-settings';`;
  let settings = rows.length > 0 ? rows[0].value : {};

  settings = {
    ...settings,
    publicKey: pubKey,
    updatedAt: new Date().toISOString(),
  };

  await sql`
    INSERT INTO settings (key, value, updated_at)
    VALUES ('payment-settings', ${JSON.stringify(settings)}, NOW())
    ON CONFLICT (key)
    DO UPDATE SET value = ${JSON.stringify(settings)}, updated_at = NOW();
  `;

  console.log('✓ Successfully saved real Flutterwave Public Key to Neon DB:');
  console.log('  publicKey:', settings.publicKey);
  console.log('  clientId:', settings.clientId);
  console.log('  secretKey length:', settings.secretKey?.length);
}

updatePublicKey().catch(err => {
  console.error('Error updating public key in Neon:', err);
  process.exit(1);
});
