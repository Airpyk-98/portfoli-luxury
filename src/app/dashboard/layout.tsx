'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Edit3,
  Sliders,
  Settings,
  Mail,
  ExternalLink,
  LogOut,
  Shield,
} from 'lucide-react';
import { CountdownBadge } from '@/components/ui/countdown-badge';
import { StorageBar } from '@/components/ui/storage-bar';
import { ThemeToggle } from '@/components/theme-toggle';
import { SubscriptionGraceBanner } from '@/components/subscription-grace-banner';
import { User } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/portfolio')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        } else {
          router.push('/login');
        }
      })
      .catch((err) => {
        console.error(err);
        router.push('/login');
      })
      .finally(() => setLoading(false));
  }, [router]);

  const navItems = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/editor', label: 'Studio Editor', icon: Edit3 },
    { href: '/dashboard/services', label: 'Services & Pricing', icon: Sliders },
    { href: '/dashboard/inquiries', label: 'Inquiries Inbox', icon: Mail },
    { href: '/dashboard/settings', label: 'Settings & Quotas', icon: Settings },
  ];

  const handleLogout = () => {
    document.cookie = 'portfoli_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/login');
  };

  const username = user?.username || '';
  const publicUrl = username ? `/${username}` : '#';

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="animate-pulse flex items-center gap-2 text-sm text-zinc-400 font-mono">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          Loading workspace...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col md:flex-row relative selection:bg-emerald-400 selection:text-black transition-colors duration-500">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-64 w-[600px] h-[400px] bg-emerald-500/10 dark:bg-emerald-500/10 rounded-full blur-[160px]" />
      </div>

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-72 bg-card-bg border-r border-border backdrop-blur-2xl p-6 flex flex-col justify-between z-20 flex-shrink-0 transition-colors duration-300">
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-300 flex items-center justify-center text-black font-black text-sm shadow-glass-glow">
                P
              </div>
              <span className="font-display font-extrabold text-lg tracking-tight text-foreground group-hover:text-emerald-500 transition-colors">
                portfoli
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <span className="text-[10px] font-mono text-emerald-800 dark:text-[#00FF87] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-400/40 font-bold">
                STUDIO
              </span>
            </div>
          </div>

          {/* User Profile Mini Bar */}
          <div className="p-3 rounded-2xl bg-black/5 dark:bg-[#0e1713]/80 border border-border flex items-center justify-between">
            <div className="space-y-0.5 overflow-hidden">
              <div className="text-xs font-bold text-foreground truncate max-w-[130px]">
                {user?.name || user?.username || 'Creator'}
              </div>
              <div className="text-[11px] font-mono text-emerald-700 dark:text-[#00FF87] font-bold truncate">
                @{username}
              </div>
            </div>
            {username && (
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-700 dark:text-[#00FF87] hover:text-white dark:hover:text-black border border-emerald-500/30 transition-all shrink-0"
                title="View Public Portfolio"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200',
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-800 dark:text-[#00FF87] border border-emerald-400/50 shadow-glass-glow'
                      : 'text-zinc-700 dark:text-zinc-300 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'
                  )}
                >
                  <Icon className="w-4 h-4 text-emerald-600 dark:text-[#00FF87]" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Subscription Countdown & Storage Gauge */}
        <div className="space-y-4 pt-6 border-t border-border">
          <CountdownBadge subscription={user?.subscription} compact />
          <StorageBar
            tier={user?.subscription?.tier}
            usedBytes={user?.storageUsedBytes || 0}
            className="p-3 text-[11px]"
          />

          <div className="flex items-center justify-between pt-2">
            {user?.role === 'admin' && (
              <Link
                href="/admin"
                className="text-[11px] font-mono font-semibold text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-[#00FF87] flex items-center gap-1"
              >
                <Shield className="w-3.5 h-3.5" /> Admin Control
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 hover:text-rose-600 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Log Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-7xl relative z-10">
        <SubscriptionGraceBanner user={user} />
        {children}
      </main>
    </div>
  );
}
