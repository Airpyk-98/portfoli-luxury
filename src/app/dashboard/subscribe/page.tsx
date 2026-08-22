'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { ThemeToggle } from '@/components/theme-toggle';
import { ScrollReveal } from '@/components/ui/kinetic-motion';
import {
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  Crown,
  Zap,
} from 'lucide-react';

export default function SubscribePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <SubscribePageInner />
    </Suspense>
  );
}

function SubscribePageInner() {
  const searchParams = useSearchParams();
  const tierParam = searchParams.get('tier') || 'elite_5k';
  const [selectedTier, setSelectedTier] = useState<string>(tierParam);
  const [user, setUser] = useState<any>(null);
  const [pricing, setPricing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch user
    fetch('/api/portfolio')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        } else {
          window.location.href = `/register?tier=${selectedTier}`;
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    // Fetch live pricing from admin config
    fetch('/api/admin/pricing')
      .then((res) => res.json())
      .then((data) => {
        if (data.pricing) setPricing(data.pricing);
      })
      .catch(console.error);
  }, [selectedTier]);

  const handleProceedToPayment = async () => {
    if (!user) return;
    setPaying(true);
    setError(null);

    try {
      const payRes = await fetch('/api/payment/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          tier: selectedTier,
        }),
      });

      const payData = await payRes.json();
      if (payData.success && payData.checkoutUrl) {
        window.location.href = payData.checkoutUrl;
      } else {
        setError(payData.message || 'Payment initiation failed. Please try again.');
      }
    } catch (err: any) {
      setError('Connection error. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  if (loading || !pricing) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="animate-pulse text-zinc-500">Loading...</div>
      </div>
    );
  }

  const tierConfigs: Record<string, { name: string; icon: React.ReactNode; accent: string; features: string[] }> = {
    pro_2k: {
      name: 'Creator Pro',
      icon: <Zap className="w-6 h-6" />,
      accent: 'from-blue-500 to-cyan-400',
      features: [
        `Up to ${pricing.pro_2k.maxVideos} Videos`,
        `Up to ${pricing.pro_2k.maxPhotos} Photos`,
        `${Math.round(pricing.pro_2k.storageQuotaBytes / (1024 * 1024 * 1024))} GB Storage`,
        'Side-Swipe Cards',
        'Custom Fonts',
        'Daily Countdown',
        'portfoli.site/username URL',
      ],
    },
    elite_5k: {
      name: 'Elite Mastery',
      icon: <Crown className="w-6 h-6" />,
      accent: 'from-emerald-500 to-teal-300',
      features: [
        'Unlimited Videos',
        'Unlimited Photos',
        `${Math.round(pricing.elite_5k.storageQuotaBytes / (1024 * 1024 * 1024))} GB Storage`,
        'Custom Subdomain (username.portfoli.site)',
        '3D Crystal Prism Mode',
        'Zero Branding',
        'All Creator Pro Features',
      ],
    },
  };

  const currentTierKey = selectedTier === 'pro_2k' ? 'pro_2k' : 'elite_5k';
  const otherTierKey = currentTierKey === 'elite_5k' ? 'pro_2k' : 'elite_5k';
  const currentConfig = tierConfigs[currentTierKey];
  const otherConfig = tierConfigs[otherTierKey];
  const currentPrice = pricing[currentTierKey].priceNgn;
  const otherPrice = pricing[otherTierKey].priceNgn;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-emerald-400 selection:text-black relative overflow-hidden py-12 px-4 sm:px-6 transition-colors duration-500">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-emerald-500/10 rounded-full blur-[160px]" />
      </div>

      <div className="max-w-2xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Pricing
          </Link>
          <ThemeToggle />
        </div>

        {/* Welcome */}
        <ScrollReveal animation="fade-up">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-[#00FF87] text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Secure Checkout
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Complete Your Subscription
            </h1>
            {user && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Welcome, <span className="font-semibold text-foreground">{user.name || user.username}</span>
              </p>
            )}
          </div>
        </ScrollReveal>

        {/* Selected Plan Card */}
        <ScrollReveal animation="fade-up" delay={0.1}>
          <GlassCard intensity="ultra" glow className="p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${currentConfig.accent} flex items-center justify-center text-white shadow-lg`}>
                  {currentConfig.icon}
                </div>
                <div>
                  <h2 className="text-lg font-bold">{currentConfig.name}</h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">1-Year Subscription</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-emerald-600 dark:text-[#00FF87]">
                  ₦{currentPrice.toLocaleString()}
                </div>
                <div className="text-xs text-zinc-500">/year</div>
              </div>
            </div>

            {/* Features List */}
            <div className="border-t border-zinc-200/50 dark:border-zinc-700/50 pt-4">
              <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
                What&apos;s Included
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentConfig.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span className="text-zinc-700 dark:text-zinc-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Proceed Button */}
            <GlassButton
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleProceedToPayment}
              disabled={paying}
            >
              {paying ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Proceed to Pay ₦{currentPrice.toLocaleString()}
                </span>
              )}
            </GlassButton>

            <p className="text-center text-[10px] text-zinc-400 dark:text-zinc-500">
              Powered by Flutterwave · Secure payment · Cancel anytime
            </p>
          </GlassCard>
        </ScrollReveal>

        {/* Switch Plan Option */}
        <ScrollReveal animation="fade-up" delay={0.2}>
          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-tr ${otherConfig.accent} flex items-center justify-center text-white shadow`}>
                  {otherConfig.icon}
                </div>
                <div>
                  <p className="text-sm font-bold">{otherConfig.name}</p>
                  <p className="text-xs text-zinc-500">
                    ₦{otherPrice.toLocaleString()}/year
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTier(otherTierKey)}
                className="text-xs font-bold text-emerald-600 dark:text-[#00FF87] hover:underline"
              >
                Switch to this plan
              </button>
            </div>
          </GlassCard>
        </ScrollReveal>

        {/* Footer */}
        <div className="text-center text-xs text-zinc-400 dark:text-zinc-500 space-y-1">
          <p>All plans include a 1-year subscription period.</p>
          <p>
            Questions?{' '}
            <Link href="/" className="text-emerald-600 dark:text-[#00FF87] hover:underline">
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
