'use client';

import React from 'react';
import { UserSubscription } from '@/lib/types';
import { getSubscriptionCountdown } from '@/lib/tiers';
import { Clock, Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CountdownBadge({
  subscription,
  compact = false,
  className,
}: {
  subscription?: UserSubscription;
  compact?: boolean;
  className?: string;
}) {
  const { daysRemaining, totalDays, isExpired, percentageRemaining, tierLabel, badgeColor } =
    getSubscriptionCountdown(subscription);

  if (subscription?.tier === 'free' || !subscription) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-950/40 text-emerald-400 text-xs font-semibold backdrop-blur-xl',
          className
        )}
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Free Plan (200MB)</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold backdrop-blur-xl',
          badgeColor,
          className
        )}
      >
        <Clock className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
        <span>
          {isExpired ? 'Plan Expired' : `${daysRemaining} Days Left`} ({tierLabel})
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'p-5 rounded-2xl border bg-gradient-to-b from-[#101e17]/80 to-[#09110d]/90 backdrop-blur-2xl text-foreground relative overflow-hidden shadow-glass',
        isExpired ? 'border-rose-500/40' : 'border-emerald-500/30',
        className
      )}
    >
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
            {isExpired ? <AlertTriangle className="w-5 h-5 text-rose-400" /> : <ShieldCheck className="w-5 h-5 text-emerald-400" />}
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              {tierLabel}
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/20">
                ACTIVE
              </span>
            </h4>
            <p className="text-xs text-zinc-400">Annual Billing Cycle</p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-black font-mono tracking-tight text-emerald-400">
            {isExpired ? '0' : daysRemaining}
          </div>
          <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
            Days Remaining
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="h-2 w-full bg-zinc-800/80 rounded-full overflow-hidden p-0.5 border border-white/5">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500 bg-gradient-to-r',
              isExpired
                ? 'from-rose-600 to-rose-400 w-full'
                : 'from-emerald-600 via-emerald-400 to-teal-300'
            )}
            style={{ width: isExpired ? '100%' : `${percentageRemaining}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
          <span>Started: {new Date(subscription.startDate).toLocaleDateString()}</span>
          <span>Renews: {new Date(subscription.endDate).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}
