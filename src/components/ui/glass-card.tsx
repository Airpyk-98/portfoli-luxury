'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from '@/components/ui/motion-shim';

export interface GlassCardProps extends HTMLMotionProps<'div'> {
  intensity?: 'subtle' | 'medium' | 'high' | 'ultra';
  glow?: boolean;
  interactive?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ intensity = 'high', glow = false, interactive = false, className, children, ...props }, ref) => {
    const intensityStyles = {
      subtle:
        'bg-white/70 dark:bg-[#0a0f0c]/60 backdrop-blur-md border border-emerald-600/15 dark:border-emerald-500/15 shadow-sm',
      medium:
        'bg-white/85 dark:bg-[#0d1410]/75 backdrop-blur-xl border border-emerald-600/20 dark:border-emerald-500/20 shadow-md dark:shadow-glass',
      high:
        'bg-white/95 dark:bg-[#101914]/85 backdrop-blur-2xl border border-emerald-600/25 dark:border-emerald-500/25 shadow-lg dark:shadow-glass',
      ultra:
        'bg-white dark:bg-[#122019]/90 backdrop-blur-3xl border border-emerald-600/35 dark:border-emerald-400/40 shadow-xl dark:shadow-glass-glow',
    };

    const glowStyle = glow
      ? 'ring-1 ring-emerald-500/40 dark:ring-[#00FF87]/30 shadow-glass-glow'
      : '';
    const interactiveStyle = interactive
      ? 'transition-all duration-300 hover:border-emerald-500 dark:hover:border-[#00FF87] hover:shadow-lg dark:hover:shadow-glass-glow hover:-translate-y-1 cursor-pointer'
      : '';

    return (
      <motion.div
        ref={ref}
        className={cn(
          'relative rounded-2xl p-6 text-foreground overflow-hidden transition-colors duration-300',
          intensityStyles[intensity],
          glowStyle,
          interactiveStyle,
          className
        )}
        {...props}
      >
        {/* Subtle glass reflection highlight on top edge */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/40 dark:via-[#00FF87]/30 to-transparent" />
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
