import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { Database } from '@/lib/storage';
import { getPaymentSettings, saveTransaction } from '@/lib/payment-settings';
import { TierType, PaymentTransaction } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * 3DES Payload Encryption Helper for Flutterwave Direct Charges
 * Uses Triple DES (des-ede3) algorithm with the merchant's Encryption Key.
 */
export function encryptFlutterwavePayload(encryptionKey: string, payload: Record<string, any>): string {
  try {
    const text = typeof payload === 'string' ? payload : JSON.stringify(payload);
    // Triple DES in Node.js
    const key = Buffer.from(encryptionKey, 'utf8');
    const cipher = crypto.createCipheriv('des-ede3', key, Buffer.alloc(0));
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
  } catch (err) {
    console.error('3DES payload encryption error:', err);
    return '';
  }
}

/**
 * Flutterwave v4 OAuth 2.0 Token Generation
 * Exchanges client_id and client_secret for an access_token.
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
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await res.json();
    if (data.access_token) {
      return data.access_token;
    }
    console.warn('Flutterwave v4 OAuth token response did not contain access_token:', data);
  } catch (err) {
    console.error('Error fetching Flutterwave v4 OAuth token:', err);
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, tier = 'elite_5k', returnUrl } = body;

    if (!userId) {
      return NextResponse.json({ success: false, message: 'User ID is required' }, { status: 400 });
    }

    const user = await Database.findUserByIdAsync(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // STRICT SERVER-SIDE PRICING LOOKUP (Non-forgeable)
    const pricing = await Database.getPricingConfigAsync();
    let amount = 5000;
    const selectedTier: TierType = tier === 'pro_2k' ? 'pro_2k' : 'elite_5k';

    if (selectedTier === 'pro_2k') {
      amount = pricing.pro_2k.priceNgn || 2000;
    } else {
      amount = pricing.elite_5k.priceNgn || 5000;
    }

    const txRef = `portfoli_${user.username}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const settings = await getPaymentSettingsAsync();

    const host = req.headers.get('host') || 'portfoli.site';
    const proto = host.includes('localhost') ? 'http' : 'https';
    const redirectUrl =
      returnUrl ||
      `${proto}://${host}/dashboard?payment=success&tx_ref=${txRef}&tier=${selectedTier}`;

    // Record Pending Transaction in Ledger
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

    // 1. Check for v4 OAuth 2.0 (Client ID & Client Secret)
    let authHeader = '';
    if (settings.clientId && settings.clientSecret) {
      const v4Token = await getV4OAuthToken(settings.clientId, settings.clientSecret);
      if (v4Token) {
        authHeader = `Bearer ${v4Token}`;
      } else {
        console.warn('Could not exchange Client ID and Secret for Flutterwave v4 access token.');
      }
    }

    // 2. Fallback to Secret Key if v4 OAuth is not configured
    if (!authHeader && settings.secretKey) {
      authHeader = `Bearer ${settings.secretKey.trim()}`;
    }

    if (!authHeader) {
      return NextResponse.json({
        success: false,
        message: 'Flutterwave credentials not configured. Please save your Client ID and Client Secret in the Admin Panel (Settings > Payment Gateway) or set FLUTTERWAVE_CLIENT_ID and FLUTTERWAVE_CLIENT_SECRET environment variables.',
      }, { status: 400 });
    }

    // 3. Initiate payment with Flutterwave API
    try {
      const flwResponse = await fetch('https://api.flutterwave.com/v3/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
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
            title: 'portfoli — Luxury Portfolio Subscription',
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
          v4Authenticated: Boolean(settings.clientId && settings.clientSecret),
        });
      } else {
        console.error('Flutterwave payments API error response:', flwData);
        return NextResponse.json({
          success: false,
          message: flwData.message || 'Flutterwave failed to generate checkout link. Please check credentials.',
          details: flwData,
        }, { status: 400 });
      }
    } catch (flwErr: any) {
      console.error('Error connecting to Flutterwave API:', flwErr);
      return NextResponse.json({
        success: false,
        message: `Connection to Flutterwave API failed: ${flwErr.message}`,
      }, { status: 500 });
    }
  } catch (err: any) {
    console.error('Payment initialization failed:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Payment initiation error' },
      { status: 500 }
    );
  }
}
