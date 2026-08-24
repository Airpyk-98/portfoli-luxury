import fs from 'fs';
import path from 'path';
import { PaymentTransaction } from './types';

export interface EnvironmentCredentials {
  clientId: string;
  clientSecret: string;
  secretKey: string;
  publicKey: string;
  encryptionKey: string;
  webhookSecretHash: string;
}

export interface PaymentGatewaySettings {
  provider: 'flutterwave';
  environment: 'live' | 'test';
  live: EnvironmentCredentials;
  test: EnvironmentCredentials;
  // Computed active credentials based on environment
  clientId: string;
  clientSecret: string;
  secretKey: string;
  publicKey: string;
  encryptionKey: string;
  webhookSecretHash: string;
  gtmContainerId: string;
  ga4MeasurementId: string;
  lookerStudioEmbedUrl: string;
  enabled: boolean;
  updatedAt: string;
}

export const DEFAULT_LIVE_CREDENTIALS: EnvironmentCredentials = {
  clientId: 'bd08bd61-4ef5-48aa-bd97-54baa6cb8e94',
  clientSecret: 'LrmNFMn2jzZAkHQQQRYryPbTpejlkDzX',
  secretKey: 'LrmNFMn2jzZAkHQQQRYryPbTpejlkDzX',
  publicKey: 'FLWPUBK-12c95a21380df8ff3cc01a7e077d4ebc-X',
  encryptionKey: '+XHci2HLXOgOnVYuxEIhzl1sM/C0asfWv7lhgDVOCUI=',
  webhookSecretHash: 'myportfoli_flw_live_secret_hash_2026',
};

export const DEFAULT_TEST_CREDENTIALS: EnvironmentCredentials = {
  clientId: '0cdcb25c-c586-4ed6-bed5-5dbeab11afcf',
  clientSecret: 'm1FHHwKLK1ea8L6UqdDnpeER0UQSuvAQ',
  secretKey: 'm1FHHwKLK1ea8L6UqdDnpeER0UQSuvAQ',
  publicKey: 'FLWPUBK_TEST-0cdcb25c-c586-4ed6-bed5-5dbeab11afcf',
  encryptionKey: 'jg2t/iQ4lnixhzvE14Ub/1y3n4Q1cr+MzF3xpHX0U/Q=',
  webhookSecretHash: 'myportfoli_flw_test_secret_hash_2026',
};

const DEFAULT_SETTINGS: PaymentGatewaySettings = {
  provider: 'flutterwave',
  environment: 'live',
  live: DEFAULT_LIVE_CREDENTIALS,
  test: DEFAULT_TEST_CREDENTIALS,
  clientId: DEFAULT_LIVE_CREDENTIALS.clientId,
  clientSecret: DEFAULT_LIVE_CREDENTIALS.clientSecret,
  secretKey: DEFAULT_LIVE_CREDENTIALS.secretKey,
  publicKey: DEFAULT_LIVE_CREDENTIALS.publicKey,
  encryptionKey: DEFAULT_LIVE_CREDENTIALS.encryptionKey,
  webhookSecretHash: DEFAULT_LIVE_CREDENTIALS.webhookSecretHash,
  gtmContainerId: 'GTM-MSFTWV9X',
  ga4MeasurementId: '',
  lookerStudioEmbedUrl: '',
  enabled: true,
  updatedAt: new Date().toISOString(),
};

declare global {
  var __portfoli_payment_settings: PaymentGatewaySettings | undefined;
  var __portfoli_transactions: PaymentTransaction[] | undefined;
}

const isServerless = process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined;
const TMP_DATA_DIR = path.join('/tmp', 'portfoli_data');
const LOCAL_DATA_DIR = path.join(process.cwd(), 'data');

function ensureDir(dirPath: string) {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  } catch (e) {}
}

function getSettingsFilePath(): string {
  if (isServerless) {
    ensureDir(TMP_DATA_DIR);
    return path.join(TMP_DATA_DIR, 'payment-settings.json');
  }
  ensureDir(LOCAL_DATA_DIR);
  return path.join(LOCAL_DATA_DIR, 'payment-settings.json');
}

function getTransactionsFilePath(): string {
  if (isServerless) {
    ensureDir(TMP_DATA_DIR);
    return path.join(TMP_DATA_DIR, 'transactions.json');
  }
  ensureDir(LOCAL_DATA_DIR);
  return path.join(LOCAL_DATA_DIR, 'transactions.json');
}

function resolveActiveCredentials(settings: any): PaymentGatewaySettings {
  const env: 'live' | 'test' = settings.environment === 'test' ? 'test' : 'live';
  const liveCreds: EnvironmentCredentials = {
    ...DEFAULT_LIVE_CREDENTIALS,
    ...(settings.live || {}),
  };
  const testCreds: EnvironmentCredentials = {
    ...DEFAULT_TEST_CREDENTIALS,
    ...(settings.test || {}),
  };

  const active = env === 'test' ? testCreds : liveCreds;

  return {
    provider: 'flutterwave',
    environment: env,
    live: liveCreds,
    test: testCreds,
    clientId: active.clientId,
    clientSecret: active.clientSecret,
    secretKey: active.secretKey,
    publicKey: active.publicKey,
    encryptionKey: active.encryptionKey,
    webhookSecretHash: active.webhookSecretHash,
    gtmContainerId: settings.gtmContainerId || 'GTM-MSFTWV9X',
    ga4MeasurementId: settings.ga4MeasurementId || '',
    lookerStudioEmbedUrl: settings.lookerStudioEmbedUrl || '',
    enabled: settings.enabled !== undefined ? Boolean(settings.enabled) : true,
    updatedAt: settings.updatedAt || new Date().toISOString(),
  };
}

export function getPaymentSettings(): PaymentGatewaySettings {
  let settings = DEFAULT_SETTINGS;

  if (globalThis.__portfoli_payment_settings) {
    settings = globalThis.__portfoli_payment_settings;
  } else {
    const primaryPath = getSettingsFilePath();
    const fallbackPath = path.join(LOCAL_DATA_DIR, 'payment-settings.json');

    try {
      if (fs.existsSync(primaryPath)) {
        const data = JSON.parse(fs.readFileSync(primaryPath, 'utf8'));
        settings = { ...DEFAULT_SETTINGS, ...data };
      } else if (fs.existsSync(fallbackPath)) {
        const data = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
        settings = { ...DEFAULT_SETTINGS, ...data };
      }
    } catch (err) {
      console.error('Error reading payment settings:', err);
    }
  }

  const finalSettings = resolveActiveCredentials(settings);
  globalThis.__portfoli_payment_settings = finalSettings;
  return finalSettings;
}

export function savePaymentSettings(settings: Partial<PaymentGatewaySettings>): PaymentGatewaySettings {
  const current = getPaymentSettings();
  const updated = resolveActiveCredentials({
    ...current,
    ...settings,
    live: {
      ...current.live,
      ...(settings.live || {}),
    },
    test: {
      ...current.test,
      ...(settings.test || {}),
    },
    updatedAt: new Date().toISOString(),
  });

  globalThis.__portfoli_payment_settings = updated;

  try {
    const targetPath = getSettingsFilePath();
    fs.writeFileSync(targetPath, JSON.stringify(updated, null, 2), 'utf8');

    if (isServerless) {
      try {
        const localPath = path.join(LOCAL_DATA_DIR, 'payment-settings.json');
        fs.writeFileSync(localPath, JSON.stringify(updated, null, 2), 'utf8');
      } catch (e) {}
    }
  } catch (err) {
    console.error('Error saving payment settings to disk:', err);
  }

  // Sync to Neon
  try {
    const { saveNeonPaymentSettings } = require('./neon');
    saveNeonPaymentSettings(updated).catch((e: any) => console.warn('Neon payment settings sync notice:', e));
  } catch (e) {}

  return updated;
}

export async function getPaymentSettingsAsync(): Promise<PaymentGatewaySettings> {
  let settings = getPaymentSettings();
  try {
    const { getNeonPaymentSettings } = require('./neon');
    const dbSettings = await getNeonPaymentSettings();
    if (dbSettings) {
      settings = resolveActiveCredentials({ ...settings, ...dbSettings });
    }
  } catch (e) {}

  globalThis.__portfoli_payment_settings = settings;
  return settings;
}

export async function savePaymentSettingsAsync(settings: Partial<PaymentGatewaySettings>): Promise<PaymentGatewaySettings> {
  const updated = savePaymentSettings(settings);
  try {
    const { saveNeonPaymentSettings } = require('./neon');
    await saveNeonPaymentSettings(updated);
  } catch (e) {}
  return updated;
}

export function getMaskedPaymentSettings(customSettings?: PaymentGatewaySettings) {
  const s = customSettings || getPaymentSettings();
  const mask = (str: string) => {
    if (!str || str.length <= 8) return str ? '********' : '';
    return str.slice(0, 4) + '••••••••' + str.slice(-4);
  };

  return {
    provider: s.provider,
    environment: s.environment,
    live: {
      clientId: s.live.clientId,
      clientSecret: mask(s.live.clientSecret),
      secretKey: mask(s.live.secretKey),
      publicKey: s.live.publicKey,
      encryptionKey: mask(s.live.encryptionKey),
      webhookSecretHash: s.live.webhookSecretHash,
    },
    test: {
      clientId: s.test.clientId,
      clientSecret: mask(s.test.clientSecret),
      secretKey: mask(s.test.secretKey),
      publicKey: s.test.publicKey,
      encryptionKey: mask(s.test.encryptionKey),
      webhookSecretHash: s.test.webhookSecretHash,
    },
    // Active environment masked keys
    clientId: s.clientId,
    clientSecret: mask(s.clientSecret),
    secretKey: mask(s.secretKey),
    publicKey: s.publicKey,
    encryptionKey: mask(s.encryptionKey),
    webhookSecretHash: s.webhookSecretHash,
    gtmContainerId: s.gtmContainerId,
    ga4MeasurementId: s.ga4MeasurementId,
    lookerStudioEmbedUrl: s.lookerStudioEmbedUrl,
    enabled: s.enabled,
    hasConfiguredSecret: Boolean(s.secretKey || s.clientSecret),
    updatedAt: s.updatedAt,
  };
}

export async function getMaskedPaymentSettingsAsync() {
  const s = await getPaymentSettingsAsync();
  return getMaskedPaymentSettings(s);
}

export function getTransactions(): PaymentTransaction[] {
  if (globalThis.__portfoli_transactions) {
    return globalThis.__portfoli_transactions;
  }

  const primaryPath = getTransactionsFilePath();
  const fallbackPath = path.join(LOCAL_DATA_DIR, 'transactions.json');

  try {
    if (fs.existsSync(primaryPath)) {
      const data = JSON.parse(fs.readFileSync(primaryPath, 'utf8'));
      globalThis.__portfoli_transactions = Array.isArray(data) ? data : [];
      return globalThis.__portfoli_transactions;
    }
    if (fs.existsSync(fallbackPath)) {
      const data = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
      globalThis.__portfoli_transactions = Array.isArray(data) ? data : [];
      return globalThis.__portfoli_transactions;
    }
  } catch (err) {
    console.error('Error reading transactions:', err);
  }

  globalThis.__portfoli_transactions = [];
  return [];
}

export function saveTransaction(tx: PaymentTransaction): void {
  const transactions = getTransactions();
  const existingIdx = transactions.findIndex((t) => t.txRef === tx.txRef || (tx.id && t.id === tx.id));

  if (existingIdx >= 0) {
    transactions[existingIdx] = { ...transactions[existingIdx], ...tx };
  } else {
    transactions.unshift(tx);
  }

  globalThis.__portfoli_transactions = transactions;

  try {
    const targetPath = getTransactionsFilePath();
    fs.writeFileSync(targetPath, JSON.stringify(transactions, null, 2), 'utf8');

    if (isServerless) {
      try {
        const localPath = path.join(LOCAL_DATA_DIR, 'transactions.json');
        fs.writeFileSync(localPath, JSON.stringify(transactions, null, 2), 'utf8');
      } catch (e) {}
    }
  } catch (err) {
    console.error('Error saving transaction to disk:', err);
  }
}

export function getLiveRevenueStats() {
  const txs = getTransactions();
  const successful = txs.filter((t) => t.status === 'successful');
  const totalRevenueNgn = successful.reduce((sum, t) => sum + (t.amount || 0), 0);

  const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
  const thisMonthRevenueNgn = successful
    .filter((t) => new Date(t.createdAt).getTime() >= thisMonthStart)
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  return {
    totalRevenueNgn,
    thisMonthRevenueNgn,
    totalTransactionsCount: txs.length,
    successfulTransactionsCount: successful.length,
    recentTransactions: txs.slice(0, 15),
  };
}
