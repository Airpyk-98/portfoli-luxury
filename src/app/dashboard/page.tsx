'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { CountdownBadge } from '@/components/ui/countdown-badge';
import { StorageBar } from '@/components/ui/storage-bar';
import { KineticTypography, ScrollReveal, PerspectiveTilt } from '@/components/ui/kinetic-motion';
import {
  Eye,
  Edit3,
  Layers,
  Sliders,
  Mail,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  HardDrive,
  Globe,
  Film,
} from 'lucide-react';
import { UserPortfolio, User, Inquiry } from '@/lib/types';
import { formatBytes } from '@/lib/tiers';

export default function DashboardOverviewPage() {
  const [user, setUser] = useState<User | null>(null);
  const [portfolio, setPortfolio] = useState<UserPortfolio | null>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/portfolio')
      .then((res) => res.json())
      .then((data) => {
        if (data.portfolio) setPortfolio(data.portfolio);
        if (data.user) {
          setUser(data.user);

          // Check if returned from Flutterwave payment
          if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const txRef = urlParams.get('tx_ref');
            const transactionId = urlParams.get('transaction_id');
            const tier = urlParams.get('tier') || 'elite_5k';

            if (txRef || transactionId) {
              fetch('/api/payment/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  txRef,
                  transactionId,
                  userId: data.user.id,
                  tier,
                }),
              })
                .then((r) => r.json())
                .then((vData) => {
                  if (vData.success) {
                    setPaymentSuccessMsg('🎉 Payment verified! Your 1-Year Elite subscription & 5GB storage are now active.');
                    if (vData.user) setUser(vData.user);
                    // Clean URL
                    window.history.replaceState({}, document.title, '/dashboard');
                  }
                })
                .catch(console.error);
            }
          }
        }
      })
      .catch(console.error);

    fetch('/api/inquiries')
      .then((res) => res.json())
      .then((data) => {
        if (data.inquiries) setInquiries(data.inquiries);
      })
      .catch(console.error);
  }, []);

  const totalProjects = portfolio?.projects?.length || 0;
  let totalVideos = 0;
  let totalPhotos = 0;
  portfolio?.projects?.forEach((p) => {
    p.media?.forEach((m) => {
      if (m.type === 'video') totalVideos++;
      else totalPhotos++;
    });
  });

  const username = user?.username || '';
  const publicSlug = username ? `/${username}` : '#';

  return (
    <div className="space-y-8">
      {/* Payment Success Celebration */}
      {paymentSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500 text-emerald-300 text-xs font-bold flex items-center justify-between shadow-glass-glow animate-pulse font-mono">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{paymentSuccessMsg}</span>
          </div>
          <button
            onClick={() => setPaymentSuccessMsg(null)}
            className="text-xs text-zinc-400 hover:text-white px-2 py-1 rounded"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Welcome Bar */}
      <ScrollReveal animation="fade-up">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">
              Creator Studio
            </span>
            <KineticTypography
              text={`Welcome, ${user?.name || 'Creator'}`}
              className="text-3xl sm:text-4xl font-extrabold text-foreground font-display"
            />
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard/editor">
              <GlassButton variant="primary" size="sm" glow className="text-xs font-bold">
                <Edit3 className="w-3.5 h-3.5" /> Edit Portfolio
              </GlassButton>
            </Link>
            <a href={publicSlug} target="_blank" rel="noopener noreferrer">
              <GlassButton variant="glass" size="sm" className="text-xs font-semibold">
                <Eye className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> View Live
              </GlassButton>
            </a>
          </div>
        </div>
      </ScrollReveal>

      {/* Subscription Countdown Card */}
      <ScrollReveal animation="fade-up" delayMs={50}>
        <CountdownBadge subscription={user?.subscription} />
      </ScrollReveal>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ScrollReveal animation="fade-up" delayMs={100}>
          <PerspectiveTilt>
            <GlassCard intensity="high" className="p-5 space-y-2">
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-semibold">
                <span>Portfolio Work</span>
                <Layers className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-3xl font-black font-mono text-foreground">{totalProjects}</div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {totalVideos} Videos • {totalPhotos} Images
              </div>
            </GlassCard>
          </PerspectiveTilt>
        </ScrollReveal>

        <ScrollReveal animation="fade-up" delayMs={150}>
          <PerspectiveTilt>
            <GlassCard intensity="high" className="p-5 space-y-2">
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-semibold">
                <span>Active Display Mode</span>
                <Sparkles className="w-4 h-4 text-cyan-500" />
              </div>
              <div className="text-lg font-bold text-foreground capitalize">
                {portfolio?.theme?.displayMode?.replace('_', ' ') || 'Crystal Prism'}
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">3D Optics Engine</div>
            </GlassCard>
          </PerspectiveTilt>
        </ScrollReveal>

        <ScrollReveal animation="fade-up" delayMs={200}>
          <PerspectiveTilt>
            <GlassCard intensity="high" className="p-5 space-y-2">
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-semibold">
                <span>Services Listed</span>
                <Sliders className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-3xl font-black font-mono text-foreground">
                {portfolio?.services?.length || 0}
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Custom pricing & timelines</div>
            </GlassCard>
          </PerspectiveTilt>
        </ScrollReveal>

        <ScrollReveal animation="fade-up" delayMs={250}>
          <PerspectiveTilt>
            <GlassCard intensity="high" className="p-5 space-y-2">
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-semibold">
                <span>Client Inquiries</span>
                <Mail className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-3xl font-black font-mono text-foreground">{inquiries.length}</div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Direct client leads</div>
            </GlassCard>
          </PerspectiveTilt>
        </ScrollReveal>
      </div>

      {/* Storage Meter & Link Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-4">
          <h3 className="text-base font-bold text-foreground font-display">Storage Telemetry</h3>
          <StorageBar
            tier={user?.subscription?.tier}
            usedBytes={user?.storageUsedBytes || 0}
          />
        </div>

        <div className="lg:col-span-6 space-y-4">
          <h3 className="text-base font-bold text-foreground font-display">Your Domain & Routes</h3>
          <GlassCard intensity="high" className="p-5 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-zinc-500 dark:text-zinc-400">Public Slug URL:</span>
              <a
                href={publicSlug}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-bold"
              >
                portfoli.site/{username} <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-zinc-500 dark:text-zinc-400">Custom Subdomain:</span>
              {user?.subscription?.tier === 'elite_5k' ? (
                <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                  {username}.portfoli.site (Active)
                </span>
              ) : (
                <Link
                  href="/pricing"
                  className="text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 font-medium"
                >
                  Unlock with Elite (₦5,000/yr) <ArrowUpRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Recent Inquiries List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground font-display">Recent Client Inquiries</h3>
          <Link href="/dashboard/inquiries" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">
            View All ({inquiries.length})
          </Link>
        </div>

        {inquiries.length === 0 ? (
          <GlassCard intensity="high" className="p-8 text-center text-zinc-500 dark:text-zinc-400 space-y-2">
            <Mail className="w-8 h-8 mx-auto text-emerald-500/40" />
            <p className="text-xs">No client inquiries yet. Share your portfolio link to start receiving client briefs.</p>
          </GlassCard>
        ) : (
          <div className="space-y-3">
            {inquiries.slice(0, 3).map((inq) => (
              <GlassCard key={inq.id} intensity="high" className="p-4 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground text-xs">{inq.senderName}</span>
                    <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">({inq.senderEmail})</span>
                    {inq.serviceInterest && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                        {inq.serviceInterest}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2">{inq.message}</p>
                </div>
                <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
                  {new Date(inq.createdAt).toLocaleDateString()}
                </span>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
