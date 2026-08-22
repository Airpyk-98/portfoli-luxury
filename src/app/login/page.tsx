'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { GlassInput } from '@/components/ui/glass-input';
import { ThemeToggle } from '@/components/theme-toggle';
import { ScrollReveal, PerspectiveTilt } from '@/components/ui/kinetic-motion';
import { Lock, Mail, Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!login || !password) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invalid credentials.');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Connection error. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-emerald-400 selection:text-black flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-500">
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-emerald-500/10 rounded-full blur-[150px]" />
      </div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
          <ThemeToggle />
        </div>

        <ScrollReveal animation="fade-up">
          <div className="text-center space-y-2">
            <Link href="/" className="inline-flex items-center gap-2 group mb-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-300 flex items-center justify-center text-black font-black text-sm shadow-glass-glow">
                P
              </div>
              <span className="font-display font-extrabold text-xl tracking-tight text-foreground group-hover:text-emerald-500 transition-colors">
                portfoli
              </span>
            </Link>
            <h1 className="text-2xl font-black text-foreground font-display">Creator Sign In</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Access your studio editor, project showcases, and live analytics.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal animation="scale-up" delayMs={100}>
          <PerspectiveTilt>
            <GlassCard intensity="ultra" glow className="p-6 sm:p-8 space-y-6">
              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-medium text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <GlassInput
                  label="Username or Email"
                  placeholder="e.g. kristos or alex@domain.com"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4" />}
                  required
                />

                <GlassInput
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                  required
                />

                <GlassButton
                  type="submit"
                  variant="primary"
                  glow
                  loading={loading}
                  className="w-full text-xs font-bold py-3 mt-2"
                >
                  Sign In to Studio <ArrowRight className="w-4 h-4 ml-1" />
                </GlassButton>
              </form>

              <div className="pt-4 border-t border-border text-center text-xs text-zinc-500 dark:text-zinc-400 space-y-2">
                <p>
                  Don&apos;t have an account yet?{' '}
                  <Link href="/register" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                    Claim your handle now
                  </Link>
                </p>
                <div className="pt-2 text-[11px] font-mono text-zinc-400">
                  Demo credentials: <code className="text-emerald-600 dark:text-emerald-400">kristos</code> / <code className="text-emerald-600 dark:text-emerald-400">password123</code>
                </div>
              </div>
            </GlassCard>
          </PerspectiveTilt>
        </ScrollReveal>
      </div>
    </div>
  );
}
