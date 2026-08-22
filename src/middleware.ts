import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

  // Exclude internal static assets and API routes
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/static') ||
    url.pathname.startsWith('/uploads') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Extract potential subdomain intelligently across localhost, netlify.app, vercel.app, and custom domains
  let subdomain: string | null = null;

  if (hostname.includes('localhost')) {
    const hostWithoutPort = hostname.split(':')[0];
    const hostParts = hostWithoutPort.split('.');
    if (hostParts.length >= 2 && hostParts[0] !== 'localhost') {
      subdomain = hostParts[0].toLowerCase();
    }
  } else if (hostname.endsWith('.netlify.app')) {
    const hostParts = hostname.split('.');
    // e.g. "kristos.portfoli-luxury.netlify.app" has length 4
    if (hostParts.length >= 4) {
      subdomain = hostParts[0].toLowerCase();
    }
  } else if (hostname.endsWith('.vercel.app')) {
    const hostParts = hostname.split('.');
    if (hostParts.length >= 4) {
      subdomain = hostParts[0].toLowerCase();
    }
  } else {
    // Custom domains e.g. "kristos.portfoli.me" has length 3
    const hostParts = hostname.split('.');
    if (hostParts.length >= 3) {
      subdomain = hostParts[0].toLowerCase();
    }
  }

  // Ignored root subdomains
  const ignoredSubdomains = ['www', 'app', 'api', 'admin', 'mail', 'portfoli-luxury'];

  if (subdomain && !ignoredSubdomains.includes(subdomain)) {
    // Rewrite root request on subdomain to the user's portfolio route
    if (url.pathname === '/' || url.pathname === '') {
      url.pathname = `/${subdomain}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
