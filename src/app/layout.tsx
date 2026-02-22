import { Analytics } from '@vercel/analytics/react';
import { geolocation, ipAddress } from '@vercel/functions';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Geist, Geist_Mono } from 'next/font/google';
import { headers } from 'next/headers';

import Footer from '@/components/Footer';
import { GoogleAnalyticsDeferred } from '@/components/GoogleAnalyticsDeferred';
import Navbar from '@/components/Navbar';

import type { Metadata } from 'next';

import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Sip Happens | Espresso Martini Reviews',
  description:
    "Reviewing espresso martinis around the globe, one sip at a time. Honest reviews from the world's best (and worst) bars.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersData = await headers();
  const ip = ipAddress({ headers: headersData }) || 'Unknown';
  const geo = geolocation({ headers: headersData });
  const geoData = { ip, geo };

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <GoogleAnalyticsDeferred
          gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || ''}
          geoData={geoData}
        />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
