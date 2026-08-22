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
  if (globalThis.__portfoli_payment_settings) {
    return globalThis.__portfoli_payment_settings;
  }

  const primaryPath = getSettingsFilePath();
  const fallbackPath = path.join(LOCAL_DATA_DIR, 'payment-settings.json');

  try {
    if (fs.existsSync(primaryPath)) {
      const data = JSON.parse(fs.readFileSync(primaryPath, 'utf8'));
      globalThis.__portfoli_payment_settings = { ...DEFAULT_SETTINGS, ...data };
      return globalThis.__portfoli_payment_settings;
    }
    if (fs.existsSync(fallbackPath)) {
      const data = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
      globalThis.__portfoli_payment_settings = { ...DEFAULT_SETTINGS, ...data };
      return globalThis.__portfoli_payment_settings;
    }
  } catch (err) {
    console.error('Error reading payment settings:', err);
  }

  globalThis.__portfoli_payment_settings = DEFAULT_SETTINGS;
  return DEFAULT_SETTINGS;
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
