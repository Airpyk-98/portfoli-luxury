'use client';

import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Film } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from '@/components/ui/motion-shim';

export interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  caption?: string;
  className?: string;
  compressed?: boolean;
}

export function VideoPlayer({
  src,
  poster,
  title,
  caption,
  className,
  compressed,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const [hasStarted, setHasStarted] = useState(false);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
      setHasStarted(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const total = videoRef.current.duration || 1;
    setProgress((current / total) * 100);
    setCurrentTime(formatTime(current));
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(formatTime(videoRef.current.duration));
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickPos = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = clickPos * (videoRef.current.duration || 0);
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  return (
    <div
      className={cn(
        'group relative rounded-2xl overflow-hidden bg-black/90 border border-emerald-500/20 shadow-glass transition-all duration-300 aspect-video flex items-center justify-center cursor-pointer select-none',
        className
      )}
      onClick={handleTogglePlay}
    >
      {/* Video Element - Strict autoPlay={false} */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={false}
        preload="metadata"
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        className="w-full h-full object-cover"
      />

      {/* High-End Cover Overlay (When not playing or paused) */}
      {!hasStarted && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/60 flex flex-col justify-between p-5 transition-opacity duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 backdrop-blur-md flex items-center gap-1">
                <Film className="w-3 h-3" /> Video Showcase
              </span>
              {compressed && (
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                  WebM HD
                </span>
              )}
            </div>
            <span className="text-xs font-mono text-zinc-300 bg-black/60 px-2 py-1 rounded-md border border-white/10">
              {duration !== '0:00' ? duration : 'Click to Play'}
            </span>
          </div>

          {/* Glowing Emerald Center Play Button */}
          <div className="self-center">
            <motion.div
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.95 }}
              className="w-16 h-16 rounded-full bg-emerald-500/90 text-black flex items-center justify-center shadow-glass-glow hover:bg-emerald-400 border border-emerald-300/60 transition-all duration-300 group-hover:scale-110"
            >
              <Play className="w-7 h-7 fill-black translate-x-0.5" />
            </motion.div>
          </div>

          <div>
            {title && <h4 className="text-base font-bold text-white mb-0.5 line-clamp-1">{title}</h4>}
            {caption && <p className="text-xs text-zinc-300 line-clamp-1">{caption}</p>}
          </div>
        </div>
      )}

      {/* In-Video Sleek Glass Controls (Visible on hover or pause when started) */}
      {hasStarted && (
        <div
          className={cn(
            'absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300',
            isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress Bar Scrubber */}
          <div
            className="w-full h-1.5 bg-white/20 hover:h-2.5 rounded-full cursor-pointer overflow-hidden transition-all mb-3 relative"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-white">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleTogglePlay}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-emerald-500 hover:text-black flex items-center justify-center transition-colors"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>
              <button
                type="button"
                onClick={handleToggleMute}
                className="text-zinc-300 hover:text-white transition-colors"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <span className="font-mono text-zinc-300 text-[11px]">
                {currentTime} / {duration}
              </span>
            </div>

            <button
              type="button"
              onClick={handleFullscreen}
              className="text-zinc-300 hover:text-emerald-400 transition-colors p-1"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
