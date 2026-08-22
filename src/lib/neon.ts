import { neon, neonConfig } from '@neondatabase/serverless';
import { User, Inquiry, PricingConfig } from './types';
import { DEFAULT_PRICING } from './tiers';

// Configure connection caching for serverless
neonConfig.fetchConnectionCache = true;

const connectionString =
  process.env.DATABASE_URL ||
  process.env.NEON_DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  '';

export const sql = connectionString ? neon(connectionString) : null;

let isSchemaInitialized = false;

/**
 * Initializes required Postgres tables in Neon if they don't exist yet.
 */
export async function initNeonSchema() {
  if (!sql || isSchemaInitialized) return;

  try {
    // 1. Users table
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

    // 2. Inquiries table
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

    // 3. Settings table (for dynamic pricing and payment gateway credentials)
    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        key VARCHAR(100) PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // 4. Index on customSubdomain inside portfolio JSONB for fast edge lookup
    await sql`
      CREATE INDEX IF NOT EXISTS idx_users_subdomain ON users ((portfolio->>'customSubdomain'));
    `;

    // 5. Seed initial demo users if table is empty
    const countRes = await sql`SELECT count(*)::int as count FROM users;`;
    if (countRes && countRes[0] && countRes[0].count === 0) {
      try {
        const { SEED_USERS } = require('./storage');
        if (Array.isArray(SEED_USERS) && SEED_USERS.length > 0) {
          for (const u of SEED_USERS) {
            await sql`
              INSERT INTO users (
                id, email, username, password_hash, name, role, subscription, portfolio, storage_used_bytes, created_at, updated_at
              ) VALUES (
                ${u.id},
                ${u.email.toLowerCase()},
                ${u.username.toLowerCase()},
                ${u.passwordHash || ''},
                ${u.name},
                ${u.role || 'user'},
                ${JSON.stringify(u.subscription)},
                ${JSON.stringify(u.portfolio)},
                ${u.storageUsedBytes || 0},
                NOW(),
                NOW()
              ) ON CONFLICT (id) DO NOTHING;
            `;
          }
        }
      } catch (seedErr) {
        console.warn('Seed population notice:', seedErr);
      }
    }

    isSchemaInitialized = true;
  } catch (err) {
    console.warn('Neon schema init notice (might be read-only or connecting):', err);
  }
}

// Auto-run schema check in background
if (sql) {
  initNeonSchema().catch(() => {});
}

/**
 * User Operations on Neon
 */
export async function getNeonUsers(): Promise<User[]> {
  if (!sql) return [];
  try {
    await initNeonSchema();
    const rows = await sql`SELECT * FROM users ORDER BY created_at DESC;`;
    return rows.map((r: any) => ({
      id: r.id,
      email: r.email,
      username: r.username,
      passwordHash: r.password_hash,
      name: r.name,
      role: r.role,
      subscription: r.subscription,
      portfolio: r.portfolio,
      storageUsedBytes: Number(r.storage_used_bytes || 0),
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  } catch (err) {
    console.error('Neon getNeonUsers error:', err);
    return [];
  }
}

export async function findNeonUserByUsername(username: string): Promise<User | null> {
  if (!sql) return null;
  try {
    await initNeonSchema();
    const rows = await sql`
      SELECT * FROM users WHERE LOWER(username) = LOWER(${username}) LIMIT 1;
    `;
    if (!rows || rows.length === 0) return null;
    const r = rows[0] as any;
    return {
      id: r.id,
      email: r.email,
      username: r.username,
      passwordHash: r.password_hash,
      name: r.name,
      role: r.role,
      subscription: r.subscription,
      portfolio: r.portfolio,
      storageUsedBytes: Number(r.storage_used_bytes || 0),
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  } catch (err) {
    console.error('Neon findNeonUserByUsername error:', err);
    return null;
  }
}

export async function findNeonUserById(id: string): Promise<User | null> {
  if (!sql) return null;
  try {
    await initNeonSchema();
    const rows = await sql`
      SELECT * FROM users WHERE id = ${id} LIMIT 1;
    `;
    if (!rows || rows.length === 0) return null;
    const r = rows[0] as any;
    return {
      id: r.id,
      email: r.email,
      username: r.username,
      passwordHash: r.password_hash,
      name: r.name,
      role: r.role,
      subscription: r.subscription,
      portfolio: r.portfolio,
      storageUsedBytes: Number(r.storage_used_bytes || 0),
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  } catch (err) {
    console.error('Neon findNeonUserById error:', err);
    return null;
  }
}

export async function findNeonUserByEmail(email: string): Promise<User | null> {
  if (!sql) return null;
  try {
    await initNeonSchema();
    const rows = await sql`
      SELECT * FROM users WHERE LOWER(email) = LOWER(${email}) LIMIT 1;
    `;
    if (!rows || rows.length === 0) return null;
    const r = rows[0] as any;
    return {
      id: r.id,
      email: r.email,
      username: r.username,
      passwordHash: r.password_hash,
      name: r.name,
      role: r.role,
      subscription: r.subscription,
      portfolio: r.portfolio,
      storageUsedBytes: Number(r.storage_used_bytes || 0),
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  } catch (err) {
    console.error('Neon findNeonUserByEmail error:', err);
    return null;
  }
}

export async function findNeonUserBySubdomain(subdomain: string): Promise<User | null> {
  if (!sql) return null;
  try {
    await initNeonSchema();
    const rows = await sql`
      SELECT * FROM users 
      WHERE LOWER(portfolio->>'customSubdomain') = LOWER(${subdomain})
        AND subscription->>'tier' = 'elite_5k'
        AND (subscription->>'active')::boolean = true
      LIMIT 1;
    `;
    if (!rows || rows.length === 0) return null;
    const r = rows[0] as any;
    return {
      id: r.id,
      email: r.email,
      username: r.username,
      passwordHash: r.password_hash,
      name: r.name,
      role: r.role,
      subscription: r.subscription,
      portfolio: r.portfolio,
      storageUsedBytes: Number(r.storage_used_bytes || 0),
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  } catch (err) {
    console.error('Neon findNeonUserBySubdomain error:', err);
    return null;
  }
}

export async function saveNeonUser(user: User): Promise<User> {
  if (!sql) return user;
  try {
    await initNeonSchema();
    const now = new Date().toISOString();
    await sql`
      INSERT INTO users (
        id, email, username, password_hash, name, role, subscription, portfolio, storage_used_bytes, created_at, updated_at
      ) VALUES (
        ${user.id},
        ${user.email.toLowerCase()},
        ${user.username.toLowerCase()},
        ${user.passwordHash || ''},
        ${user.name},
        ${user.role || 'user'},
        ${JSON.stringify(user.subscription)},
        ${JSON.stringify(user.portfolio)},
        ${user.storageUsedBytes || 0},
        ${user.createdAt || now},
        ${now}
      )
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        username = EXCLUDED.username,
        password_hash = COALESCE(NULLIF(EXCLUDED.password_hash, ''), users.password_hash),
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        subscription = EXCLUDED.subscription,
        portfolio = EXCLUDED.portfolio,
        storage_used_bytes = EXCLUDED.storage_used_bytes,
        updated_at = NOW();
    `;
    return user;
  } catch (err) {
    console.error('Neon saveNeonUser error:', err);
    return user;
  }
}

/**
 * Pricing Config Operations on Neon
 */
export async function getNeonPricing(): Promise<PricingConfig> {
  if (!sql) return DEFAULT_PRICING;
  try {
    await initNeonSchema();
    const rows = await sql`SELECT value FROM settings WHERE key = 'pricing' LIMIT 1;`;
    if (!rows || rows.length === 0) return DEFAULT_PRICING;
    return rows[0].value as PricingConfig;
  } catch (err) {
    return DEFAULT_PRICING;
  }
}

export async function saveNeonPricing(pricing: PricingConfig): Promise<PricingConfig> {
  if (!sql) return pricing;
  try {
    await initNeonSchema();
    await sql`
      INSERT INTO settings (key, value, updated_at)
      VALUES ('pricing', ${JSON.stringify(pricing)}, NOW())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
    `;
    return pricing;
  } catch (err) {
    console.error('Neon saveNeonPricing error:', err);
    return pricing;
  }
}

/**
 * Inquiries Operations on Neon
 */
export async function getNeonInquiries(portfolioUserId?: string): Promise<Inquiry[]> {
  if (!sql) return [];
  try {
    await initNeonSchema();
    let rows;
    if (portfolioUserId) {
      rows = await sql`
        SELECT * FROM inquiries WHERE portfolio_user_id = ${portfolioUserId} ORDER BY created_at DESC;
      `;
    } else {
      rows = await sql`SELECT * FROM inquiries ORDER BY created_at DESC;`;
    }
    return rows.map((r: any) => ({
      id: r.id,
      portfolioUserId: r.portfolio_user_id,
      portfolioUsername: r.portfolio_username,
      senderName: r.sender_name,
      senderEmail: r.sender_email,
      senderSubject: r.sender_subject,
      message: r.message,
      serviceInterest: r.service_interest,
      createdAt: r.created_at,
    }));
  } catch (err) {
    console.error('Neon getNeonInquiries error:', err);
    return [];
  }
}

export async function saveNeonInquiry(inquiry: any): Promise<any> {
  if (!sql) return inquiry;
  try {
    await initNeonSchema();
    const inqId = inquiry.id || `inq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    await sql`
      INSERT INTO inquiries (
        id, portfolio_user_id, portfolio_username, sender_name, sender_email, sender_subject, message, service_interest, created_at
      ) VALUES (
        ${inqId},
        ${inquiry.portfolioUserId || ''},
        ${inquiry.portfolioUsername || ''},
        ${inquiry.senderName},
        ${inquiry.senderEmail},
        ${inquiry.senderSubject || 'Portfolio Inquiry'},
        ${inquiry.message},
        ${inquiry.serviceInterest || ''},
        NOW()
      );
    `;
    return { ...inquiry, id: inqId };
  } catch (err) {
    console.error('Neon saveNeonInquiry error:', err);
    return inquiry;
  }
}

/**
 * Payment Gateway Settings on Neon
 */
export async function getNeonPaymentSettings(): Promise<any | null> {
  if (!sql) return null;
  try {
    await initNeonSchema();
    const rows = await sql`SELECT value FROM settings WHERE key = 'payment-settings' LIMIT 1;`;
    if (!rows || rows.length === 0) return null;
    return rows[0].value;
  } catch (err) {
    return null;
  }
}

export async function saveNeonPaymentSettings(settings: any): Promise<any> {
  if (!sql) return settings;
  try {
    await initNeonSchema();
    await sql`
      INSERT INTO settings (key, value, updated_at)
      VALUES ('payment-settings', ${JSON.stringify(settings)}, NOW())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
    `;
    return settings;
  } catch (err) {
    console.error('Neon saveNeonPaymentSettings error:', err);
    return settings;
  }
}
