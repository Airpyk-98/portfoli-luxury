'use client';

import React from 'react';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { ThemeToggle } from '@/components/theme-toggle';
import { KineticTypography, ScrollReveal, PerspectiveTilt } from '@/components/ui/kinetic-motion';
import {
  Sparkles,
  Layers,
  Zap,
  Globe,
  ShieldCheck,
  Video,
  ChevronRight,
  ArrowUpRight,
  CheckCircle2,
  Lock,
  Smartphone,
  Eye,
  Sliders,
  Award,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-emerald-400 selection:text-black relative overflow-hidden font-sans transition-colors duration-500">
      {/* Dynamic Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[550px] bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-[160px]" />
        <div className="absolute top-[35%] -right-40 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[180px]" />
        <div className="absolute bottom-10 -left-40 w-[700px] h-[700px] bg-emerald-600/10 rounded-full blur-[190px]" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(16,185,129,0.06)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(0,255,135,0.05)_1px,transparent_1px)] [background-size:32px_32px] opacity-70" />
      </div>

      {/* Global Navbar */}
      <nav className="sticky top-4 z-50 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-card-bg backdrop-blur-2xl border border-border shadow-glass dark:shadow-glass shadow-glass-light transition-all duration-300">
          <Link href="/" className="flex items-center gap-2.5 pl-2 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-300 flex items-center justify-center text-black font-black text-sm shadow-glass-glow">
              P
            </div>
            <span className="font-display font-extrabold text-lg tracking-tight text-foreground group-hover:text-emerald-500 transition-colors">
              portfoli
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-xs font-bold text-zinc-700 dark:text-zinc-200">
            <a href="#features" className="hover:text-emerald-600 dark:hover:text-[#00FF87] transition-colors">
              Features
            </a>
            <a href="#showcase" className="hover:text-emerald-600 dark:hover:text-[#00FF87] transition-colors">
              Optics & 3D Displays
            </a>
            <a href="#pricing" className="hover:text-emerald-600 dark:hover:text-[#00FF87] transition-colors">
              Pricing
            </a>
            <Link href="/kristos" className="text-emerald-700 dark:text-[#00FF87] hover:underline flex items-center gap-1 font-bold">
              <span>Live Showcase</span> <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login">
              <GlassButton variant="ghost" size="sm" className="text-xs font-bold">
                Log In
              </GlassButton>
            </Link>
            <Link href="/register">
              <GlassButton variant="primary" size="sm" glow className="text-xs font-bold">
                Claim Handle <ChevronRight className="w-3.5 h-3.5" />
              </GlassButton>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-24 text-center space-y-8">
        <ScrollReveal animation="scale-up" delayMs={50}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-400/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold backdrop-blur-xl shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-[#00FF87]" />
            <span>Next-Gen Glassmorphic Portfolio Architecture</span>
          </div>
        </ScrollReveal>

        {/* Kinetic Typographic Intro */}
        <div className="pt-2">
          <KineticTypography
            text="Portfolios that command absolute authority."
            className="text-4xl sm:text-6xl lg:text-7xl font-black text-foreground font-display justify-center leading-[1.08] tracking-tight"
            delayMs={100}
            staggerMs={60}
          />
        </div>

        <ScrollReveal animation="fade-up" delayMs={300}>
          <p className="text-base sm:text-xl text-zinc-800 dark:text-zinc-200 max-w-3xl mx-auto font-normal leading-relaxed">
            Elevate your work with high-end glassmorphic dark/light aesthetics, 3D Crystal Prism showcases, custom subdomains, and zero-autoplay click-to-play video playback. Built to make clients and interviewers instantly confident.
          </p>
        </ScrollReveal>

        <ScrollReveal animation="fade-up" delayMs={450}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/register" className="w-full sm:w-auto">
              <GlassButton variant="primary" size="lg" glow className="w-full sm:w-auto text-sm font-black px-8">
                Start Free (200MB Included) <ChevronRight className="w-4 h-4 ml-1" />
              </GlassButton>
            </Link>
            <Link href="/kristos" className="w-full sm:w-auto">
              <GlassButton variant="glass" size="lg" className="w-full sm:w-auto text-sm font-bold">
                <Eye className="w-4 h-4 mr-2 text-emerald-600 dark:text-[#00FF87]" /> Explore Kristos Vance Portfolio
              </GlassButton>
            </Link>
          </div>
        </ScrollReveal>

        {/* Live Subdomain Pill Demo */}
        <ScrollReveal animation="fade-up" delayMs={600}>
          <div className="pt-6 flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-zinc-700 dark:text-zinc-300 font-semibold">
            <Globe className="w-4 h-4 text-emerald-600 dark:text-[#00FF87]" />
            <span>Claim your custom link:</span>
            <span className="font-bold bg-white dark:bg-white/10 px-2.5 py-1 rounded-md border border-border text-foreground">
              portfoli.me/<span className="text-emerald-700 dark:text-[#00FF87]">yourname</span>
            </span>
            <span className="text-zinc-500">or</span>
            <span className="font-bold bg-white dark:bg-white/10 px-2.5 py-1 rounded-md border border-emerald-500/40 text-emerald-800 dark:text-emerald-300">
              <span className="text-emerald-700 dark:text-[#00FF87]">yourname</span>.portfoli.me
            </span>
          </div>
        </ScrollReveal>
      </section>

      {/* INTERACTIVE DEMO PREVIEW MOCKUP */}
      <section id="showcase" className="max-w-6xl mx-auto px-4 sm:px-6 pb-28 relative z-10">
        <ScrollReveal animation="prism-fold">
          <PerspectiveTilt>
            <div className="rounded-3xl p-1 bg-gradient-to-b from-emerald-500/50 via-emerald-400/20 to-transparent shadow-glass-glow-lg">
              <div className="bg-white dark:bg-[#09100d]/95 rounded-[22px] p-4 sm:p-8 backdrop-blur-3xl space-y-6 border border-border">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400 ml-2 font-semibold">kristos.portfoli.me</span>
                  </div>
                  <span className="text-xs font-mono text-emerald-800 dark:text-[#00FF87] px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-400/40 font-bold">
                    3D CRYSTAL PRISM ENGINE ACTIVE
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                  <div className="lg:col-span-2 relative aspect-video rounded-2xl overflow-hidden bg-black/80 border border-emerald-500/30">
                    <img
                      src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80"
                      alt="Crystal Prism Optics"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-300 font-bold px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40">
                          Spatial UI
                        </span>
                        <h3 className="text-xl font-bold text-white mt-1">Aetheria Spatial Interface</h3>
                        <p className="text-xs text-zinc-200">Click-to-play high-fidelity video & crystal optics.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <GlassCard intensity="high" className="p-5 space-y-3">
                      <div className="text-xs font-mono text-emerald-800 dark:text-[#00FF87] uppercase font-bold">Display Modes</div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
                        <span className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-400/50 text-center">
                          3D Crystal Prism
                        </span>
                        <span className="p-2 rounded-lg bg-black/5 dark:bg-white/5 text-zinc-700 dark:text-zinc-300 border border-border text-center">
                          Side-Swipe Cards
                        </span>
                        <span className="p-2 rounded-lg bg-black/5 dark:bg-white/5 text-zinc-700 dark:text-zinc-300 border border-border text-center">
                          3D Carousel
                        </span>
                        <span className="p-2 rounded-lg bg-black/5 dark:bg-white/5 text-zinc-700 dark:text-zinc-300 border border-border text-center">
                          Luxury Bento Grid
                        </span>
                      </div>
                    </GlassCard>

                    <GlassCard intensity="high" className="p-5 space-y-2">
                      <div className="text-xs font-mono text-emerald-800 dark:text-[#00FF87] uppercase font-bold">Storage Pipeline</div>
                      <p className="text-xs text-zinc-700 dark:text-zinc-200 font-normal leading-relaxed">
                        Direct Hugging Face Hub dataset backend with automatic Kaggle WebM compression for videos &gt; 100MB.
                      </p>
                    </GlassCard>
                  </div>
                </div>
              </div>
            </div>
          </PerspectiveTilt>
        </ScrollReveal>
      </section>

      {/* CORE CAPABILITIES GRID */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 pb-28 relative z-10 space-y-12">
        <ScrollReveal animation="fade-up">
          <div className="text-center space-y-3">
            <span className="text-xs font-mono text-emerald-700 dark:text-[#00FF87] uppercase tracking-widest font-bold">
              Architectural Supremacy
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground font-display">
              Engineered for Creators & High-End Professionals
            </h2>
            <p className="text-sm sm:text-base text-zinc-700 dark:text-zinc-300 max-w-2xl mx-auto font-normal">
              Every layer of portfoli is tuned to deliver an unmatched impression to recruiters, clients, and partners.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Layers,
              title: '4 Bespoke Display Modes',
              desc: 'Showcase projects via interactive 3D Crystal Prisms, fluid horizontal swipe cards, rotating 3D carousels, or editorial bento grids.',
            },
            {
              icon: Video,
              title: 'Click-to-Play Video Engine',
              desc: 'Strict zero autoplay. Videos play only on user click, wrapped in glowing emerald glass controls and theatre lightboxes.',
            },
            {
              icon: Globe,
              title: 'Subdomains & Slugs',
              desc: 'Claim your unique name on portfoli.me/kristos or unlock dedicated subdomains on kristos.portfoli.me.',
            },
            {
              icon: Sliders,
              title: 'Services & Pricing Matrix',
              desc: 'List your service tiers with NGN/USD rates, delivery timelines, and direct client inquiry forms dispatched to your inbox.',
            },
            {
              icon: Zap,
              title: 'HF Hub & Kaggle Pipeline',
              desc: 'Large video uploads exceeding 100MB are compressed to high-fidelity WebM VP9, saving bandwidth while retaining crisp visual quality.',
            },
            {
              icon: ShieldCheck,
              title: 'Daily Countdown & Quotas',
              desc: 'Transparent live daily subscription countdown in your settings, real-time storage gauges, and instant one-click tier upgrades.',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <ScrollReveal key={idx} animation="fade-up" delayMs={idx * 80}>
                <PerspectiveTilt>
                  <GlassCard intensity="high" className="p-6 space-y-4 h-full flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-700 dark:text-[#00FF87]">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground font-display">{item.title}</h3>
                      <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal">{item.desc}</p>
                    </div>
                  </GlassCard>
                </PerspectiveTilt>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="max-w-6xl mx-auto px-4 sm:px-6 pb-32 relative z-10 space-y-12">
        <ScrollReveal animation="fade-up">
          <div className="text-center space-y-3">
            <span className="text-xs font-mono text-emerald-700 dark:text-[#00FF87] uppercase tracking-widest font-bold">
              Transparent Investment
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground font-display">
              Predictable Annual Plans
            </h2>
            <p className="text-sm sm:text-base text-zinc-700 dark:text-zinc-300 max-w-xl mx-auto font-normal">
              From free foundational setups to high-end unlimited mastery with dedicated subdomains.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* FREE TIER */}
          <ScrollReveal animation="fade-up" delayMs={50}>
            <GlassCard intensity="high" className="p-7 flex flex-col justify-between space-y-6 h-full">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-foreground font-display">Starter</h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 font-normal">For beginners building their first portfolio.</p>
                </div>

                <div className="pt-2">
                  <div className="text-4xl font-black text-foreground font-mono">₦0</div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">Free Forever</div>
                </div>

                <ul className="space-y-2.5 pt-4 border-t border-border text-xs text-zinc-800 dark:text-zinc-200 font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#00FF87]" /> Max 1 Video
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#00FF87]" /> Max 5 Project Photos
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#00FF87]" /> 200 MB Storage Quota
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#00FF87]" /> Standard URL (portfoli.me/username)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#00FF87]" /> Carousel & Bento Display Modes
                  </li>
                </ul>
              </div>

              <Link href="/register" className="w-full">
                <GlassButton variant="secondary" className="w-full text-xs font-bold">
                  Get Started Free
                </GlassButton>
              </Link>
            </GlassCard>
          </ScrollReveal>

          {/* PRO TIER (2,000 NGN) */}
          <ScrollReveal animation="fade-up" delayMs={150}>
            <GlassCard intensity="ultra" glow className="p-7 flex flex-col justify-between space-y-6 relative border-emerald-500/50 h-full">
              <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-emerald-500 text-black text-[10px] font-black uppercase tracking-wider shadow-glass-glow">
                Recommended
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-foreground font-display">Creator Pro</h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 font-normal">For active developers, designers, and freelancers.</p>
                </div>

                <div className="pt-2">
                  <div className="text-4xl font-black text-emerald-700 dark:text-[#00FF87] font-mono">₦2,000</div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">per year (Annual Billing)</div>
                </div>

                <ul className="space-y-2.5 pt-4 border-t border-border text-xs text-zinc-800 dark:text-zinc-200 font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#00FF87]" /> Up to 10 Videos
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#00FF87]" /> Up to 70 Project Images
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#00FF87]" /> 1 GB High-Speed Storage
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#00FF87]" /> Side-Swipe Cards & Custom Fonts
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#00FF87]" /> Daily Subscription Countdown Tracker
                  </li>
                </ul>
              </div>

              <Link href="/register" className="w-full">
                <GlassButton variant="primary" glow className="w-full text-xs font-bold">
                  Upgrade to Pro (₦2,000/yr)
                </GlassButton>
              </Link>
            </GlassCard>
          </ScrollReveal>

          {/* ELITE TIER (5,000 NGN) */}
          <ScrollReveal animation="fade-up" delayMs={250}>
            <GlassCard intensity="high" className="p-7 flex flex-col justify-between space-y-6 h-full">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-foreground font-display">Elite Mastery</h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 font-normal">For agencies, lead consultants, and top-tier talent.</p>
                </div>

                <div className="pt-2">
                  <div className="text-4xl font-black text-cyan-700 dark:text-cyan-300 font-mono">₦5,000</div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">per year (Annual Billing)</div>
                </div>

                <ul className="space-y-2.5 pt-4 border-t border-border text-xs text-zinc-800 dark:text-zinc-200 font-medium">
                  <li className="flex items-center gap-2 font-bold text-cyan-800 dark:text-cyan-300">
                    <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> Custom Subdomain (kristos.portfoli.me)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> Unlimited Uploads (Max 2GB Quota)
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

              <Link href="/register" className="w-full">
                <GlassButton variant="glass" className="w-full text-xs font-bold text-cyan-800 dark:text-cyan-300 border-cyan-500/50 hover:bg-cyan-50 dark:hover:bg-cyan-950/80">
                  Claim Elite (₦5,000/yr)
                </GlassButton>
              </Link>
            </GlassCard>
          </ScrollReveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border py-10 relative z-10 text-xs text-zinc-700 dark:text-zinc-300">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-bold text-foreground">portfoli</span> — Luxury Multi-User Portfolio Platform
          </div>
          <div className="flex items-center gap-6 font-semibold">
            <Link href="/pricing" className="hover:text-emerald-600 dark:hover:text-[#00FF87] transition-colors">
              Pricing & Tiers
            </Link>
            <Link href="/admin" className="hover:text-emerald-600 dark:hover:text-[#00FF87] transition-colors">
              Admin Portal
            </Link>
            <Link href="/login" className="hover:text-emerald-600 dark:hover:text-[#00FF87] transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
