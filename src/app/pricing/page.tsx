'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { ThemeToggle } from '@/components/theme-toggle';
import { KineticTypography, ScrollReveal, PerspectiveTilt } from '@/components/ui/kinetic-motion';
import { CheckCircle2, ChevronRight, Sparkles, ArrowLeft, ShieldCheck, Zap } from 'lucide-react';
import { PricingConfig, TierType } from '@/lib/types';
import { DEFAULT_PRICING, formatBytes } from '@/lib/tiers';

export default function PricingPage() {
  const [pricing, setPricing] = useState<PricingConfig>(DEFAULT_PRICING);
  const [upgradingTier, setUpgradingTier] = useState<TierType | null>(null);
  const [upgradeSuccess, setUpgradeSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/pricing')
      .then((res) => res.json())
      .then((data) => {
        if (data.pricing) setPricing(data.pricing);
      })
      .catch(console.error);
  }, []);

  const handleUpgrade = async (tier: TierType) => {
    setUpgradingTier(tier);
    try {
      const res = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetTier: tier }),
      });
      const data = await res.json();
      if (res.ok) {
        setUpgradeSuccess(`Successfully enrolled in ${tier.toUpperCase()}! Your daily countdown and limits have been updated.`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpgradingTier(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-emerald-400 selection:text-black relative overflow-hidden py-12 px-4 sm:px-6 transition-colors duration-500">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-emerald-500/10 rounded-full blur-[140px]" />
      </div>

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-[#00FF87] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/dashboard" className="text-xs font-bold text-emerald-700 dark:text-[#00FF87] hover:underline">
              Go to Studio Dashboard
            </Link>
          </div>
        </div>

        <ScrollReveal animation="fade-up">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-400/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold backdrop-blur-xl shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-[#00FF87]" />
              <span>Investment & Tier Upgrade Architecture</span>
            </div>
            <KineticTypography
              text="Scale your visual authority seamlessly."
              className="text-3xl sm:text-5xl font-black text-foreground font-display justify-center leading-tight"
            />
            <p className="text-sm text-zinc-700 dark:text-zinc-300 font-normal leading-relaxed">
              Upgrade instantly to unlock higher video and photo quotas, dedicated subdomains, and high-performance 3D Crystal Prism displays.
            </p>
          </div>
        </ScrollReveal>

        {upgradeSuccess && (
          <ScrollReveal animation="scale-up">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-500/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#00FF87]" />
              <span>{upgradeSuccess}</span>
            </div>
          </ScrollReveal>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* FREE PLAN */}
          <ScrollReveal animation="fade-up" delayMs={50}>
            <PerspectiveTilt>
              <GlassCard intensity="high" className="p-7 flex flex-col justify-between space-y-6 h-full">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-foreground font-display">Starter</h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 font-normal">Foundation setup for emerging creators.</p>
                  </div>

                  <div className="pt-2">
                    <div className="text-4xl font-black text-foreground font-mono">₦{pricing.free.priceNgn}</div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">Free Forever</div>
                  </div>

                  <ul className="space-y-2.5 pt-4 border-t border-border text-xs text-zinc-800 dark:text-zinc-200 font-medium">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#00FF87]" /> Max {pricing.free.maxVideos} Video
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#00FF87]" /> Max {pricing.free.maxPhotos} Project Photos
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#00FF87]" /> {formatBytes(pricing.free.storageQuotaBytes)} Storage Cap
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#00FF87]" /> Standard URL (portfoli.me/username)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#00FF87]" /> Carousel & Bento Display Modes
                    </li>
                  </ul>
                </div>

                <GlassButton variant="secondary" className="w-full text-xs font-bold" disabled>
                  Current Default Plan
                </GlassButton>
              </GlassCard>
            </PerspectiveTilt>
          </ScrollReveal>

          {/* PRO PLAN */}
          <ScrollReveal animation="fade-up" delayMs={150}>
            <PerspectiveTilt>
              <GlassCard intensity="ultra" glow className="p-7 flex flex-col justify-between space-y-6 relative border-emerald-500/50 h-full">
                <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-emerald-500 text-black text-[10px] font-black uppercase tracking-wider shadow-glass-glow">
                  Most Popular
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-foreground font-display">Creator Pro</h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 font-normal">For active developers and designers.</p>
                  </div>

                  <div className="pt-2">
                    <div className="text-4xl font-black text-emerald-700 dark:text-[#00FF87] font-mono">
                      ₦{pricing.pro_2k.priceNgn.toLocaleString()}
                    </div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">per year (Annual Billing)</div>
                  </div>

                  <ul className="space-y-2.5 pt-4 border-t border-border text-xs text-zinc-800 dark:text-zinc-200 font-medium">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#00FF87]" /> Up to {pricing.pro_2k.maxVideos} Videos
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#00FF87]" /> Up to {pricing.pro_2k.maxPhotos} Project Images
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#00FF87]" /> {formatBytes(pricing.pro_2k.storageQuotaBytes)} High-Speed Storage
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#00FF87]" /> Side-Swipe Cards & Custom Fonts
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#00FF87]" /> Daily Subscription Countdown Tracker
                    </li>
                  </ul>
                </div>

                <GlassButton
                  variant="primary"
                  glow
                  loading={upgradingTier === 'pro_2k'}
                  onClick={() => handleUpgrade('pro_2k')}
                  className="w-full text-xs font-bold"
                >
                  Upgrade to Pro (₦{pricing.pro_2k.priceNgn.toLocaleString()}/yr)
                </GlassButton>
              </GlassCard>
            </PerspectiveTilt>
          </ScrollReveal>

          {/* ELITE PLAN */}
          <ScrollReveal animation="fade-up" delayMs={250}>
            <PerspectiveTilt>
              <GlassCard intensity="high" className="p-7 flex flex-col justify-between space-y-6 h-full">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-foreground font-display">Elite Mastery</h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 font-normal">For top-tier talent and agencies.</p>
                  </div>

                  <div className="pt-2">
                    <div className="text-4xl font-black text-cyan-700 dark:text-cyan-300 font-mono">
                      ₦{pricing.elite_5k.priceNgn.toLocaleString()}
                    </div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">per year (Annual Billing)</div>
                  </div>

                  <ul className="space-y-2.5 pt-4 border-t border-border text-xs text-zinc-800 dark:text-zinc-200 font-medium">
                    <li className="flex items-center gap-2 font-bold text-cyan-800 dark:text-cyan-300">
                      <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> Dedicated Subdomain (kristos.portfoli.me)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> Unlimited Uploads (Max {formatBytes(pricing.elite_5k.storageQuotaBytes)})
                    </li>
                    <li className="flex items-center gap-2 font-bold text-emerald-800 dark:text-[#00FF87]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#00FF87]" /> 3D Crystal Prism Display Mode
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> Priority Kaggle WebM Video Pipeline
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> Zero &apos;Powered by portfoli&apos; Badge
                    </li>
                  </ul>
                </div>

                <GlassButton
                  variant="glass"
                  loading={upgradingTier === 'elite_5k'}
                  onClick={() => handleUpgrade('elite_5k')}
                  className="w-full text-xs font-bold text-cyan-800 dark:text-cyan-300 border-cyan-500/50 hover:bg-cyan-50 dark:hover:bg-cyan-950/80"
                >
                  Claim Elite (₦{pricing.elite_5k.priceNgn.toLocaleString()}/yr)
                </GlassButton>
              </GlassCard>
            </PerspectiveTilt>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
