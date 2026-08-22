'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { SAMPLE_TEMPLATES, SampleTemplateInfo } from '@/lib/sample-templates';
import { TemplateCardPreview } from '@/components/displays/template-card-preview';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import {
  Layers,
  ChevronLeft,
  ChevronRight,
  Eye,
  Layout,
  Type,
  Sliders,
  Sparkles,
  Play,
  Pause,
} from 'lucide-react';
import { ScrollReveal, PerspectiveTilt } from '@/components/ui/kinetic-motion';

export function HomeTemplateCarousel() {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  const filteredTemplates = SAMPLE_TEMPLATES.filter((t) => {
    if (selectedFilter === 'all') return true;
    return t.displayMode === selectedFilter;
  });

  const total = filteredTemplates.length;

  // Reset index if filter changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedFilter]);

  // Master 2-second continuous sliding loop
  useEffect(() => {
    if (!isAutoPlay || isHovered || total <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 2800);

    return () => clearInterval(interval);
  }, [isAutoPlay, isHovered, total]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  // Re-order templates to create a seamless circular window
  const getVisibleTemplates = () => {
    if (total === 0) return [];
    if (total === 1) return [filteredTemplates[0]];

    // Create a 3-item window that wraps around infinitely
    const items: { template: SampleTemplateInfo; index: number }[] = [];
    for (let i = 0; i < Math.min(3, total); i++) {
      const idx = (currentIndex + i) % total;
      items.push({ template: filteredTemplates[idx], index: idx });
    }
    return items;
  };

  const visibleTemplates = getVisibleTemplates();

  return (
    <section
      id="templates"
      className="max-w-6xl mx-auto px-4 sm:px-6 pb-28 relative z-10 space-y-10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <ScrollReveal animation="fade-up">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-400/40 text-emerald-800 dark:text-[#00FF87] text-xs font-mono font-bold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>5 BESPOKE DESIGN PRESETS IN CONTINUOUS MOTION</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground font-display">
            Unique Portfolios for Every Discipline
          </h2>
          <p className="text-sm sm:text-base text-zinc-700 dark:text-zinc-300 max-w-2xl mx-auto font-normal">
            Watch the live carousel transition through 3D Crystal Prisms, fluid side-swipes, and turntable optics. Every card dynamically rotates through real projects with smooth ease physics.
          </p>
        </div>
      </ScrollReveal>

      {/* Filter Tabs & Playback Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border pb-4">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {[
            { id: 'all', label: 'All Templates (5)' },
            { id: 'crystal_prism', label: '3D Crystal Prism' },
            { id: 'side_swipe', label: 'Fluid Side-Swipe' },
            { id: 'carousel_3d', label: '3D Carousel' },
            { id: 'bento_grid', label: 'Editorial Bento Grid' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedFilter === f.id
                  ? 'bg-emerald-500 text-black shadow-glass-glow'
                  : 'bg-card-bg text-foreground hover:bg-black/5 dark:hover:bg-white/10 border border-border'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Carousel Navigation Chevrons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            className="p-2 rounded-xl bg-card-bg border border-border text-zinc-700 dark:text-zinc-300 hover:text-emerald-500 transition-colors cursor-pointer text-xs font-mono flex items-center gap-1.5"
            title={isAutoPlay ? 'Pause Auto-slide' : 'Resume Auto-slide'}
          >
            {isAutoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-500" />}
            <span className="hidden xs:inline">{isAutoPlay ? 'Auto' : 'Paused'}</span>
          </button>

          <button
            onClick={handlePrev}
            className="p-2 rounded-xl bg-card-bg border border-border hover:border-emerald-500 text-foreground transition-all cursor-pointer shadow-sm hover:shadow-glass-glow"
            aria-label="Previous template"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={handleNext}
            className="p-2 rounded-xl bg-card-bg border border-border hover:border-emerald-500 text-foreground transition-all cursor-pointer shadow-sm hover:shadow-glass-glow"
            aria-label="Next template"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3-Card Carousel Stage with Continuous Eased Slide Transitions */}
      <div className="relative overflow-hidden py-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]">
          {visibleTemplates.map(({ template, index }) => (
            <div
              key={`${template.id}_${index}`}
              className="h-full transition-all duration-500"
            >
              <PerspectiveTilt>
                <GlassCard
                  intensity="high"
                  className="p-5 space-y-4 h-full flex flex-col justify-between group hover:border-emerald-500/50 transition-all duration-300 shadow-glass-glow-lg"
                >
                  <div className="space-y-3.5">
                    {/* Top Row: Avatar & Identity */}
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl overflow-hidden border-2 p-0.5 relative shrink-0 shadow-md transition-transform duration-300 group-hover:scale-105"
                        style={{ borderColor: template.accentColor }}
                      >
                        <img
                          src={template.avatarUrl}
                          alt={template.name}
                          className="w-full h-full object-cover rounded-[10px]"
                        />
                      </div>
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-bold text-foreground truncate font-display">
                            {template.name}
                          </h3>
                          <span
                            className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border uppercase shrink-0"
                            style={{
                              color: template.accentColor,
                              borderColor: `${template.accentColor}40`,
                              backgroundColor: `${template.accentColor}15`,
                            }}
                          >
                            {template.themeName}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-300 font-medium truncate">
                          {template.headline}
                        </p>
                      </div>
                    </div>

                    {/* DYNAMIC LIVE MULTI-PROJECT PREVIEW (3D Cube, Fluid Swipe, Turntable) */}
                    <TemplateCardPreview
                      template={template}
                      cardIndex={index}
                      isPaused={isHovered}
                    />

                    {/* Template Specs: Display Mode & Font System */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                      <div className="p-2 rounded-lg bg-black/5 dark:bg-black/40 border border-border space-y-0.5">
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block font-sans">
                          Display Mode
                        </span>
                        <span className="font-bold text-foreground flex items-center gap-1.5 truncate">
                          <Layout className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          {template.displayModeLabel}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-black/5 dark:bg-black/40 border border-border space-y-0.5">
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block font-sans">
                          Font System
                        </span>
                        <span className="font-bold text-foreground flex items-center gap-1.5 truncate">
                          <Type className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                          {template.primaryFont}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center gap-2">
                    <Link
                      href={`/${template.username}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-glass-glow"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Launch Live Portfolio</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                    <Link
                      href={`/register?template=${template.username}`}
                      className="px-3.5 py-2.5 rounded-xl bg-card-bg hover:bg-black/5 dark:hover:bg-white/10 border border-border text-foreground text-xs font-bold transition-all"
                    >
                      Use
                    </Link>
                  </div>
                </GlassCard>
              </PerspectiveTilt>
            </div>
          ))}
        </div>
      </div>

      {/* Carousel Progress Indicators */}
      <div className="flex items-center justify-center gap-2 pt-2">
        {filteredTemplates.map((t, idx) => (
          <button
            key={t.id}
            onClick={() => setCurrentIndex(idx)}
            className="h-2 rounded-full transition-all duration-500 cursor-pointer"
            style={{
              width: currentIndex === idx ? '28px' : '8px',
              backgroundColor:
                currentIndex === idx ? '#00FF87' : 'rgba(255,255,255,0.2)',
              boxShadow:
                currentIndex === idx ? '0 0 10px rgba(0,255,135,0.6)' : 'none',
            }}
            title={t.name}
          />
        ))}
      </div>

      {/* Customization Banner */}
      <ScrollReveal animation="fade-up">
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-glass-glow">
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-sm font-bold text-emerald-700 dark:text-[#00FF87]">
              <Sliders className="w-4 h-4" />
              <span>Fully Modular & 100% Customizable in Studio Editor</span>
            </div>
            <p className="text-xs text-zinc-700 dark:text-zinc-300 font-normal max-w-2xl">
              Every preset is a live demonstration of what is possible. In your personal Studio Editor, switch display optics, color glows, fonts, and video layouts instantly with 1 click.
            </p>
          </div>
          <Link href="/register">
            <GlassButton variant="primary" size="md" glow className="whitespace-nowrap text-xs font-bold px-6">
              Create Your Custom Portfolio <ChevronRight className="w-4 h-4 ml-1" />
            </GlassButton>
          </Link>
        </div>
      </ScrollReveal>
    </section>
  );
}
