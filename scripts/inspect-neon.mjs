import { neon } from '@neondatabase/serverless';

const connectionString = 'postgresql://neondb_owner:npg_w6Zq1QtKvjCc@ep-late-rice-b15at53p-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(connectionString);

async function inspectDb() {
  console.log('Connecting to Neon PostgreSQL database...');

  // 1. Check existing tables
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `;
  console.log('Existing tables:', tables.map(t => t.table_name));

  // 2. Initialize schema if not present
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(100) PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      username VARCHAR(100) UNIQUE NOT NULL,
      password_hash TEXT,
      name VARCHAR(255),
      role VARCHAR(50) DEFAULT 'user',
      subscription JSONB NOT NULL,
      portfolio JSONB NOT NULL,
      storage_used_bytes BIGINT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS inquiries (
      id VARCHAR(100) PRIMARY KEY,
      portfolio_user_id VARCHAR(100),
      portfolio_username VARCHAR(100),
      sender_name VARCHAR(255),
      sender_email VARCHAR(255),
      sender_subject TEXT,
      message TEXT,
      service_interest VARCHAR(255),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS settings (
      key VARCHAR(100) PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  // 3. Query all users
  const users = await sql`
    SELECT id, username, email, name, role, subscription->>'tier' as tier, (subscription->>'active')::boolean as active, created_at
    FROM users
    ORDER BY created_at DESC;
  `;

  console.log(`\nFound ${users.length} user account(s) in Neon PostgreSQL:`);
  console.table(users);

  // 4. Query settings
  const settings = await sql`SELECT key, updated_at FROM settings;`;
  console.log('\nSettings entries in Neon:');
  console.table(settings);
}

inspectDb().catch(err => {
  console.error('Neon inspection error:', err);
  process.exit(1);
});
