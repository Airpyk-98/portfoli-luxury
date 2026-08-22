const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('Testing 3DES Encryption...');
function encryptFlutterwavePayload(encryptionKey, payload) {
  try {
    const text = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const key = Buffer.from(encryptionKey, 'utf8');
    const cipher = crypto.createCipheriv('des-ede3', key, Buffer.alloc(0));
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
  } catch (err) {
    return 'Error: ' + err.message;
  }
}

// 24-byte key for 3DES
const testKey = '123456789012345678901234';
const payload = { amount: 5000, currency: 'NGN', email: 'test@example.com' };
console.log('3DES Result:', encryptFlutterwavePayload(testKey, payload));

// Test subscription calculation logic with missing endDate
function getSubscriptionStatus(sub) {
  if (!sub || sub.tier === 'free') {
    return {
      isActive: true,
      isGracePeriod: false,
      isExpiredAndDecommissioned: false,
      daysRemainingInSubscription: 9999,
      daysRemainingInGrace: 30,
      endDate: sub?.endDate || new Date().toISOString(),
      tier: 'free',
    };
  }

  const now = Date.now();
  const endMs = new Date(sub.endDate).getTime();
  const diffMs = endMs - now;
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (daysRemaining > 0 && sub.active) {
    return {
      isActive: true,
      isGracePeriod: false,
      isExpiredAndDecommissioned: false,
      daysRemainingInSubscription: daysRemaining,
      daysRemainingInGrace: 30,
      endDate: sub.endDate,
      tier: sub.tier,
    };
  }

  const daysPastExpiration = Math.abs(daysRemaining);
  const graceDaysRemaining = Math.max(0, 30 - daysPastExpiration);

  if (graceDaysRemaining > 0) {
    return {
      isActive: false,
      isGracePeriod: true,
      isExpiredAndDecommissioned: false,
      daysRemainingInSubscription: 0,
      daysRemainingInGrace: graceDaysRemaining,
      endDate: sub.endDate,
      tier: sub.tier,
    };
  }

  return {
    isActive: false,
    isGracePeriod: false,
    isExpiredAndDecommissioned: true,
    daysRemainingInSubscription: 0,
    daysRemainingInGrace: 0,
    endDate: sub.endDate,
    tier: sub.tier,
  };
}

console.log('Status with undefined endDate:', getSubscriptionStatus({ tier: 'elite_5k', active: true }));

const futureDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();
console.log('Status with 10 days left:', getSubscriptionStatus({ tier: 'elite_5k', active: true, endDate: futureDate }));

const graceDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
console.log('Status with 10 days past (Grace):', getSubscriptionStatus({ tier: 'elite_5k', active: true, endDate: graceDate }));

const expiredDate = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString();
console.log('Status with 40 days past (Decommissioned):', getSubscriptionStatus({ tier: 'elite_5k', active: true, endDate: expiredDate }));
const { DEFAULT_PRICING, MB_IN_BYTES, GB_IN_BYTES } = {
  MB_IN_BYTES: 1024 * 1024,
  GB_IN_BYTES: 1024 * 1024 * 1024,
  DEFAULT_PRICING: {
    free: {
      priceNgn: 0,
      maxVideos: 1,
      maxPhotos: 5,
      storageQuotaBytes: 200 * 1024 * 1024,
      subdomainAllowed: false,
      displayModesAllowed: ['carousel_3d', 'bento_grid'],
    },
    pro_2k: {
      priceNgn: 2000,
      maxVideos: 10,
      maxPhotos: 70,
      storageQuotaBytes: 1 * 1024 * 1024 * 1024,
      subdomainAllowed: false,
      displayModesAllowed: ['carousel_3d', 'side_swipe', 'bento_grid'],
    },
    elite_5k: {
      priceNgn: 5000,
      maxVideos: 9999,
      maxPhotos: 99999,
      storageQuotaBytes: 2 * 1024 * 1024 * 1024,
      subdomainAllowed: true,
      displayModesAllowed: ['crystal_prism', 'side_swipe', 'carousel_3d', 'bento_grid'],
    },
  }
};

function checkUploadAllowed(tier, currentVideosCount, currentPhotosCount, currentStorageBytes, newFileType, newFileSizeBytes, pricingConfig = DEFAULT_PRICING) {
  const tierConfig = pricingConfig[tier];
  if (!tierConfig) return { allowed: false, reason: 'Unknown tier' };

  if (currentStorageBytes + newFileSizeBytes > tierConfig.storageQuotaBytes) {
    const quotaMb = Math.round(tierConfig.storageQuotaBytes / MB_IN_BYTES);
    return {
      allowed: false,
      reason: Storage quota exceeded. Your  plan limit is . Please upgrade to continue uploading.,
    };
  }

  if (newFileType === 'video') {
    if (currentVideosCount + 1 > tierConfig.maxVideos) {
      return {
        allowed: false,
        reason: Video upload limit reached ( video max on ). Upgrade for higher limits.,
      };
    }
  } else if (newFileType === 'image') {
    if (currentPhotosCount + 1 > tierConfig.maxPhotos) {
      return {
        allowed: false,
        reason: Photo upload limit reached ( photos max on ). Upgrade for higher limits.,
      };
    }
  }

  return { allowed: true };
}

console.log('Free 1st image (under quota):', checkUploadAllowed('free', 0, 0, 0, 'image', 5 * MB_IN_BYTES));
console.log('Free 6th image (exceeds maxPhotos=5):', checkUploadAllowed('free', 0, 5, 10 * MB_IN_BYTES, 'image', 5 * MB_IN_BYTES));
console.log('Free 2nd video (exceeds maxVideos=1):', checkUploadAllowed('free', 1, 0, 10 * MB_IN_BYTES, 'video', 10 * MB_IN_BYTES));
console.log('Free storage overflow (205MB > 200MB):', checkUploadAllowed('free', 0, 0, 190 * MB_IN_BYTES, 'image', 20 * MB_IN_BYTES));
console.log('Pro storage overflow (1.1GB > 1GB):', checkUploadAllowed('pro_2k', 5, 20, 950 * MB_IN_BYTES, 'image', 100 * MB_IN_BYTES));
