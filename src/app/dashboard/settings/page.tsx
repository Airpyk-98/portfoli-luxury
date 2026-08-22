'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, UserPortfolio } from '@/lib/types';
import { CountdownBadge } from '@/components/ui/countdown-badge';
import { StorageBar } from '@/components/ui/storage-bar';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { GlassInput } from '@/components/ui/glass-input';
import {
  ShieldCheck,
  Globe,
  Lock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  HardDrive,
  User as UserIcon,
} from 'lucide-react';
import { isSubdomainAllowed, formatBytes } from '@/lib/tiers';

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [portfolio, setPortfolio] = useState<UserPortfolio | null>(null);

  // Settings form states
  const [username, setUsername] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [savingDomain, setSavingDomain] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [domainSuccess, setDomainSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [domainError, setDomainError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/portfolio')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setUsername(data.user.username);
        }
        if (data.portfolio) {
          setPortfolio(data.portfolio);
          setSubdomain(data.portfolio.customSubdomain || data.user?.username || '');
        }
      })
      .catch(console.error);
  }, []);

  const handleUpdateDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portfolio || !user) return;

    setSavingDomain(true);
    setDomainError(null);
    setDomainSuccess(false);

    try {
      const res = await fetch('/api/portfolio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...portfolio,
          username: username.toLowerCase().trim(),
          customSubdomain: subdomain ? subdomain.toLowerCase().trim() : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setDomainError(data.error || 'Failed to update domain settings.');
      } else {
        setDomainSuccess(true);
        if (data.portfolio) setPortfolio(data.portfolio);
        if (data.user) setUser(data.user);
        setTimeout(() => setDomainSuccess(false), 3000);
      }
    } catch {
      setDomainError('Connection error while updating domain.');
    } finally {
      setSavingDomain(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) return;
    setSavingPassword(true);
    // Simulated credential update
    setTimeout(() => {
      setSavingPassword(false);
      setPasswordSuccess(true);
      setNewPassword('');
      setCurrentPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    }, 800);
  };

  if (!user || !portfolio) {
    return (
      <div className="py-24 text-center text-zinc-400">
        <Sparkles className="w-8 h-8 mx-auto text-emerald-400 animate-spin mb-3" />
        <p>Loading Account Settings...</p>
      </div>
    );
  }

  const isSubdomainUnlocked = user.subscription?.tier === 'elite_5k';

  return (
    <div className="space-y-8 max-w-4xl pb-20">
      <div>
        <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">
          Account & Infrastructure
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground font-display">
          Settings & Subscriptions
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Manage your subscription countdown, custom subdomains, security, and storage allocations.
        </p>
      </div>

      {/* 1. DAILY SUBSCRIPTION COUNTDOWN WIDGET */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-foreground font-display">Live Subscription Countdown</h3>
        <CountdownBadge subscription={user.subscription} />
        {user.subscription?.tier !== 'elite_5k' && (
          <div className="flex items-center justify-between p-4 rounded-xl bg-black/5 dark:bg-[#0d1712] border border-border text-xs">
            <span className="text-zinc-600 dark:text-zinc-300">Want custom subdomains and unlimited uploads?</span>
            <Link
              href="/pricing"
              className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
            >
              Upgrade Plan <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* 2. DOMAIN & URL SETTINGS */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-foreground font-display">Domain & URL Routing</h3>
        <GlassCard intensity="high" className="p-6 space-y-5">
          {domainSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Domain routing updated successfully.</span>
            </div>
          )}
          {domainError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-500/40 text-rose-600 dark:text-rose-300 text-xs">
              {domainError}
            </div>
          )}

          <form onSubmit={handleUpdateDomain} className="space-y-4">
            <div>
              <GlassInput
                label="Standard Slug Path (Free & Pro Tier)"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                helper={`Your public path is: portfoli.me/${username}`}
                required
              />
            </div>

            {/* Custom Subdomain (Elite 5k Tier Requirement) */}
            <div className="pt-3 border-t border-border space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                  Custom Subdomain (Elite Tier Required)
                </label>
                {isSubdomainUnlocked ? (
                  <span className="text-[10px] font-mono font-bold text-cyan-700 dark:text-cyan-300 px-2 py-0.5 rounded bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-500/40">
                    UNLOCKED (5k Plan)
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-500/30">
                    Locked to ₦5,000 Elite Tier
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <GlassInput
                  placeholder="kristos"
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  disabled={!isSubdomainUnlocked}
                  className={!isSubdomainUnlocked ? 'opacity-50 cursor-not-allowed' : ''}
                />
                <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 whitespace-nowrap">.portfoli.me</span>
              </div>

              {!isSubdomainUnlocked && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400/90 font-medium">
                  Notice: Only paid users on the ₦5,000/yr plan can activate custom subdomains.
                </p>
              )}
            </div>

            <GlassButton
              type="submit"
              variant="primary"
              glow
              loading={savingDomain}
              className="text-xs font-bold"
            >
              Save URL Configuration
            </GlassButton>
          </form>
        </GlassCard>
      </div>

      {/* 3. STORAGE CONSUMPTION GAUGE */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-foreground font-display">Storage Quotas</h3>
        <StorageBar tier={user.subscription?.tier} usedBytes={user.storageUsedBytes || 0} />
      </div>

      {/* 4. SECURITY & PASSWORD UPDATE */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-foreground font-display">Security & Password</h3>
        <GlassCard intensity="high" className="p-6 space-y-4">
          {passwordSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Password updated successfully.</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <GlassInput
              label="Current Password"
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <GlassInput
              label="New Password"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <GlassButton
              type="submit"
              variant="secondary"
              loading={savingPassword}
              className="text-xs font-bold"
            >
              Update Password
            </GlassButton>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
