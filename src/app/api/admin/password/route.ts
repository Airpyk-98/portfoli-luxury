import { NextResponse } from 'next/server';
import { Database } from '@/lib/storage';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('portfoli_session')?.value;
    const adminKey = req.headers.get('x-admin-key');
    const currentPasscode = Database.getAdminPasscode();

    let isAuthorized = false;
    if (adminKey && Database.verifyAdminPasscode(adminKey)) {
      isAuthorized = true;
    } else if (token) {
      const payload = verifyToken(token);
      if (payload && (payload.role === 'admin' || payload.username === 'admin')) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Master administrative authorization required.' }, { status: 403 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !Database.verifyAdminPasscode(currentPassword)) {
      return NextResponse.json({ error: 'Current admin passcode is incorrect.' }, { status: 400 });
    }

    if (!newPassword || newPassword.trim().length < 6) {
      return NextResponse.json({ error: 'New passcode must be at least 6 characters long.' }, { status: 400 });
    }

    const success = Database.updateAdminPasscode(newPassword);
    if (!success) {
      return NextResponse.json({ error: 'Failed to update passcode.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Admin security passcode successfully updated.' });
  } catch (err: any) {
    return NextResponse.json({ error: 'Server error updating admin passcode.' }, { status: 500 });
  }
}
