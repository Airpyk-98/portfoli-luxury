'use client';

import React from 'react';
import { useTheme } from '@/components/theme-provider';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        'relative p-2 rounded-xl border transition-all duration-300 backdrop-blur-xl flex items-center justify-center cursor-pointer select-none',
        theme === 'dark'
          ? 'bg-[#101a14]/80 border-emerald-500/30 text-emerald-400 hover:border-emerald-400 shadow-glass'
          : 'bg-white/90 border-emerald-600/30 text-emerald-700 hover:border-emerald-600 shadow-glass-light',
        className
      )}
      title={theme === 'dark' ? 'Switch to Light Snow Mode' : 'Switch to Dark Obsidian Mode'}
      aria-label="Toggle Color Theme"
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-emerald-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-emerald-700 transition-transform duration-300 -rotate-12 hover:rotate-0" />
      )}
    </button>
  );
}
