'use client';

import React, { useRef } from 'react';
import { ProjectItem } from '@/lib/types';
import { VideoPlayer } from '@/components/media/video-player';
import { ChevronLeft, ChevronRight, ExternalLink, Sparkles } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { motion } from '@/components/ui/motion-shim';
import { getPaletteTokens } from '@/lib/color-tokens';

const EASE_CINEMATIC_OUT = [0.16, 1, 0.3, 1] as const;

export function SideSwipeCardsDisplay({
  projects,
  accentColor = '#00FF87',
  isDark = true,
}: {
  projects: ProjectItem[];
  accentColor?: string;
  isDark?: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const tokens = getPaletteTokens(accentColor, isDark);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const offset = direction === 'left' ? -420 : 420;
    scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  if (!projects || projects.length === 0) {
    return (
      <div className="py-12 text-center text-zinc-600 dark:text-zinc-400">
        <Sparkles className="w-8 h-8 mx-auto opacity-50 mb-2" style={{ color: tokens.accent }} />
        <p>No projects featured yet.</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-4">
      {/* Navigation Controls */}
      <div className="flex items-center justify-between px-2">
        <span
          className="text-xs font-mono uppercase tracking-wider font-bold"
          style={{ color: tokens.accentText }}
        >
          Horizontal Swipe Stream
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleScroll('left')}
            className="w-9 h-9 rounded-xl bg-white dark:bg-[#0a120e]/80 border border-border text-foreground flex items-center justify-center transition-colors cursor-pointer shadow-sm hover:border-emerald-500"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="w-9 h-9 rounded-xl bg-white dark:bg-[#0a120e]/80 border border-border text-foreground flex items-center justify-center transition-colors cursor-pointer shadow-sm hover:border-emerald-500"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scrolling Card Track */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-6 pt-2 px-2 scroll-smooth snap-x snap-mandatory scrollbar-none"
      >
        {projects.map((proj, idx) => {
          const heroMedia = proj.media?.[0];

          return (
            <motion.div
              key={proj.id || idx}
              initial={{ opacity: 0, x: 45, filter: 'blur(6px)', scale: 0.96 }}
              whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)', scale: 1 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.65, delay: idx * 0.08, ease: EASE_CINEMATIC_OUT }}
              className="snap-center flex-shrink-0 w-[340px] sm:w-[420px]"
            >
              <GlassCard intensity="high" className="h-full flex flex-col justify-between p-6 space-y-4 group">
                <div className="space-y-4">
                  {/* Media Container */}
                  <div className="relative rounded-2xl overflow-hidden aspect-video bg-black/5 dark:bg-black/60 border border-border">
                    {heroMedia ? (
                      heroMedia.type === 'video' ? (
                        <VideoPlayer
                          src={heroMedia.url}
                          title={proj.title}
                          caption={heroMedia.caption}
                          compressed={heroMedia.compressed}
                          className="w-full h-full"
                        />
                      ) : (
                        <img
                          src={heroMedia.url}
                          alt={proj.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
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
                        No Media Preview
                      </div>
                    )}
                  </div>

                  <div>
                    <span
                      className="text-[10px] font-mono uppercase tracking-widest font-bold px-2 py-0.5 rounded border"
                      style={{
                        color: tokens.badgeText,
                        backgroundColor: tokens.badgeBg,
                        borderColor: tokens.badgeBorder,
                      }}
                    >
                      {proj.category || 'Featured'}
                    </span>
                    <h3 className="text-xl font-bold text-foreground mt-2 font-display">{proj.title}</h3>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-2 line-clamp-3 leading-relaxed font-normal">
                      {proj.description}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <div className="text-xs text-zinc-600 dark:text-zinc-400 font-mono">
                    <span>{proj.client || 'Client Work'}</span> • <span>{proj.date || '2026'}</span>
                  </div>

                  {proj.liveUrl && (
                    <a
                      href={proj.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 hover:scale-105"
                      style={{
                        backgroundColor: tokens.btnBg,
                        color: tokens.btnText,
                        boxShadow: tokens.btnGlow,
                      }}
                    >
                      <span>Explore</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
