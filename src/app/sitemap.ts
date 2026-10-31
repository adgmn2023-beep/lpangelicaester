import type { MetadataRoute } from "next";
import { site, siteUrl } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = siteUrl;
  if (!url) return [];

  return [
    {
      url,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: new URL(site.privacyPath, url).toString(),
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];
}
