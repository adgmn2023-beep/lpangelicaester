import type { Metadata, Viewport } from "next";

import { AnalyticsScripts } from "@/components/analytics";
import { site, siteUrl } from "@/config/site";
import { brand } from "@/config/brand";
import "./globals.css";


export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: site.title,
  description: site.description,
  applicationName: site.name,
  alternates: siteUrl ? { canonical: siteUrl } : undefined,
  openGraph: {
    type: "website",
    locale: site.locale,
    siteName: site.name,
    title: site.title,
    description: site.description,
    url: siteUrl,
    images: brand.og ? [{ url: brand.og, width: 1200, height: 630, alt: site.name }] : undefined,
  },
  twitter: {
    card: brand.og ? "summary_large_image" : "summary",
    title: site.title,
    description: site.description,
    images: brand.og ? [brand.og] : undefined,
  },
  icons: {
    icon: brand.icon ? [{ url: brand.icon, sizes: "512x512", type: "image/png" }] : undefined,
    apple: brand.appleIcon ? [{ url: brand.appleIcon, sizes: "180x180", type: "image/png" }] : undefined,
  },
  robots: { index: Boolean(siteUrl), follow: Boolean(siteUrl) },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body >
        {children}
        <AnalyticsScripts />
      </body>
    </html>
  );
}
