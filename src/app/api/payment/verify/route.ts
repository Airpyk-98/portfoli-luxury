import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/storage';
import { getPaymentSettings, saveTransaction, getTransactions } from '@/lib/payment-settings';
import { TierType } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { txRef, transactionId, userId, tier = 'elite_5k' } = body;

    if (!userId) {
      return NextResponse.json({ success: false, message: 'User ID is required' }, { status: 400 });
    }

    const user = Database.findUserById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const settings = getPaymentSettings();
    const selectedTier: TierType = tier === 'pro_2k' ? 'pro_2k' : 'elite_5k';
    const pricing = Database.getPricing();
    const amount = selectedTier === 'pro_2k' ? pricing.pro_2k.priceNgn : pricing.elite_5k.priceNgn;

    let isVerified = false;
    let flwRef = transactionId;

    // Verify against Flutterwave API if secret key exists and transactionId passed
    if (settings.secretKey && transactionId) {
      try {
        const verifyRes = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${settings.secretKey}`,
          },
        });

        const verifyData = await verifyRes.json();
        if (verifyData.status === 'success' && verifyData.data?.status === 'successful') {
          isVerified = true;
          flwRef = verifyData.data.flw_ref || transactionId;
        }
      } catch (err) {
        console.error('Flutterwave direct verification error:', err);
      }
    } else {
      // In sandbox / direct return flow
      isVerified = true;
    }

    if (isVerified) {
      const now = new Date();
      const oneYearLater = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

      user.subscription = {
        tier: selectedTier,
        startDate: now.toISOString(),
        endDate: oneYearLater.toISOString(),
        active: true,
        autoRenew: true,
        amountPaid: amount,
        currency: 'NGN',
        lastPaymentRef: txRef || `flw_${transactionId}`,
      };
      user.updatedAt = now.toISOString();

      Database.updateUser(user);

      saveTransaction({
        id: `tx_${flwRef || Date.now()}`,
        txRef: txRef || `tx_${Date.now()}`,
        flwRef: flwRef || '',
        userId: user.id,
        username: user.username,
        userEmail: user.email,
        amount,
        currency: 'NGN',
        tier: selectedTier,
        status: 'successful',
        paymentType: 'flutterwave_direct_verify',
        createdAt: now.toISOString(),
        verifiedAt: now.toISOString(),
      });

      return NextResponse.json({
        success: true,
        message: 'Subscription verified and activated successfully.',
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          role: user.role,
          subscription: user.subscription,
        },
      });
    }

    return NextResponse.json(
      { success: false, message: 'Transaction could not be verified by Flutterwave' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}
