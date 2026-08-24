import { NextResponse } from 'next/server';
import { Database } from '@/lib/storage';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

function isAuthorizedAdmin(req: Request, token?: string): boolean {
  const adminKey = req.headers.get('x-admin-key');
  if (adminKey && Database.verifyAdminPasscode(adminKey)) {
    return true;
  }
  if (token) {
    const payload = verifyToken(token);
    if (payload && (payload.role === 'admin' || payload.username === 'admin')) {
      return true;
    }
  }
  return false;
}

export async function GET(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('portfoli_session')?.value;

  const pricing = await Database.getPricingConfigAsync();

  // If not admin, return public pricing
  if (!isAuthorizedAdmin(req, token)) {
    return NextResponse.json({ success: true, pricing });
  }

  const users = await Database.getUsersAsync();

  // Subscriptions telemetry
  const totalUsers = users.length;
  let totalRevenueNgn = 0;
  let activeSubscriptions = 0;
  let tierDistribution = { free: 0, pro_2k: 0, elite_5k: 0 };
  let totalStorageUsedBytes = 0;

  users.forEach((u) => {
    totalStorageUsedBytes += u.storageUsedBytes || 0;
    const tier = u.subscription?.tier || 'free';
    tierDistribution[tier] = (tierDistribution[tier] || 0) + 1;
    if (u.subscription?.active) {
      activeSubscriptions++;
      totalRevenueNgn += u.subscription.amountPaid || 0;
    }
  });

  return NextResponse.json({
    success: true,
    pricing,
    telemetry: {
      totalUsers,
      activeSubscriptions,
      totalRevenueNgn,
      tierDistribution,
      totalStorageUsedBytes,
    },
  });
}

export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('portfoli_session')?.value;

    if (!isAuthorizedAdmin(req, token)) {
      return NextResponse.json({ error: 'Master Admin authorization required.' }, { status: 403 });
    }

    const updatedConfig = await req.json();
    const result = await Database.updatePricingConfigAsync(updatedConfig);

    return NextResponse.json({ success: true, pricing: result });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to update pricing.' }, { status: 500 });
  }
}
