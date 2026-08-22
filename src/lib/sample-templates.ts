import { DisplayMode } from './types';

export interface TemplateProjectPreview {
  id: string;
  title: string;
  category: string;
  image: string;
  metricBadge?: string;
  description?: string;
}

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
  motionType: 'cube_3d' | 'fluid_swipe' | 'turntable_carousel' | 'bento_matrix' | 'terminal_metric';
  motionBadge: string;
  projects: TemplateProjectPreview[];
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
    motionType: 'cube_3d',
    motionBadge: '3D Prism Cube Flip',
    projects: [
      {
        id: 'kp_1',
        title: 'Aetheria Spatial Interface',
        category: 'Spatial UI / WebGL',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
        metricBadge: 'Volumetric Glass',
      },
      {
        id: 'kp_2',
        title: 'Quantum Raytracer Engine',
        category: 'Real-time Shaders',
        image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1200&auto=format&fit=crop&q=80',
        metricBadge: '60 FPS 4K WebGL',
      },
      {
        id: 'kp_3',
        title: 'Sub-Millisecond Gesture Tracker',
        category: 'Spatial Optics',
        image: 'https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=1200&auto=format&fit=crop&q=80',
        metricBadge: 'Vision Pro Ready',
      },
    ],
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
    motionType: 'fluid_swipe',
    motionBadge: 'Continuous Fluid Swipe',
    projects: [
      {
        id: 'ep_1',
        title: 'Vogue Haute Couture Autumn',
        category: 'Editorial Direction',
        image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&auto=format&fit=crop&q=80',
        metricBadge: 'Paris Fashion Week',
      },
      {
        id: 'ep_2',
        title: 'LVMH Private Salon Monograph',
        category: 'Luxury Brand Identity',
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&auto=format&fit=crop&q=80',
        metricBadge: 'VIP Limited Edition',
      },
      {
        id: 'ep_3',
        title: 'L’Étoile Fragrance Film & Stills',
        category: 'Spatial Photography',
        image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1200&auto=format&fit=crop&q=80',
        metricBadge: 'Global Campaign',
      },
    ],
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
    motionType: 'turntable_carousel',
    motionBadge: '3D Rotary Turntable',
    projects: [
      {
        id: 'mp_1',
        title: 'Cyberpunk Hyper-Car CGI',
        category: 'Unreal Engine 5',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
        metricBadge: 'Realtime Raytracing',
      },
      {
        id: 'mp_2',
        title: 'Nebula Particle Universe',
        category: 'Houdini Simulation',
        image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200&auto=format&fit=crop&q=80',
        metricBadge: '10M Particles',
      },
      {
        id: 'mp_3',
        title: 'Apex Motors World Stage',
        category: 'Hologram Concert VFX',
        image: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200&auto=format&fit=crop&q=80',
        metricBadge: 'Live Spatial Show',
      },
    ],
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
    motionType: 'bento_matrix',
    motionBadge: 'Dynamic Bento Matrix',
    projects: [
      {
        id: 'sp_1',
        title: 'Hyperion Acoustic Pavilion',
        category: 'Parametric Geometry',
        image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80',
        metricBadge: 'Zero Electronic Reverb',
      },
      {
        id: 'sp_2',
        title: 'Kyoto Biophilic Research Center',
        category: 'Regenerative Design',
        image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
        metricBadge: 'Net-Zero Carbon',
      },
      {
        id: 'sp_3',
        title: 'Voxel Lattice Spatial System',
        category: 'Algorithmic Structure',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
        metricBadge: 'Timber Computational',
      },
    ],
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
    motionType: 'terminal_metric',
    motionBadge: 'Live Metric Card Flip',
    projects: [
      {
        id: 'zp_1',
        title: 'Nexus ZK-Rollup Protocol',
        category: 'Distributed Consensus',
        image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
        metricBadge: '85,000 TPS Verified',
      },
      {
        id: 'zp_2',
        title: 'Aegis High-Frequency Router',
        category: 'Low-Latency Engine',
        image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80',
        metricBadge: '0.18ms Execution',
      },
      {
        id: 'zp_3',
        title: 'Quantum-Resistant Key Vault',
        category: 'Zero-Knowledge Security',
        image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop&q=80',
        metricBadge: 'ZK-SNARKs Engine',
      },
    ],
    tags: ['Monochrome', 'Pure White', 'High Throughput', 'JetBrains Mono'],
  },
];
