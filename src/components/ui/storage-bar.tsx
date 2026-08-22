'use client';

import React from 'react';
import { TierType, PricingConfig } from '@/lib/types';
import { DEFAULT_PRICING, formatBytes } from '@/lib/tiers';
import { HardDrive, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function StorageBar({
  tier = 'free',
  usedBytes = 0,
  pricingConfig = DEFAULT_PRICING,
  showUpgradeLink = true,
  className,
}: {
  tier?: TierType;
  usedBytes?: number;
  pricingConfig?: PricingConfig;
  showUpgradeLink?: boolean;
  className?: string;
}) {
  const quotaBytes = pricingConfig[tier]?.storageQuotaBytes || 200 * 1024 * 1024;
  const percentage = Math.min(100, Math.round((usedBytes / quotaBytes) * 100));
  const isNearLimit = percentage >= 80;
  const isFull = percentage >= 98;

  return (
    <div
      className={cn(
        'p-4 rounded-2xl border bg-[#0a120e]/70 backdrop-blur-xl border-emerald-500/20 shadow-glass text-foreground',
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
          <HardDrive className="w-4 h-4 text-emerald-400" />
          <span>Cloud Storage</span>
        </div>
        <span className="text-xs font-mono font-bold text-emerald-400">
          {formatBytes(usedBytes)} / {formatBytes(quotaBytes, 0)} ({percentage}%)
        </span>
      </div>

      <div className="h-2 w-full bg-zinc-800/80 rounded-full overflow-hidden p-0.5 border border-white/5 mb-2">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 bg-gradient-to-r',
            isFull
              ? 'from-rose-500 to-rose-400'
              : isNearLimit
              ? 'from-amber-500 to-emerald-400'
              : 'from-emerald-600 via-emerald-400 to-cyan-400'
          )}
          style={{ width: `${Math.max(4, percentage)}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-zinc-400">
        <span>Plan limit: {formatBytes(quotaBytes, 0)}</span>
        {showUpgradeLink && tier !== 'elite_5k' && (
          <Link
            href="/pricing"
            className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-0.5 transition-colors"
          >
            Upgrade Quota <ArrowUpRight className="w-3 h-3" />
          </Link>
        )}
      </div>
    </div>
  );
}
