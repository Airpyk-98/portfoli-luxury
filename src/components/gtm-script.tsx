'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

export function GTMScript() {
  const pathname = usePathname();
  const [gtmId, setGtmId] = useState<string>(
    process.env.NEXT_PUBLIC_GTM_ID || 'GTM-PORTFOLI2026'
  );
  const [ga4Id, setGa4Id] = useState<string>(
    process.env.NEXT_PUBLIC_GA4_ID || ''
  );

  useEffect(() => {
    // If admin authorized or custom settings available, fetch custom configured IDs
    fetch('/api/admin/payment-settings')
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (data?.settings?.gtmContainerId) {
          setGtmId(data.settings.gtmContainerId.trim());
        }
        if (data?.settings?.ga4MeasurementId) {
          setGa4Id(data.settings.ga4MeasurementId.trim());
        }
      })
      .catch(() => {});
  }, []);

  // STRICT RULE: Exclude Google Tag Manager and analytics from all /admin pages
  if (pathname && (pathname === '/admin' || pathname.startsWith('/admin/'))) {
    return null;
  }

  return (
    <>
      {/* Google Tag Manager (GTM) Container Script */}
      {gtmId && (
        <>
          <Script
            id="google-tag-manager"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${gtmId}');
              `,
            }}
          />
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        </>
      )}

      {/* Google Analytics 4 (GA4) Direct Script (if configured) */}
      {ga4Id && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
            strategy="afterInteractive"
          />
          <Script
            id="google-analytics-ga4"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${ga4Id}', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
        </>
      )}
    </>
  );
}
