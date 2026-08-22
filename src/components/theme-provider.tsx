'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { ThemeConfig } from '@/lib/types';
import { getFontGoogleUrl } from '@/lib/font-registry';

interface ThemeContextType {
  theme: 'dark' | 'light';
  setTheme: (mode: 'dark' | 'light') => void;
  toggleTheme: () => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  applyPortfolioTheme: (config: ThemeConfig) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = 'dark',
}: {
  children: React.ReactNode;
  defaultTheme?: 'dark' | 'light';
}) {
  const [theme, setThemeState] = useState<'dark' | 'light'>(defaultTheme);
  const [accentColor, setAccentColor] = useState<string>('#00FF87');

  const updateDomTheme = (mode: 'dark' | 'light') => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.style.colorScheme = 'light';
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('portfoli_theme') as 'dark' | 'light' | null;
    const active = saved || defaultTheme;
    setThemeState(active);
    updateDomTheme(active);
  }, [defaultTheme]);

  const setTheme = useCallback((mode: 'dark' | 'light') => {
    setThemeState(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('portfoli_theme', mode);
    }
    updateDomTheme(mode);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') {
        localStorage.setItem('portfoli_theme', next);
      }
      updateDomTheme(next);
      return next;
    });
  }, []);

  const applyPortfolioTheme = useCallback((config: ThemeConfig) => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('portfoli_theme') : null;
    if (!saved && config.mode) {
      setTheme(config.mode);
    }
    if (config.accentColor) {
      setAccentColor(config.accentColor);
      if (typeof document !== 'undefined') {
        document.documentElement.style.setProperty('--accent-glow', config.accentColor);
      }
    }

    // Dynamic Google Fonts inject
    if (config.primaryFont && config.secondaryFont && typeof document !== 'undefined') {
      const fontUrl = getFontGoogleUrl(config.primaryFont, config.secondaryFont);
      let fontLink = document.getElementById('dynamic-portfolio-fonts') as HTMLLinkElement | null;
      if (!fontLink) {
        fontLink = document.createElement('link');
        fontLink.id = 'dynamic-portfolio-fonts';
        fontLink.rel = 'stylesheet';
        document.head.appendChild(fontLink);
      }
      fontLink.href = fontUrl;
    }
  }, [setTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        accentColor,
        setAccentColor,
        applyPortfolioTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
