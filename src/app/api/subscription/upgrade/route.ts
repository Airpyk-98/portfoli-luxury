import { NextResponse } from 'next/server';
import { Database } from '@/lib/storage';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { TierType } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const { targetTier } = (await req.json()) as { targetTier: TierType };
    if (!['free', 'pro_2k', 'elite_5k'].includes(targetTier)) {
      return NextResponse.json({ error: 'Invalid tier requested' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get('portfoli_session')?.value;
    let user = Database.findUserByUsername('kristos');

    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        const found = Database.findUserById(payload.id);
        if (found) user = found;
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'User session required' }, { status: 401 });
    }

    const pricing = Database.getPricingConfig();
    const amount = targetTier === 'elite_5k' ? pricing.elite_5k.priceNgn : targetTier === 'pro_2k' ? pricing.pro_2k.priceNgn : 0;

    user.subscription = {
      tier: targetTier,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      active: true,
      autoRenew: true,
      amountPaid: amount,
      currency: 'NGN',
    };

    if (targetTier === 'elite_5k' && !user.portfolio.customSubdomain) {
      user.portfolio.customSubdomain = user.username;
    }

    Database.saveUser(user);

    return NextResponse.json({
      success: true,
      subscription: user.subscription,
      message: `Successfully upgraded to ${targetTier.toUpperCase()}!`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to upgrade subscription' }, { status: 500 });
  }
}
