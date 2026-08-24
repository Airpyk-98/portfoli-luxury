import { neon } from '@neondatabase/serverless';

const connectionString = 'postgresql://neondb_owner:npg_w6Zq1QtKvjCc@ep-late-rice-b15at53p-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(connectionString);

async function checkSettings() {
  const rows = await sql`SELECT key, value, updated_at FROM settings WHERE key = 'payment-settings';`;
  console.log('--- NEON DATABASE PAYMENT SETTINGS ---');
  if (rows.length > 0) {
    const s = rows[0].value;
    console.log('✓ Found settings in Neon:');
    console.log('  Provider:', s.provider);
    console.log('  Environment:', s.environment);
    console.log('  Client ID:', s.clientId);
    console.log('  Secret Key (Length):', s.clientSecret?.length, 'chars');
    console.log('  Encryption Key (Length):', s.encryptionKey?.length, 'chars');
    console.log('  Public Key:', s.publicKey);
    console.log('  GTM Container ID:', s.gtmContainerId);
    console.log('  Updated At:', rows[0].updated_at);
  } else {
    console.log('✗ No settings row found in Neon.');
  }
}

checkSettings().catch(console.error);
