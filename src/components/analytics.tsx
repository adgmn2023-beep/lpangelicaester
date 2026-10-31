"use client";

import Script from "next/script";

declare global {
  interface Window {
    gtag?: (...args: [string, ...unknown[]]) => void;
    dataLayer?: unknown[];
  }
}

export function AnalyticsScripts() {
  const adsId = process.env.NEXT_PUBLIC_GADS_ID;
  const ga4Id = process.env.NEXT_PUBLIC_GA4_ID;
  const measurementId = adsId || ga4Id;

  if (!measurementId) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || []; window.gtag = function(){window.dataLayer.push(arguments);}; window.gtag('js', new Date()); ${
          adsId ? `window.gtag('config', '${adsId}');` : ""
        } ${ga4Id ? `window.gtag('config', '${ga4Id}');` : ""}`}
      </Script>
    </>
  );
}

export function trackConversion(action: "whatsapp" | "phone" | "directions") {
  const adsId = process.env.NEXT_PUBLIC_GADS_ID;
  const ga4Id = process.env.NEXT_PUBLIC_GA4_ID;
  if (typeof window === "undefined" || (!adsId && !ga4Id)) {
    return;
  }

  const gtag = window.gtag || ((...args: [string, ...unknown[]]) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(args);
  });

  gtag("event", `click_${action}`, {
    event_category: "engagement",
    event_label: action,
  });

  const label = process.env.NEXT_PUBLIC_GADS_WHATSAPP_LABEL;
  if (action === "whatsapp" && adsId && label) {
    gtag("event", "conversion", {
      send_to: `${adsId}/${label}`,
    });
  }
}
