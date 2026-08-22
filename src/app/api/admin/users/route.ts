import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/storage';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { getSubscriptionStatus, TierType } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function isAuthorizedAdmin(req: NextRequest, token?: string): boolean {
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

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('portfoli_session')?.value;

    if (!isAuthorizedAdmin(req, token)) {
      return NextResponse.json({ error: 'Master Admin authorization required.' }, { status: 403 });
    }

    const rawUsers = Database.getUsers();
    let totalStorageUsedBytes = 0;
    let totalRevenue = 0;
    let paidSubscribers = 0;
    let freeUsers = 0;
    let inGracePeriod = 0;
    let expiredCount = 0;

    const users = rawUsers.map((u) => {
      const storageUsed = u.storageUsedBytes || 0;
      totalStorageUsedBytes += storageUsed;

      const sub = u.subscription;
      const statusInfo = getSubscriptionStatus(sub);

      const hasPaid = sub && sub.tier !== 'free' && (sub.amountPaid || 0) > 0;
      if (hasPaid) {
        totalRevenue += sub.amountPaid || 0;
      }

      if (statusInfo.isActive && sub?.tier !== 'free') {
        paidSubscribers++;
      } else if (statusInfo.isGracePeriod) {
        inGracePeriod++;
      } else if (statusInfo.isExpiredAndDecommissioned) {
        expiredCount++;
      } else {
        freeUsers++;
      }

      // Check if user has an actual paid start date
      const hasSubscriptionStarted = Boolean(sub && sub.tier !== 'free' && sub.startDate);

      return {
        id: u.id,
        name: u.name || u.displayName || u.username,
        username: u.username,
        email: u.email,
        role: u.role || 'creator',
        avatarUrl: u.avatarUrl || '',
        storageUsedBytes: storageUsed,
        customSubdomain: u.customSubdomain || '',
        createdAt: u.createdAt || '',
        subscription: {
          tier: sub?.tier || 'free',
          startDate: hasSubscriptionStarted ? sub?.startDate : null,
          endDate: sub?.endDate || null,
          active: sub?.active ?? false,
          amountPaid: sub?.amountPaid || 0,
          currency: sub?.currency || 'NGN',
          autoRenew: sub?.autoRenew ?? false,
        },
        statusInfo: {
          isActive: statusInfo.isActive,
          isGracePeriod: statusInfo.isGracePeriod,
          isExpiredAndDecommissioned: statusInfo.isExpiredAndDecommissioned,
          daysRemainingInSubscription: statusInfo.daysRemainingInSubscription,
          daysRemainingInGrace: statusInfo.daysRemainingInGrace,
          hasStarted: hasSubscriptionStarted,
        },
      };
    });

    const analytics = {
      totalUsers: users.length,
      paidSubscribers,
      freeUsers,
      inGracePeriod,
      expiredCount,
      totalStorageUsedBytes,
      totalRevenue,
      conversionRate: users.length > 0 ? Math.round((paidSubscribers / users.length) * 100) : 0,
    };

    return NextResponse.json({
      success: true,
      users,
      analytics,
    });
  } catch (err: any) {
    console.error('Error fetching admin user list:', err);
    return NextResponse.json({ error: 'Failed to load user management list.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('portfoli_session')?.value;

    if (!isAuthorizedAdmin(req, token)) {
      return NextResponse.json({ error: 'Master Admin authorization required.' }, { status: 403 });
    }

    const body = await req.json();
    const { userId, action, tier, extendDays } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }

    const user = Database.findUserById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    if (action === 'update_tier' && tier) {
      const validTier: TierType = tier === 'elite_5k' ? 'elite_5k' : tier === 'pro_2k' ? 'pro_2k' : 'free';
      const now = new Date();
      const oneYearLater = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

      user.subscription = {
        tier: validTier,
        startDate: validTier === 'free' ? '' : now.toISOString(),
        endDate: validTier === 'free' ? '' : oneYearLater.toISOString(),
        active: validTier !== 'free',
        autoRenew: false,
        amountPaid: validTier === 'elite_5k' ? 5000 : validTier === 'pro_2k' ? 2000 : 0,
        currency: 'NGN',
      };
      Database.saveUser(user);
    } else if (action === 'extend_days' && extendDays) {
      const days = Number(extendDays) || 30;
      const currentEnd = user.subscription?.endDate ? new Date(user.subscription.endDate) : new Date();
      const newEnd = new Date(Math.max(Date.now(), currentEnd.getTime()) + days * 24 * 60 * 60 * 1000);

      user.subscription = {
        tier: user.subscription?.tier || 'pro_2k',
        startDate: user.subscription?.startDate || new Date().toISOString(),
        endDate: newEnd.toISOString(),
        active: true,
        autoRenew: user.subscription?.autoRenew ?? false,
        amountPaid: user.subscription?.amountPaid || 0,
        currency: 'NGN',
      };
      Database.saveUser(user);
    }

    return NextResponse.json({
      success: true,
      message: 'User subscription updated successfully.',
      user,
    });
  } catch (err: any) {
    console.error('Error updating user subscription:', err);
    return NextResponse.json({ error: 'Failed to update user.' }, { status: 500 });
  }
}
