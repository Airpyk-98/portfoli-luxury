import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'portfoli_cyber_luxury_secret_jwt_key_2026_production';

export const SESSION_COOKIE_NAME = 'portfoli_session';

/**
 * High-security password hashing using Node crypto pbkdf2
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export async function comparePassword(password: string, storedHash?: string): Promise<boolean> {
  if (!password) return false;

  // Allow test passwords for demo seed users without custom hash or with placeholder hash
  if (!storedHash || storedHash.includes('Placeholder')) {
    return password === 'password123' || password === 'admin123';
  }

  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, hash] = parts;
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');

  try {
    const hashBuf = Buffer.from(hash, 'hex');
    const verifyBuf = Buffer.from(verifyHash, 'hex');
    if (hashBuf.length !== verifyBuf.length) return false;
    return crypto.timingSafeEqual(hashBuf, verifyBuf);
  } catch {
    return false;
  }
}

/**
 * Lightweight token signer using HMAC-SHA256
 */
export function signToken(payload: { id: string; email: string; username: string; role?: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const data = Buffer.from(
    JSON.stringify({
      ...payload,
      role: payload.role || 'user',
      exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
    })
  ).toString('base64url');

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${data}`)
    .digest('base64url');

  return `${header}.${data}.${signature}`;
}

export function verifyToken(token: string): { id: string; email: string; username: string; role: string } | null {
  try {
    const [header, data, signature] = token.split('.');
    if (!header || !data || !signature) return null;

    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${data}`)
      .digest('base64url');

    if (signature !== expectedSignature) return null;

    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf-8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}

export function getSessionCookieOptions(isLogout = false) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: isLogout ? 0 : 30 * 24 * 60 * 60,
    expires: isLogout ? new Date(0) : undefined,
    path: '/',
  };
}
