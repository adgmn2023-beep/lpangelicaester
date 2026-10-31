import { siteUrl } from "@/config/site";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const url = siteUrl;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    ...(url ? { sitemap: new URL("/sitemap.xml", url).toString() } : {}),
  };
}
