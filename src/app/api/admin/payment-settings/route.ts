import { NextRequest, NextResponse } from 'next/server';
import {
  getPaymentSettings,
  savePaymentSettings,
  getMaskedPaymentSettings,
  getLiveRevenueStats,
} from '@/lib/payment-settings';
import { isAuthorizedAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    if (!isAuthorizedAdmin(req)) {
      return NextResponse.json({ error: 'Master Admin authorization required.' }, { status: 401 });
    }

    const maskedSettings = getMaskedPaymentSettings();
    const liveStats = getLiveRevenueStats();

    const host = req.headers.get('host') || 'portfoli.site';
    const proto = host.includes('localhost') ? 'http' : 'https';
    const webhookEndpoint = host.includes('localhost')
      ? `${proto}://${host}/api/webhooks/flutterwave`
      : `https://portfoli.site/api/webhooks/flutterwave`;

    return NextResponse.json({
      success: true,
      settings: maskedSettings,
      liveStats,
      webhookEndpoint,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to get payment settings' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isAuthorizedAdmin(req)) {
      return NextResponse.json({ error: 'Master Admin authorization required.' }, { status: 401 });
    }

    const body = await req.json();
    const current = getPaymentSettings();

    // If masked placeholder was sent, retain current secret
    const isMasked = (val?: string) => val && val.includes('••••••••');

    const updated = savePaymentSettings({
      provider: 'flutterwave',
      environment: body.environment === 'test' ? 'test' : 'live',
      clientId: isMasked(body.clientId) ? current.clientId : (body.clientId || '').trim(),
      clientSecret: isMasked(body.clientSecret) ? current.clientSecret : (body.clientSecret || '').trim(),
      secretKey: isMasked(body.secretKey) ? current.secretKey : (body.secretKey || '').trim(),
      publicKey: isMasked(body.publicKey) ? current.publicKey : (body.publicKey || '').trim(),
      encryptionKey: isMasked(body.encryptionKey) ? current.encryptionKey : (body.encryptionKey || '').trim(),
      webhookSecretHash: (body.webhookSecretHash || current.webhookSecretHash || 'portfoli_flw_live_secret_hash_2026').trim(),
      gtmContainerId: (body.gtmContainerId || '').trim(),
      ga4MeasurementId: (body.ga4MeasurementId || '').trim(),
      lookerStudioEmbedUrl: (body.lookerStudioEmbedUrl || '').trim(),
      enabled: body.enabled !== undefined ? Boolean(body.enabled) : true,
    });

    return NextResponse.json({
      success: true,
      message: 'Payment gateway and telemetry configuration updated successfully.',
      settings: getMaskedPaymentSettings(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update payment settings' },
      { status: 500 }
    );
  }
}
