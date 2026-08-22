'use client';

import React, { useState } from 'react';
import { User, getSubscriptionStatus } from '@/lib/types';
import { AlertTriangle, Clock, ShieldAlert, Sparkles, X, ChevronRight, CheckCircle2 } from 'lucide-react';
import { GlassButton } from '@/components/ui/glass-button';

interface Props {
  user: User | null;
  onRenewClick?: () => void;
}

export function SubscriptionGraceBanner({ user, onRenewClick }: Props) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isRenewing, setIsRenewing] = useState(false);

  if (!user || !user.subscription) return null;

  const status = getSubscriptionStatus(user.subscription);

  // If active with plenty of time, do not display
  if (status.isActive && status.daysRemainingInSubscription > 7) {
    return null;
  }

  const handleRenew = async () => {
    if (onRenewClick) {
      onRenewClick();
      return;
    }

    try {
      setIsRenewing(true);
      const res = await fetch('/api/payment/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          tier: user.subscription?.tier === 'pro_2k' ? 'pro_2k' : 'elite_5k',
        }),
      });
      const data = await res.json();
      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert(data.message || 'Payment initiation failed');
      }
    } catch (err: any) {
      alert('Failed to connect to payment gateway: ' + err.message);
    } finally {
      setIsRenewing(false);
    }
  };

  // EXPIRING SOON WARNING (7 days or less before expiration)
  if (status.isActive && status.daysRemainingInSubscription <= 7) {
    return (
      <div className="w-full mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
          <div className="text-xs space-y-0.5">
            <span className="font-bold text-amber-200 block font-mono">
              Subscription Expiring in {status.daysRemainingInSubscription} Day{status.daysRemainingInSubscription === 1 ? '' : 's'}
            </span>
            <span className="text-zinc-400">
              Renew today to maintain uninterrupted custom subdomain routing and 4K media streaming.
            </span>
          </div>
        </div>
        <button
          onClick={handleRenew}
          disabled={isRenewing}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold font-mono transition-all shrink-0 cursor-pointer shadow-md"
        >
          {isRenewing ? 'Connecting...' : 'Renew Subscription'}
        </button>
      </div>
    );
  }

  // 30-DAY GRACE PERIOD ACTIVE WARNING
  if (status.isGracePeriod) {
    return (
      <>
        {/* Persistent Top Bar */}
        <div className="w-full mb-6 p-4 rounded-2xl bg-gradient-to-r from-red-500/20 via-amber-500/15 to-red-500/20 border-2 border-red-500/60 text-red-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl animate-pulse">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-2 rounded-xl bg-red-500/20 text-red-400 shrink-0">
              <ShieldAlert className="w-6 h-6 animate-bounce" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-black uppercase tracking-wider text-red-300 bg-red-950/80 px-2.5 py-0.5 rounded-full border border-red-500/50">
                  ⚠️ 30-Day Video Retention Grace Period Active
                </span>
                <span className="text-xs font-mono font-bold text-white">
                  ({status.daysRemainingInGrace} Days Left)
                </span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed font-normal">
                Your annual subscription expired on {new Date(status.endDate).toLocaleDateString()}. You have <strong className="text-red-300 font-bold">{status.daysRemainingInGrace} days remaining</strong> to renew your subscription. If not renewed within this grace window, your uploaded 4K videos will be permanently decommissioned and your custom subdomain released.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              onClick={handleRenew}
              disabled={isRenewing}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-400 hover:to-amber-400 text-black text-xs font-black font-mono transition-all cursor-pointer shadow-glass-glow flex items-center justify-center gap-1.5"
            >
              <span>{isRenewing ? 'Connecting...' : 'Renew Subscription Now'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Pop-up (Shows on First Arrival) */}
        {!isDismissed && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
            <div className="relative w-full max-w-md p-6 rounded-3xl bg-[#120808] border-2 border-red-500/60 shadow-2xl space-y-5 text-center">
              <div className="w-14 h-14 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center mx-auto shadow-lg">
                <AlertTriangle className="w-7 h-7 animate-pulse" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-widest block">
                  Action Required
                </span>
                <h3 className="text-xl font-extrabold text-white font-display">
                  Subscription Expired
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Your account is currently in the <strong className="text-red-300 font-bold">30-day grace period ({status.daysRemainingInGrace} days remaining)</strong>. Please renew your subscription to retain your uploaded 4K videos, media storage quota, and active custom subdomain.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/50 border border-red-500/30 text-left text-xs font-mono space-y-1.5">
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Expired On:</span>
                  <span className="text-white font-bold">{new Date(status.endDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Grace Period Window:</span>
                  <span className="text-amber-400 font-bold">30 Days</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Days Left Before Deletion:</span>
                  <span className="text-red-400 font-bold">{status.daysRemainingInGrace} Days</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={handleRenew}
                  disabled={isRenewing}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-400 hover:to-amber-400 text-black text-xs font-black font-mono transition-all cursor-pointer shadow-glass-glow flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isRenewing ? 'Connecting to Gateway...' : 'Renew Subscription & Protect Videos'}</span>
                </button>

                <button
                  onClick={() => setIsDismissed(true)}
                  className="w-full py-2 text-xs font-mono text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                >
                  Dismiss for this session
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // POST-GRACE DECOMMISSIONED WARNING
  if (status.isExpiredAndDecommissioned) {
    return (
      <div className="w-full mb-6 p-5 rounded-2xl bg-black/90 border-2 border-red-600 text-red-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-3.5">
          <ShieldAlert className="w-6 h-6 text-red-500 shrink-0" />
          <div className="text-xs space-y-1">
            <span className="font-bold text-red-400 block font-mono text-sm">
              Account Decommissioned (Grace Period Expired)
            </span>
            <span className="text-zinc-400">
              Your 30-day grace period has lapsed. Premium display optics and 4K media uploads are locked. Re-subscribe now to reactivate all features.
            </span>
          </div>
        </div>
        <button
          onClick={handleRenew}
          disabled={isRenewing}
          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold font-mono transition-all shrink-0 cursor-pointer shadow-lg"
        >
          {isRenewing ? 'Connecting...' : 'Re-Subscribe Now'}
        </button>
      </div>
    );
  }

  return null;
}
