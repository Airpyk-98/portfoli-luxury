'use client';

import React, { useState, useEffect } from 'react';
import { UserPortfolio, ServiceItem, SocialLink } from '@/lib/types';
import { CrystalPrismDisplay } from '@/components/displays/crystal-prism';
import { SideSwipeCardsDisplay } from '@/components/displays/side-swipe-cards';
import { Carousel3DDisplay } from '@/components/displays/carousel-3d';
import { BentoGridDisplay } from '@/components/displays/bento-grid';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { GlassInput, GlassTextarea } from '@/components/ui/glass-input';
import { ThemeToggle } from '@/components/theme-toggle';
import { KineticTypography, ScrollReveal, PerspectiveTilt } from '@/components/ui/kinetic-motion';
import {
  Globe,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  Send,
  Sparkles,
  MapPin,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import {
  GithubIcon,
  LinkedinIcon,
  TwitterIcon,
  InstagramIcon,
  DribbbleIcon,
} from '@/components/ui/icons';
import { useTheme } from '@/components/theme-provider';
import { getPaletteTokens } from '@/lib/color-tokens';

export function PortfolioRenderer({
  portfolio: initialPortfolio,
  isOwner = false,
}: {
  portfolio: UserPortfolio;
  isOwner?: boolean;
}) {
  const [portfolio, setPortfolio] = useState<UserPortfolio>(initialPortfolio);
  const { theme, applyPortfolioTheme } = useTheme();
  const isDark = theme === 'dark';
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  // Inquiries form state
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Hydrate client-side from local preview cache or fresh API
  useEffect(() => {
    if (typeof window !== 'undefined' && initialPortfolio?.username) {
      try {
        const cached = localStorage.getItem(`portfoli_preview_${initialPortfolio.username}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.username === initialPortfolio.username) {
            setPortfolio(parsed);
          }
        }
      } catch {}

      fetch(`/api/portfolio?username=${encodeURIComponent(initialPortfolio.username)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.portfolio) {
            setPortfolio(data.portfolio);
          }
        })
        .catch(() => {});
    }
  }, [initialPortfolio?.username]);

  const tokens = getPaletteTokens(portfolio.theme?.accentColor, isDark);

  useEffect(() => {
    if (portfolio?.theme) {
      applyPortfolioTheme(portfolio.theme);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portfolio?.theme?.accentColor, portfolio?.theme?.primaryFont, portfolio?.theme?.secondaryFont, portfolio?.theme?.mode]);

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName || !senderEmail || !message) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolioUserId: portfolio.userId,
          portfolioUsername: portfolio.username,
          senderName,
          senderEmail,
          senderSubject: subject || selectedService ? `Inquiry regarding ${selectedService?.title}` : 'General Inquiry',
          message,
          serviceInterest: selectedService?.title,
        }),
      });

      if (res.ok) {
        setSubmitSuccess(true);
        setSenderName('');
        setSenderEmail('');
        setMessage('');
        setSubject('');
        setSelectedService(null);
      }
    } catch (err) {
      console.error('Failed to submit inquiry:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSocialIcon = (platform: SocialLink['platform']) => {
    switch (platform) {
      case 'github':
        return <GithubIcon className="w-4 h-4 text-current" />;
      case 'linkedin':
        return <LinkedinIcon className="w-4 h-4 text-current" />;
      case 'twitter':
        return <TwitterIcon className="w-4 h-4 text-current" />;
      case 'instagram':
        return <InstagramIcon className="w-4 h-4 text-current" />;
      case 'dribbble':
        return <DribbbleIcon className="w-4 h-4 text-current" />;
      case 'email':
        return <Mail className="w-4 h-4 text-current" />;
      default:
        return <Globe className="w-4 h-4 text-current" />;
    }
  };

  const renderDisplayMode = () => {
    const mode = portfolio.theme?.displayMode || 'crystal_prism';
    switch (mode) {
      case 'crystal_prism':
        return <CrystalPrismDisplay projects={portfolio.projects || []} accentColor={portfolio.theme?.accentColor} isDark={isDark} />;
      case 'side_swipe':
        return <SideSwipeCardsDisplay projects={portfolio.projects || []} accentColor={portfolio.theme?.accentColor} isDark={isDark} />;
      case 'carousel_3d':
        return <Carousel3DDisplay projects={portfolio.projects || []} accentColor={portfolio.theme?.accentColor} isDark={isDark} />;
      case 'bento_grid':
      default:
        return <BentoGridDisplay projects={portfolio.projects || []} accentColor={portfolio.theme?.accentColor} isDark={isDark} />;
    }
  };

  return (
    <div
      className="min-h-screen bg-background text-foreground transition-colors duration-500 font-sans relative overflow-hidden selection:bg-emerald-500 selection:text-black"
      style={
        {
          '--accent': tokens.accent,
          '--accent-glow': tokens.btnGlow,
          '--accent-border': tokens.badgeBorder,
          fontFamily: portfolio.theme?.secondaryFont
            ? `"${portfolio.theme.secondaryFont}", system-ui, sans-serif`
            : undefined,
        } as React.CSSProperties
      }
    >
      {/* Background Dynamic Ambient Glows using Creator's Accent */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[750px] h-[550px] rounded-full blur-[150px] transition-all duration-700"
          style={{ backgroundColor: tokens.ambientGlow }}
        />
        <div
          className="absolute top-[40%] -left-32 w-[500px] h-[500px] rounded-full blur-[160px] transition-all duration-700"
          style={{ backgroundColor: tokens.ambientGlow }}
        />
        <div
          className="absolute bottom-10 right-0 w-[600px] h-[600px] rounded-full blur-[180px] transition-all duration-700"
          style={{ backgroundColor: tokens.ambientGlow }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(16,185,129,0.06)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(0,255,135,0.05)_1px,transparent_1px)] [background-size:24px_24px] opacity-70" />
      </div>

      {/* Floating Header Bar */}
      <header className="sticky top-4 z-40 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-card-bg backdrop-blur-2xl border border-border shadow-glass dark:shadow-glass shadow-glass-light transition-all duration-300">
          <a href="#hero" className="flex items-center gap-2.5 font-bold tracking-tight text-foreground pl-2">
            <span
              className="w-2.5 h-2.5 rounded-full animate-pulse shadow-sm"
              style={{ backgroundColor: tokens.accent, boxShadow: `0 0 10px ${tokens.accent}` }}
            />
            <span className="font-display font-extrabold text-base tracking-tight text-foreground">{portfolio.displayName}</span>
          </a>

          <nav className="hidden md:flex items-center gap-7 text-xs font-bold text-zinc-700 dark:text-zinc-200">
            <a href="#projects" className="hover:text-foreground transition-colors">
              Projects
            </a>
            <a href="#services" className="hover:text-foreground transition-colors">
              Services & Pricing
            </a>
            <a href="#about" className="hover:text-foreground transition-colors">
              Bio
            </a>
            <a href="#contact" className="hover:text-foreground transition-colors">
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <a
              href="#contact"
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200"
              style={{
                backgroundColor: tokens.btnBg,
                color: tokens.btnText,
                boxShadow: tokens.btnGlow,
              }}
            >
              Get in Touch
            </a>
          </div>
        </div>
      </header>

      {/* Main Portfolio Sections */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-24 space-y-24">
        {/* HERO / BIO SECTION */}
        <section id="hero" className="space-y-8 pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-6">
              {/* Availability Badge with High Contrast */}
              {portfolio.availableForHire && (
                <ScrollReveal animation="scale-up" delayMs={50}>
                  <div
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold backdrop-blur-xl shadow-sm border"
                    style={{
                      borderColor: tokens.badgeBorder,
                      backgroundColor: tokens.badgeBg,
                      color: tokens.badgeText,
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full animate-ping"
                      style={{ backgroundColor: tokens.accent }}
                    />
                    <span>{portfolio.availabilityText || 'Available for Select Projects & Roles'}</span>
                  </div>
                </ScrollReveal>
              )}

              {/* Display Name & Headline */}
              <div className="space-y-2">
                <KineticTypography
                  text={portfolio.displayName}
                  className="text-4xl sm:text-6xl lg:text-7xl font-black text-foreground tracking-tight leading-[1.05]"
                  delayMs={100}
                  staggerMs={70}
                  style={{
                    fontFamily: portfolio.theme?.primaryFont
                      ? `"${portfolio.theme.primaryFont}", sans-serif`
                      : undefined,
                  }}
                />
                <ScrollReveal animation="fade-up" delayMs={200}>
                  <p
                    className="text-xl sm:text-2xl font-bold font-display"
                    style={{ color: tokens.accentText }}
                  >
                    {portfolio.headline}
                  </p>
                </ScrollReveal>
              </div>

              {/* Bio Narrative with High Contrast */}
              <ScrollReveal animation="fade-up" delayMs={300}>
                <p className="text-base sm:text-lg text-zinc-800 dark:text-zinc-200 font-normal leading-relaxed max-w-2xl">
                  {portfolio.bio}
                </p>
              </ScrollReveal>

              {/* Metadata Badges */}
              <ScrollReveal animation="fade-up" delayMs={400}>
                <div className="flex flex-wrap items-center gap-5 pt-2">
                  {portfolio.location && (
                    <div className="flex items-center gap-1.5 text-xs text-zinc-700 dark:text-zinc-300 font-mono font-medium">
                      <MapPin className="w-4 h-4" style={{ color: tokens.accent }} />
                      <span>{portfolio.location}</span>
                    </div>
                  )}
                  {portfolio.emailContact && (
                    <div className="flex items-center gap-1.5 text-xs text-zinc-700 dark:text-zinc-300 font-mono font-medium">
                      <Mail className="w-4 h-4" style={{ color: tokens.accent }} />
                      <span>{portfolio.emailContact}</span>
                    </div>
                  )}
                </div>
              </ScrollReveal>

              {/* Social Links Row */}
              {portfolio.socials && portfolio.socials.length > 0 && (
                <ScrollReveal animation="fade-up" delayMs={500}>
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    {portfolio.socials.map((social) => (
                      <a
                        key={social.id}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-white dark:bg-[#0e1713] border border-border hover:border-emerald-500 text-zinc-900 dark:text-zinc-100 transition-all duration-200 shadow-sm flex items-center gap-2 text-xs font-bold"
                      >
                        {renderSocialIcon(social.platform)}
                        {social.label && <span>{social.label}</span>}
                      </a>
                    ))}
                  </div>
                </ScrollReveal>
              )}
            </div>

            {/* Avatar / Profile Frame with Custom Accent Glow */}
            <div className="lg:col-span-4 flex justify-center">
              <ScrollReveal animation="scale-up" delayMs={200}>
                <PerspectiveTilt>
                  <div
                    className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl p-1.5 shadow-glass-glow-lg transition-all duration-500"
                    style={{
                      background: `linear-gradient(135deg, ${tokens.accent}, rgba(255,255,255,0.3), ${tokens.borderGlow})`,
                      boxShadow: tokens.btnGlow,
                    }}
                  >
                    <div className="w-full h-full rounded-[22px] overflow-hidden bg-white/20 dark:bg-[#0a120e] relative">
                      {portfolio.avatarUrl ? (
                        <img
                          src={portfolio.avatarUrl}
                          alt={portfolio.displayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center text-4xl font-extrabold"
                          style={{ color: tokens.accentText, backgroundColor: tokens.badgeBg }}
                        >
                          {portfolio.displayName.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                    </div>
                  </div>
                </PerspectiveTilt>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* PROJECTS SHOWCASE SECTION */}
        <section id="projects" className="space-y-8">
          <ScrollReveal animation="fade-up">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-4">
              <div>
                <span
                  className="text-xs font-mono uppercase tracking-widest font-bold"
                  style={{ color: tokens.accentText }}
                >
                  Curated Showcase
                </span>
                <h2
                  className="text-3xl sm:text-4xl font-extrabold text-foreground mt-1 font-display"
                  style={{
                    fontFamily: portfolio.theme?.primaryFont
                      ? `"${portfolio.theme.primaryFont}", sans-serif`
                      : undefined,
                  }}
                >
                  Featured Work & Systems
                </h2>
              </div>
              <div className="text-xs font-mono text-zinc-600 dark:text-zinc-400 font-semibold">
                Display Mode: <span className="font-bold uppercase" style={{ color: tokens.accentText }}>{portfolio.theme?.displayMode || 'Crystal Prism'}</span>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="prism-fold" delayMs={100}>
            {renderDisplayMode()}
          </ScrollReveal>
        </section>

        {/* SERVICES & PRICING SECTION */}
        {portfolio.services && portfolio.services.length > 0 && (
          <section id="services" className="space-y-8">
            <ScrollReveal animation="fade-up">
              <div className="border-b border-border pb-4">
                <span
                  className="text-xs font-mono uppercase tracking-widest font-bold"
                  style={{ color: tokens.accentText }}
                >
                  Engagement Model
                </span>
                <h2
                  className="text-3xl sm:text-4xl font-extrabold text-foreground mt-1 font-display"
                  style={{
                    fontFamily: portfolio.theme?.primaryFont
                      ? `"${portfolio.theme.primaryFont}", sans-serif`
                      : undefined,
                  }}
                >
                  Services & Deliverables
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {portfolio.services.map((service, idx) => (
                <ScrollReveal key={service.id || idx} animation="fade-up" delayMs={idx * 100}>
                  <PerspectiveTilt>
                    <GlassCard
                      intensity={service.popular ? 'ultra' : 'high'}
                      glow={service.popular}
                      className="flex flex-col justify-between p-7 space-y-6 relative h-full"
                      style={{
                        borderColor: service.popular ? tokens.badgeBorder : undefined,
                      }}
                    >
                      {service.popular && (
                        <div
                          className="absolute -top-3 right-6 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                          style={{
                            backgroundColor: tokens.btnBg,
                            color: tokens.btnText,
                            boxShadow: tokens.btnGlow,
                          }}
                        >
                          Most Popular
                        </div>
                      )}

                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xl font-bold text-foreground font-display">{service.title}</h3>
                          <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-2 leading-relaxed font-normal">{service.description}</p>
                        </div>

                        <div className="pt-2 border-t border-border">
                          <div
                            className="text-2xl font-black font-mono"
                            style={{ color: tokens.accentText }}
                          >
                            {service.priceFormatted}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-zinc-700 dark:text-zinc-300 mt-1 font-medium">
                            <Clock className="w-3.5 h-3.5" style={{ color: tokens.accent }} />
                            <span>Timeline: {service.deliveryTime}</span>
                          </div>
                        </div>

                        {service.features && service.features.length > 0 && (
                          <div className="space-y-2 pt-2">
                            {service.features.map((feat, fIdx) => (
                              <div key={fIdx} className="flex items-start gap-2 text-xs text-zinc-800 dark:text-zinc-200 font-medium">
                                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: tokens.accent }} />
                                <span>{feat}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        className="w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer"
                        style={{
                          backgroundColor: service.popular ? tokens.btnBg : 'transparent',
                          color: service.popular ? tokens.btnText : 'inherit',
                          border: service.popular ? 'none' : `1px solid ${tokens.badgeBorder}`,
                          boxShadow: service.popular ? tokens.btnGlow : 'none',
                        }}
                        onClick={() => {
                          setSelectedService(service);
                          const contactSection = document.getElementById('contact');
                          contactSection?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        {service.ctaText || 'Inquire Service'}
                      </button>
                    </GlassCard>
                  </PerspectiveTilt>
                </ScrollReveal>
              ))}
            </div>
          </section>
        )}

        {/* CONTACT & DIRECT INQUIRY SECTION */}
        <section id="contact" className="space-y-8">
          <ScrollReveal animation="fade-up">
            <div className="border-b border-border pb-4">
              <span
                className="text-xs font-mono uppercase tracking-widest font-bold"
                style={{ color: tokens.accentText }}
              >
                Direct Connection
              </span>
              <h2
                className="text-3xl sm:text-4xl font-extrabold text-foreground mt-1 font-display"
                style={{
                  fontFamily: portfolio.theme?.primaryFont
                    ? `"${portfolio.theme.primaryFont}", sans-serif`
                    : undefined,
                }}
              >
                Start a Conversation
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-6">
              <ScrollReveal animation="fade-up" delayMs={100}>
                <GlassCard intensity="high" className="p-6 space-y-4">
                  <h3 className="text-lg font-bold text-foreground font-display">Inquiry Channel</h3>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    Direct messages are delivered securely to {portfolio.displayName}&apos;s verified inbox.
                  </p>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-3 text-xs text-zinc-800 dark:text-zinc-200">
                      <div
                        className="w-8 h-8 rounded-xl border flex items-center justify-center"
                        style={{
                          backgroundColor: tokens.badgeBg,
                          borderColor: tokens.badgeBorder,
                          color: tokens.accent,
                        }}
                      >
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase text-zinc-500 dark:text-zinc-400 block">Direct Email</span>
                        <span className="font-bold text-foreground">{portfolio.emailContact}</span>
                      </div>
                    </div>

                    {portfolio.phoneContact && (
                      <div className="flex items-center gap-3 text-xs text-zinc-800 dark:text-zinc-200">
                        <div
                          className="w-8 h-8 rounded-xl border flex items-center justify-center"
                          style={{
                            backgroundColor: tokens.badgeBg,
                            borderColor: tokens.badgeBorder,
                            color: tokens.accent,
                          }}
                        >
                          <Phone className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono uppercase text-zinc-500 dark:text-zinc-400 block">Phone / WhatsApp</span>
                          <span className="font-bold text-foreground">{portfolio.phoneContact}</span>
                        </div>
                      </div>
                    )}

                    {portfolio.calendlyUrl && (
                      <div className="pt-2">
                        <a
                          href={portfolio.calendlyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-xs font-bold border transition-all"
                          style={{
                            backgroundColor: tokens.badgeBg,
                            borderColor: tokens.badgeBorder,
                            color: tokens.badgeText,
                          }}
                        >
                          <span className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> Schedule Call via Calendly
                          </span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                </GlassCard>
              </ScrollReveal>
            </div>

            <div className="lg:col-span-7">
              <ScrollReveal animation="fade-up" delayMs={200}>
                <GlassCard intensity="ultra" glow className="p-6 sm:p-8">
                  {submitSuccess ? (
                    <div className="py-8 text-center space-y-3">
                      <CheckCircle2
                        className="w-12 h-12 mx-auto"
                        style={{ color: tokens.accent }}
                      />
                      <h4 className="text-xl font-bold text-foreground">Message Dispatched</h4>
                      <p className="text-xs text-zinc-700 dark:text-zinc-300 max-w-sm mx-auto">
                        Thank you! Your message has been sent directly to {portfolio.displayName}. You will receive a response shortly.
                      </p>
                      <GlassButton
                        variant="glass"
                        size="sm"
                        onClick={() => setSubmitSuccess(false)}
                        className="mt-4"
                      >
                        Send Another Message
                      </GlassButton>
                    </div>
                  ) : (
                    <form onSubmit={handleInquirySubmit} className="space-y-4">
                      {selectedService && (
                        <div
                          className="p-3 rounded-xl border flex items-center justify-between text-xs font-bold"
                          style={{
                            backgroundColor: tokens.badgeBg,
                            borderColor: tokens.badgeBorder,
                            color: tokens.badgeText,
                          }}
                        >
                          <span>Selected Service: <strong>{selectedService.title}</strong></span>
                          <button
                            type="button"
                            onClick={() => setSelectedService(null)}
                            className="text-zinc-500 hover:text-foreground"
                          >
                            ✕ Clear
                          </button>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <GlassInput
                          label="Your Name"
                          placeholder="e.g. Alex Morgan"
                          value={senderName}
                          onChange={(e) => setSenderName(e.target.value)}
                          required
                        />
                        <GlassInput
                          label="Your Email"
                          type="email"
                          placeholder="alex@company.com"
                          value={senderEmail}
                          onChange={(e) => setSenderEmail(e.target.value)}
                          required
                        />
                      </div>

                      <GlassInput
                        label="Subject"
                        placeholder="e.g. New Project Inquiry"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                      />

                      <GlassTextarea
                        label="Message / Project Scope"
                        placeholder="Tell me about your project, timeline, and goals..."
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                      />

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 px-6 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-50"
                        style={{
                          backgroundColor: tokens.btnBg,
                          color: tokens.btnText,
                          boxShadow: tokens.btnGlow,
                        }}
                      >
                        <Send className="w-4 h-4" /> Send Direct Inquiry
                      </button>
                    </form>
                  )}
                </GlassCard>
              </ScrollReveal>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 relative z-10 text-center text-xs text-zinc-600 dark:text-zinc-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-medium">© {new Date().getFullYear()} {portfolio.displayName}. All rights reserved.</p>
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 hover:text-foreground transition-colors font-mono text-[11px] font-bold"
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: tokens.accent }} />
            <span>Powered by <strong>portfoli</strong></span>
          </a>
        </div>
      </footer>
    </div>
  );
}
