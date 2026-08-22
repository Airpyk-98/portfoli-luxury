import { NextResponse } from 'next/server';
import { Database } from '@/lib/storage';
import { comparePassword, signToken, getSessionCookieOptions, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { login, password } = await req.json();

    if (!login || !password) {
      return NextResponse.json({ error: 'Username/email and password required.' }, { status: 400 });
    }

    const user =
      (await Database.findUserByEmailAsync(login)) ||
      (await Database.findUserByUsernameAsync(login));

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    const isValid = await comparePassword(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        subscription: user.subscription,
      },
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions(false));

    return response;
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Server error during login.' }, { status: 500 });
  }
}
