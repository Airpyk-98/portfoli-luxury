'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PricingConfig, TierType } from '@/lib/types';
import { DEFAULT_PRICING, formatBytes } from '@/lib/tiers';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { GlassInput } from '@/components/ui/glass-input';
import { ThemeToggle } from '@/components/theme-toggle';
import { ScrollReveal, PerspectiveTilt } from '@/components/ui/kinetic-motion';
import {
  Shield,
  DollarSign,
  Users,
  HardDrive,
  CheckCircle2,
  TrendingUp,
  ArrowLeft,
  Sparkles,
  Save,
  Lock,
  KeyRound,
  AlertTriangle,
  Key,
  CreditCard,
  Radio,
  Copy,
  ExternalLink,
  BarChart3,
  Globe,
  Layers,
  Activity,
  Check,
  RefreshCw,
  Search,
  UserCheck,
  UserX,
  Clock,
  Calendar,
  AlertCircle,
  ChevronRight,
  MoreVertical,
  PlusCircle,
} from 'lucide-react';

export default function AdminControlPage() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [adminPasscode, setAdminPasscode] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<'users' | 'pricing' | 'gateway' | 'transactions' | 'gtm' | 'security'>('users');

  // User Management State
  const [usersList, setUsersList] = useState<any[]>([]);
  const [userAnalytics, setUserAnalytics] = useState<any>(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Pricing & Telemetry
  const [pricing, setPricing] = useState<PricingConfig>(DEFAULT_PRICING);
  const [telemetry, setTelemetry] = useState<any>(null);
  const [savingPricing, setSavingPricing] = useState(false);
  const [pricingSaveSuccess, setPricingSaveSuccess] = useState(false);

  // Flutterwave & GTM Settings State
  const [paymentSettings, setPaymentSettings] = useState({
    provider: 'flutterwave',
    environment: 'live',
    clientId: '',
    clientSecret: '',
    secretKey: '',
    publicKey: '',
    encryptionKey: '',
    webhookSecretHash: 'portfoli_flw_live_secret_hash_2026',
    gtmContainerId: '',
    ga4MeasurementId: '',
    lookerStudioEmbedUrl: '',
    enabled: true,
    hasConfiguredSecret: false,
  });
  const [webhookUrl, setWebhookUrl] = useState('');
  const [liveRevenueStats, setLiveRevenueStats] = useState<any>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  // Password update form state
  const [currentPasscode, setCurrentPasscode] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);

  // Check saved admin session in sessionStorage
  useEffect(() => {
    const savedKey = sessionStorage.getItem('portfoli_admin_key');
    if (savedKey) {
      verifyAndLoadAdmin(savedKey);
    }
  }, []);

  const loadUsersList = async (key: string) => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/admin/users', {
        headers: { 'x-admin-key': key },
      });
      const data = await res.json();
      if (data.success) {
        setUsersList(data.users || []);
        setUserAnalytics(data.analytics || null);
      }
    } catch (err) {
      console.error('Error loading users list:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadPaymentSettings = async (key: string) => {
    try {
      const res = await fetch('/api/admin/payment-settings', {
        headers: { 'x-admin-key': key },
      });
      const data = await res.json();
      if (data.success) {
        setPaymentSettings(data.settings);
        setWebhookUrl(data.webhookEndpoint || '');
        if (data.liveStats) setLiveRevenueStats(data.liveStats);
      }
    } catch (err) {
      console.error('Error loading payment settings:', err);
    }
  };

  const verifyAndLoadAdmin = async (key: string) => {
    try {
      setAuthError(null);
      const res = await fetch('/api/admin/pricing', {
        headers: { 'x-admin-key': key },
      });
      const data = await res.json();
      if (res.ok) {
        setIsAdminAuthenticated(true);
        sessionStorage.setItem('portfoli_admin_key', key);
        if (data.pricing) setPricing(data.pricing);
        if (data.telemetry) setTelemetry(data.telemetry);
        loadUsersList(key);
        loadPaymentSettings(key);
      } else {
        setIsAdminAuthenticated(false);
        sessionStorage.removeItem('portfoli_admin_key');
        setAuthError(data.error || 'Invalid Admin Security Key.');
      }
    } catch {
      setAuthError('Connection error verifying admin credentials.');
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPasscode) return;
    verifyAndLoadAdmin(adminPasscode);
  };

  const handleSavePricing = async () => {
    setSavingPricing(true);
    try {
      const activeKey = sessionStorage.getItem('portfoli_admin_key') || adminPasscode;
      const res = await fetch('/api/admin/pricing', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': activeKey,
        },
        body: JSON.stringify(pricing),
      });
      if (res.ok) {
        setPricingSaveSuccess(true);
        setTimeout(() => setPricingSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to update pricing:', err);
    } finally {
      setSavingPricing(false);
    }
  };

  const handleSavePaymentSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const activeKey = sessionStorage.getItem('portfoli_admin_key') || adminPasscode;
      const res = await fetch('/api/admin/payment-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': activeKey,
        },
        body: JSON.stringify(paymentSettings),
      });
      const data = await res.json();
      if (data.success) {
        setSettingsSuccess(true);
        if (data.settings) setPaymentSettings(data.settings);
        setTimeout(() => setSettingsSuccess(false), 3500);
      } else {
        alert(data.message || 'Failed to save settings');
      }
    } catch (err: any) {
      alert('Error saving payment settings: ' + err.message);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleCopyWebhook = () => {
    if (!webhookUrl) return;
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const handleUpdatePasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (newPasscode !== confirmPasscode) {
      setPassError('New passcodes do not match.');
      return;
    }
    if (newPasscode.length < 6) {
      setPassError('New passcode must be at least 6 characters.');
      return;
    }

    setIsUpdatingPass(true);
    try {
      const activeKey = sessionStorage.getItem('portfoli_admin_key') || adminPasscode;
      const res = await fetch('/api/admin/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': activeKey,
        },
        body: JSON.stringify({
          currentPassword: currentPasscode,
          newPassword: newPasscode,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setPassSuccess('Admin security passcode updated successfully!');
        sessionStorage.setItem('portfoli_admin_key', newPasscode);
        setCurrentPasscode('');
        setNewPasscode('');
        setConfirmPasscode('');
        setTimeout(() => setPassSuccess(null), 4000);
      } else {
        setPassError(data.error || 'Failed to update passcode.');
      }
    } catch {
      setPassError('Network error updating passcode.');
    } finally {
      setIsUpdatingPass(false);
    }
  };

  // Filtered Users List
  const filteredUsers = usersList.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      u.name?.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q);

    const matchesTier =
      filterTier === 'all' ||
      u.subscription?.tier === filterTier;

    let matchesStatus = true;
    if (filterStatus === 'active') {
      matchesStatus = u.statusInfo?.isActive && u.subscription?.tier !== 'free';
    } else if (filterStatus === 'free') {
      matchesStatus = u.subscription?.tier === 'free';
    } else if (filterStatus === 'grace') {
      matchesStatus = u.statusInfo?.isGracePeriod;
    } else if (filterStatus === 'expired') {
      matchesStatus = u.statusInfo?.isExpiredAndDecommissioned;
    }

    return matchesSearch && matchesTier && matchesStatus;
  });

  // If not authenticated, render Security Gate
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-500">
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-emerald-500/10 rounded-full blur-[160px]" />
        </div>

        <GlassCard intensity="ultra" glow className="max-w-md w-full p-8 space-y-6 relative z-10 border-emerald-500/40">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-500/40 text-emerald-700 dark:text-[#00FF87] flex items-center justify-center mx-auto shadow-glass-glow">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-foreground font-display">Admin Authorization Gate</h1>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Master administrative control room. Default passcode is <code className="text-emerald-500 font-mono">admin123</code>.
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-500/40 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <GlassInput
              label="Master Security Passcode"
              type="password"
              placeholder="••••••••••••••••"
              value={adminPasscode}
              onChange={(e) => setAdminPasscode(e.target.value)}
              required
              leftIcon={<KeyRound className="w-4 h-4" />}
            />

            <GlassButton type="submit" variant="primary" glow className="w-full text-xs font-bold py-3">
              Unlock Master Control Room
            </GlassButton>
          </form>

          <div className="pt-2 text-center border-t border-border">
            <Link href="/dashboard" className="text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-foreground">
              ← Return to Creator Dashboard
            </Link>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-emerald-400 selection:text-black py-10 px-4 sm:px-6 relative overflow-hidden transition-colors duration-500">
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-emerald-500/10 rounded-full blur-[160px]" />
      </div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10 pb-20">
        {/* Header Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-[#00FF87] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-500/40 text-emerald-800 dark:text-[#00FF87] font-bold">
              MASTER ADMIN PORTAL
            </span>
            <button
              onClick={() => {
                sessionStorage.removeItem('portfoli_admin_key');
                setIsAdminAuthenticated(false);
              }}
              className="text-xs font-bold text-zinc-500 hover:text-rose-500 transition-colors cursor-pointer"
            >
              Lock Gate
            </button>
          </div>
        </div>

        {/* Title */}
        <ScrollReveal animation="fade-up">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-700 dark:text-[#00FF87] font-bold">
              Platform Master Infrastructure
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground font-display">
              User Management & Platform Command Center
            </h1>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Track creator subscribers, monitor remaining subscription days, manage Flutterwave v4 Live keys, and inspect real-time platform revenue.
            </p>
          </div>
        </ScrollReveal>

        {/* Admin Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
          {[
            { id: 'users', label: 'Users & Subscription Roster', icon: Users },
            { id: 'pricing', label: 'Dynamic Pricing Matrix', icon: DollarSign },
            { id: 'gateway', label: 'Flutterwave Payment Gateway', icon: CreditCard },
            { id: 'transactions', label: 'Live Revenue & Transactions', icon: TrendingUp },
            { id: 'gtm', label: 'Google Tag Manager & Analytics', icon: BarChart3 },
            { id: 'security', label: 'Admin Security & Password', icon: Key },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500 text-black shadow-glass-glow'
                    : 'bg-card-bg text-zinc-700 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/5 border border-border'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 0: USERS & SUBSCRIPTION ROSTER (USER MANAGEMENT DASHBOARD) */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* User Management Analytics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <PerspectiveTilt>
                <GlassCard intensity="high" className="p-5 space-y-2">
                  <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400 text-xs font-bold">
                    <span>Total Creators</span>
                    <Users className="w-4 h-4 text-emerald-600 dark:text-[#00FF87]" />
                  </div>
                  <div className="text-3xl font-black font-mono text-foreground">
                    {userAnalytics?.totalUsers || usersList.length || 0}
                  </div>
                  <div className="text-[11px] text-zinc-600 dark:text-zinc-400">All registered creator profiles</div>
                </GlassCard>
              </PerspectiveTilt>

              <PerspectiveTilt>
                <GlassCard intensity="ultra" glow className="p-5 space-y-2 border-emerald-500/40">
                  <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400 text-xs font-bold">
                    <span>Active Paid Subscribers</span>
                    <UserCheck className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-3xl font-black font-mono text-emerald-700 dark:text-[#00FF87]">
                    {userAnalytics?.paidSubscribers || 0}
                  </div>
                  <div className="text-[11px] text-zinc-600 dark:text-zinc-400">
                    Pro & Elite active paid plans ({userAnalytics?.conversionRate || 0}% conversion)
                  </div>
                </GlassCard>
              </PerspectiveTilt>

              <PerspectiveTilt>
                <GlassCard intensity="high" className="p-5 space-y-2">
                  <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400 text-xs font-bold">
                    <span>Free / Starter Users</span>
                    <UserX className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div className="text-3xl font-black font-mono text-foreground">
                    {userAnalytics?.freeUsers || 0}
                  </div>
                  <div className="text-[11px] text-zinc-600 dark:text-zinc-400">Starter free tier accounts</div>
                </GlassCard>
              </PerspectiveTilt>

              <PerspectiveTilt>
                <GlassCard
                  intensity="high"
                  className={`p-5 space-y-2 ${
                    userAnalytics?.inGracePeriod > 0 ? 'border-amber-500/50 bg-amber-500/5' : ''
                  }`}
                >
                  <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400 text-xs font-bold">
                    <span>In 30-Day Grace Period</span>
                    <Clock className={`w-4 h-4 ${userAnalytics?.inGracePeriod > 0 ? 'text-amber-400 animate-pulse' : 'text-zinc-400'}`} />
                  </div>
                  <div className={`text-3xl font-black font-mono ${userAnalytics?.inGracePeriod > 0 ? 'text-amber-400' : 'text-foreground'}`}>
                    {userAnalytics?.inGracePeriod || 0}
                  </div>
                  <div className="text-[11px] text-zinc-600 dark:text-zinc-400">Expiring subscribers needing renewal</div>
                </GlassCard>
              </PerspectiveTilt>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-black/20 p-3.5 rounded-2xl border border-border">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search by creator name, username, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-card-bg border border-border text-xs text-foreground placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={filterTier}
                  onChange={(e) => setFilterTier(e.target.value)}
                  className="bg-card-bg border border-border text-foreground rounded-xl px-3 py-2 text-xs font-mono font-medium"
                >
                  <option value="all">All Tiers</option>
                  <option value="elite_5k">Elite Mastery (₦5,000)</option>
                  <option value="pro_2k">Creator Pro (₦2,000)</option>
                  <option value="free">Starter Free</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-card-bg border border-border text-foreground rounded-xl px-3 py-2 text-xs font-mono font-medium"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Paid Subscribers</option>
                  <option value="free">Free Accounts</option>
                  <option value="grace">In Grace Period</option>
                  <option value="expired">Decommissioned</option>
                </select>

                <button
                  onClick={() => {
                    const key = sessionStorage.getItem('portfoli_admin_key') || adminPasscode;
                    loadUsersList(key);
                  }}
                  className="p-2 rounded-xl bg-card-bg border border-border text-foreground hover:text-emerald-500 transition-all cursor-pointer flex items-center gap-1 text-xs font-mono"
                  title="Refresh User List"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Desktop & Mobile Responsive User Table */}
            <GlassCard intensity="high" className="p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono min-w-[760px]">
                  <thead className="bg-black/40 border-b border-border text-zinc-400 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-4">Creator / User</th>
                      <th className="p-4">Portfolio Link</th>
                      <th className="p-4">Subscription Tier</th>
                      <th className="p-4">Subscription Date</th>
                      <th className="p-4">Days Left / Status</th>
                      <th className="p-4">Storage Usage</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-zinc-500 font-sans">
                          {loadingUsers ? 'Loading creators roster...' : 'No users matching your search filters.'}
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const tier = u.subscription?.tier || 'free';
                        const isFree = tier === 'free';
                        const status = u.statusInfo;
                        const startDateFormatted = u.subscription?.startDate
                          ? new Date(u.subscription.startDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : '—';

                        return (
                          <tr key={u.id || u.username} className="hover:bg-white/[0.02] transition-colors">
                            {/* Creator / User */}
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                {u.avatarUrl ? (
                                  <img
                                    src={u.avatarUrl}
                                    alt={u.name}
                                    className="w-8 h-8 rounded-full object-cover border border-border flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                                    {u.name?.charAt(0) || u.username?.charAt(0) || 'U'}
                                  </div>
                                )}
                                <div>
                                  <div className="font-bold text-foreground font-sans flex items-center gap-1.5">
                                    <span>{u.name}</span>
                                    {u.role === 'admin' && (
                                      <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold">
                                        ADMIN
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-zinc-500">{u.email}</div>
                                </div>
                              </div>
                            </td>

                            {/* Public Link */}
                            <td className="p-4 font-bold text-emerald-400">
                              <a
                                href={`/${u.username}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 hover:underline text-[11px]"
                              >
                                portfoli.me/{u.username}
                                <ExternalLink className="w-3 h-3 text-zinc-500" />
                              </a>
                            </td>

                            {/* Subscription Tier */}
                            <td className="p-4">
                              {tier === 'elite_5k' ? (
                                <span className="px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1">
                                  <Sparkles className="w-3 h-3 text-cyan-400" /> Elite Mastery
                                </span>
                              ) : tier === 'pro_2k' ? (
                                <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3 text-emerald-400" /> Creator Pro
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 text-[10px] font-bold uppercase tracking-wider">
                                  Starter Free
                                </span>
                              )}
                            </td>

                            {/* Subscription Start Date (or Dash if not subscribing) */}
                            <td className="p-4 text-zinc-300 text-xs">
                              {isFree ? (
                                <span className="text-zinc-600 font-bold text-sm">—</span>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                                  <span>{startDateFormatted}</span>
                                </div>
                              )}
                            </td>

                            {/* Days Remaining / Expiration Status */}
                            <td className="p-4">
                              {isFree ? (
                                <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-500 border border-zinc-800 text-[10px] font-bold">
                                  Free Forever
                                </span>
                              ) : status?.isActive ? (
                                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 text-[10px] font-bold inline-flex items-center gap-1.5 shadow-glass-glow">
                                  <Clock className="w-3 h-3 text-emerald-400" />
                                  <span>{status.daysRemainingInSubscription} Days Left</span>
                                </span>
                              ) : status?.isGracePeriod ? (
                                <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/50 text-[10px] font-bold inline-flex items-center gap-1.5 animate-pulse">
                                  <AlertCircle className="w-3 h-3 text-amber-400" />
                                  <span>⚠️ {status.daysRemainingInGrace} Days Grace Left</span>
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/50 text-[10px] font-bold">
                                  Decommissioned
                                </span>
                              )}
                            </td>

                            {/* Storage Usage */}
                            <td className="p-4">
                              <div className="space-y-1">
                                <div className="text-[11px] text-zinc-400">
                                  {formatBytes(u.storageUsedBytes || 0)} / {tier === 'elite_5k' ? '5 GB' : tier === 'pro_2k' ? '1 GB' : '100 MB'}
                                </div>
                                <div className="w-24 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                                  <div
                                    className={`h-full ${tier === 'elite_5k' ? 'bg-cyan-400' : 'bg-emerald-400'}`}
                                    style={{
                                      width: `${Math.min(100, Math.max(5, ((u.storageUsedBytes || 0) / (tier === 'elite_5k' ? 5368709120 : tier === 'pro_2k' ? 1073741824 : 104857600)) * 100))}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="p-4 text-right">
                              <a
                                href={`/${u.username}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 rounded-lg bg-card-bg hover:bg-emerald-500 hover:text-black border border-border text-foreground transition-all cursor-pointer inline-flex items-center gap-1 text-[11px] font-sans font-semibold"
                              >
                                <span>Preview</span>
                                <ChevronRight className="w-3 h-3" />
                              </a>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Scroll Hint */}
              <div className="sm:hidden p-3 bg-black/40 border-t border-border text-center text-[10px] text-zinc-500 font-mono flex items-center justify-center gap-1">
                <span>← Swipe table horizontally to view full details →</span>
              </div>
            </GlassCard>
          </div>
        )}

        {/* TAB 1: DYNAMIC PRICING MATRIX */}
        {activeTab === 'pricing' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h2 className="text-xl font-extrabold text-foreground font-display">
                  Dynamic Tier Customization
                </h2>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Update prices and upload caps. These exact amounts are strictly locked on the server and charged to users via Flutterwave.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {pricingSaveSuccess && (
                  <span className="text-xs font-bold text-emerald-700 dark:text-[#00FF87] flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-4 h-4" /> Pricing Matrix Saved
                  </span>
                )}
                <GlassButton variant="primary" glow loading={savingPricing} onClick={handleSavePricing} className="text-xs font-bold">
                  <Save className="w-3.5 h-3.5" /> Save Pricing Matrix
                </GlassButton>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 1. Starter Tier (Free) */}
              <GlassCard intensity="high" className="p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="text-base font-extrabold text-foreground font-display">Starter (Free Plan)</h3>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40">
                    FREE
                  </span>
                </div>

                <div className="space-y-4">
                  <GlassInput
                    label="Price (NGN)"
                    type="number"
                    value={pricing.free.priceNgn}
                    onChange={(e) =>
                      setPricing({
                        ...pricing,
                        free: { ...pricing.free, priceNgn: Number(e.target.value) },
                      })
                    }
                    disabled
                  />
                  <GlassInput
                    label="Max Allowed Videos"
                    type="number"
                    value={pricing.free.maxVideos}
                    onChange={(e) =>
                      setPricing({
                        ...pricing,
                        free: { ...pricing.free, maxVideos: Number(e.target.value) },
                      })
                    }
                  />
                  <GlassInput
                    label="Max Project Photos"
                    type="number"
                    value={pricing.free.maxPhotos}
                    onChange={(e) =>
                      setPricing({
                        ...pricing,
                        free: { ...pricing.free, maxPhotos: Number(e.target.value) },
                      })
                    }
                  />
                </div>
              </GlassCard>

              {/* 2. Creator Pro Tier (2,000 NGN default) */}
              <GlassCard intensity="ultra" glow className="p-6 space-y-5 border-emerald-500/40">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="text-base font-extrabold text-foreground font-display">Creator Pro Tier</h3>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500 text-black">
                    POPULAR
                  </span>
                </div>

                <div className="space-y-4">
                  <GlassInput
                    label="Annual Price (NGN)"
                    type="number"
                    value={pricing.pro_2k.priceNgn}
                    onChange={(e) =>
                      setPricing({
                        ...pricing,
                        pro_2k: { ...pricing.pro_2k, priceNgn: Number(e.target.value) },
                      })
                    }
                  />
                  <GlassInput
                    label="Max Allowed Videos"
                    type="number"
                    value={pricing.pro_2k.maxVideos}
                    onChange={(e) =>
                      setPricing({
                        ...pricing,
                        pro_2k: { ...pricing.pro_2k, maxVideos: Number(e.target.value) },
                      })
                    }
                  />
                  <GlassInput
                    label="Max Project Photos"
                    type="number"
                    value={pricing.pro_2k.maxPhotos}
                    onChange={(e) =>
                      setPricing({
                        ...pricing,
                        pro_2k: { ...pricing.pro_2k, maxPhotos: Number(e.target.value) },
                      })
                    }
                  />
                </div>
              </GlassCard>

              {/* 3. Elite Mastery Tier (5,000 NGN default) */}
              <GlassCard intensity="high" className="p-6 space-y-5 border-cyan-500/40">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="text-base font-extrabold text-foreground font-display">Elite Mastery Tier</h3>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border border-cyan-500/40">
                    SUBDOMAINS
                  </span>
                </div>

                <div className="space-y-4">
                  <GlassInput
                    label="Annual Price (NGN)"
                    type="number"
                    value={pricing.elite_5k.priceNgn}
                    onChange={(e) =>
                      setPricing({
                        ...pricing,
                        elite_5k: { ...pricing.elite_5k, priceNgn: Number(e.target.value) },
                      })
                    }
                  />
                  <GlassInput
                    label="Max Allowed Videos"
                    type="number"
                    value={pricing.elite_5k.maxVideos}
                    onChange={(e) =>
                      setPricing({
                        ...pricing,
                        elite_5k: { ...pricing.elite_5k, maxVideos: Number(e.target.value) },
                      })
                    }
                  />
                  <GlassInput
                    label="Max Project Photos"
                    type="number"
                    value={pricing.elite_5k.maxPhotos}
                    onChange={(e) =>
                      setPricing({
                        ...pricing,
                        elite_5k: { ...pricing.elite_5k, maxPhotos: Number(e.target.value) },
                      })
                    }
                  />
                </div>
              </GlassCard>
            </div>
          </div>
        )}

        {/* TAB 2: FLUTTERWAVE PAYMENT GATEWAY */}
        {activeTab === 'gateway' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h2 className="text-xl font-extrabold text-foreground font-display">
                  Flutterwave v4 Live Payment Gateway
                </h2>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Configure your Flutterwave Client ID, Client Secret, and Encryption Key to receive payments directly into your bank account.
                </p>
              </div>

              {settingsSuccess && (
                <span className="text-xs font-bold text-emerald-700 dark:text-[#00FF87] flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-4 h-4" /> Flutterwave Gateway Saved
                </span>
              )}
            </div>

            <form onSubmit={handleSavePaymentSettings} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gateway Credentials */}
                <GlassCard intensity="high" className="p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-500" />
                      <h3 className="text-sm font-bold text-foreground">API Credentials</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-mono font-bold text-zinc-400">Environment:</label>
                      <select
                        value={paymentSettings.environment}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, environment: e.target.value as any })}
                        className="bg-card-bg border border-border text-foreground rounded-lg px-2.5 py-1 text-xs font-mono font-bold"
                      >
                        <option value="live">Live Production (v4)</option>
                        <option value="test">Test / Sandbox</option>
                      </select>
                    </div>
                  </div>

                  <GlassInput
                    label="Flutterwave Client ID (v4 OAuth 2.0)"
                    placeholder="Enter your Client ID"
                    value={paymentSettings.clientId}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, clientId: e.target.value })}
                    helperText="Used to generate temporary OAuth 2.0 Bearer tokens"
                  />

                  <GlassInput
                    label="Flutterwave Client Secret (v4 OAuth 2.0)"
                    type="password"
                    placeholder="Enter your Client Secret"
                    value={paymentSettings.clientSecret}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, clientSecret: e.target.value })}
                  />

                  <GlassInput
                    label="Flutterwave Secret Key (FLWSECK-...)"
                    type="password"
                    placeholder="FLWSECK-xxxxxxxxxxxxxxxxxxxx"
                    value={paymentSettings.secretKey}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, secretKey: e.target.value })}
                    helperText="Required for transaction verification and live analytics"
                  />

                  <GlassInput
                    label="Flutterwave Encryption Key (FLWSECK_3DES-...)"
                    type="password"
                    placeholder="FLWSECK_3DES-xxxxxxxxxxxxxxxxxxxx"
                    value={paymentSettings.encryptionKey}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, encryptionKey: e.target.value })}
                    helperText="Required for 3DES direct charge encryption and secure payload hashing"
                  />

                  <GlassInput
                    label="Flutterwave Public Key (FLWPUBK-...)"
                    placeholder="FLWPUBK-xxxxxxxxxxxxxxxxxxxx"
                    value={paymentSettings.publicKey}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, publicKey: e.target.value })}
                  />

                  <GlassInput
                    label="Webhook Secret Hash"
                    placeholder="portfoli_flw_live_secret_hash_2026"
                    value={paymentSettings.webhookSecretHash}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, webhookSecretHash: e.target.value })}
                    helperText="Enter the same secret hash in your Flutterwave Webhook settings"
                  />
                </GlassCard>

                {/* Webhook Configuration Guide */}
                <GlassCard intensity="high" className="p-6 space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-border pb-3">
                      <Radio className="w-4 h-4 text-cyan-500 animate-pulse" />
                      <h3 className="text-sm font-bold text-foreground">Webhook Endpoint Configuration</h3>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-black/40 border border-border space-y-2">
                      <span className="text-[11px] font-mono text-zinc-400 block font-medium">Your Live Webhook URL:</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={webhookUrl || 'https://quirky-kepler.vercel.app/api/webhooks/flutterwave'}
                          className="flex-1 bg-black/60 border border-border rounded-xl px-3 py-2 text-xs font-mono text-emerald-400 select-all"
                        />
                        <button
                          type="button"
                          onClick={handleCopyWebhook}
                          className="p-2.5 rounded-xl bg-card-bg hover:bg-white/10 border border-border text-foreground transition-all cursor-pointer"
                          title="Copy Webhook URL"
                        >
                          {copiedWebhook ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-zinc-400 leading-relaxed">
                      <p className="font-bold text-foreground">How to configure in Flutterwave Dashboard:</p>
                      <ol className="list-decimal list-inside space-y-1.5 font-mono text-[11px]">
                        <li>Log in to your <strong>Flutterwave Dashboard</strong>.</li>
                        <li>Navigate to <strong>Settings</strong> → <strong>Webhooks</strong>.</li>
                        <li>Paste the <strong>Live Webhook URL</strong> above into the endpoint field.</li>
                        <li>Set the <strong>Secret Hash</strong> to match the hash configured on the left.</li>
                        <li>Save changes. All user subscriptions will automatically activate in real-time!</li>
                      </ol>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border flex items-center justify-between">
                    <div className="text-xs font-mono text-zinc-500">
                      Status: {paymentSettings.secretKey || paymentSettings.clientSecret ? <span className="text-emerald-500 font-bold">● Connected</span> : <span className="text-amber-500 font-bold">● Credentials Pending</span>}
                    </div>
                    <GlassButton type="submit" variant="primary" glow loading={savingSettings} className="text-xs font-bold">
                      <Save className="w-3.5 h-3.5" /> Save Flutterwave Credentials
                    </GlassButton>
                  </div>
                </GlassCard>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: LIVE TRANSACTIONS & REVENUE LEDGER */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h2 className="text-xl font-extrabold text-foreground font-display">
                  Live Transactions & Subscriber Ledger
                </h2>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Real-time log of Flutterwave payment transactions, subscription activations, and subscriber renewals.
                </p>
              </div>

              <button
                onClick={() => {
                  const key = sessionStorage.getItem('portfoli_admin_key') || adminPasscode;
                  loadPaymentSettings(key);
                }}
                className="p-2 rounded-xl bg-card-bg border border-border text-foreground hover:text-emerald-500 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-mono"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>

            <GlassCard intensity="high" className="p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-black/30 border-b border-border text-zinc-400 uppercase text-[10px]">
                    <tr>
                      <th className="p-4">Transaction Ref</th>
                      <th className="p-4">Subscriber</th>
                      <th className="p-4">Tier Plan</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(!liveRevenueStats?.recentTransactions || liveRevenueStats.recentTransactions.length === 0) ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-zinc-500 font-sans">
                          No transactions recorded yet. Completed payments will appear here in real-time.
                        </td>
                      </tr>
                    ) : (
                      liveRevenueStats.recentTransactions.map((tx: any) => (
                        <tr key={tx.id || tx.txRef} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-4 font-bold text-foreground truncate max-w-[150px]">{tx.txRef}</td>
                          <td className="p-4">
                            <div className="font-bold text-foreground">{tx.username || 'User'}</div>
                            <div className="text-[10px] text-zinc-500">{tx.userEmail}</div>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase">
                              {tx.tier}
                            </span>
                          </td>
                          <td className="p-4 font-bold text-emerald-400">₦{Number(tx.amount || 0).toLocaleString()}</td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                tx.status === 'successful'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : tx.status === 'pending'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              }`}
                            >
                              {tx.status}
                            </span>
                          </td>
                          <td className="p-4 text-zinc-400 text-[11px]">{new Date(tx.createdAt).toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>
        )}

        {/* TAB 4: GOOGLE TAG MANAGER & ANALYTICS */}
        {activeTab === 'gtm' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h2 className="text-xl font-extrabold text-foreground font-display">
                  Google Tag Manager & Web Analytics
                </h2>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Inject GTM containers & Google Analytics 4 across all public & creator pages (strictly excluded from /admin).
                </p>
              </div>

              {settingsSuccess && (
                <span className="text-xs font-bold text-emerald-700 dark:text-[#00FF87] flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-4 h-4" /> Analytics Config Saved
                </span>
              )}
            </div>

            <form onSubmit={handleSavePaymentSettings} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* GTM Inputs */}
                <GlassCard intensity="high" className="p-6 space-y-4">
                  <div className="flex items-center gap-2 border-b border-border pb-3">
                    <Globe className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-sm font-bold text-foreground">Container & Tracking IDs</h3>
                  </div>

                  <GlassInput
                    label="Google Tag Manager Container ID"
                    placeholder="GTM-XXXXXXX"
                    value={paymentSettings.gtmContainerId}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, gtmContainerId: e.target.value })}
                    helperText="Injected in <head> and <body> for all pages except /admin"
                  />

                  <GlassInput
                    label="Google Analytics 4 Measurement ID (Optional)"
                    placeholder="G-XXXXXXXXXX"
                    value={paymentSettings.ga4MeasurementId}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, ga4MeasurementId: e.target.value })}
                    helperText="Direct GA4 tracking integration"
                  />

                  <GlassInput
                    label="Google Looker Studio Embed URL (Optional)"
                    placeholder="https://lookerstudio.google.com/embed/reporting/..."
                    value={paymentSettings.lookerStudioEmbedUrl}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, lookerStudioEmbedUrl: e.target.value })}
                    helperText="Embeds live interactive visual charts right inside this admin portal"
                  />

                  <div className="pt-2">
                    <GlassButton type="submit" variant="primary" glow loading={savingSettings} className="text-xs font-bold">
                      <Save className="w-3.5 h-3.5" /> Save Analytics IDs
                    </GlassButton>
                  </div>
                </GlassCard>

                {/* How to get GTM Guide */}
                <GlassCard intensity="high" className="p-6 space-y-3">
                  <div className="flex items-center gap-2 border-b border-border pb-3">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-bold text-foreground">How to Get Your GTM Container ID in 60 Seconds</h3>
                  </div>

                  <div className="space-y-3 text-xs text-zinc-300 leading-relaxed">
                    <p className="text-zinc-400">Google Tag Manager is 100% free from Google. Follow these steps:</p>
                    <ol className="list-decimal list-inside space-y-2 font-mono text-[11px] text-zinc-300">
                      <li>
                        Go to <a href="https://tagmanager.google.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline font-bold">tagmanager.google.com</a> and sign in with your Google account.
                      </li>
                      <li>Click <strong>Create Account</strong>.</li>
                      <li>Enter your Account Name (e.g. <em>portfoli</em>) and Country.</li>
                      <li>In <strong>Container setup</strong>, enter target domain <code className="text-emerald-400">quirky-kepler.vercel.app</code> and select <strong>Web</strong>.</li>
                      <li>Click <strong>Create</strong>. You will immediately see your Container ID in the top right formatted as <code className="text-emerald-400 font-bold">GTM-XXXXXXX</code>.</li>
                      <li>Copy and paste it into the field on the left, then click <strong>Save</strong>!</li>
                    </ol>
                  </div>
                </GlassCard>
              </div>

              {/* Looker Studio Embedded Dashboard Viewer (if URL configured) */}
              {paymentSettings.lookerStudioEmbedUrl && (
                <GlassCard intensity="high" className="p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-500" /> Live Web Traffic & Event Dashboard
                    </h3>
                    <a
                      href={paymentSettings.lookerStudioEmbedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-emerald-400 flex items-center gap-1 hover:underline"
                    >
                      Open Full Screen <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden bg-black border border-border">
                    <iframe
                      src={paymentSettings.lookerStudioEmbedUrl}
                      className="w-full h-full border-0"
                      allowFullScreen
                    />
                  </div>
                </GlassCard>
              )}
            </form>
          </div>
        )}

        {/* TAB 5: ADMIN SECURITY & PASSCODE SETTINGS */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/40 text-emerald-700 dark:text-[#00FF87] flex items-center justify-center">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-foreground font-display">
                  Admin Security & Passcode Settings
                </h2>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Update the Master Admin Passcode for protecting platform telemetry, gateway credentials, and pricing controls.
                </p>
              </div>
            </div>

            <GlassCard intensity="high" className="p-6 max-w-2xl">
              {passSuccess && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-500/40 text-emerald-800 dark:text-[#00FF87] text-xs font-bold flex items-center gap-2 font-mono">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{passSuccess}</span>
                </div>
              )}

              {passError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-500/40 text-rose-800 dark:text-rose-300 text-xs font-bold flex items-center gap-2 font-mono">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{passError}</span>
                </div>
              )}

              <form onSubmit={handleUpdatePasscode} className="space-y-4">
                <GlassInput
                  label="Current Admin Passcode"
                  type="password"
                  placeholder="Enter current passcode (default: admin123)"
                  value={currentPasscode}
                  onChange={(e) => setCurrentPasscode(e.target.value)}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <GlassInput
                    label="New Admin Passcode"
                    type="password"
                    placeholder="At least 6 characters"
                    value={newPasscode}
                    onChange={(e) => setNewPasscode(e.target.value)}
                    required
                  />
                  <GlassInput
                    label="Confirm New Passcode"
                    type="password"
                    placeholder="Re-enter new passcode"
                    value={confirmPasscode}
                    onChange={(e) => setConfirmPasscode(e.target.value)}
                    required
                  />
                </div>

                <div className="pt-2">
                  <GlassButton
                    type="submit"
                    variant="primary"
                    glow
                    loading={isUpdatingPass}
                    className="text-xs font-bold py-2.5"
                  >
                    <Save className="w-3.5 h-3.5" /> Update Admin Passcode
                  </GlassButton>
                </div>
              </form>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
}
