import { NextResponse } from 'next/server';
import { Database } from '@/lib/storage';
import { verifyToken, hashPassword, comparePassword, SESSION_COOKIE_NAME } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { currentPassword, newPassword, username, email } = body || {};

    // 1. Try resolving authenticated user via session cookie or Authorization header
    let token: string | undefined;

    try {
      const cookieStore = await cookies();
      token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    } catch {}

    if (!token) {
      const cookieHeader = req.headers.get('cookie');
      if (cookieHeader) {
        const regex = new RegExp(`(?:^|;\\s*)${SESSION_COOKIE_NAME}=([^;]+)`);
        const match = cookieHeader.match(regex);
        if (match && match[1]) {
          token = decodeURIComponent(match[1]);
        }
      }
    }

    if (!token) {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7).trim();
      }
    }

    let user = null;

    if (token) {
      const payload = verifyToken(token);
      if (payload?.id) {
        user = (await Database.findUserByIdAsync(payload.id)) || (await Database.findUserByUsernameAsync(payload.username));
      }
    }

    // 2. If no valid session token, fallback to explicit username/email + currentPassword in body
    if (!user) {
      const lookup = username || email;
      if (lookup) {
        user = (await Database.findUserByUsernameAsync(lookup)) || (await Database.findUserByEmailAsync(lookup));
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'Authentication required. Please log in.' }, { status: 401 });
    }

    // 3. Verify current password if provided or if user logged in via credentials
    if (!currentPassword) {
      return NextResponse.json({ error: 'Current password is required.' }, { status: 400 });
    }

    const isCurrentValid = await comparePassword(currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });
    }

    // 4. Validate new password
    if (!newPassword || typeof newPassword !== 'string' || newPassword.trim().length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    // 5. Update user password hash and persist in database
    const newHash = await hashPassword(newPassword.trim());
    user.passwordHash = newHash;
    user.updatedAt = new Date().toISOString();
    await Database.saveUserAsync(user);

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (err: any) {
    console.error('Update password error:', err);
    return NextResponse.json({ error: 'Server error updating password.' }, { status: 500 });
  }
}
