import { Database } from './storage';
import { verifyToken, SESSION_COOKIE_NAME } from './auth';

/**
 * Validates whether the incoming HTTP Request has valid administrative authorization.
 * Checks:
 * 1. 'x-admin-key' or 'x-admin-passcode' header matching active/master admin keys.
 * 2. 'adminKey' or 'key' query parameter matching active/master admin keys.
 * 3. 'Authorization' header (Bearer <masterKey> or Bearer <adminJwtToken>).
 * 4. Explicit token if provided.
 * 5. 'portfoli_session' cookie with admin role.
 */
export function isAuthorizedAdmin(req: Request, token?: string): boolean {
  // 1. Check custom headers
  const adminKey = req.headers.get('x-admin-key') || req.headers.get('x-admin-passcode');
  if (adminKey && Database.verifyAdminPasscode(adminKey.trim())) {
    return true;
  }

  // 2. Check query parameters
  try {
    const url = new URL(req.url);
    const queryKey =
      url.searchParams.get('adminKey') ||
      url.searchParams.get('key') ||
      url.searchParams.get('x-admin-key');
    if (queryKey && Database.verifyAdminPasscode(queryKey.trim())) {
      return true;
    }
  } catch {}

  // 3. Check Authorization header
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearer = authHeader.substring(7).trim();
    if (Database.verifyAdminPasscode(bearer)) {
      return true;
    }
    const payload = verifyToken(bearer);
    if (payload && (payload.role === 'admin' || payload.username === 'admin')) {
      return true;
    }
  }

  // 4. Check explicit token
  if (token) {
    const payload = verifyToken(token);
    if (payload && (payload.role === 'admin' || payload.username === 'admin')) {
      return true;
    }
  }

  // 5. Check cookies header for session cookie
  const cookieHeader = req.headers.get('cookie');
  if (cookieHeader) {
    const regex = new RegExp(`(?:^|;\\s*)${SESSION_COOKIE_NAME}=([^;]+)`);
    const match = cookieHeader.match(regex);
    if (match && match[1]) {
      const sessionToken = decodeURIComponent(match[1]);
      const payload = verifyToken(sessionToken);
      if (payload && (payload.role === 'admin' || payload.username === 'admin')) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Returns the currently active master passcode.
 */
export function getMasterKey(): string {
  return Database.getAdminPasscode();
}
