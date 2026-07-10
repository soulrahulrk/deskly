import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

/**
 * Public, crawlable pages only — the authenticated app and auth utility
 * pages (login/register/reset) aren't content destinations worth indexing.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/docs", "/docs/getting-started", "/docs/features", "/docs/deployment", "/faq"];

  return routes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
