'use client';

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence, type Transition } from 'framer-motion';
import { cn } from '@/lib/utils';

// Luxury easing curves
export const EASE_CINEMATIC_OUT = [0.16, 1, 0.3, 1] as const;
export const EASE_CINEMATIC_IN = [0.7, 0, 0.84, 0] as const;
export const EASE_CINEMATIC_IN_OUT = [0.65, 0, 0.35, 1] as const;
export const EASE_SPRING = { type: 'spring', stiffness: 240, damping: 22, mass: 0.8 } as const;
export const EASE_SPRING_SOFT = { type: 'spring', stiffness: 160, damping: 20, mass: 1 } as const;

/**
 * High-performance kinetic typographic intro animation.
 * Splits text into staggered words with blur-to-focus and glowing ascent.
 */
export function KineticTypography({
  text,
  className,
  delayMs = 0,
  staggerMs = 45,
  as: Component = 'h1',
  style,
}: {
  text: string;
  className?: string;
  delayMs?: number;
  staggerMs?: number;
  variant?: 'fade-up' | 'split-word' | 'stagger-glow' | 'blur-in';
  as?: React.ElementType;
  style?: React.CSSProperties;
}) {
  const words = text.split(' ');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: delayMs / 1000,
        staggerChildren: staggerMs / 1000,
      },
    },
  };

  const wordVariants = {
    hidden: {
      opacity: 0,
      y: 28,
      filter: 'blur(8px)',
      scale: 0.96,
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      scale: 1,
      transition: {
        duration: 0.75,
        ease: EASE_CINEMATIC_OUT,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn('inline-flex flex-wrap gap-x-[0.28em] gap-y-1 justify-center', className)}
      style={style}
    >
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden py-1">
          <motion.span
            variants={wordVariants}
            className="inline-block transform-gpu"
          >
            {word}
          </motion.span>
        </span>
      ))}
    </motion.div>
  );
}

/**
 * Scroll-driven section & element reveal with entrance and exit viewport tracking
 * and velocity-matched easing curves.
 */
export function ScrollReveal({
  children,
  className,
  animation = 'fade-up',
  delayMs = 0,
  threshold = 0.15,
  once = false,
}: {
  children: React.ReactNode;
  className?: string;
  animation?: 'fade-up' | 'fade-in' | 'slide-left' | 'slide-right' | 'scale-up' | 'prism-fold';
  delayMs?: number;
  threshold?: number;
  once?: boolean;
}) {
  const variants = {
    'fade-up': {
      hidden: {
        opacity: 0,
        y: 36,
        scale: 0.97,
        filter: 'blur(4px)',
      },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        transition: {
          duration: 0.85,
          delay: delayMs / 1000,
          ease: EASE_CINEMATIC_OUT,
        },
      },
      exit: {
        opacity: 0,
        y: -20,
        scale: 0.98,
        filter: 'blur(3px)',
        transition: {
          duration: 0.5,
          ease: EASE_CINEMATIC_IN,
        },
      },
    },
    'fade-in': {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          duration: 0.7,
          delay: delayMs / 1000,
          ease: EASE_CINEMATIC_OUT,
        },
      },
      exit: {
        opacity: 0,
        transition: { duration: 0.4, ease: EASE_CINEMATIC_IN },
      },
    },
    'slide-left': {
      hidden: { opacity: 0, x: 40, filter: 'blur(4px)' },
      visible: {
        opacity: 1,
        x: 0,
        filter: 'blur(0px)',
        transition: {
          duration: 0.8,
          delay: delayMs / 1000,
          ease: EASE_CINEMATIC_OUT,
        },
      },
      exit: {
        opacity: 0,
        x: -30,
        filter: 'blur(3px)',
        transition: { duration: 0.45, ease: EASE_CINEMATIC_IN },
      },
    },
    'slide-right': {
      hidden: { opacity: 0, x: -40, filter: 'blur(4px)' },
      visible: {
        opacity: 1,
        x: 0,
        filter: 'blur(0px)',
        transition: {
          duration: 0.8,
          delay: delayMs / 1000,
          ease: EASE_CINEMATIC_OUT,
        },
      },
      exit: {
        opacity: 0,
        x: 30,
        filter: 'blur(3px)',
        transition: { duration: 0.45, ease: EASE_CINEMATIC_IN },
      },
    },
    'scale-up': {
      hidden: { opacity: 0, scale: 0.9, filter: 'blur(6px)' },
      visible: {
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        transition: {
          duration: 0.8,
          delay: delayMs / 1000,
          ease: EASE_CINEMATIC_OUT,
        },
      },
      exit: {
        opacity: 0,
        scale: 0.94,
        filter: 'blur(4px)',
        transition: { duration: 0.45, ease: EASE_CINEMATIC_IN },
      },
    },
    'prism-fold': {
      hidden: { opacity: 0, scale: 0.93, rotateX: 10, filter: 'blur(8px)' },
      visible: {
        opacity: 1,
        scale: 1,
        rotateX: 0,
        filter: 'blur(0px)',
        transition: {
          duration: 0.95,
          delay: delayMs / 1000,
          ease: EASE_CINEMATIC_OUT,
        },
      },
      exit: {
        opacity: 0,
        scale: 0.96,
        rotateX: -6,
        filter: 'blur(4px)',
        transition: { duration: 0.5, ease: EASE_CINEMATIC_IN },
      },
    },
  };

  const selectedVariant = variants[animation] || variants['fade-up'];

  return (
    <motion.div
      variants={selectedVariant}
      initial="hidden"
      whileInView="visible"
      exit={once ? undefined : "exit"}
      viewport={{ once, amount: threshold, margin: '0px 0px -50px 0px' }}
      className={cn('transform-gpu', className)}
    >
      {children}
    </motion.div>
  );
}

/**
 * Stagger Container for list & grid animations
 */
export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.08,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  delay?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            delayChildren: delay,
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 24, scale: 0.97, filter: 'blur(3px)' },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          transition: {
            duration: 0.65,
            ease: EASE_CINEMATIC_OUT,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Interactive 3D Perspective Tilt Card with specular spotlight reflection.
 */
export function PerspectiveTilt({
  children,
  className,
  glowColor = 'rgba(0, 255, 135, 0.25)',
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, glowX: 50, glowY: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -6; // Max 6 deg
    const rotateY = ((x - centerX) / centerX) * 6;

    setTilt({
      x: rotateX,
      y: rotateY,
      glowX: (x / rect.width) * 100,
      glowY: (y / rect.height) * 100,
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0, glowX: 50, glowY: 50 });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: isHovered ? tilt.x : 0,
        rotateY: isHovered ? tilt.y : 0,
        scale: isHovered ? 1.015 : 1,
      }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 24,
        mass: 0.6,
      }}
      style={{ perspective: 1200, transformStyle: 'preserve-3d' }}
      className={cn('relative transform-gpu', className)}
    >
      {/* Specular Spotlight Layer */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="pointer-events-none absolute -inset-px rounded-[inherit] z-10"
            style={{
              background: `radial-gradient(400px circle at ${tilt.glowX}% ${tilt.glowY}%, ${glowColor}, transparent 60%)`,
            }}
          />
        )}
      </AnimatePresence>
      {children}
    </motion.div>
  );
}
