import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { meta } from '@/data/data';

/* ── Fonts are SELF-HOSTED, deliberately ──────────────────────────

   These were `next/font/google`, which downloads each family from
   fonts.gstatic.com *at build time*. That worked on this machine and
   failed on Vercel:

     Module not found: Can't resolve
     '@vercel/turbopack-next/internal/font/google/font'

   The deployment could not reach the font CDN, so the build died before
   it produced any output — which is why the site 404'd rather than
   showing an error. A build that depends on the network reaching a
   third party is not reproducible.

   next/font/local reads the .woff2 files out of the repo, so the build
   is hermetic: no network, faster, and identical on every machine.
   Files are the latin subset, 107 KB total, committed to the repo. */
const display = localFont({
  src: './fonts/anton-400.woff2',
  weight: '400',
  style: 'normal',
  variable: '--font-display-loaded',
  display: 'swap',
  fallback: ['Arial Narrow', 'sans-serif'],
});

const body = localFont({
  src: './fonts/inter-var.woff2',
  weight: '100 900',
  style: 'normal',
  variable: '--font-body-loaded',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

const mono = localFont({
  src: [
    { path: './fonts/jbmono-400.woff2', weight: '400', style: 'normal' },
    { path: './fonts/jbmono-500.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--font-mono-loaded',
  display: 'swap',
  fallback: ['ui-monospace', 'monospace'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://preetpanaviya.vercel.app'),
  title: `${meta.name} — ${meta.role}`,
  description: meta.description,
  authors: [{ name: meta.name }],
  openGraph: {
    type: 'website',
    title: `${meta.name} — ${meta.role}`,
    description: meta.description,
    siteName: meta.name,
    locale: 'en_IN',
    // TODO: add an OG image at /og.jpg once one exists
  },
  twitter: {
    card: 'summary_large_image',
    title: `${meta.name} — ${meta.role}`,
    description: meta.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      {/* No manual <head> font preload. The Anton preload used to live
          here, hardcoded to a fonts.gstatic.com URL — a build-time-free
          but runtime network dependency that also failed outright on
          Vercel. next/font/local already emits its own <link rel=preload>
          for the hashed local file, so this block was pure duplication. */}
      <body className="antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:bg-accent focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:uppercase focus:tracking-widest focus:text-base"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}