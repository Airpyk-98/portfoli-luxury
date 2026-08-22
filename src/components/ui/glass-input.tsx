'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
  ({ label, error, helper, leftIcon, rightIcon, className, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 tracking-wide uppercase">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-zinc-400 dark:text-zinc-400 flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full bg-white/80 dark:bg-[#0a120e]/60 backdrop-blur-xl border border-emerald-600/20 dark:border-emerald-500/20 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 transition-all duration-200 shadow-inner',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-rose-500/60 focus:border-rose-400 focus:ring-rose-400/40',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 text-zinc-400 flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
        {helper && !error && <p className="text-xs text-zinc-500 dark:text-zinc-400">{helper}</p>}
      </div>
    );
  }
);

GlassInput.displayName = 'GlassInput';

export interface GlassTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export const GlassTextarea = React.forwardRef<HTMLTextAreaElement, GlassTextareaProps>(
  ({ label, error, helper, className, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 tracking-wide uppercase">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'w-full bg-white/80 dark:bg-[#0a120e]/60 backdrop-blur-xl border border-emerald-600/20 dark:border-emerald-500/20 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 transition-all duration-200 shadow-inner min-h-[100px]',
            error && 'border-rose-500/60 focus:border-rose-400 focus:ring-rose-400/40',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
        {helper && !error && <p className="text-xs text-zinc-500 dark:text-zinc-400">{helper}</p>}
      </div>
    );
  }
);

GlassTextarea.displayName = 'GlassTextarea';
