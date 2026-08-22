export interface FontPairing {
  id: string;
  name: string;
  category: 'Modern Luxury' | 'Cyber Editorial' | 'Minimalist Clean' | 'Creative Display' | 'Technical Brutalist';
  primaryFont: string;   // For Headings / Hero Display
  secondaryFont: string; // For Body / Subtext
  description: string;
  googleFontsQuery: string;
}

export const FONT_PAIRINGS: FontPairing[] = [
  {
    id: 'syne-jakarta',
    name: 'Syne & Plus Jakarta Sans',
    category: 'Modern Luxury',
    primaryFont: 'Syne',
    secondaryFont: 'Plus Jakarta Sans',
    description: 'High-fashion geometric headline with ultra-clean readable modern body.',
    googleFontsQuery: 'family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Syne:wght@600;700;800',
  },
  {
    id: 'clash-inter',
    name: 'Clash Display & Inter',
    category: 'Cyber Editorial',
    primaryFont: 'Clash Display',
    secondaryFont: 'Inter',
    description: 'Bold avant-garde design powerhouse paired with the gold standard digital typeface.',
    googleFontsQuery: 'family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@600;700',
  },
  {
    id: 'space-geist',
    name: 'Space Grotesk & Geist',
    category: 'Technical Brutalist',
    primaryFont: 'Space Grotesk',
    secondaryFont: 'Inter',
    description: 'Futuristic monoline tech aesthetic for developers and technical founders.',
    googleFontsQuery: 'family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600;700',
  },
  {
    id: 'outfit-satoshi',
    name: 'Outfit & Satoshi',
    category: 'Minimalist Clean',
    primaryFont: 'Outfit',
    secondaryFont: 'Outfit',
    description: 'Silky smooth contemporary sans-serif with geometric precision.',
    googleFontsQuery: 'family=Outfit:wght@400;500;600;700;800',
  },
  {
    id: 'playfair-outfit',
    name: 'Playfair Display & Outfit',
    category: 'Creative Display',
    primaryFont: 'Playfair Display',
    secondaryFont: 'Outfit',
    description: 'Editorial high-contrast serif headlines with sleek modern body.',
    googleFontsQuery: 'family=Outfit:wght@400;500;600&family=Playfair+Display:ital,wght@0,600;0,700;1,400',
  },
  {
    id: 'jetbrains-inter',
    name: 'JetBrains Mono & Inter',
    category: 'Technical Brutalist',
    primaryFont: 'JetBrains Mono',
    secondaryFont: 'Inter',
    description: 'Distinctive code-inspired monospaced flair for engineers & creative technologists.',
    googleFontsQuery: 'family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;700',
  },
];

export function getFontGoogleUrl(primaryFont: string, secondaryFont: string): string {
  const fonts = Array.from(new Set([primaryFont, secondaryFont]));
  const query = fonts
    .map((f) => `family=${encodeURIComponent(f)}:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400`)
    .join('&');
  return `https://fonts.googleapis.com/css2?${query}&display=swap`;
}
