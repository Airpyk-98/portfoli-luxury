import { DisplayMode } from './types';

export interface SampleTemplateInfo {
  id: string;
  username: string;
  name: string;
  role: string;
  category: string;
  avatarUrl: string;
  location: string;
  themeName: string;
  accentColor: string;
  accentLabel: string;
  displayMode: DisplayMode;
  displayModeLabel: string;
  primaryFont: string;
  secondaryFont: string;
  headline: string;
  bioSnippet: string;
  featuredProjectTitle: string;
  featuredProjectImage: string;
  tags: string[];
}

export const SAMPLE_TEMPLATES: SampleTemplateInfo[] = [
  {
    id: 'tmpl_kristos',
    username: 'kristos',
    name: 'Kristos Vance',
    role: 'Spatial UI & Product Technologist',
    category: 'Spatial UI & Design',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    location: 'Lagos & San Francisco',
    themeName: 'Cyber Emerald',
    accentColor: '#00FF87',
    accentLabel: 'Neon Emerald',
    displayMode: 'crystal_prism',
    displayModeLabel: '3D Crystal Prism',
    primaryFont: 'Syne',
    secondaryFont: 'Plus Jakarta Sans',
    headline: 'Principal Design Technologist & Creative Director',
    bioSnippet: 'Bridging the chasm between visionary spatial design, reactive glassmorphism, and robust full-stack engineering.',
    featuredProjectTitle: 'Aetheria Spatial Operating Interface',
    featuredProjectImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    tags: ['Spatial UI', 'WebGL', '3D Prism', 'Syne Font'],
  },
  {
    id: 'tmpl_elena',
    username: 'elena',
    name: 'Elena Rostova',
    role: 'Luxury Fashion & Editorial Art Director',
    category: 'Fashion & Luxury',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80',
    location: 'Paris & London',
    themeName: 'Solar Champagne',
    accentColor: '#F59E0B',
    accentLabel: 'Solar Amber',
    displayMode: 'side_swipe',
    displayModeLabel: 'Fluid Side-Swipe Cards',
    primaryFont: 'Outfit',
    secondaryFont: 'Plus Jakarta Sans',
    headline: 'Fashion Director & Luxury Editorial Stylist',
    bioSnippet: 'Curating visual narratives across Paris, Milan, and New York. Defining high-fashion aesthetics for global luxury houses.',
    featuredProjectTitle: 'Vogue Haute Couture Autumn Campaign',
    featuredProjectImage: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&auto=format&fit=crop&q=80',
    tags: ['Editorial', 'Horizontal Swipe', 'Solar Amber', 'Outfit Font'],
  },
  {
    id: 'tmpl_marcus',
    username: 'marcus',
    name: 'Marcus Thorne',
    role: 'VFX Lead & 3D Motion Director',
    category: '3D & VFX Motion',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
    location: 'London & Los Angeles',
    themeName: 'Electric Neon',
    accentColor: '#A855F7',
    accentLabel: 'Electric Violet',
    displayMode: 'carousel_3d',
    displayModeLabel: '3D Rotating Carousel',
    primaryFont: 'Space Grotesk',
    secondaryFont: 'Outfit',
    headline: 'VFX Director & Commercial 3D Motion Lead',
    bioSnippet: 'Crafting photorealistic CGI, cinematic simulations, and mind-bending visual effects for blockbuster campaigns.',
    featuredProjectTitle: 'Cyberpunk Hyper-Car Commercial CGI',
    featuredProjectImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    tags: ['3D Carousel', 'VFX', 'Electric Violet', 'Space Grotesk'],
  },
  {
    id: 'tmpl_sora',
    username: 'sora',
    name: 'Dr. Sora Tanaka',
    role: 'Parametric Architect & Spatial Acoustics',
    category: 'Architecture & Science',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80',
    location: 'Tokyo & Zurich',
    themeName: 'Cyber Blueprint',
    accentColor: '#00F0FF',
    accentLabel: 'Cyber Cyan',
    displayMode: 'bento_grid',
    displayModeLabel: 'Editorial Bento Grid',
    primaryFont: 'Space Grotesk',
    secondaryFont: 'JetBrains Mono',
    headline: 'Parametric Architect & Spatial Acoustics Researcher',
    bioSnippet: 'Designing responsive architectural geometries and acoustically optimized spatial structures that bridge computation with biophilic sustainability.',
    featuredProjectTitle: 'Hyperion Acoustic Concert Pavilion',
    featuredProjectImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80',
    tags: ['Bento Grid', 'Cyber Cyan', 'JetBrains Mono', 'Architecture'],
  },
  {
    id: 'tmpl_zara',
    username: 'zara',
    name: 'Zara Sterling',
    role: 'Distributed Systems & Crypto Architect',
    category: 'Software & Systems',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&auto=format&fit=crop&q=80',
    location: 'New York & Singapore',
    themeName: 'Monochrome Titanium',
    accentColor: '#FFFFFF',
    accentLabel: 'Pure White',
    displayMode: 'bento_grid',
    displayModeLabel: 'Minimalist Metric Bento',
    primaryFont: 'JetBrains Mono',
    secondaryFont: 'Plus Jakarta Sans',
    headline: 'Principal Distributed Systems & Cryptographic Engineer',
    bioSnippet: 'Architecting sub-millisecond consensus protocols, zero-knowledge verifiable compute engines, and financial settlement infrastructure.',
    featuredProjectTitle: 'Nexus ZK-Rollup Settlement Protocol',
    featuredProjectImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
    tags: ['Monochrome', 'Pure White', 'High Throughput', 'JetBrains Mono'],
  },
];
