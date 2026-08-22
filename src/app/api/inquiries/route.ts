import { NextResponse } from 'next/server';
import { Database } from '@/lib/storage';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('portfoli_session')?.value;
    if (!token) {
      return NextResponse.json({ inquiries: [] });
    }

    const payload = verifyToken(token);
    if (!payload || !payload.id) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const inquiries = Database.getInquiries(payload.id);
    return NextResponse.json({ inquiries });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { portfolioUserId, portfolioUsername, senderName, senderEmail, senderSubject, message, serviceInterest } = body;

    if (!senderName || !senderEmail || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required.' }, { status: 400 });
    }

    const inquiry = Database.saveInquiry({
      portfolioUserId: portfolioUserId || 'user_kristos_01',
      portfolioUsername: portfolioUsername || 'kristos',
      senderName,
      senderEmail,
      senderSubject: senderSubject || 'Portfolio Inquiry',
      message,
      serviceInterest,
    });

    return NextResponse.json({ success: true, inquiry });
  } catch (err: any) {
    console.error('Inquiry dispatch error:', err);
    return NextResponse.json({ error: 'Failed to dispatch inquiry' }, { status: 500 });
  }
}
