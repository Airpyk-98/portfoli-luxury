import { NextResponse } from 'next/server';
import { Database } from '@/lib/storage';
import { hashPassword, signToken } from '@/lib/auth';
import { User, UserPortfolio } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const { name, email, username, password } = await req.json();

    if (!name || !email || !username || !password) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_-]/g, '');

    // Reserved usernames
    const reserved = ['admin', 'api', 'dashboard', 'pricing', 'login', 'register', 'settings', 'static'];
    if (reserved.includes(cleanUsername)) {
      return NextResponse.json({ error: 'This username is reserved.' }, { status: 400 });
    }

    // Check existing username or email
    const existingUser = Database.findUserByUsername(cleanUsername);
    if (existingUser) {
      return NextResponse.json({ error: 'Username is already taken.' }, { status: 409 });
    }

    const existingEmail = Database.findUserByEmail(email);
    if (existingEmail) {
      return NextResponse.json({ error: 'Email is already registered.' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const initialPortfolio: UserPortfolio = {
      id: `port_${userId}`,
      userId,
      username: cleanUsername,
      displayName: name,
      headline: 'Creative Professional & Builder',
      bio: 'Crafting high-impact digital experiences and products.',
      availableForHire: true,
      availabilityText: 'Open for Opportunities',
      emailContact: email,
      theme: {
        mode: 'dark',
        primaryFont: 'Syne',
        secondaryFont: 'Plus Jakarta Sans',
        accentColor: '#00FF87',
        secondaryAccent: '#FFFFFF',
        glassIntensity: 'high',
        displayMode: 'crystal_prism',
        sectionScrollEffect: 'reveal',
        typographyReveal: 'stagger-glow',
        showAvailableBadge: true,
      },
      socials: [],
      projects: [],
      services: [],
      viewsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newUser: User = {
      id: userId,
      email,
      username: cleanUsername,
      passwordHash,
      name,
      role: 'user',
      subscription: {
        tier: 'free',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        active: true,
        autoRenew: false,
        amountPaid: 0,
        currency: 'NGN',
      },
      portfolio: initialPortfolio,
      storageUsedBytes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    Database.saveUser(newUser);

    const token = signToken({
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      role: newUser.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        subscription: newUser.subscription,
      },
    });

    response.cookies.set('portfoli_session', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (err: any) {
    console.error('Registration error:', err);
    return NextResponse.json({ error: 'Server error during registration.' }, { status: 500 });
  }
}
