import fs from 'fs';
import path from 'path';
import { PaymentTransaction } from './types';

export interface PaymentGatewaySettings {
  provider: 'flutterwave';
  environment: 'live' | 'test';
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

const DEFAULT_SETTINGS: PaymentGatewaySettings = {
  provider: 'flutterwave',
  environment: 'live',
  clientId: '',
  clientSecret: '',
  secretKey: '',
  publicKey: '',
  encryptionKey: '',
  webhookSecretHash: 'portfoli_flw_live_secret_hash_2026',
  gtmContainerId: '',
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

  // Override with environment variables if available
  const finalSettings: PaymentGatewaySettings = {
    ...settings,
    secretKey: process.env.FLUTTERWAVE_SECRET_KEY || process.env.FLW_SECRET_KEY || settings.secretKey,
    publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY || process.env.FLW_PUBLIC_KEY || settings.publicKey,
    clientId: process.env.FLUTTERWAVE_CLIENT_ID || process.env.FLW_CLIENT_ID || settings.clientId,
    clientSecret: process.env.FLUTTERWAVE_CLIENT_SECRET || process.env.FLW_CLIENT_SECRET || settings.clientSecret,
    encryptionKey: process.env.FLUTTERWAVE_ENCRYPTION_KEY || process.env.FLW_ENCRYPTION_KEY || settings.encryptionKey,
    webhookSecretHash: process.env.FLUTTERWAVE_WEBHOOK_HASH || settings.webhookSecretHash,
  };

  globalThis.__portfoli_payment_settings = finalSettings;
  return finalSettings;
}

export function savePaymentSettings(settings: Partial<PaymentGatewaySettings>): PaymentGatewaySettings {
  const current = getPaymentSettings();
  const updated: PaymentGatewaySettings = {
    ...current,
    ...settings,
    updatedAt: new Date().toISOString(),
  };

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

export function getMaskedPaymentSettings() {
  const s = getPaymentSettings();
  const mask = (str: string) => {
    if (!str || str.length <= 8) return str ? '********' : '';
    return str.slice(0, 4) + '••••••••' + str.slice(-4);
  };

  return {
    provider: s.provider,
    environment: s.environment,
    clientId: mask(s.clientId),
    clientSecret: mask(s.clientSecret),
    secretKey: mask(s.secretKey),
    publicKey: s.publicKey ? s.publicKey.slice(0, 8) + '••••••••' + s.publicKey.slice(-4) : '',
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
