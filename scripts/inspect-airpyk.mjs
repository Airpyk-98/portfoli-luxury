import { neon } from '@neondatabase/serverless';

const connectionString = 'postgresql://neondb_owner:npg_w6Zq1QtKvjCc@ep-late-rice-b15at53p-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(connectionString);

async function inspectUser() {
  const rows = await sql`SELECT id, username, email, name, subscription, portfolio FROM users WHERE username = 'airpyk98';`;
  if (rows.length > 0) {
    console.log('Found user airpyk98:');
    console.log('Subscription:', rows[0].subscription);
    console.log('Portfolio customSubdomain:', rows[0].portfolio?.customSubdomain);
    console.log('Portfolio keys:', Object.keys(rows[0].portfolio || {}));
  } else {
    console.log('User airpyk98 not found');
  }
}

inspectUser().catch(console.error);
