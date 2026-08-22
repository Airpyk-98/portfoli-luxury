'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from '@/components/ui/motion-shim';

export interface GlassButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'glass' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  glow?: boolean;
  children: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      glow = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeStyles = {
      sm: 'px-3.5 py-1.5 text-xs font-semibold rounded-xl gap-1.5',
      md: 'px-5 py-2.5 text-sm font-bold rounded-xl gap-2',
      lg: 'px-7 py-3.5 text-base font-bold rounded-2xl gap-2.5',
      icon: 'p-2.5 rounded-xl text-sm',
    };

    const variantStyles = {
      primary:
        'bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-500 dark:hover:bg-[#00FF87] text-white dark:text-black font-extrabold border border-emerald-500/50 shadow-md dark:shadow-glass-glow hover:shadow-lg transition-all duration-200',
      secondary:
        'bg-white dark:bg-zinc-800/80 text-zinc-900 dark:text-white border border-border backdrop-blur-xl hover:bg-zinc-100 dark:hover:bg-zinc-700 shadow-sm transition-all duration-200 font-bold',
      glass:
        'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-600/30 dark:border-emerald-500/40 backdrop-blur-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/60 shadow-sm transition-all duration-200 font-bold',
      outline:
        'bg-transparent hover:bg-emerald-500/10 text-emerald-700 dark:text-[#00FF87] border border-emerald-600/40 dark:border-emerald-500/40 hover:border-emerald-500 transition-all duration-200 font-bold',
      danger:
        'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-all duration-200 font-bold',
      ghost:
        'bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-zinc-700 dark:text-zinc-300 hover:text-foreground transition-all duration-200 font-medium',
    };

    const glowStyle = glow ? 'ring-2 ring-emerald-500/40 dark:ring-[#00FF87]/50 shadow-glass-glow' : '';

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed select-none',
          sizeStyles[size],
          variantStyles[variant],
          glowStyle,
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Processing...</span>
          </span>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

GlassButton.displayName = 'GlassButton';
