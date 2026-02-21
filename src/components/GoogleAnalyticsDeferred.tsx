'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

import { googleAnalyticsFallbackTimeoutMs, googleAnalyticsIdleTimeoutMs } from '@/lib/constants';

/**
 * Defers Google Analytics loading until the browser is idle,
 * keeping gtag out of Lighthouse's critical rendering path.
 */
export const GoogleAnalyticsDeferred = ({ gaId }: { gaId: string }) => {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (!gaId) return;

    const load = () => setShouldLoad(true);

    if (typeof requestIdleCallback === 'function') {
      const id = requestIdleCallback(load, { timeout: googleAnalyticsIdleTimeoutMs });
      return () => cancelIdleCallback(id);
    }

    const timer = setTimeout(load, googleAnalyticsFallbackTimeoutMs);
    return () => clearTimeout(timer);
  }, [gaId]);

  if (!gaId || !shouldLoad) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="lazyOnload" />
      <Script id="ga-init" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  );
};
