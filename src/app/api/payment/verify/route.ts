import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/storage';
import { getPaymentSettings, saveTransaction, getTransactions } from '@/lib/payment-settings';
import { TierType } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Flutterwave v4 OAuth 2.0 Token Generation for Verification
 */
async function getV4OAuthToken(clientId: string, clientSecret: string): Promise<string | null> {
  try {
    if (!clientId || !clientSecret) return null;
    const params = new URLSearchParams();
    params.append('client_id', clientId.trim());
    params.append('client_secret', clientSecret.trim());
    params.append('grant_type', 'client_credentials');
    const res = await fetch('https://idp.flutterwave.com/realms/flutterwave/protocol/openid-connect/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const data = await res.json();
    return data.access_token || null;
  } catch (err) {
    console.error('V4 OAuth token error during verification:', err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { txRef, transactionId, userId, tier = 'elite_5k' } = body;

    if (!userId) {
      return NextResponse.json({ success: false, message: 'User ID is required' }, { status: 400 });
    }

    const user = await Database.findUserByIdAsync(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const settings = await getPaymentSettingsAsync();
    const selectedTier: TierType = tier === 'pro_2k' ? 'pro_2k' : 'elite_5k';
    const pricing = await Database.getPricingConfigAsync();
    const amount = selectedTier === 'pro_2k' ? pricing.pro_2k.priceNgn : pricing.elite_5k.priceNgn;

    let isVerified = false;
    let flwRef = transactionId;

    // Verify against Flutterwave API if credentials exist and transactionId passed
    if (transactionId) {
      // Build auth header: prefer V4 OAuth, fallback to Secret Key
      let authHeader = '';
      if (settings.clientId && settings.clientSecret) {
        const v4Token = await getV4OAuthToken(settings.clientId, settings.clientSecret);
        if (v4Token) authHeader = `Bearer ${v4Token}`;
      }
      if (!authHeader && settings.secretKey) {
        authHeader = `Bearer ${settings.secretKey}`;
      }

      if (authHeader) {
        try {
          const verifyRes = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: authHeader,
            },
          });

          const verifyData = await verifyRes.json();
          if (verifyData.status === 'success' && (verifyData.data?.status === 'successful' || verifyData.data?.status === 'completed')) {
            isVerified = true;
            flwRef = verifyData.data.flw_ref || transactionId;
          } else {
            console.warn('Flutterwave verification rejected:', verifyData);
          }
        } catch (err) {
          console.error('Flutterwave direct verification error:', err);
        }
      }
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

      // Auto-activate custom subdomain for Elite Mastery tier
      if (selectedTier === 'elite_5k' && !user.portfolio.customSubdomain) {
        user.portfolio.customSubdomain = user.username;
      }

      await Database.saveUserAsync(user);

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
