import { NextRequest, NextResponse } from 'next/server';
import {
  getPaymentSettingsAsync,
  savePaymentSettingsAsync,
  getMaskedPaymentSettingsAsync,
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

    const maskedSettings = await getMaskedPaymentSettingsAsync();
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
    const current = await getPaymentSettingsAsync();

    // If masked placeholder was sent, retain current secret
    const isMasked = (val?: string) => val && val.includes('••••••••');

    const liveInput = body.live || {};
    const testInput = body.test || {};

    const updated = await savePaymentSettingsAsync({
      provider: 'flutterwave',
      environment: body.environment === 'test' ? 'test' : 'live',
      live: {
        clientId: liveInput.clientId !== undefined ? liveInput.clientId.trim() : (isMasked(body.clientId) ? current.live.clientId : (body.clientId !== undefined ? body.clientId.trim() : current.live.clientId)),
        clientSecret: liveInput.clientSecret && !isMasked(liveInput.clientSecret) ? liveInput.clientSecret.trim() : (!isMasked(body.clientSecret) && body.clientSecret ? body.clientSecret.trim() : current.live.clientSecret),
        secretKey: liveInput.secretKey && !isMasked(liveInput.secretKey) ? liveInput.secretKey.trim() : (!isMasked(body.secretKey) && body.secretKey ? body.secretKey.trim() : current.live.secretKey),
        publicKey: liveInput.publicKey !== undefined ? liveInput.publicKey.trim() : (body.publicKey !== undefined ? body.publicKey.trim() : current.live.publicKey),
        encryptionKey: liveInput.encryptionKey && !isMasked(liveInput.encryptionKey) ? liveInput.encryptionKey.trim() : (!isMasked(body.encryptionKey) && body.encryptionKey ? body.encryptionKey.trim() : current.live.encryptionKey),
        webhookSecretHash: liveInput.webhookSecretHash !== undefined ? liveInput.webhookSecretHash.trim() : (body.webhookSecretHash !== undefined ? body.webhookSecretHash.trim() : current.live.webhookSecretHash),
      },
      test: {
        clientId: testInput.clientId !== undefined ? testInput.clientId.trim() : current.test.clientId,
        clientSecret: testInput.clientSecret && !isMasked(testInput.clientSecret) ? testInput.clientSecret.trim() : current.test.clientSecret,
        secretKey: testInput.secretKey && !isMasked(testInput.secretKey) ? testInput.secretKey.trim() : current.test.secretKey,
        publicKey: testInput.publicKey !== undefined ? testInput.publicKey.trim() : current.test.publicKey,
        encryptionKey: testInput.encryptionKey && !isMasked(testInput.encryptionKey) ? testInput.encryptionKey.trim() : current.test.encryptionKey,
        webhookSecretHash: testInput.webhookSecretHash !== undefined ? testInput.webhookSecretHash.trim() : current.test.webhookSecretHash,
      },
      gtmContainerId: (body.gtmContainerId || current.gtmContainerId || '').trim(),
      ga4MeasurementId: (body.ga4MeasurementId || current.ga4MeasurementId || '').trim(),
      lookerStudioEmbedUrl: (body.lookerStudioEmbedUrl || current.lookerStudioEmbedUrl || '').trim(),
      enabled: body.enabled !== undefined ? Boolean(body.enabled) : true,
    });

    const masked = getMaskedPaymentSettings(updated);

    return NextResponse.json({
      success: true,
      message: 'Payment gateway and telemetry configuration updated successfully.',
      settings: masked,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update payment settings' },
      { status: 500 }
    );
  }
}
