'use client';

import React, { useState, useEffect } from 'react';
import { SampleTemplateInfo, TemplateProjectPreview } from '@/lib/sample-templates';
import { motion, AnimatePresence } from '@/components/ui/motion-shim';
import { Sparkles, Layers, ArrowRight, Eye, ChevronRight } from 'lucide-react';

interface Props {
  template: SampleTemplateInfo;
  cardIndex: number;
  isPaused?: boolean;
}

export function TemplateCardPreview({ template, cardIndex, isPaused = false }: Props) {
  const [activeProjectIdx, setActiveProjectIdx] = useState(0);
  const projects = template.projects || [];
  const count = projects.length;

  // Stagger interval slightly based on cardIndex so cards don't all flip at the exact same millisecond
  const intervalMs = 2100 + (cardIndex % 3) * 300;

  useEffect(() => {
    if (count <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setActiveProjectIdx((prev) => (prev + 1) % count);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [count, intervalMs, isPaused]);

  const currentProj = projects[activeProjectIdx] || projects[0];

  if (!currentProj) return null;

  return (
    <div className="space-y-2.5">
      {/* Visual Showcase Box with Custom Motion Mode */}
      <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-black/80 border border-white/10 shadow-inner group/box">
        {/* Render specialized motion based on template.motionType */}
        {template.motionType === 'cube_3d' && (
          <div className="w-full h-full relative [perspective:1000px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentProj.id}
                initial={{ opacity: 0, rotateY: -70, scale: 0.9, z: -50 }}
                animate={{ opacity: 1, rotateY: 0, scale: 1, z: 0 }}
                exit={{ opacity: 0, rotateY: 70, scale: 0.9, z: -50 }}
                transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                className="w-full h-full relative"
              >
                <img
                  src={currentProj.image}
                  alt={currentProj.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {template.motionType === 'fluid_swipe' && (
          <div className="w-full h-full relative overflow-hidden">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={currentProj.id}
                initial={{ x: '100%', opacity: 0.8 }}
                animate={{ x: '0%', opacity: 1 }}
                exit={{ x: '-100%', opacity: 0.8 }}
                transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
                className="w-full h-full absolute inset-0"
              >
                <img
                  src={currentProj.image}
                  alt={currentProj.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {template.motionType === 'turntable_carousel' && (
          <div className="w-full h-full relative [perspective:900px] overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentProj.id}
                initial={{ opacity: 0, scale: 0.82, rotateY: 28, y: 15 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0, y: 0 }}
                exit={{ opacity: 0, scale: 0.82, rotateY: -28, y: -15 }}
                transition={{ duration: 0.8, ease: [0.2, 0.9, 0.3, 1] }}
                className="w-full h-full relative"
              >
                <img
                  src={currentProj.image}
                  alt={currentProj.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {template.motionType === 'bento_matrix' && (
          <div className="w-full h-full relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentProj.id}
                initial={{ opacity: 0, scale: 1.12, filter: 'blur(4px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                transition={{ duration: 0.65, ease: 'easeOut' }}
                className="w-full h-full relative"
              >
                <img
                  src={currentProj.image}
                  alt={currentProj.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {template.motionType === 'terminal_metric' && (
          <div className="w-full h-full relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentProj.id}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -30, scale: 0.95 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="w-full h-full relative"
              >
                <img
                  src={currentProj.image}
                  alt={currentProj.title}
                  className="w-full h-full object-cover grayscale contrast-125"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* Top Badges: Metric & Motion Mode */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none z-10">
          <span
            className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border shadow-sm backdrop-blur-md"
            style={{
              color: template.accentColor,
              borderColor: `${template.accentColor}50`,
              backgroundColor: 'rgba(0,0,0,0.6)',
            }}
          >
            {currentProj.metricBadge || template.motionBadge}
          </span>
          <span className="text-[10px] font-mono text-zinc-300 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10">
            {activeProjectIdx + 1}/{count}
          </span>
        </div>

        {/* Bottom Title & Category Overlay */}
        <div className="absolute bottom-2.5 inset-x-2.5 pointer-events-none z-10">
          <span className="text-[10px] font-mono text-zinc-400 block font-medium">
            {currentProj.category}
          </span>
          <h4 className="text-xs sm:text-sm font-bold text-white truncate font-display drop-shadow-md">
            {currentProj.title}
          </h4>
        </div>
      </div>

      {/* Slide Pagination Track with Mini Bars */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          {projects.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => setActiveProjectIdx(idx)}
              className="h-1.5 rounded-full transition-all duration-300 cursor-pointer"
              style={{
                width: activeProjectIdx === idx ? '20px' : '6px',
                backgroundColor:
                  activeProjectIdx === idx ? template.accentColor : 'rgba(255,255,255,0.2)',
                boxShadow:
                  activeProjectIdx === idx
                    ? `0 0 8px ${template.accentColor}`
                    : 'none',
              }}
              title={p.title}
            />
          ))}
        </div>
        <span className="text-[10px] font-mono text-zinc-500 font-medium">
          Auto-switching {template.motionBadge}
        </span>
      </div>
    </div>
  );
}
