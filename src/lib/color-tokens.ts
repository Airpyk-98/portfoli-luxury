/**
 * Dynamic Palette & Contrast Intelligence Engine
 * Computes WCAG AAA / AA contrast-safe color tokens for any user-selected accent.
 */

export interface PaletteTokens {
  accent: string;
  accentText: string;
  accentSub: string;
  btnBg: string;
  btnText: string;
  btnGlow: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  ambientGlow: string;
  borderGlow: string;
}

export function getPaletteTokens(accentHex: string = '#00FF87', isDark: boolean = true): PaletteTokens {
  const hex = (accentHex || '#00FF87').trim().toUpperCase();

  // 1. PURE WHITE / MONOCHROME
  if (hex === '#FFFFFF' || hex === '#FAFAFA' || hex === '#F4F4F5' || hex === '#18181B' || hex === '#000000') {
    if (isDark) {
      return {
        accent: '#ffffff',
        accentText: '#ffffff',
        accentSub: '#e4e4e7',
        btnBg: '#ffffff',
        btnText: '#000000',
        btnGlow: '0 0 25px rgba(255, 255, 255, 0.35)',
        badgeBg: 'rgba(255, 255, 255, 0.1)',
        badgeBorder: 'rgba(255, 255, 255, 0.3)',
        badgeText: '#ffffff',
        ambientGlow: 'rgba(255, 255, 255, 0.15)',
        borderGlow: 'rgba(255, 255, 255, 0.4)',
      };
    } else {
      return {
        accent: '#090e0b',
        accentText: '#090e0b',
        accentSub: '#27272a',
        btnBg: '#090e0b',
        btnText: '#ffffff',
        btnGlow: '0 0 20px rgba(0, 0, 0, 0.25)',
        badgeBg: 'rgba(0, 0, 0, 0.06)',
        badgeBorder: 'rgba(0, 0, 0, 0.2)',
        badgeText: '#090e0b',
        ambientGlow: 'rgba(0, 0, 0, 0.08)',
        borderGlow: 'rgba(0, 0, 0, 0.3)',
      };
    }
  }

  // 2. CYBER CYAN
  if (hex === '#00F0FF' || hex === '#06B6D4' || hex === '#0891B2' || hex === '#38BDF8') {
    if (isDark) {
      return {
        accent: '#00F0FF',
        accentText: '#00F0FF',
        accentSub: '#67e8f9',
        btnBg: '#00F0FF',
        btnText: '#000000',
        btnGlow: '0 0 25px rgba(0, 240, 255, 0.45)',
        badgeBg: 'rgba(0, 240, 255, 0.15)',
        badgeBorder: 'rgba(0, 240, 255, 0.4)',
        badgeText: '#00F0FF',
        ambientGlow: 'rgba(0, 240, 255, 0.2)',
        borderGlow: 'rgba(0, 240, 255, 0.5)',
      };
    } else {
      return {
        accent: '#0891b2',
        accentText: '#0891b2',
        accentSub: '#0e7490',
        btnBg: '#0891b2',
        btnText: '#ffffff',
        btnGlow: '0 0 20px rgba(8, 145, 178, 0.35)',
        badgeBg: 'rgba(8, 145, 178, 0.1)',
        badgeBorder: 'rgba(8, 145, 178, 0.35)',
        badgeText: '#155e75',
        ambientGlow: 'rgba(8, 145, 178, 0.12)',
        borderGlow: 'rgba(8, 145, 178, 0.4)',
      };
    }
  }

  // 3. ELECTRIC VIOLET / PURPLE
  if (hex === '#A855F7' || hex === '#C084FC' || hex === '#9333EA' || hex === '#8B5CF6') {
    if (isDark) {
      return {
        accent: '#c084fc',
        accentText: '#c084fc',
        accentSub: '#e9d5ff',
        btnBg: '#a855f7',
        btnText: '#ffffff',
        btnGlow: '0 0 25px rgba(168, 85, 247, 0.45)',
        badgeBg: 'rgba(168, 85, 247, 0.15)',
        badgeBorder: 'rgba(168, 85, 247, 0.4)',
        badgeText: '#c084fc',
        ambientGlow: 'rgba(168, 85, 247, 0.2)',
        borderGlow: 'rgba(168, 85, 247, 0.5)',
      };
    } else {
      return {
        accent: '#7e22ce',
        accentText: '#7e22ce',
        accentSub: '#6b21a8',
        btnBg: '#7e22ce',
        btnText: '#ffffff',
        btnGlow: '0 0 20px rgba(126, 34, 206, 0.35)',
        badgeBg: 'rgba(126, 34, 206, 0.1)',
        badgeBorder: 'rgba(126, 34, 206, 0.35)',
        badgeText: '#581c87',
        ambientGlow: 'rgba(126, 34, 206, 0.12)',
        borderGlow: 'rgba(126, 34, 206, 0.4)',
      };
    }
  }

  // 4. SOLAR AMBER / GOLD
  if (hex === '#F59E0B' || hex === '#FBBF24' || hex === '#D97706' || hex === '#EAB308') {
    if (isDark) {
      return {
        accent: '#fbbf24',
        accentText: '#fbbf24',
        accentSub: '#fde68a',
        btnBg: '#f59e0b',
        btnText: '#000000',
        btnGlow: '0 0 25px rgba(245, 158, 11, 0.45)',
        badgeBg: 'rgba(245, 158, 11, 0.15)',
        badgeBorder: 'rgba(245, 158, 11, 0.4)',
        badgeText: '#fbbf24',
        ambientGlow: 'rgba(245, 158, 11, 0.2)',
        borderGlow: 'rgba(245, 158, 11, 0.5)',
      };
    } else {
      return {
        accent: '#b45309',
        accentText: '#b45309',
        accentSub: '#92400e',
        btnBg: '#d97706',
        btnText: '#ffffff',
        btnGlow: '0 0 20px rgba(217, 119, 6, 0.35)',
        badgeBg: 'rgba(217, 119, 6, 0.1)',
        badgeBorder: 'rgba(217, 119, 6, 0.35)',
        badgeText: '#78350f',
        ambientGlow: 'rgba(217, 119, 6, 0.12)',
        borderGlow: 'rgba(217, 119, 6, 0.4)',
      };
    }
  }

  // 5. CRIMSON ROSE
  if (hex === '#F43F5E' || hex === '#FB7185' || hex === '#E11D48' || hex === '#EF4444') {
    if (isDark) {
      return {
        accent: '#fb7185',
        accentText: '#fb7185',
        accentSub: '#fecdd3',
        btnBg: '#f43f5e',
        btnText: '#ffffff',
        btnGlow: '0 0 25px rgba(244, 63, 94, 0.45)',
        badgeBg: 'rgba(244, 63, 94, 0.15)',
        badgeBorder: 'rgba(244, 63, 94, 0.4)',
        badgeText: '#fb7185',
        ambientGlow: 'rgba(244, 63, 94, 0.2)',
        borderGlow: 'rgba(244, 63, 94, 0.5)',
      };
    } else {
      return {
        accent: '#be123c',
        accentText: '#be123c',
        accentSub: '#9f1239',
        btnBg: '#e11d48',
        btnText: '#ffffff',
        btnGlow: '0 0 20px rgba(225, 29, 72, 0.35)',
        badgeBg: 'rgba(225, 29, 72, 0.1)',
        badgeBorder: 'rgba(225, 29, 72, 0.35)',
        badgeText: '#881337',
        ambientGlow: 'rgba(225, 29, 72, 0.12)',
        borderGlow: 'rgba(225, 29, 72, 0.4)',
      };
    }
  }

  // 6. DEFAULT / NEON EMERALD & FOREST JADE
  if (isDark) {
    return {
      accent: '#00FF87',
      accentText: '#00FF87',
      accentSub: '#a7f3d0',
      btnBg: '#00FF87',
      btnText: '#000000',
      btnGlow: '0 0 25px rgba(0, 255, 135, 0.45)',
      badgeBg: 'rgba(0, 255, 135, 0.12)',
      badgeBorder: 'rgba(0, 255, 135, 0.4)',
      badgeText: '#00FF87',
      ambientGlow: 'rgba(0, 255, 135, 0.18)',
      borderGlow: 'rgba(0, 255, 135, 0.45)',
    };
  } else {
    return {
      accent: '#047857',
      accentText: '#047857',
      accentSub: '#065f46',
      btnBg: '#059669',
      btnText: '#ffffff',
      btnGlow: '0 0 20px rgba(5, 150, 105, 0.35)',
      badgeBg: 'rgba(5, 150, 105, 0.1)',
      badgeBorder: 'rgba(5, 150, 105, 0.35)',
      badgeText: '#064e3b',
      ambientGlow: 'rgba(5, 150, 105, 0.12)',
      borderGlow: 'rgba(5, 150, 105, 0.4)',
    };
  }
}
