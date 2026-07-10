import { siteConfig } from "@/lib/site";

/** Must mirror the visible on-screen breadcrumb trail verbatim. */
export function docsBreadcrumbJsonLd(pageName: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Docs", item: `${siteConfig.url}/docs` },
      { "@type": "ListItem", position: 2, name: pageName, item: `${siteConfig.url}${path}` },
    ],
  };
}
