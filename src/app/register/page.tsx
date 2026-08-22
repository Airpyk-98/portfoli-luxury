'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { GlassInput } from '@/components/ui/glass-input';
import { ThemeToggle } from '@/components/theme-toggle';
import { ScrollReveal, PerspectiveTilt } from '@/components/ui/kinetic-motion';
import { User, Mail, Lock, Check, X, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live username debounced availability check
  useEffect(() => {
    if (!username || username.trim().length < 3) {
      setUsernameAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingUsername(true);
      try {
        const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(username.trim())}`);
        const data = await res.json();
        setUsernameAvailable(data.available);
      } catch {
        setUsernameAvailable(null);
      } finally {
        setCheckingUsername(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !username || !password) return;
    if (usernameAvailable === false) {
      setError('Please choose an available username.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed.');
      } else {
        router.push('/dashboard/editor');
      }
    } catch {
      setError('Connection error. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-emerald-400 selection:text-black flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-500">
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-emerald-500/10 rounded-full blur-[160px]" />
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
            <h1 className="text-2xl font-black text-foreground font-display">Claim Your Portfolio Handle</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Create your account with 200MB free storage and 3D display capabilities.
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
                  label="Full Name"
                  placeholder="e.g. Maya Chen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  leftIcon={<User className="w-4 h-4" />}
                  required
                />

                <GlassInput
                  label="Email Address"
                  type="email"
                  placeholder="maya@design.co"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4" />}
                  required
                />

                <div className="space-y-1">
                  <GlassInput
                    label="Desired Username / Handle"
                    placeholder="mayachen"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                    rightIcon={
                      checkingUsername ? (
                        <span className="text-[10px] text-zinc-400">checking...</span>
                      ) : usernameAvailable === true ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : usernameAvailable === false ? (
                        <X className="w-4 h-4 text-rose-500" />
                      ) : null
                    }
                    helper={
                      username
                        ? usernameAvailable === true
                          ? `✓ portfoli.me/${username} is available!`
                          : usernameAvailable === false
                          ? `✗ @${username} is already claimed.`
                          : `Choose 3+ letters or numbers.`
                        : `Your public slug: portfoli.me/yourname`
                    }
                    required
                  />
                </div>

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
                  disabled={usernameAvailable === false}
                  className="w-full text-xs font-bold py-3 mt-2"
                >
                  Create Portfolio & Claim Handle <ArrowRight className="w-4 h-4 ml-1" />
                </GlassButton>
              </form>

              <div className="pt-4 border-t border-border text-center text-xs text-zinc-500 dark:text-zinc-400">
                Already have an account?{' '}
                <Link href="/login" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                  Sign in here
                </Link>
              </div>
            </GlassCard>
          </PerspectiveTilt>
        </ScrollReveal>
      </div>
    </div>
  );
}
