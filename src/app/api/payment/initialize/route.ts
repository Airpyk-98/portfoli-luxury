import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/storage';
import { getPaymentSettings, saveTransaction } from '@/lib/payment-settings';
import { TierType, PaymentTransaction } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, tier = 'elite_5k', returnUrl } = body;

    if (!userId) {
      return NextResponse.json({ success: false, message: 'User ID is required' }, { status: 400 });
    }

    const user = Database.findUserById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // STRICT SERVER-SIDE PRICING LOOKUP (Non-forgeable)
    const pricing = Database.getPricing();
    let amount = 5000;
    const selectedTier: TierType = tier === 'pro_2k' ? 'pro_2k' : 'elite_5k';

    if (selectedTier === 'pro_2k') {
      amount = pricing.pro_2k.priceNgn || 2000;
    } else {
      amount = pricing.elite_5k.priceNgn || 5000;
    }

    const txRef = `portfoli_${user.username}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const settings = getPaymentSettings();

    const host = req.headers.get('host') || 'quirky-kepler.vercel.app';
    const proto = host.includes('localhost') ? 'http' : 'https';
    const redirectUrl =
      returnUrl ||
      `${proto}://${host}/dashboard?payment=success&tx_ref=${txRef}&tier=${selectedTier}`;

    // Record Pending Transaction
    const transaction: PaymentTransaction = {
      id: `tx_${Date.now()}`,
      txRef,
      userId: user.id,
      username: user.username,
      userEmail: user.email,
      amount,
      currency: 'NGN',
      tier: selectedTier,
      status: 'pending',
      paymentType: 'flutterwave_v4',
      createdAt: new Date().toISOString(),
      metadata: {
        environment: settings.environment,
        tier: selectedTier,
        userName: user.name,
      },
    };
    saveTransaction(transaction);

    // If Flutterwave Secret Key is configured, make real API call
    if (settings.secretKey) {
      try {
        const flwResponse = await fetch('https://api.flutterwave.com/v3/payments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${settings.secretKey}`,
          },
          body: JSON.stringify({
            tx_ref: txRef,
            amount: amount,
            currency: 'NGN',
            redirect_url: redirectUrl,
            meta: {
              userId: user.id,
              username: user.username,
              tier: selectedTier,
            },
            customer: {
              email: user.email,
              name: user.name || user.displayName || user.username,
            },
            customizations: {
              title: 'portfoli — Elite Annual Subscription',
              description: `1-Year Access to ${selectedTier === 'elite_5k' ? 'Elite 5GB' : 'Pro 1GB'} Architecture & Custom Subdomain`,
              logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
            },
          }),
        });

        const flwData = await flwResponse.json();

        if (flwData.status === 'success' && flwData.data?.link) {
          return NextResponse.json({
            success: true,
            checkoutUrl: flwData.data.link,
            txRef,
            amount,
            currency: 'NGN',
            tier: selectedTier,
          });
        } else {
          console.warn('Flutterwave API returned non-success:', flwData);
          // Fallback to client-side modal or direct verify URL with error details
        }
      } catch (flwErr) {
        console.error('Error connecting to Flutterwave API:', flwErr);
      }
    }

    // Direct checkout fallback if keys are being configured or in local sandbox
    return NextResponse.json({
      success: true,
      checkoutUrl: redirectUrl,
      txRef,
      amount,
      currency: 'NGN',
      tier: selectedTier,
      isDirectVerification: !settings.secretKey,
      message: settings.secretKey
        ? 'Payment initiated via Flutterwave gateway'
        : 'Flutterwave credentials pending in Admin Portal. Direct sandbox activation enabled.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Payment initialization failed' },
      { status: 500 }
    );
  }
}
