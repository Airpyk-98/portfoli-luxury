'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SAMPLE_TEMPLATES, SampleTemplateInfo } from '@/lib/sample-templates';
import { TemplateCardPreview } from '@/components/displays/template-card-preview';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import {
  X,
  ExternalLink,
  Layers,
  Sparkles,
  Palette,
  Type,
  Layout,
  CheckCircle2,
  ArrowRight,
  Sliders,
  Eye,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from '@/components/ui/motion-shim';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function SamplePortfoliosModal({ isOpen, onClose }: Props) {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const filteredTemplates = SAMPLE_TEMPLATES.filter((t) => {
    if (selectedFilter === 'all') return true;
    return t.displayMode === selectedFilter;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-xl">
          {/* Backdrop dismiss */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-5xl max-h-[90vh] flex flex-col rounded-3xl bg-[#09100d] border border-emerald-500/40 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/10 bg-white/5 backdrop-blur-md">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-400 text-xs font-bold font-mono">
                  <Layers className="w-3.5 h-3.5" />
                  <span>PRESET TEMPLATES & LIVE SAMPLES</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white font-display">
                  Preview Sample Portfolios
                </h2>
                <p className="text-xs text-zinc-400 max-w-xl font-normal">
                  Explore bespoke design templates with distinct display optics, glowing accent palettes, and font pairings. All templates are 100% customizable in your editor.
                </p>
              </div>

              <button
                onClick={onClose}
                className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-all cursor-pointer border border-white/10"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Pills */}
            <div className="px-5 py-3 border-b border-white/10 bg-black/30 flex flex-wrap items-center gap-2 overflow-x-auto">
              <span className="text-xs font-mono text-zinc-400 font-bold mr-2">Filter Optics:</span>
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
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedFilter === f.id
                      ? 'bg-emerald-500 text-black shadow-glass-glow'
                      : 'bg-white/5 text-zinc-300 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Template Tiles Grid */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 max-h-[60vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-emerald-500/50 transition-all duration-300 space-y-4 flex flex-col justify-between group hover:shadow-glass-glow"
                  >
                    <div className="space-y-3.5">
                      {/* Top Row: Avatar & Identity */}
                      <div className="flex items-center gap-3.5">
                        <div
                          className="w-14 h-14 rounded-2xl overflow-hidden border-2 p-0.5 relative shrink-0 shadow-lg"
                          style={{ borderColor: template.accentColor }}
                        >
                          <img
                            src={template.avatarUrl}
                            alt={template.name}
                            className="w-full h-full object-cover rounded-[12px]"
                          />
                        </div>
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold text-white truncate font-display">
                              {template.name}
                            </h3>
                            <span
                              className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border uppercase"
                              style={{
                                color: template.accentColor,
                                borderColor: `${template.accentColor}40`,
                                backgroundColor: `${template.accentColor}15`,
                              }}
                            >
                              {template.themeName}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-300 font-medium truncate">{template.headline}</p>
                          <p className="text-[11px] text-zinc-500 font-mono">{template.location}</p>
                        </div>
                      </div>

                      {/* DYNAMIC LIVE MULTI-PROJECT PREVIEW */}
                      <TemplateCardPreview
                        template={template}
                        cardIndex={0}
                      />

                      {/* Template Specs */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                        <div className="p-2 rounded-lg bg-black/40 border border-white/5 space-y-1">
                          <span className="text-[10px] text-zinc-400 block font-sans">Display Mode</span>
                          <span className="font-bold text-white flex items-center gap-1.5 truncate">
                            <Layout className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            {template.displayModeLabel}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-black/40 border border-white/5 space-y-1">
                          <span className="text-[10px] text-zinc-400 block font-sans">Font Pairing</span>
                          <span className="font-bold text-white flex items-center gap-1.5 truncate">
                            <Type className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            {template.primaryFont} + {template.secondaryFont}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 flex items-center gap-3">
                      <Link
                        href={`/${template.username}`}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-glass-glow"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Launch Live Portfolio</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        href={`/register?template=${template.username}`}
                        className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-bold transition-all"
                        title="Use this layout as starting template"
                      >
                        Use Preset
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Customization Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-teal-950/50 to-emerald-950/70 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <div className="space-y-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold text-emerald-300">
                    <Sliders className="w-4 h-4 text-[#00FF87]" />
                    <span>Total Creative Freedom & Live Studio Editor</span>
                  </div>
                  <p className="text-xs text-zinc-300 font-normal">
                    You are never locked into a single look. Change accent glows, display optics, fonts, and order anytime with live preview.
                  </p>
                </div>
                <Link href="/register">
                  <GlassButton variant="primary" size="sm" glow className="whitespace-nowrap text-xs font-bold px-5">
                    Build Your Portfolio Now
                  </GlassButton>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
