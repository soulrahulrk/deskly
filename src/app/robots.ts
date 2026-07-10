import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard", "/tickets", "/contacts", "/analytics", "/settings"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
