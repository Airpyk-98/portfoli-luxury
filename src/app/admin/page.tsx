'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PricingConfig } from '@/lib/types';
import { DEFAULT_PRICING, formatBytes } from '@/lib/tiers';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { GlassInput } from '@/components/ui/glass-input';
import { ThemeToggle } from '@/components/theme-toggle';
import { ScrollReveal, PerspectiveTilt } from '@/components/ui/kinetic-motion';
import {
  Shield,
  DollarSign,
  Users,
  HardDrive,
  CheckCircle2,
  TrendingUp,
  ArrowLeft,
  Sparkles,
  Save,
  Lock,
  KeyRound,
  AlertTriangle,
  Key,
} from 'lucide-react';

export default function AdminControlPage() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [adminPasscode, setAdminPasscode] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);

  const [pricing, setPricing] = useState<PricingConfig>(DEFAULT_PRICING);
  const [telemetry, setTelemetry] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Password update form state
  const [currentPasscode, setCurrentPasscode] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);

  // Check saved admin session in sessionStorage
  useEffect(() => {
    const savedKey = sessionStorage.getItem('portfoli_admin_key');
    if (savedKey) {
      verifyAndLoadAdmin(savedKey);
    }
  }, []);

  const verifyAndLoadAdmin = async (key: string) => {
    try {
      setAuthError(null);
      const res = await fetch('/api/admin/pricing', {
        headers: { 'x-admin-key': key },
      });
      const data = await res.json();
      if (res.ok) {
        setIsAdminAuthenticated(true);
        sessionStorage.setItem('portfoli_admin_key', key);
        if (data.pricing) setPricing(data.pricing);
        if (data.telemetry) setTelemetry(data.telemetry);
      } else {
        setIsAdminAuthenticated(false);
        sessionStorage.removeItem('portfoli_admin_key');
        setAuthError(data.error || 'Invalid Admin Security Key.');
      }
    } catch {
      setAuthError('Connection error verifying admin credentials.');
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPasscode) return;
    verifyAndLoadAdmin(adminPasscode);
  };

  const handleSavePricing = async () => {
    setSaving(true);
    try {
      const activeKey = sessionStorage.getItem('portfoli_admin_key') || adminPasscode;
      const res = await fetch('/api/admin/pricing', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': activeKey,
        },
        body: JSON.stringify(pricing),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to update pricing:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (newPasscode !== confirmPasscode) {
      setPassError('New passcodes do not match.');
      return;
    }
    if (newPasscode.length < 6) {
      setPassError('New passcode must be at least 6 characters.');
      return;
    }

    setIsUpdatingPass(true);
    try {
      const activeKey = sessionStorage.getItem('portfoli_admin_key') || adminPasscode;
      const res = await fetch('/api/admin/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': activeKey,
        },
        body: JSON.stringify({
          currentPassword: currentPasscode,
          newPassword: newPasscode,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setPassSuccess('Admin security passcode updated successfully!');
        sessionStorage.setItem('portfoli_admin_key', newPasscode);
        setCurrentPasscode('');
        setNewPasscode('');
        setConfirmPasscode('');
        setTimeout(() => setPassSuccess(null), 4000);
      } else {
        setPassError(data.error || 'Failed to update passcode.');
      }
    } catch {
      setPassError('Network error updating passcode.');
    } finally {
      setIsUpdatingPass(false);
    }
  };

  // If not authenticated, render Security Gate
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-500">
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-emerald-500/10 rounded-full blur-[160px]" />
        </div>

        <GlassCard intensity="ultra" glow className="max-w-md w-full p-8 space-y-6 relative z-10 border-emerald-500/40">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-500/40 text-emerald-700 dark:text-[#00FF87] flex items-center justify-center mx-auto shadow-glass-glow">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-foreground font-display">Admin Authorization Gate</h1>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Restricted platform infrastructure. Please enter the master administrative security key to proceed.
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-500/40 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <GlassInput
              label="Master Security Passcode"
              type="password"
              placeholder="••••••••••••••••"
              value={adminPasscode}
              onChange={(e) => setAdminPasscode(e.target.value)}
              required
              leftIcon={<KeyRound className="w-4 h-4" />}
            />

            <GlassButton type="submit" variant="primary" glow className="w-full text-xs font-bold py-3">
              Unlock Master Control Room
            </GlassButton>
          </form>

          <div className="pt-2 text-center border-t border-border">
            <Link href="/dashboard" className="text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-foreground">
              ← Return to Creator Dashboard
            </Link>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-emerald-400 selection:text-black py-10 px-4 sm:px-6 relative overflow-hidden transition-colors duration-500">
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-emerald-500/10 rounded-full blur-[160px]" />
      </div>

      <div className="max-w-6xl mx-auto space-y-8 relative z-10 pb-20">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-[#00FF87] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-500/40 text-emerald-800 dark:text-[#00FF87] font-bold">
              MASTER ADMIN PORTAL
            </span>
            <button
              onClick={() => {
                sessionStorage.removeItem('portfoli_admin_key');
                setIsAdminAuthenticated(false);
              }}
              className="text-xs font-bold text-zinc-500 hover:text-rose-500 transition-colors cursor-pointer"
            >
              Lock
            </button>
          </div>
        </div>

        <ScrollReveal animation="fade-up">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-700 dark:text-[#00FF87] font-bold">
              Platform Infrastructure
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground font-display">
              Dynamic Pricing & Subscriptions Control
            </h1>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Adjust platform pricing in real-time, inspect subscription revenue, and monitor cloud storage consumption.
            </p>
          </div>
        </ScrollReveal>

        {/* Global Telemetry Metrics */}
        {telemetry && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ScrollReveal animation="fade-up" delayMs={50}>
              <PerspectiveTilt>
                <GlassCard intensity="high" className="p-5 space-y-2">
                  <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400 text-xs font-bold">
                    <span>Total Creators</span>
                    <Users className="w-4 h-4 text-emerald-600 dark:text-[#00FF87]" />
                  </div>
                  <div className="text-3xl font-black font-mono text-foreground">{telemetry.totalUsers}</div>
                  <div className="text-[11px] text-zinc-600 dark:text-zinc-400">Registered creators across all nodes</div>
                </GlassCard>
              </PerspectiveTilt>
            </ScrollReveal>

            <ScrollReveal animation="fade-up" delayMs={100}>
              <PerspectiveTilt>
                <GlassCard intensity="high" className="p-5 space-y-2">
                  <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400 text-xs font-bold">
                    <span>Active Subscriptions</span>
                    <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-[#00FF87]" />
                  </div>
                  <div className="text-3xl font-black font-mono text-emerald-700 dark:text-[#00FF87]">
                    {telemetry.activeSubscriptions}
                  </div>
                  <div className="text-[11px] text-zinc-600 dark:text-zinc-400">Pro & Elite recurring plans</div>
                </GlassCard>
              </PerspectiveTilt>
            </ScrollReveal>

            <ScrollReveal animation="fade-up" delayMs={150}>
              <PerspectiveTilt>
                <GlassCard intensity="high" className="p-5 space-y-2">
                  <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400 text-xs font-bold">
                    <span>Total Revenue</span>
                    <DollarSign className="w-4 h-4 text-emerald-600 dark:text-[#00FF87]" />
                  </div>
                  <div className="text-3xl font-black font-mono text-foreground">
                    ₦{telemetry.totalRevenueNgn.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-zinc-600 dark:text-zinc-400">Annual Gross Platform Revenue</div>
                </GlassCard>
              </PerspectiveTilt>
            </ScrollReveal>

            <ScrollReveal animation="fade-up" delayMs={200}>
              <PerspectiveTilt>
                <GlassCard intensity="high" className="p-5 space-y-2">
                  <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400 text-xs font-bold">
                    <span>Storage Consumed</span>
                    <HardDrive className="w-4 h-4 text-emerald-600 dark:text-[#00FF87]" />
                  </div>
                  <div className="text-3xl font-black font-mono text-foreground">
                    {formatBytes(telemetry.totalStorageUsedBytes)}
                  </div>
                  <div className="text-[11px] text-zinc-600 dark:text-zinc-400">HF Hub & Kaggle video cache</div>
                </GlassCard>
              </PerspectiveTilt>
            </ScrollReveal>
          </div>
        )}

        {/* Dynamic Pricing Configuration Forms */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-xl font-extrabold text-foreground font-display">
                Dynamic Tier Customization
              </h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Update prices and upload caps across all tiers. Changes propagate immediately.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {saveSuccess && (
                <span className="text-xs font-bold text-emerald-700 dark:text-[#00FF87] flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Changes Applied
                </span>
              )}
              <GlassButton variant="primary" glow loading={saving} onClick={handleSavePricing} className="text-xs font-bold">
                <Save className="w-3.5 h-3.5" /> Save Pricing Matrix
              </GlassButton>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 1. Starter Tier (Free) */}
            <GlassCard intensity="high" className="p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-base font-extrabold text-foreground font-display">Starter (Free Plan)</h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40">
                  FREE
                </span>
              </div>

              <div className="space-y-4">
                <GlassInput
                  label="Price (NGN)"
                  type="number"
                  value={pricing.free.priceNgn}
                  onChange={(e) =>
                    setPricing({
                      ...pricing,
                      free: { ...pricing.free, priceNgn: Number(e.target.value) },
                    })
                  }
                  disabled
                />
                <GlassInput
                  label="Max Allowed Videos"
                  type="number"
                  value={pricing.free.maxVideos}
                  onChange={(e) =>
                    setPricing({
                      ...pricing,
                      free: { ...pricing.free, maxVideos: Number(e.target.value) },
                    })
                  }
                />
                <GlassInput
                  label="Max Project Photos"
                  type="number"
                  value={pricing.free.maxPhotos}
                  onChange={(e) =>
                    setPricing({
                      ...pricing,
                      free: { ...pricing.free, maxPhotos: Number(e.target.value) },
                    })
                  }
                />
              </div>
            </GlassCard>

            {/* 2. Creator Pro Tier (2,000 NGN default) */}
            <GlassCard intensity="ultra" glow className="p-6 space-y-5 border-emerald-500/40">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-base font-extrabold text-foreground font-display">Creator Pro Tier</h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500 text-black">
                  POPULAR
                </span>
              </div>

              <div className="space-y-4">
                <GlassInput
                  label="Annual Price (NGN)"
                  type="number"
                  value={pricing.pro_2k.priceNgn}
                  onChange={(e) =>
                    setPricing({
                      ...pricing,
                      pro_2k: { ...pricing.pro_2k, priceNgn: Number(e.target.value) },
                    })
                  }
                />
                <GlassInput
                  label="Max Allowed Videos"
                  type="number"
                  value={pricing.pro_2k.maxVideos}
                  onChange={(e) =>
                    setPricing({
                      ...pricing,
                      pro_2k: { ...pricing.pro_2k, maxVideos: Number(e.target.value) },
                    })
                  }
                />
                <GlassInput
                  label="Max Project Photos"
                  type="number"
                  value={pricing.pro_2k.maxPhotos}
                  onChange={(e) =>
                    setPricing({
                      ...pricing,
                      pro_2k: { ...pricing.pro_2k, maxPhotos: Number(e.target.value) },
                    })
                  }
                />
              </div>
            </GlassCard>

            {/* 3. Elite Mastery Tier (5,000 NGN default) */}
            <GlassCard intensity="high" className="p-6 space-y-5 border-cyan-500/40">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-base font-extrabold text-foreground font-display">Elite Mastery Tier</h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border border-cyan-500/40">
                  SUBDOMAINS
                </span>
              </div>

              <div className="space-y-4">
                <GlassInput
                  label="Annual Price (NGN)"
                  type="number"
                  value={pricing.elite_5k.priceNgn}
                  onChange={(e) =>
                    setPricing({
                      ...pricing,
                      elite_5k: { ...pricing.elite_5k, priceNgn: Number(e.target.value) },
                    })
                  }
                />
                <GlassInput
                  label="Max Allowed Videos"
                  type="number"
                  value={pricing.elite_5k.maxVideos}
                  onChange={(e) =>
                    setPricing({
                      ...pricing,
                      elite_5k: { ...pricing.elite_5k, maxVideos: Number(e.target.value) },
                    })
                  }
                />
                <GlassInput
                  label="Max Project Photos"
                  type="number"
                  value={pricing.elite_5k.maxPhotos}
                  onChange={(e) =>
                    setPricing({
                      ...pricing,
                      elite_5k: { ...pricing.elite_5k, maxPhotos: Number(e.target.value) },
                    })
                  }
                />
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Admin Security & Passcode Settings Card */}
        <div className="pt-6 border-t border-border space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/40 text-emerald-700 dark:text-[#00FF87] flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-foreground font-display">
                Admin Security & Passcode Settings
              </h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Update the Master Admin Passcode for protecting platform telemetry and pricing controls.
              </p>
            </div>
          </div>

          <GlassCard intensity="high" className="p-6 max-w-2xl">
            {passSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-500/40 text-emerald-800 dark:text-[#00FF87] text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{passSuccess}</span>
              </div>
            )}

            {passError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-500/40 text-rose-800 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{passError}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePasscode} className="space-y-4">
              <GlassInput
                label="Current Admin Passcode"
                type="password"
                placeholder="Enter current passcode"
                value={currentPasscode}
                onChange={(e) => setCurrentPasscode(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <GlassInput
                  label="New Admin Passcode"
                  type="password"
                  placeholder="At least 6 characters"
                  value={newPasscode}
                  onChange={(e) => setNewPasscode(e.target.value)}
                  required
                />
                <GlassInput
                  label="Confirm New Passcode"
                  type="password"
                  placeholder="Re-enter new passcode"
                  value={confirmPasscode}
                  onChange={(e) => setConfirmPasscode(e.target.value)}
                  required
                />
              </div>

              <div className="pt-2">
                <GlassButton
                  type="submit"
                  variant="primary"
                  glow
                  loading={isUpdatingPass}
                  className="text-xs font-bold py-2.5"
                >
                  <Save className="w-3.5 h-3.5" /> Update Admin Passcode
                </GlassButton>
              </div>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
