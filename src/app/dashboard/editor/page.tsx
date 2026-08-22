'use client';

import React, { useState, useEffect } from 'react';
import { UserPortfolio, ProjectItem, MediaItem, SocialLink, MediaDisplayMode, TierType } from '@/lib/types';
import { FONT_PAIRINGS } from '@/lib/font-registry';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { GlassInput, GlassTextarea } from '@/components/ui/glass-input';
import {
  Save,
  Plus,
  Trash2,
  Upload,
  Sparkles,
  Layers,
  Eye,
  Sliders,
  CheckCircle2,
  Video,
  Image as ImageIcon,
  Film,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Camera,
  Loader2,
} from 'lucide-react';
import { isDisplayModeAllowed } from '@/lib/tiers';

export default function StudioEditorPage() {
  const [portfolio, setPortfolio] = useState<UserPortfolio | null>(null);
  const [userTier, setUserTier] = useState<TierType>('free');
  const [activeTab, setActiveTab] = useState<'profile' | 'theme' | 'projects' | 'socials'>('projects');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadingMediaForProj, setUploadingMediaForProj] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/portfolio')
      .then((res) => res.json())
      .then((data) => {
        if (data.portfolio) {
          setPortfolio(data.portfolio);
          if (data.user?.subscription?.tier) {
            setUserTier(data.user.subscription.tier);
          }
        }
      })
      .catch(console.error);
  }, []);

  const handleSave = async () => {
    if (!portfolio) return;
    setIsSaving(true);
    setSaveSuccess(false);

    // 1. Sync immediately to client-side localStorage for instant preview fidelity
    if (typeof window !== 'undefined' && portfolio.username) {
      try {
        localStorage.setItem(`portfoli_preview_${portfolio.username}`, JSON.stringify(portfolio));
      } catch {}
    }

    try {
      const res = await fetch('/api/portfolio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(portfolio),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
      }
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Profile Avatar Upload Handler
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !portfolio) return;

    setIsUploadingAvatar(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'image');

    try {
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error || 'Failed to upload profile photo.');
      } else if (data.media?.url) {
        const updated = {
          ...portfolio,
          avatarUrl: data.media.url,
        };
        setPortfolio(updated);
        // Sync to localStorage
        if (typeof window !== 'undefined' && portfolio.username) {
          try {
            localStorage.setItem(`portfoli_preview_${portfolio.username}`, JSON.stringify(updated));
          } catch {}
        }
      }
    } catch (err) {
      setUploadError('Failed to process avatar upload.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Upload handler (HF Hub + Kaggle WebM compression if >100MB)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, projectId: string, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (!file || !portfolio) return;

    setUploadingMediaForProj(projectId);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error || 'Upload failed');
      } else {
        const newMedia: MediaItem = data.media;
        const updatedProjects = portfolio.projects.map((p) => {
          if (p.id === projectId) {
            return {
              ...p,
              media: [...(p.media || []), newMedia],
            };
          }
          return p;
        });

        setPortfolio({
          ...portfolio,
          projects: updatedProjects,
        });
      }
    } catch (err) {
      setUploadError('Failed to process upload.');
    } finally {
      setUploadingMediaForProj(null);
    }
  };

  // Projects CRUD
  const handleAddProject = () => {
    if (!portfolio) return;
    const newProj: ProjectItem = {
      id: `proj_${Date.now()}`,
      title: 'New Creative Project',
      description: 'Describe the project goals, challenge, and impact achieved.',
      category: 'Design & Engineering',
      tags: ['TypeScript', 'UI/UX', 'Glassmorphism'],
      client: 'Client / Company',
      date: '2026',
      liveUrl: 'https://example.com',
      featured: false,
      order: portfolio.projects.length + 1,
      media: [],
    };
    setPortfolio({
      ...portfolio,
      projects: [newProj, ...portfolio.projects],
    });
  };

  const handleDeleteProject = (projId: string) => {
    if (!portfolio) return;
    setPortfolio({
      ...portfolio,
      projects: portfolio.projects.filter((p) => p.id !== projId),
    });
  };

  const handleDeleteMedia = (projId: string, mediaId: string) => {
    if (!portfolio) return;
    const updated = portfolio.projects.map((p) => {
      if (p.id === projId) {
        return {
          ...p,
          media: p.media.filter((m) => m.id !== mediaId),
        };
      }
      return p;
    });
    setPortfolio({ ...portfolio, projects: updated });
  };

  // Socials CRUD
  const handleAddSocial = () => {
    if (!portfolio) return;
    const newSocial: SocialLink = {
      id: `soc_${Date.now()}`,
      platform: 'github',
      url: 'https://github.com',
      label: 'GitHub',
    };
    setPortfolio({
      ...portfolio,
      socials: [...portfolio.socials, newSocial],
    });
  };

  const handleDeleteSocial = (socialId: string) => {
    if (!portfolio) return;
    setPortfolio({
      ...portfolio,
      socials: portfolio.socials.filter((s) => s.id !== socialId),
    });
  };

  if (!portfolio) {
    return (
      <div className="py-24 text-center text-zinc-400">
        <Sparkles className="w-8 h-8 mx-auto text-emerald-400 animate-spin mb-3" />
        <p>Loading Studio Configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Top Header & Save Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-30 py-3 bg-card-bg backdrop-blur-xl border-b border-border transition-colors">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">
            Live Portfolio Studio
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground font-display">
            Portfolio Customizer & CRUD Engine
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> All Changes Published
            </span>
          )}
          <a
            href={`/${portfolio.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex"
          >
            <GlassButton variant="glass" size="sm" className="text-xs font-semibold">
              <Eye className="w-3.5 h-3.5 mr-1" /> View Live
            </GlassButton>
          </a>
          <GlassButton
            variant="primary"
            size="sm"
            glow
            loading={isSaving}
            onClick={handleSave}
            className="text-xs font-bold"
          >
            <Save className="w-3.5 h-3.5" /> Save & Publish
          </GlassButton>
        </div>
      </div>

      {uploadError && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Editor Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto scrollbar-none">
        {[
          { id: 'projects', label: 'Projects & Media', icon: Layers },
          { id: 'theme', label: 'Optics & Display Mode', icon: Sparkles },
          { id: 'profile', label: 'Bio & Availability', icon: Sliders },
          { id: 'socials', label: 'Socials & Links', icon: ExternalLink },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-400/50 shadow-glass-glow'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PROJECTS & MEDIA CRUD */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground font-display">Featured Projects Showcase</h2>
              <p className="text-xs text-zinc-400">Add images and click-to-play videos for your portfolio.</p>
            </div>
            <GlassButton variant="primary" size="sm" onClick={handleAddProject} className="text-xs font-bold">
              <Plus className="w-3.5 h-3.5" /> Add Project
            </GlassButton>
          </div>

          <div className="space-y-6">
            {portfolio.projects.map((proj, idx) => (
              <GlassCard key={proj.id} intensity="high" className="p-6 space-y-6">
                <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <GlassInput
                      label="Project Title"
                      value={proj.title}
                      onChange={(e) => {
                        const updated = portfolio.projects.map((p) =>
                          p.id === proj.id ? { ...p, title: e.target.value } : p
                        );
                        setPortfolio({ ...portfolio, projects: updated });
                      }}
                    />
                    <GlassInput
                      label="Category / Subtitle"
                      value={proj.category}
                      onChange={(e) => {
                        const updated = portfolio.projects.map((p) =>
                          p.id === proj.id ? { ...p, category: e.target.value } : p
                        );
                        setPortfolio({ ...portfolio, projects: updated });
                      }}
                    />
                  </div>
                  <button
                    onClick={() => handleDeleteProject(proj.id)}
                    className="p-2 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <GlassTextarea
                  label="Project Narrative & Scope"
                  rows={3}
                  value={proj.description}
                  onChange={(e) => {
                    const updated = portfolio.projects.map((p) =>
                      p.id === proj.id ? { ...p, description: e.target.value } : p
                    );
                    setPortfolio({ ...portfolio, projects: updated });
                  }}
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <GlassInput
                    label="Live URL"
                    placeholder="https://example.com"
                    value={proj.liveUrl || ''}
                    onChange={(e) => {
                      const updated = portfolio.projects.map((p) =>
                        p.id === proj.id ? { ...p, liveUrl: e.target.value } : p
                      );
                      setPortfolio({ ...portfolio, projects: updated });
                    }}
                  />
                  <GlassInput
                    label="Client / Company"
                    placeholder="e.g. Aetheria Labs"
                    value={proj.client || ''}
                    onChange={(e) => {
                      const updated = portfolio.projects.map((p) =>
                        p.id === proj.id ? { ...p, client: e.target.value } : p
                      );
                      setPortfolio({ ...portfolio, projects: updated });
                    }}
                  />
                  <GlassInput
                    label="Year"
                    placeholder="2026"
                    value={proj.date || ''}
                    onChange={(e) => {
                      const updated = portfolio.projects.map((p) =>
                        p.id === proj.id ? { ...p, date: e.target.value } : p
                      );
                      setPortfolio({ ...portfolio, projects: updated });
                    }}
                  />
                </div>

                {/* Media Manager Section */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold">
                      Attached Media ({proj.media?.length || 0})
                    </span>
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, proj.id, 'image')}
                        />
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 text-xs font-semibold transition-all">
                          <ImageIcon className="w-3.5 h-3.5 text-emerald-400" /> Upload Image
                        </span>
                      </label>

                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, proj.id, 'video')}
                        />
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition-all">
                          <Video className="w-3.5 h-3.5 text-emerald-400" /> Upload Video
                        </span>
                      </label>
                    </div>
                  </div>

                  {uploadingMediaForProj === proj.id && (
                    <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-400/40 text-xs text-emerald-300 flex items-center gap-2 animate-pulse">
                      <Film className="w-4 h-4 text-emerald-400" />
                      <span>Optimizing and uploading media to cloud storage...</span>
                    </div>
                  )}

                  {/* Media Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {proj.media?.map((m) => (
                      <div
                        key={m.id}
                        className="relative rounded-xl overflow-hidden aspect-video bg-black/80 border border-white/10 group"
                      >
                        {m.type === 'video' ? (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-emerald-950/40 text-emerald-400 p-2 text-center">
                            <Film className="w-6 h-6 mb-1" />
                            <span className="text-[10px] font-mono line-clamp-1">{m.originalName}</span>
                            {m.compressed && (
                              <span className="text-[9px] font-mono text-cyan-300">WebM HD</span>
                            )}
                          </div>
                        ) : (
                          <img src={m.url} alt="" className="w-full h-full object-cover" />
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteMedia(proj.id, m.id)}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/80 text-rose-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: THEME & DISPLAY OPTICS */}
      {activeTab === 'theme' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white font-display">Optics, Typography & Display Modes</h2>
            <p className="text-xs text-zinc-400">Choose how your work is staged and rendered to viewers.</p>
          </div>

          <GlassCard intensity="high" className="p-6 space-y-6">
            {/* Display Mode Selector */}
            <div className="space-y-3">
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold">
                Project Showcase Display Architecture
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    id: 'crystal_prism',
                    name: '3D Crystal Prism',
                    desc: 'Multifaceted 3D glass prism cards with dynamic light refractions & facet switching.',
                    badge: 'ELITE ONLY',
                  },
                  {
                    id: 'side_swipe',
                    name: 'Side-Swipe Cards',
                    desc: 'Horizontal fluid slider with velocity-matched kinetic parallax motion.',
                    badge: 'PRO & ELITE',
                  },
                  {
                    id: 'carousel_3d',
                    name: '3D Carousel',
                    desc: 'Rotating focal carousel with active center stage and depth scaling.',
                    badge: 'ALL TIERS',
                  },
                  {
                    id: 'bento_grid',
                    name: 'Luxury Bento Grid',
                    desc: 'Asymmetrical editorial masonry grid with glass lightbox inspect.',
                    badge: 'ALL TIERS',
                  },
                ].map((mode) => {
                  const isSelected = portfolio.theme?.displayMode === mode.id;
                  const allowed = isDisplayModeAllowed(userTier, mode.id as MediaDisplayMode);
                  return (
                    <div
                      key={mode.id}
                      onClick={() => {
                        setPortfolio({
                          ...portfolio,
                          theme: { ...portfolio.theme, displayMode: mode.id as any },
                        });
                      }}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 flex flex-col justify-between space-y-3 ${
                        isSelected
                          ? 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-500 shadow-glass-glow text-foreground'
                          : 'bg-card-bg border-border hover:border-emerald-400/40 text-foreground'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <h4 className="font-bold text-sm text-foreground">{mode.name}</h4>
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-white/5 border border-emerald-300 dark:border-white/10 text-emerald-800 dark:text-emerald-400 font-bold">
                            {mode.badge}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">{mode.desc}</p>
                      </div>
                      <div className="text-[11px] font-mono text-emerald-700 dark:text-[#00FF87] font-bold">
                        {isSelected ? '● ACTIVE DISPLAY' : '○ Click to select'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Typography Pairing */}
            <div className="space-y-3 pt-4 border-t border-border">
              <label className="block text-xs font-mono uppercase tracking-wider text-foreground font-bold">
                Curated Typography Pairings
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {FONT_PAIRINGS.map((pair) => {
                  const isSelected = portfolio.theme?.primaryFont === pair.primaryFont;
                  return (
                    <div
                      key={pair.id}
                      onClick={() => {
                        setPortfolio({
                          ...portfolio,
                          theme: {
                            ...portfolio.theme,
                            primaryFont: pair.primaryFont,
                            secondaryFont: pair.secondaryFont,
                          },
                        });
                      }}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-500 text-foreground shadow-glass-glow'
                          : 'bg-card-bg border-border hover:border-emerald-400/40 text-foreground'
                      }`}
                    >
                      <span className="text-[10px] font-mono text-emerald-700 dark:text-[#00FF87] font-bold block">{pair.category}</span>
                      <h4 className="text-base font-bold mt-1 text-foreground" style={{ fontFamily: `"${pair.primaryFont}", sans-serif` }}>
                        {pair.name}
                      </h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 font-normal">{pair.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Accent Color Palette */}
            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono uppercase tracking-wider text-foreground font-bold">
                  Primary Glow Accent
                </label>
                <div className="text-xs font-mono font-bold flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: portfolio.theme?.accentColor || '#00FF87' }} />
                  <span>{portfolio.theme?.accentColor || '#00FF87'}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {[
                  { name: 'Neon Emerald', color: '#00FF87' },
                  { name: 'Cyber Cyan', color: '#00F0FF' },
                  { name: 'Electric Violet', color: '#A855F7' },
                  { name: 'Solar Amber', color: '#F59E0B' },
                  { name: 'Crimson Rose', color: '#F43F5E' },
                  { name: 'Forest Jade', color: '#10B981' },
                  { name: 'Pure White', color: '#FFFFFF' },
                ].map((palette) => {
                  const isSelected = portfolio.theme?.accentColor === palette.color;
                  return (
                    <button
                      key={palette.color}
                      type="button"
                      onClick={() => {
                        setPortfolio({
                          ...portfolio,
                          theme: { ...portfolio.theme, accentColor: palette.color },
                        });
                      }}
                      className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 shadow-glass-glow text-foreground scale-105'
                          : 'border-border bg-card-bg hover:border-emerald-400/40 text-foreground'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-black/20 dark:border-white/20 shadow-sm"
                        style={{ backgroundColor: palette.color }}
                      />
                      <span>{palette.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* TAB 3: PROFILE & BIO */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white font-display">Identity, Bio & Availability</h2>
            <p className="text-xs text-zinc-400">Customize how you present your credentials.</p>
          </div>

          <GlassCard intensity="high" className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <GlassInput
                label="Display Name"
                value={portfolio.displayName}
                onChange={(e) => setPortfolio({ ...portfolio, displayName: e.target.value })}
              />
              <GlassInput
                label="Headline Title"
                value={portfolio.headline}
                onChange={(e) => setPortfolio({ ...portfolio, headline: e.target.value })}
              />
            </div>

            <GlassTextarea
              label="Bio Narrative"
              rows={4}
              value={portfolio.bio}
              onChange={(e) => setPortfolio({ ...portfolio, bio: e.target.value })}
            />

            {/* Avatar / Profile Photo Device Upload */}
            <div className="p-4 rounded-2xl bg-card-bg border border-border space-y-3">
              <label className="block text-xs font-mono uppercase tracking-wider text-foreground font-bold">
                Profile Photo / Avatar
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <div
                  className="w-24 h-24 rounded-2xl overflow-hidden border-2 flex items-center justify-center relative shadow-glass-glow flex-shrink-0 bg-black/20"
                  style={{
                    borderColor: portfolio.theme?.accentColor || '#00FF87',
                    boxShadow: `0 0 20px ${portfolio.theme?.accentColor || '#00FF87'}33`,
                  }}
                >
                  {portfolio.avatarUrl ? (
                    <img
                      src={portfolio.avatarUrl}
                      alt="Avatar Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-zinc-400">
                      {portfolio.displayName?.substring(0, 2).toUpperCase() || 'AV'}
                    </span>
                  )}
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                      <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                      <span className="text-[9px] font-mono mt-1">Uploading...</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2.5 flex-1 w-full">
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={isUploadingAvatar}
                        onChange={handleAvatarUpload}
                      />
                      <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-glass-glow cursor-pointer">
                        <Camera className="w-4 h-4" />
                        {isUploadingAvatar ? 'Uploading from device...' : 'Upload Photo from Device'}
                      </span>
                    </label>

                    {portfolio.avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setPortfolio({ ...portfolio, avatarUrl: '' })}
                        className="px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold hover:bg-rose-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                    Upload PNG, JPG, WebP from your phone or computer. Images are hosted and compressed for maximum visual fidelity.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <GlassInput
                label="Location"
                placeholder="e.g. Lagos & San Francisco"
                value={portfolio.location || ''}
                onChange={(e) => setPortfolio({ ...portfolio, location: e.target.value })}
              />
              <GlassInput
                label="Direct Contact Email"
                type="email"
                value={portfolio.emailContact}
                onChange={(e) => setPortfolio({ ...portfolio, emailContact: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <GlassInput
                label="Phone / WhatsApp"
                placeholder="+234..."
                value={portfolio.phoneContact || ''}
                onChange={(e) => setPortfolio({ ...portfolio, phoneContact: e.target.value })}
              />
              <GlassInput
                label="Calendly Scheduling URL"
                placeholder="https://calendly.com/..."
                value={portfolio.calendlyUrl || ''}
                onChange={(e) => setPortfolio({ ...portfolio, calendlyUrl: e.target.value })}
              />
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Availability Badge</h4>
                <p className="text-xs text-zinc-400">Show &apos;Available for work&apos; pulsing indicator on hero.</p>
              </div>
              <input
                type="checkbox"
                checked={portfolio.availableForHire}
                onChange={(e) => setPortfolio({ ...portfolio, availableForHire: e.target.checked })}
                className="w-5 h-5 accent-emerald-400 rounded cursor-pointer"
              />
            </div>
          </GlassCard>
        </div>
      )}

      {/* TAB 4: SOCIALS */}
      {activeTab === 'socials' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white font-display">Socials & External Links</h2>
              <p className="text-xs text-zinc-400">Attach your GitHub, LinkedIn, Dribbble, Twitter, or website links.</p>
            </div>
            <GlassButton variant="primary" size="sm" onClick={handleAddSocial} className="text-xs font-bold">
              <Plus className="w-3.5 h-3.5" /> Add Link
            </GlassButton>
          </div>

          <div className="space-y-3">
            {portfolio.socials.map((social) => (
              <GlassCard key={social.id} intensity="high" className="p-4 flex items-center gap-4">
                <select
                  value={social.platform}
                  onChange={(e) => {
                    const updated = portfolio.socials.map((s) =>
                      s.id === social.id ? { ...s, platform: e.target.value as any } : s
                    );
                    setPortfolio({ ...portfolio, socials: updated });
                  }}
                  className="bg-[#0a120e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="github">GitHub</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="twitter">X / Twitter</option>
                  <option value="instagram">Instagram</option>
                  <option value="dribbble">Dribbble</option>
                  <option value="figma">Figma</option>
                  <option value="website">Personal Website</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>

                <GlassInput
                  placeholder="https://..."
                  value={social.url}
                  onChange={(e) => {
                    const updated = portfolio.socials.map((s) =>
                      s.id === social.id ? { ...s, url: e.target.value } : s
                    );
                    setPortfolio({ ...portfolio, socials: updated });
                  }}
                  className="flex-1"
                />

                <button
                  type="button"
                  onClick={() => handleDeleteSocial(social.id)}
                  className="text-zinc-500 hover:text-rose-400 p-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </GlassCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
