import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Outfit, Space_Grotesk, Syne, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-outfit',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const syne = Syne({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'portfoli — Luxury Glassmorphic Portfolio Platform',
  description:
    'A high-end multi-user portfolio platform with 3D Crystal Prism showcases, customizable glassmorphic themes, and subdomains designed to give creators, developers, and designers maximum confidence.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${plusJakartaSans.variable} ${outfit.variable} ${spaceGrotesk.variable} ${syne.variable} ${jetbrainsMono.variable} ${plusJakartaSans.className} font-sans antialiased selection:bg-emerald-400 selection:text-black`}
      >
        <ThemeProvider defaultTheme="dark">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
