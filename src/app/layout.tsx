import type { Metadata, Viewport } from 'next';
import { Anton, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { meta } from '@/data/data';

const display = Anton({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display-loaded',
  display: 'swap',
});

const body = Inter({
  subsets: ['latin'],
  variable: '--font-body-loaded',
  display: 'swap',
});

const mono = JetBrains_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-mono-loaded',
  display: 'swap',
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
      <head>
        {/* Preload the display face — it is the largest paint on the page */}
        <link
          rel="preload"
          href="https://fonts.gstatic.com/s/anton/v25/1Ptgg87LROyAm3K8-C8CSKlv.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
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