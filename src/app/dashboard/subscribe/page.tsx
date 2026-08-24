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

  const [showSandboxModal, setShowSandboxModal] = useState(false);
  const [sandboxData, setSandboxData] = useState<any>(null);
  const [sandboxSimulating, setSandboxSimulating] = useState(false);

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

      // Check if Test / Sandbox mode is active
      if (payData.success && payData.isSandbox) {
        setSandboxData(payData);
        setShowSandboxModal(true);
        setPaying(false);
        return;
      }

      if (payData.success && payData.checkoutUrl) {
        window.location.href = payData.checkoutUrl;
        return;
      }

      if (payData.success && payData.inlineConfig) {
        // Load Flutterwave inline modal script dynamically
        if (!(window as any).FlutterwaveCheckout) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.flutterwave.com/v3.js';
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Flutterwave checkout modal'));
            document.body.appendChild(script);
          });
        }

        if ((window as any).FlutterwaveCheckout) {
          (window as any).FlutterwaveCheckout({
            ...payData.inlineConfig,
            callback: async function (response: any) {
              try {
                const verifyRes = await fetch('/api/payment/verify', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    userId: user.id,
                    tier: selectedTier,
                    txRef: payData.txRef,
                    transactionId: response.transaction_id || response.id,
                  }),
                });
                const verifyData = await verifyRes.json();
                if (verifyData.success) {
                  window.location.href = '/dashboard?payment=success';
                } else {
                  setError(verifyData.message || 'Payment verification failed.');
                  setPaying(false);
                }
              } catch (e) {
                setError('Verification error. Please contact support.');
                setPaying(false);
              }
            },
            onclose: function () {
              setPaying(false);
            },
          });
          return;
        }
      }

      setError(payData.message || 'Payment initiation failed. Please try again.');
      setPaying(false);
    } catch (err: any) {
      setError(err.message || 'Connection error. Please try again.');
      setPaying(false);
    }
  };

  const handleExecuteSandboxPayment = async (simulateSuccess: boolean) => {
    if (!sandboxData || !user) return;
    setSandboxSimulating(true);

    if (!simulateSuccess) {
      setTimeout(() => {
        setError('Payment Failed: Simulated card decline or insufficient funds in test mode.');
        setShowSandboxModal(false);
        setSandboxSimulating(false);
      }, 700);
      return;
    }

    try {
      const verifyRes = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          tier: selectedTier,
          txRef: sandboxData.txRef,
          transactionId: `test_flw_${Date.now()}`,
        }),
      });

      const verifyData = await verifyRes.json();
      if (verifyData.success) {
        window.location.href = '/dashboard?payment=success';
      } else {
        setError(verifyData.message || 'Sandbox verification failed.');
        setSandboxSimulating(false);
      }
    } catch (e: any) {
      setError('Sandbox execution error. Please try again.');
      setSandboxSimulating(false);
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
          <div className="space-y-3">
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
                  className="text-xs font-bold text-emerald-600 dark:text-[#00FF87] hover:underline cursor-pointer"
                >
                  Switch to {otherConfig.name}
                </button>
              </div>
            </GlassCard>

            <div className="text-center pt-2">
              <Link
                href="/dashboard/editor"
                className="text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 underline transition-colors"
              >
                Or continue with Free Starter Plan (₦0 / 200MB) →
              </Link>
            </div>
          </div>
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

      {/* Flutterwave Sandbox Test Modal */}
      {showSandboxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="max-w-md w-full bg-[#0d1712] border border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  TEST SANDBOX MODE
                </span>
              </div>
              <button
                onClick={() => setShowSandboxModal(false)}
                className="text-zinc-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                Flutterwave Sandbox Simulator
              </h3>
              <p className="text-xs text-zinc-400">
                You are testing plan: <span className="text-white font-bold">{currentConfig.name}</span> for{' '}
                <span className="text-emerald-400 font-bold">₦{sandboxData?.amount?.toLocaleString()} NGN</span>.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-black/40 border border-zinc-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-zinc-400">
                <span>Client ID:</span>
                <span className="text-zinc-200 truncate max-w-[180px]">{sandboxData?.sandboxDetails?.clientId}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Reference:</span>
                <span className="text-zinc-200 truncate max-w-[180px]">{sandboxData?.txRef}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>User:</span>
                <span className="text-emerald-400 font-bold">@{user.username}</span>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => handleExecuteSandboxPayment(true)}
                disabled={sandboxSimulating}
                className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                {sandboxSimulating ? (
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Simulate Successful Payment (Active Plan)
                  </>
                )}
              </button>

              <button
                onClick={() => handleExecuteSandboxPayment(false)}
                disabled={sandboxSimulating}
                className="w-full py-2.5 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-medium text-xs transition-all cursor-pointer"
              >
                Simulate Declined Card (Failure)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
