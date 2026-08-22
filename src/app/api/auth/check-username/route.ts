import { NextResponse } from 'next/server';
import { Database } from '@/lib/storage';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username')?.toLowerCase().trim();

  if (!username) {
    return NextResponse.json({ available: false, message: 'Username is required.' });
  }

  const clean = username.replace(/[^a-z0-9_-]/g, '');
  if (clean.length < 3) {
    return NextResponse.json({ available: false, message: 'Must be at least 3 characters.' });
  }

  const reserved = ['admin', 'api', 'dashboard', 'pricing', 'login', 'register', 'settings', 'static'];
  if (reserved.includes(clean)) {
    return NextResponse.json({ available: false, message: 'Username is reserved.' });
  }

  const existing = Database.findUserByUsername(clean);
  return NextResponse.json({
    available: !existing,
    cleanUsername: clean,
    message: existing ? 'Username taken' : 'Username available',
  });
}
