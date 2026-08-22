export type TierType = 'free' | 'pro_2k' | 'elite_5k';

export interface UserSubscription {
  tier: TierType;
  startDate: string; // ISO date
  endDate: string;   // ISO date (1 year later)
  active: boolean;
  autoRenew: boolean;
  amountPaid: number; // NGN
  currency: 'NGN';
  lastPaymentRef?: string;
}

export type MediaDisplayMode = 'crystal_prism' | 'side_swipe' | 'carousel_3d' | 'bento_grid';
export type DisplayMode = MediaDisplayMode;

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  originalName: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  durationSeconds?: number;
  compressed?: boolean;
  compressionRatio?: number;
  storageProvider: 'hf' | 'local';
  hfPath?: string;
  uploadedAt: string;
  title?: string;
  caption?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  client?: string;
  date?: string;
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
  order: number;
  media: MediaItem[];
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  priceFormatted: string; // e.g. "₦150,000" or "$500"
  billingType: 'fixed' | 'hourly' | 'monthly' | 'custom';
  deliveryTime: string;
  features: string[];
  popular?: boolean;
  ctaText?: string;
  order: number;
}

export interface SocialLink {
  id: string;
  platform: 'github' | 'linkedin' | 'twitter' | 'youtube' | 'behance' | 'dribbble' | 'instagram' | 'figma' | 'website' | 'email' | 'whatsapp' | 'custom';
  url: string;
  label?: string;
}

export interface ThemeConfig {
  mode: 'dark' | 'light';
  primaryFont: string;       // e.g. "Syne", "Clash Display", "Space Grotesk", "Inter"
  secondaryFont: string;     // e.g. "Plus Jakarta Sans", "Inter", "Geist", "Satoshi"
  accentColor: string;       // e.g. "#00FF87" (Neon Emerald), "#10B981", "#05DF72", "#38BDF8"
  secondaryAccent: string;   // e.g. "#FFFFFF", "#94A3B8"
  glassIntensity: 'subtle' | 'medium' | 'high' | 'ultra';
  displayMode: MediaDisplayMode;
  sectionScrollEffect: 'smooth' | 'reveal' | 'parallax' | 'magnetic';
  typographyReveal: 'fade-up' | 'split-word' | 'stagger-glow' | 'minimal';
  showAvailableBadge: boolean;
  customCss?: string;
}

export interface UserPortfolio {
  id: string;
  userId: string;
  username: string; // unique slug (e.g. 'kristos')
  customSubdomain?: string; // only for elite_5k (e.g. 'kristos')
  displayName: string;
  headline: string;
  bio: string;
  avatarUrl?: string;
  location?: string;
  availableForHire: boolean;
  availabilityText?: string; // e.g. "Available for Q3 Projects"
  emailContact: string;
  phoneContact?: string;
  calendlyUrl?: string;
  theme: ThemeConfig;
  socials: SocialLink[];
  projects: ProjectItem[];
  services: ServiceItem[];
  customSections?: {
    id: string;
    title: string;
    contentHtml: string;
    order: number;
  }[];
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  name: string;
  role: 'user' | 'admin';
  subscription: UserSubscription;
  portfolio: UserPortfolio;
  storageUsedBytes: number;
  createdAt: string;
  updatedAt: string;
}

export interface Inquiry {
  id: string;
  portfolioUserId: string;
  portfolioUsername: string;
  senderName: string;
  senderEmail: string;
  senderSubject?: string;
  message: string;
  serviceInterest?: string;
  budget?: string;
  createdAt: string;
  read: boolean;
}

export interface PricingConfig {
  free: {
    priceNgn: number;
    maxVideos: number;
    maxPhotos: number;
    storageQuotaBytes: number; // 200MB = 200 * 1024 * 1024
    subdomainAllowed: boolean;
    displayModesAllowed: MediaDisplayMode[];
  };
  pro_2k: {
    priceNgn: number; // 2000
    maxVideos: number;
    maxPhotos: number;
    storageQuotaBytes: number; // 1GB = 1024 * 1024 * 1024
    subdomainAllowed: boolean;
    displayModesAllowed: MediaDisplayMode[];
  };
  elite_5k: {
    priceNgn: number; // 5000
    maxVideos: number; // Unlimited
    maxPhotos: number; // Unlimited
    storageQuotaBytes: number; // 2GB = 2 * 1024 * 1024 * 1024
    subdomainAllowed: boolean;
    displayModesAllowed: MediaDisplayMode[];
  };
}

export interface PaymentTransaction {
  id: string;
  txRef: string;
  flwRef?: string;
  userId: string;
  username: string;
  userEmail: string;
  amount: number;
  currency: string;
  tier: TierType;
  status: 'successful' | 'failed' | 'pending';
  paymentType?: string;
  createdAt: string;
  verifiedAt?: string;
  metadata?: Record<string, any>;
}

export interface SubscriptionStatusInfo {
  isActive: boolean;
  isGracePeriod: boolean;
  isExpiredAndDecommissioned: boolean;
  daysRemainingInSubscription: number;
  daysRemainingInGrace: number;
  endDate: string;
  tier: TierType;
}

export function getSubscriptionStatus(sub?: UserSubscription): SubscriptionStatusInfo {
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

  // If subscription is still before endDate and active
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

  // If past endDate, check 30-day grace period
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

  // Expired past 30 days
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
