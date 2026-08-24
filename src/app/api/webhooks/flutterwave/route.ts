import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/storage';
import { getPaymentSettingsAsync, saveTransaction, getTransactions } from '@/lib/payment-settings';
import { TierType, PaymentTransaction } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('verif-hash');
    const settings = await getPaymentSettingsAsync();

    // Verify webhook signature if configured
    if (settings.webhookSecretHash && signature !== settings.webhookSecretHash) {
      console.warn('Unauthorized Flutterwave webhook signature mismatch');
      return NextResponse.json({ status: 'error', message: 'Invalid signature hash' }, { status: 401 });
    }

    const payload = await req.json();
    const event = payload.event;
    const data = payload.data;

    if (!data) {
      return NextResponse.json({ status: 'ignored', message: 'No payload data' });
    }

    const txRef = data.tx_ref;
    const flwRef = data.flw_ref || data.id?.toString();
    const status = data.status?.toLowerCase();
    const amount = Number(data.amount || 0);
    const currency = data.currency || 'NGN';
    const email = data.customer?.email?.toLowerCase();
    const userId = data.meta?.userId;
    const username = data.meta?.username;
    const pricing = await Database.getPricingConfigAsync();
    const tier: TierType =
      (data.meta?.tier as TierType) ||
      (amount < pricing.elite_5k.priceNgn ? 'pro_2k' : 'elite_5k');

    const isSuccessful = status === 'successful' || status === 'completed' || event === 'charge.completed';

    if (isSuccessful) {
      // Find matching user
      let user = userId ? await Database.findUserByIdAsync(userId) : null;
      if (!user && username) {
        user = await Database.findUserByUsernameAsync(username);
      }
      if (!user && email) {
        user = await Database.findUserByEmailAsync(email);
      }

      if (user) {
        // Upgrade & Extend Subscription by 1 Year
        const now = new Date();
        const oneYearLater = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

        user.subscription = {
          tier,
          startDate: now.toISOString(),
          endDate: oneYearLater.toISOString(),
          active: true,
          autoRenew: true,
          amountPaid: amount,
          currency: 'NGN',
          lastPaymentRef: txRef,
        };
        user.updatedAt = now.toISOString();

        // Auto-activate custom subdomain for Elite Mastery tier
        if (tier === 'elite_5k' && !user.portfolio.customSubdomain) {
          user.portfolio.customSubdomain = user.username;
        }

        await Database.saveUserAsync(user);

        // Record or Update Successful Transaction
        saveTransaction({
          id: `tx_${flwRef || Date.now()}`,
          txRef: txRef || `tx_auto_${Date.now()}`,
          flwRef,
          userId: user.id,
          username: user.username,
          userEmail: user.email,
          amount,
          currency,
          tier,
          status: 'successful',
          paymentType: 'flutterwave_webhook',
          createdAt: data.created_at || now.toISOString(),
          verifiedAt: now.toISOString(),
          metadata: {
            webhookEvent: event,
            ip: data.ip,
            paymentType: data.payment_type,
          },
        });

        console.log(`Successfully processed Flutterwave webhook for user ${user.username} (Tier: ${tier}, ₦${amount})`);
      }
    }

    return NextResponse.json({ status: 'success', message: 'Webhook processed' });
  } catch (error: any) {
    console.error('Flutterwave webhook processing error:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Webhook internal error' },
      { status: 500 }
    );
  }
}
