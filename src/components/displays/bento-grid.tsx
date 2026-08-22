'use client';

import React from 'react';
import { ProjectItem } from '@/lib/types';
import { VideoPlayer } from '@/components/media/video-player';
import { ExternalLink, Sparkles } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { motion } from '@/components/ui/motion-shim';
import { cn } from '@/lib/utils';
import { getPaletteTokens } from '@/lib/color-tokens';

const EASE_CINEMATIC_OUT = [0.16, 1, 0.3, 1] as const;

export function BentoGridDisplay({
  projects,
  accentColor = '#00FF87',
  isDark = true,
}: {
  projects: ProjectItem[];
  accentColor?: string;
  isDark?: boolean;
}) {
  const tokens = getPaletteTokens(accentColor, isDark);

  if (!projects || projects.length === 0) {
    return (
      <div className="py-12 text-center text-zinc-600 dark:text-zinc-400">
        <Sparkles className="w-8 h-8 mx-auto opacity-50 mb-2" style={{ color: tokens.accent }} />
        <p>No projects featured yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((proj, idx) => {
        const isFeatured = proj.featured || idx === 0;
        const heroMedia = proj.media?.[0];

        return (
          <motion.div
            key={proj.id || idx}
            initial={{ opacity: 0, y: 30, scale: 0.96, filter: 'blur(5px)' }}
            whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{
              duration: 0.7,
              delay: idx * 0.08,
              ease: EASE_CINEMATIC_OUT,
            }}
            className={cn(isFeatured ? 'md:col-span-2 lg:col-span-2' : 'col-span-1')}
          >
            <GlassCard
              intensity={isFeatured ? 'ultra' : 'high'}
              glow={isFeatured}
              className="h-full flex flex-col justify-between p-6 space-y-4 group"
              style={{
                borderColor: isFeatured ? tokens.badgeBorder : undefined,
              }}
            >
              <div className="space-y-4">
                {/* Media Item */}
                <div
                  className="rounded-xl overflow-hidden aspect-video bg-black/5 dark:bg-black/80 border"
                  style={{ borderColor: tokens.badgeBorder }}
                >
                  {heroMedia ? (
                    heroMedia.type === 'video' ? (
                      <VideoPlayer
                        src={heroMedia.url}
                        title={heroMedia.title || proj.title}
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
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span
                      className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border"
                      style={{
                        color: tokens.badgeText,
                        backgroundColor: tokens.badgeBg,
                        borderColor: tokens.badgeBorder,
                      }}
                    >
                      {proj.category || 'Project'}
                    </span>
                    {proj.date && <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 font-medium">{proj.date}</span>}
                  </div>
                  <h3 className="text-xl font-bold text-foreground transition-colors font-display">
                    {proj.title}
                  </h3>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 line-clamp-2 mt-1.5 leading-relaxed font-normal">
                    {proj.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between">
                <span className="text-xs text-zinc-600 dark:text-zinc-400 font-mono font-medium">
                  {proj.client || 'Client Work'}
                </span>

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
                    <span>Inspect</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </GlassCard>
          </motion.div>
        );
      })}
    </div>
  );
}
