'use client';

import React, { useState } from 'react';
import { ProjectItem, MediaItem } from '@/lib/types';
import { motion, AnimatePresence } from '@/components/ui/motion-shim';
import { VideoPlayer } from '@/components/media/video-player';
import { Sparkles, Maximize2, X, ExternalLink } from 'lucide-react';
import { GithubIcon } from '@/components/ui/icons';
import { GlassCard } from '@/components/ui/glass-card';
import { cn } from '@/lib/utils';
import { getPaletteTokens } from '@/lib/color-tokens';

export function CrystalPrismDisplay({
  projects,
  accentColor = '#00FF87',
  isDark = true,
}: {
  projects: ProjectItem[];
  accentColor?: string;
  isDark?: boolean;
}) {
  const [activeProject, setActiveProject] = useState<ProjectItem>(projects[0] || null);
  const [activeMediaIndex, setActiveMediaIndex] = useState<number>(0);
  const [selectedMediaModal, setSelectedMediaModal] = useState<MediaItem | null>(null);

  const tokens = getPaletteTokens(accentColor, isDark);

  if (!projects || projects.length === 0) {
    return (
      <div className="py-12 text-center text-zinc-600 dark:text-zinc-400">
        <Sparkles className="w-8 h-8 mx-auto opacity-50 mb-2" style={{ color: tokens.accent }} />
        <p>No projects featured yet.</p>
      </div>
    );
  }

  const currentMedia = activeProject?.media || [];

  return (
    <div className="space-y-8">
      {/* Prism Project Switcher Ribbons */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
        {projects.map((proj) => {
          const isSelected = activeProject?.id === proj.id;
          return (
            <button
              key={proj.id}
              onClick={() => {
                setActiveProject(proj);
                setActiveMediaIndex(0);
              }}
              className="px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-300 backdrop-blur-xl border flex items-center gap-2 cursor-pointer"
              style={{
                backgroundColor: isSelected ? tokens.badgeBg : undefined,
                borderColor: isSelected ? tokens.badgeBorder : undefined,
                color: isSelected ? tokens.accentText : undefined,
                boxShadow: isSelected ? tokens.btnGlow : undefined,
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: isSelected ? tokens.accent : '#94a3b8',
                  boxShadow: isSelected ? `0 0 8px ${tokens.accent}` : undefined,
                }}
              />
              <span>{proj.title}</span>
              <span className="text-[10px] opacity-75 font-mono">({proj.media?.length || 0})</span>
            </button>
          );
        })}
      </div>

      {/* 3D Crystal Prism Core Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Active Prism Facet Showcase */}
        <div className="lg:col-span-8 relative">
          <div
            className="relative rounded-3xl p-1 shadow-glass-glow-lg overflow-hidden transition-all duration-500"
            style={{
              background: `linear-gradient(135deg, ${tokens.accent}, rgba(255,255,255,0.1), ${tokens.borderGlow})`,
              boxShadow: tokens.btnGlow,
            }}
          >
            {/* Specular Prism Light Refraction Layer */}
            <div
              className="absolute inset-0 pointer-events-none opacity-40"
              style={{
                background: `radial-gradient(ellipse at top right, ${tokens.accent}, transparent 65%)`,
              }}
            />

            <div className="relative bg-white dark:bg-[#080d0a]/95 rounded-[22px] overflow-hidden p-4 sm:p-6 backdrop-blur-3xl border border-border">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeProject.id}-${activeMediaIndex}`}
                  initial={{ opacity: 0, scale: 0.96, rotateY: -8 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  exit={{ opacity: 0, scale: 0.98, rotateY: 8 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-4"
                >
                  {/* Media Rendering */}
                  {currentMedia[activeMediaIndex] ? (
                    currentMedia[activeMediaIndex].type === 'video' ? (
                      <VideoPlayer
                        src={currentMedia[activeMediaIndex].url}
                        title={currentMedia[activeMediaIndex].title || activeProject.title}
                        caption={currentMedia[activeMediaIndex].caption}
                        compressed={currentMedia[activeMediaIndex].compressed}
                        className="w-full aspect-video rounded-2xl"
                      />
                    ) : (
                      <div
                        className="relative group rounded-2xl overflow-hidden aspect-video bg-black/5 dark:bg-black/60 border cursor-pointer"
                        style={{ borderColor: tokens.badgeBorder }}
                        onClick={() => setSelectedMediaModal(currentMedia[activeMediaIndex])}
                      >
                        <img
                          src={currentMedia[activeMediaIndex].url}
                          alt={currentMedia[activeMediaIndex].title || activeProject.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (currentMedia[activeMediaIndex]?.originalName && !target.src.includes('/uploads/')) {
                              target.src = `/uploads/images/${currentMedia[activeMediaIndex].originalName}`;
                            }
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4">
                          <span className="text-xs font-bold text-white">Click to expand</span>
                          <Maximize2 className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="aspect-video rounded-2xl bg-black/5 dark:bg-black/40 border border-border flex items-center justify-center text-zinc-500 text-xs">
                      No media attached to this project facet.
                    </div>
                  )}

                  {/* Multifaceted Media Carousel Strip */}
                  {currentMedia.length > 1 && (
                    <div className="flex items-center gap-3 overflow-x-auto pb-1 pt-1">
                      {currentMedia.map((m, idx) => (
                        <button
                          key={m.id || idx}
                          onClick={() => setActiveMediaIndex(idx)}
                          className={cn(
                            'relative rounded-xl overflow-hidden aspect-video w-24 flex-shrink-0 border-2 transition-all duration-200 cursor-pointer',
                            activeMediaIndex === idx
                              ? 'scale-105'
                              : 'opacity-60 hover:opacity-100'
                          )}
                          style={{
                            borderColor: activeMediaIndex === idx ? tokens.accent : 'transparent',
                            boxShadow: activeMediaIndex === idx ? tokens.btnGlow : undefined,
                          }}
                        >
                          {m.type === 'video' ? (
                            <div className="w-full h-full bg-black/80 text-[10px] text-white flex items-center justify-center font-mono">
                              ▶ VIDEO
                            </div>
                          ) : (
                            <img
                              src={m.url}
                              alt=""
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.currentTarget;
                                if (m.originalName && !target.src.includes('/uploads/')) {
                                  target.src = `/uploads/images/${m.originalName}`;
                                }
                              }}
                            />
                          )}
                          <span className="absolute bottom-1 right-1 px-1 rounded bg-black/80 text-[9px] text-white font-mono">
                            {idx + 1}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right: Project Narrative & Crystal Specs */}
        <div className="lg:col-span-4 space-y-6">
          <GlassCard intensity="high" className="space-y-5">
            <div>
              <span
                className="text-[10px] font-mono uppercase tracking-widest font-bold px-2.5 py-1 rounded-md border"
                style={{
                  color: tokens.badgeText,
                  backgroundColor: tokens.badgeBg,
                  borderColor: tokens.badgeBorder,
                }}
              >
                {activeProject.category || 'Featured Showcase'}
              </span>
              <h3 className="text-2xl font-extrabold text-foreground mt-3 font-display">
                {activeProject.title}
              </h3>
              <p className="text-sm text-zinc-700 dark:text-zinc-200 leading-relaxed mt-2.5 font-normal">
                {activeProject.description}
              </p>
            </div>

            {/* Tags / Stack */}
            {activeProject.tags && activeProject.tags.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 font-bold">
                  Tech Stack & Optics
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeProject.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50/80 dark:bg-white/5 border border-emerald-200 dark:border-white/10 text-zinc-900 dark:text-zinc-100"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Client & Date */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border text-xs">
              <div>
                <span className="text-zinc-500 dark:text-zinc-400 block text-[10px] uppercase font-mono font-bold">Client</span>
                <span className="font-bold text-foreground">{activeProject.client || 'Proprietary'}</span>
              </div>
              <div>
                <span className="text-zinc-500 dark:text-zinc-400 block text-[10px] uppercase font-mono font-bold">Year</span>
                <span className="font-bold text-foreground">{activeProject.date || '2026'}</span>
              </div>
            </div>

            {/* External Links */}
            <div className="flex items-center gap-3 pt-2">
              {activeProject.liveUrl && (
                <a
                  href={activeProject.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200"
                  style={{
                    backgroundColor: tokens.btnBg,
                    color: tokens.btnText,
                    boxShadow: tokens.btnGlow,
                  }}
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View Live Project
                </a>
              )}
              {activeProject.githubUrl && (
                <a
                  href={activeProject.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-white dark:bg-[#0e1713] border border-border hover:border-emerald-500 text-zinc-900 dark:text-zinc-100 transition-all"
                  title="Source Code"
                >
                  <GithubIcon className="w-4 h-4 text-current" />
                </a>
              )}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Expanded Modal */}
      {selectedMediaModal && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
          onClick={() => setSelectedMediaModal(null)}
        >
          <div
            className="relative max-w-5xl w-full bg-zinc-950 rounded-3xl overflow-hidden border p-2"
            style={{ borderColor: tokens.badgeBorder }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedMediaModal(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedMediaModal.url}
              alt={selectedMediaModal.title || ''}
              className="w-full max-h-[80vh] object-contain rounded-2xl"
              onError={(e) => {
                const target = e.currentTarget;
                if (selectedMediaModal.originalName && !target.src.includes('/uploads/')) {
                  target.src = `/uploads/images/${selectedMediaModal.originalName}`;
                }
              }}
            />
            {selectedMediaModal.title && (
              <div className="p-4 text-center">
                <h4 className="text-sm font-bold text-white">{selectedMediaModal.title}</h4>
                {selectedMediaModal.caption && (
                  <p className="text-xs text-zinc-400 mt-1">{selectedMediaModal.caption}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
