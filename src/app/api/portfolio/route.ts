import { NextResponse } from 'next/server';
import { Database } from '@/lib/storage';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username');

  if (username) {
    const user = await Database.findUserByUsernameAsync(username);
    if (!user || !user.portfolio) {
      return NextResponse.json({ error: 'Portfolio not found.' }, { status: 404 });
    }
    return NextResponse.json({ portfolio: user.portfolio, subscription: user.subscription });
  }

  // Get current logged-in user portfolio
  const cookieStore = await cookies();
  const token = cookieStore.get('portfoli_session')?.value;
  if (!token) {
    // No active session — return null user so pricing page redirects to register
    const demoUser = await Database.findUserByUsernameAsync('kristos');
    return NextResponse.json({
      portfolio: demoUser?.portfolio,
      user: null,
      isDemo: true,
    });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  const user = await Database.findUserByIdAsync(payload.id);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({
    portfolio: user.portfolio,
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      subscription: user.subscription,
      storageUsedBytes: user.storageUsedBytes,
    },
  });
}

export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('portfoli_session')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !payload.id) {
      return NextResponse.json({ error: 'Invalid or expired session.' }, { status: 401 });
    }

    const userId = payload.id;

    const portfolioData = await req.json();
    const updated = Database.updatePortfolio(userId, portfolioData);

    if (!updated) {
      return NextResponse.json({ error: 'Failed to update portfolio' }, { status: 500 });
    }

    return NextResponse.json({ success: true, portfolio: updated });
  } catch (err: any) {
    console.error('Error saving portfolio:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
