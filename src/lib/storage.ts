import fs from 'fs';
import path from 'path';
import { User, UserPortfolio, Inquiry, PricingConfig, TierType } from './types';
import { DEFAULT_PRICING } from './tiers';

declare global {
  var __portfoli_cache: Record<string, any> | undefined;
}

if (!globalThis.__portfoli_cache) {
  globalThis.__portfoli_cache = {};
}

function getTmpPath(filename: string): string {
  const tmpDir = path.join(
    process.platform === 'win32' ? (process.env.TEMP || 'C:\\Windows\\Temp') : '/tmp',
    'portfoli_data'
  );
  return path.join(tmpDir, filename);
}

function readJsonFile<T>(filename: string, fallback: T): T {
  // 1. Check in-memory global cache first for instant consistency
  if (globalThis.__portfoli_cache && globalThis.__portfoli_cache[filename]) {
    return globalThis.__portfoli_cache[filename];
  }

  // 2. Check writable tmp path (where serverless updates are stored)
  try {
    const tmpPath = getTmpPath(filename);
    if (fs.existsSync(tmpPath)) {
      const content = fs.readFileSync(tmpPath, 'utf-8');
      const parsed = JSON.parse(content);
      if (globalThis.__portfoli_cache) globalThis.__portfoli_cache[filename] = parsed;
      return parsed;
    }
  } catch {}

  // 3. Fallback to repository data/ directory
  try {
    const localPath = path.join(process.cwd(), 'data', filename);
    if (fs.existsSync(localPath)) {
      const content = fs.readFileSync(localPath, 'utf-8');
      const parsed = JSON.parse(content);
      if (globalThis.__portfoli_cache) globalThis.__portfoli_cache[filename] = parsed;
      return parsed;
    }
  } catch {}

  return fallback;
}

function writeJsonFile<T>(filename: string, data: T): void {
  // 1. Update in-memory global cache immediately
  if (globalThis.__portfoli_cache) {
    globalThis.__portfoli_cache[filename] = data;
  }

  // 2. Try writing to local repo data/ folder if writable (local dev)
  try {
    const localDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(localDir)) fs.mkdirSync(localDir, { recursive: true });
    const localPath = path.join(localDir, filename);
    fs.writeFileSync(localPath, JSON.stringify(data, null, 2));
  } catch {}

  // 3. Always write to writable tmp path (serverless persistence across instances)
  try {
    const tmpPath = getTmpPath(filename);
    const tmpDir = path.dirname(tmpPath);
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2));
  } catch {}
}

// Initial seed portfolio for 'kristos' demonstrating the full luxury glassmorphic experience
const SEED_KRISTOS_PORTFOLIO: UserPortfolio = {
  id: 'port_kristos_01',
  userId: 'user_kristos_01',
  username: 'kristos',
  customSubdomain: 'kristos',
  displayName: 'Kristos Vance',
  headline: 'Principal Design Technologist & Creative Director',
  bio: 'Bridging the chasm between visionary spatial design, reactive glassmorphism, and robust full-stack engineering. Crafting products that redefine human-computer interfaces.',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
  location: 'Lagos & San Francisco',
  availableForHire: true,
  availabilityText: 'Available for Select Q3 Advisory & Builds',
  emailContact: 'kristos@portfoli.me',
  phoneContact: '+234 812 345 6789',
  calendlyUrl: 'https://calendly.com',
  theme: {
    mode: 'dark',
    primaryFont: 'Syne',
    secondaryFont: 'Plus Jakarta Sans',
    accentColor: '#00FF87',
    secondaryAccent: '#FFFFFF',
    glassIntensity: 'high',
    displayMode: 'crystal_prism',
    sectionScrollEffect: 'reveal',
    typographyReveal: 'stagger-glow',
    showAvailableBadge: true,
  },
  socials: [
    { id: 's1', platform: 'github', url: 'https://github.com', label: 'GitHub' },
    { id: 's2', platform: 'linkedin', url: 'https://linkedin.com', label: 'LinkedIn' },
    { id: 's3', platform: 'twitter', url: 'https://x.com', label: 'X / Twitter' },
    { id: 's4', platform: 'dribbble', url: 'https://dribbble.com', label: 'Dribbble' },
  ],
  projects: [
    {
      id: 'proj_01',
      title: 'Aetheria Spatial Operating Interface',
      description: 'A revolutionary spatial glassmorphism OS design with volumetric widgets and sub-millisecond gesture tracking.',
      category: 'Spatial Computing / UI',
      tags: ['Spatial UI', 'React Three Fiber', 'Glassmorphism', 'TypeScript'],
      client: 'Aetheria Labs',
      date: '2026',
      liveUrl: 'https://example.com/aetheria',
      githubUrl: 'https://github.com',
      featured: true,
      order: 1,
      media: [
        {
          id: 'med_01',
          type: 'video',
          url: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-robotic-interface-loop-41584-large.mp4',
          originalName: 'spatial_interface_hero.mp4',
          sizeBytes: 18 * 1024 * 1024,
          storageProvider: 'hf',
          uploadedAt: new Date().toISOString(),
          title: '3D Volumetric Interaction Demo',
          caption: 'Click to play interactive demonstration without autoplay delay.',
        },
        {
          id: 'med_02',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
          originalName: 'prism_facet_01.jpg',
          sizeBytes: 2.4 * 1024 * 1024,
          storageProvider: 'hf',
          uploadedAt: new Date().toISOString(),
          title: 'Specular Prism Reflections',
        },
        {
          id: 'med_03',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1200&auto=format&fit=crop&q=80',
          originalName: 'glass_refraction.jpg',
          sizeBytes: 3.1 * 1024 * 1024,
          storageProvider: 'hf',
          uploadedAt: new Date().toISOString(),
          title: 'Refraction Optics & Mesh Shader',
        },
      ],
    },
    {
      id: 'proj_02',
      title: 'Neon Vault Fintech SuperApp',
      description: 'Zero-latency institutional crypto asset custody platform with biometric authentication & instant settlement rails.',
      category: 'Fintech / Security',
      tags: ['Next.js', 'Tailwind CSS', 'Rust Backend', 'Web3'],
      client: 'Neon Vault Global',
      date: '2025',
      liveUrl: 'https://example.com/neonvault',
      featured: true,
      order: 2,
      media: [
        {
          id: 'med_04',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80',
          originalName: 'vault_telemetry.jpg',
          sizeBytes: 1.8 * 1024 * 1024,
          storageProvider: 'hf',
          uploadedAt: new Date().toISOString(),
          title: 'Live Liquidity Telemetry',
        },
        {
          id: 'med_05',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&auto=format&fit=crop&q=80',
          originalName: 'vault_cards.jpg',
          sizeBytes: 2.1 * 1024 * 1024,
          storageProvider: 'hf',
          uploadedAt: new Date().toISOString(),
          title: 'Emerald Metal Card Interface',
        },
      ],
    },
    {
      id: 'proj_03',
      title: 'Chrono Lux Smart Timepiece App',
      description: 'Companion application for Swiss mechanical smart luxury watches, integrating micro-complications and precision telemetry.',
      category: 'Luxury / Mobile',
      tags: ['React Native', 'Swift', 'Design System', 'Micro-Interactions'],
      client: 'Chrono Swiss SA',
      date: '2025',
      liveUrl: 'https://example.com/chrono',
      featured: false,
      order: 3,
      media: [
        {
          id: 'med_06',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&auto=format&fit=crop&q=80',
          originalName: 'chrono_app.jpg',
          sizeBytes: 1.5 * 1024 * 1024,
          storageProvider: 'hf',
          uploadedAt: new Date().toISOString(),
          title: 'Precision Micro-complications',
        },
      ],
    },
  ],
  services: [
    {
      id: 'srv_01',
      title: 'End-to-End Product Design & Design Systems',
      description: 'From zero-to-one design architecture, token-driven component systems, high-fidelity prototypes, and design handoff.',
      priceFormatted: '₦1,500,000 / Sprint',
      billingType: 'fixed',
      deliveryTime: '2 - 3 Weeks',
      features: [
        'Figma Design System with 100+ Tokens',
        'Interactive Prototyping & User Flows',
        'Glassmorphism & Micro-Interaction Specs',
        'Developer-ready Handoff & Asset Pack',
      ],
      popular: true,
      ctaText: 'Book Design Sprint',
      order: 1,
    },
    {
      id: 'srv_02',
      title: 'Full-Stack High-Performance Web Build',
      description: 'Next.js 14, Tailwind CSS, TypeScript, and cloud-native backend deployment crafted for 99+ Core Web Vitals.',
      priceFormatted: '₦2,800,000',
      billingType: 'fixed',
      deliveryTime: '3 - 4 Weeks',
      features: [
        'SEO & Core Web Vitals Optimization (100 Score)',
        '3D Canvas & Framer Motion Integrations',
        'Database & Payment Rails (Paystack/Stripe)',
        'CI/CD & Subdomain Multi-tenant Setup',
      ],
      popular: false,
      ctaText: 'Inquire Architecture',
      order: 2,
    },
    {
      id: 'srv_03',
      title: 'Executive Fractional Design Advisory',
      description: 'Weekly strategic reviews, portfolio audits, and technical UX leadership for high-growth tech startups.',
      priceFormatted: '₦750,000 / Month',
      billingType: 'monthly',
      deliveryTime: 'Ongoing (4 hrs/wk)',
      features: [
        'Weekly 1-on-1 Strategy & Design Review',
        'Codebase UX & A11y Audits',
        'Hiring & Team Mentorship',
        'Direct Slack & Asynchronous Access',
      ],
      popular: false,
      ctaText: 'Apply for Retainer',
      order: 3,
    },
  ],
  viewsCount: 1420,
  createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
};

const SEED_USERS: User[] = [
  {
    id: 'user_kristos_01',
    email: 'kristos@portfoli.me',
    username: 'kristos',
    passwordHash: '$2a$10$YourHashedPasswordHerePlaceholder',
    name: 'Kristos Vance',
    role: 'user',
    subscription: {
      tier: 'elite_5k',
      startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 320 * 24 * 60 * 60 * 1000).toISOString(), // 320 days left
      active: true,
      autoRenew: true,
      amountPaid: 5000,
      currency: 'NGN',
    },
    portfolio: SEED_KRISTOS_PORTFOLIO,
    storageUsedBytes: 28 * 1024 * 1024, // 28MB used
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user_admin_01',
    email: 'admin@portfoli.me',
    username: 'admin',
    passwordHash: '$2a$10$AdminHashedPasswordHerePlaceholder',
    name: 'Portfoli Master Admin',
    role: 'admin',
    subscription: {
      tier: 'elite_5k',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      active: true,
      autoRenew: true,
      amountPaid: 0,
      currency: 'NGN',
    },
    portfolio: {
      ...SEED_KRISTOS_PORTFOLIO,
      id: 'port_admin_01',
      userId: 'user_admin_01',
      username: 'admin',
      displayName: 'Portfoli Executive',
    },
    storageUsedBytes: 5 * 1024 * 1024,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export class Database {
  // Users & Portfolios
  static getUsers(): User[] {
    return readJsonFile<User[]>('users.json', SEED_USERS);
  }

  static saveUsers(users: User[]): void {
    writeJsonFile('users.json', users);
  }

  static findUserByUsername(username: string): User | null {
    const users = this.getUsers();
    return users.find((u) => u.username.toLowerCase() === username.toLowerCase()) || null;
  }

  static findUserByEmail(email: string): User | null {
    const users = this.getUsers();
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  static findUserById(id: string): User | null {
    const users = this.getUsers();
    return users.find((u) => u.id === id) || null;
  }

  static findUserBySubdomain(subdomain: string): User | null {
    const users = this.getUsers();
    return (
      users.find(
        (u) =>
          u.portfolio?.customSubdomain?.toLowerCase() === subdomain.toLowerCase() &&
          u.subscription?.tier === 'elite_5k' &&
          u.subscription?.active
      ) || null
    );
  }

  static saveUser(user: User): User {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === user.id);
    if (index >= 0) {
      users[index] = { ...user, updatedAt: new Date().toISOString() };
    } else {
      users.push({ ...user, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    this.saveUsers(users);
    return user;
  }

  static updatePortfolio(userId: string, portfolioData: Partial<UserPortfolio>): UserPortfolio | null {
    const users = this.getUsers();
    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex < 0) return null;

    const currentPortfolio = users[userIndex].portfolio;
    const updatedPortfolio: UserPortfolio = {
      ...currentPortfolio,
      ...portfolioData,
      updatedAt: new Date().toISOString(),
    };

    // Calculate recalculated storage bytes
    let totalBytes = 0;
    updatedPortfolio.projects.forEach((proj) => {
      proj.media.forEach((med) => {
        totalBytes += med.sizeBytes || 0;
      });
    });

    users[userIndex].portfolio = updatedPortfolio;
    users[userIndex].storageUsedBytes = totalBytes;
    this.saveUsers(users);

    return updatedPortfolio;
  }

  // Dynamic Pricing Config
  static getPricingConfig(): PricingConfig {
    return readJsonFile<PricingConfig>('pricing.json', DEFAULT_PRICING);
  }

  static updatePricingConfig(config: Partial<PricingConfig>): PricingConfig {
    const current = this.getPricingConfig();
    const updated: PricingConfig = {
      ...current,
      ...config,
    };
    writeJsonFile('pricing.json', updated);
    return updated;
  }

  // Inquiries CRUD
  static getInquiries(portfolioUserId?: string): Inquiry[] {
    const list = readJsonFile<Inquiry[]>('inquiries.json', []);
    if (portfolioUserId) {
      return list.filter((i) => i.portfolioUserId === portfolioUserId);
    }
    return list;
  }

  static saveInquiry(inquiry: Omit<Inquiry, 'id' | 'createdAt' | 'read'>): Inquiry {
    const list = this.getInquiries();
    const newInquiry: Inquiry = {
      ...inquiry,
      id: `inq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      read: false,
    };
    list.unshift(newInquiry);
    writeJsonFile('inquiries.json', list);
    return newInquiry;
  }

  static markInquiryRead(inquiryId: string): boolean {
    const list = this.getInquiries();
    const item = list.find((i) => i.id === inquiryId);
    if (!item) return false;
    item.read = true;
    writeJsonFile('inquiries.json', list);
    return true;
  }

  // Admin Security & Passcode
  static getAdminPasscode(): string {
    const defaultPass = process.env.ADMIN_SECRET_KEY || 'portfoli_admin_2026';
    const config = readJsonFile<{ passcode?: string }>('admin-config.json', { passcode: defaultPass });
    return config.passcode || defaultPass;
  }

  static updateAdminPasscode(newPasscode: string): boolean {
    if (!newPasscode || newPasscode.trim().length < 6) return false;
    writeJsonFile('admin-config.json', {
      passcode: newPasscode.trim(),
      updatedAt: new Date().toISOString(),
    });
    return true;
  }
}
