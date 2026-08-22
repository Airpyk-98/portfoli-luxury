import { TierType, PricingConfig, UserSubscription, MediaDisplayMode } from './types';

export const MB_IN_BYTES = 1024 * 1024;
export const GB_IN_BYTES = 1024 * MB_IN_BYTES;

export const DEFAULT_PRICING: PricingConfig = {
  free: {
    priceNgn: 0,
    maxVideos: 1,
    maxPhotos: 5,
    storageQuotaBytes: 200 * MB_IN_BYTES, // 200 MB
    subdomainAllowed: false,
    displayModesAllowed: ['carousel_3d', 'bento_grid'],
  },
  pro_2k: {
    priceNgn: 2000,
    maxVideos: 10,
    maxPhotos: 70,
    storageQuotaBytes: 1 * GB_IN_BYTES, // 1 GB
    subdomainAllowed: false,
    displayModesAllowed: ['carousel_3d', 'side_swipe', 'bento_grid'],
  },
  elite_5k: {
    priceNgn: 5000,
    maxVideos: 9999, // Unlimited
    maxPhotos: 99999, // Unlimited
    storageQuotaBytes: 2 * GB_IN_BYTES, // 2 GB hard cap
    subdomainAllowed: true,
    displayModesAllowed: ['crystal_prism', 'side_swipe', 'carousel_3d', 'bento_grid'],
  },
};

/**
 * Calculates the daily countdown metrics for an active subscription.
 */
export function getSubscriptionCountdown(subscription?: UserSubscription) {
  if (!subscription || subscription.tier === 'free') {
    return {
      daysRemaining: 0,
      totalDays: 365,
      isExpired: false,
      percentageRemaining: 0,
      formattedText: 'Free Forever',
      tierLabel: 'Free Plan',
      badgeColor: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40',
    };
  }

  const now = new Date();
  const start = new Date(subscription.startDate);
  const end = new Date(subscription.endDate);

  const totalDurationMs = end.getTime() - start.getTime();
  const remainingMs = end.getTime() - now.getTime();

  const totalDays = Math.max(1, Math.ceil(totalDurationMs / (1000 * 60 * 60 * 24)));
  const daysRemaining = Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60 * 24)));
  const isExpired = remainingMs <= 0;

  const percentageRemaining = Math.min(100, Math.max(0, Math.round((daysRemaining / totalDays) * 100)));

  const tierLabel = subscription.tier === 'elite_5k' ? 'Elite Mastery (5k Plan)' : 'Creator Pro (2k Plan)';
  const badgeColor =
    subscription.tier === 'elite_5k'
      ? 'text-cyan-400 bg-cyan-950/40 border-cyan-700/50'
      : 'text-emerald-400 bg-emerald-950/40 border-emerald-700/50';

  return {
    daysRemaining,
    totalDays,
    isExpired,
    percentageRemaining,
    formattedText: isExpired ? 'Expired' : `${daysRemaining} Days Left`,
    tierLabel,
    badgeColor,
  };
}

/**
 * Formats bytes to human-readable string (MB / GB).
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (!bytes || bytes === 0) return '0 MB';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  if (i < 2) {
    return `${(bytes / (k * k)).toFixed(dm)} MB`;
  }
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Validates if an upload action is within the user's tier quotas.
 */
export function checkUploadAllowed(
  tier: TierType,
  currentVideosCount: number,
  currentPhotosCount: number,
  currentStorageBytes: number,
  newFileType: 'image' | 'video',
  newFileSizeBytes: number,
  pricingConfig: PricingConfig = DEFAULT_PRICING
): { allowed: boolean; reason?: string } {
  const tierConfig = pricingConfig[tier];

  // 1. Check storage quota
  if (currentStorageBytes + newFileSizeBytes > tierConfig.storageQuotaBytes) {
    const quotaMb = Math.round(tierConfig.storageQuotaBytes / MB_IN_BYTES);
    return {
      allowed: false,
      reason: `Storage quota exceeded. Your ${tier} plan limit is ${quotaMb >= 1024 ? `${quotaMb / 1024} GB` : `${quotaMb} MB`}. Please upgrade to continue uploading.`,
    };
  }

  // 2. Check item counts
  if (newFileType === 'video') {
    if (currentVideosCount + 1 > tierConfig.maxVideos) {
      return {
        allowed: false,
        reason: `Video upload limit reached (${tierConfig.maxVideos} video max on ${tier.toUpperCase()}). Upgrade for higher limits.`,
      };
    }
  } else if (newFileType === 'image') {
    if (currentPhotosCount + 1 > tierConfig.maxPhotos) {
      return {
        allowed: false,
        reason: `Photo upload limit reached (${tierConfig.maxPhotos} photos max on ${tier.toUpperCase()}). Upgrade for higher limits.`,
      };
    }
  }

  return { allowed: true };
}

/**
 * Validates if the user can have a custom subdomain.
 */
export function isSubdomainAllowed(tier: TierType, pricingConfig: PricingConfig = DEFAULT_PRICING): boolean {
  return pricingConfig[tier]?.subdomainAllowed ?? false;
}

/**
 * Validates if a display mode is unlocked for the user's tier.
 */
export function isDisplayModeAllowed(
  tier: TierType,
  mode: MediaDisplayMode,
  pricingConfig: PricingConfig = DEFAULT_PRICING
): boolean {
  return pricingConfig[tier]?.displayModesAllowed.includes(mode) ?? false;
}
