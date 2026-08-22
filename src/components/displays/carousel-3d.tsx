'use client';

import React, { useState } from 'react';
import { ProjectItem } from '@/lib/types';
import { VideoPlayer } from '@/components/media/video-player';
import { ChevronLeft, ChevronRight, ExternalLink, Sparkles } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { motion, AnimatePresence } from '@/components/ui/motion-shim';
import { getPaletteTokens } from '@/lib/color-tokens';

const EASE_CINEMATIC_OUT = [0.16, 1, 0.3, 1] as const;
const EASE_CINEMATIC_IN = [0.7, 0, 0.84, 0] as const;

export function Carousel3DDisplay({
  projects,
  accentColor = '#00FF87',
  isDark = true,
}: {
  projects: ProjectItem[];
  accentColor?: string;
  isDark?: boolean;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const tokens = getPaletteTokens(accentColor, isDark);

  if (!projects || projects.length === 0) {
    return (
      <div className="py-12 text-center text-zinc-600 dark:text-zinc-400">
        <Sparkles className="w-8 h-8 mx-auto opacity-50 mb-2" style={{ color: tokens.accent }} />
        <p>No projects featured yet.</p>
      </div>
    );
  }

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? projects.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === projects.length - 1 ? 0 : prev + 1));
  };

  const currentProject = projects[currentIndex];
  const heroMedia = currentProject?.media?.[0];

  return (
    <div className="space-y-6">
      {/* 3D Carousel Stage */}
      <div className="relative max-w-4xl mx-auto overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentProject.id}
            custom={direction}
            initial={{ opacity: 0, scale: 0.94, x: direction * 40, filter: 'blur(6px)' }}
            animate={{ opacity: 1, scale: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.96, x: direction * -30, filter: 'blur(4px)' }}
            transition={{
              duration: 0.55,
              ease: EASE_CINEMATIC_OUT,
            }}
          >
            <GlassCard
              intensity="ultra"
              glow
              className="p-6 sm:p-8 space-y-6"
              style={{ borderColor: tokens.badgeBorder }}
            >
              {/* Media Player / Image */}
              <div
                className="rounded-2xl overflow-hidden aspect-video bg-black/5 dark:bg-black/80 border shadow-glass-glow"
                style={{ borderColor: tokens.badgeBorder }}
              >
                {heroMedia ? (
                  heroMedia.type === 'video' ? (
                    <VideoPlayer
                      src={heroMedia.url}
                      title={heroMedia.title || currentProject.title}
                      caption={heroMedia.caption}
                      compressed={heroMedia.compressed}
                      className="w-full h-full"
                    />
                  ) : (
                    <img
                      src={heroMedia.url}
                      alt={heroMedia.title || currentProject.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (heroMedia.originalName && !target.src.includes('/uploads/')) {
                          target.src = `/uploads/images/${heroMedia.originalName}`;
                        }
                      }}
                    />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-zinc-500">
                    No Media Loaded
                  </div>
                )}
              </div>

              {/* Project Meta Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span
                    className="text-[10px] font-mono uppercase tracking-widest font-bold px-2.5 py-1 rounded border"
                    style={{
                      color: tokens.badgeText,
                      backgroundColor: tokens.badgeBg,
                      borderColor: tokens.badgeBorder,
                    }}
                  >
                    {currentProject.category || 'Featured'}
                  </span>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400 font-mono font-bold">
                    {currentIndex + 1} / {projects.length}
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground font-display">
                    {currentProject.title}
                  </h3>
                  <p className="text-sm text-zinc-700 dark:text-zinc-200 mt-2 font-normal leading-relaxed">
                    {currentProject.description}
                  </p>
                </div>

                {currentProject.tags && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {currentProject.tags.map((t, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50/80 dark:bg-white/5 border border-emerald-200 dark:border-white/10 text-zinc-900 dark:text-zinc-100"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <div className="text-xs text-zinc-600 dark:text-zinc-400 font-mono">
                    Client: <span className="font-bold text-foreground">{currentProject.client || 'Proprietary'}</span>
                  </div>

                  {currentProject.liveUrl && (
                    <a
                      href={currentProject.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                      style={{
                        backgroundColor: tokens.btnBg,
                        color: tokens.btnText,
                        boxShadow: tokens.btnGlow,
                      }}
                    >
                      <span>Explore Project</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Carousel Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={handlePrev}
          className="p-3 rounded-2xl bg-white dark:bg-[#0a120e] border border-border text-foreground hover:bg-emerald-500 hover:text-white dark:hover:text-black transition-colors cursor-pointer shadow-sm"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          {projects.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > currentIndex ? 1 : -1);
                setCurrentIndex(i);
              }}
              className="h-2 rounded-full transition-all duration-300 cursor-pointer"
              style={{
                width: currentIndex === i ? '24px' : '8px',
                backgroundColor: currentIndex === i ? tokens.accent : '#94a3b8',
                boxShadow: currentIndex === i ? `0 0 10px ${tokens.accent}` : undefined,
              }}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="p-3 rounded-2xl bg-white dark:bg-[#0a120e] border border-border text-foreground hover:bg-emerald-500 hover:text-white dark:hover:text-black transition-colors cursor-pointer shadow-sm"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
