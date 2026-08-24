import { Metadata } from 'next';
import { Database } from '@/lib/storage';
import { PortfolioRenderer } from '@/components/portfolio-renderer';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { Sparkles, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  params: { username: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const username = params?.username;
  if (!username) {
    return { title: 'Portfolio Not Found — portfoli' };
  }
  const user = await Database.findUserByUsernameAsync(username);
  if (!user || !user.portfolio) {
    return {
      title: 'Portfolio Not Found — portfoli',
    };
  }

  return {
    title: `${user.portfolio.displayName} — ${user.portfolio.headline} | portfoli`,
    description: user.portfolio.bio,
    openGraph: {
      title: `${user.portfolio.displayName} | portfoli`,
      description: user.portfolio.bio,
      images: user.portfolio.avatarUrl ? [user.portfolio.avatarUrl] : [],
    },
  };
}

export default async function PublicPortfolioPage({ params }: Props) {
  const username = params?.username;
  const user = username ? await Database.findUserByUsernameAsync(username) : null;

  if (!user || !user.portfolio) {
    return (
      <div className="min-h-screen bg-[#070a08] text-zinc-100 font-sans flex items-center justify-center p-4 relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-emerald-500/10 rounded-full blur-[160px]" />
        </div>

        <GlassCard intensity="ultra" glow className="max-w-md w-full p-8 text-center space-y-6 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white font-display">Handle Available</h1>
            <p className="text-xs text-zinc-400">
              The portfolio handle <code className="text-emerald-400 font-bold">@{username || 'unknown'}</code> is not claimed yet.
            </p>
          </div>

          <Link href={`/register`}>
            <GlassButton variant="primary" glow className="w-full text-xs font-bold">
              Claim @{username || 'handle'} Now <ArrowRight className="w-4 h-4 ml-1" />
            </GlassButton>
          </Link>

          <div className="pt-2">
            <Link href="/" className="text-xs text-zinc-500 hover:text-emerald-400 transition-colors">
              ← Return to portfoli home
            </Link>
          </div>
        </GlassCard>
      </div>
    );
  }

  return <PortfolioRenderer portfolio={user.portfolio} isOwner={false} />;
}
