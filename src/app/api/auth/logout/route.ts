import { NextResponse } from 'next/server';
import { getSessionCookieOptions, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully.',
    });

    response.cookies.set(SESSION_COOKIE_NAME, '', getSessionCookieOptions(true));

    return response;
  } catch (err: any) {
    console.error('Logout error:', err);
    return NextResponse.json({ error: 'Server error during logout.' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully.',
    });

    response.cookies.set(SESSION_COOKIE_NAME, '', getSessionCookieOptions(true));

    return response;
  } catch (err: any) {
    console.error('Logout error:', err);
    return NextResponse.json({ error: 'Server error during logout.' }, { status: 500 });
  }
}
