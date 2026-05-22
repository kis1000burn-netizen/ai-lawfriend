import type { MetadataRoute } from "next";

import { isSearchIndexingBlocked } from "@/lib/site-indexing-policy";
import { sitemapLastModified } from "@/lib/sitemap-lastmod";
import { siteOrigin } from "@/lib/site-origin";

/**
 * 공개 페이지 URL만 포함. 순서 대략 = 유입 우선순위.
 * 골격(MVP) 안내 페이지는 priority·changefreq 를 낮추어 크롤 힌트 부담을 줄임.
 */
const PUBLIC_SITEMAP_ENTRIES = [
  { path: "/", changeFrequency: "daily" as const, priority: 1 },
  { path: "/illegal-lending", changeFrequency: "weekly" as const, priority: 0.95 },
  { path: "/jeonse-damage", changeFrequency: "weekly" as const, priority: 0.95 },
  { path: "/wage-claim/report", changeFrequency: "weekly" as const, priority: 0.92 },
  { path: "/illegal-lending/report", changeFrequency: "weekly" as const, priority: 0.9 },
  { path: "/jeonse-damage/report", changeFrequency: "weekly" as const, priority: 0.9 },
  { path: "/templates", changeFrequency: "weekly" as const, priority: 0.88 },
  { path: "/templates/complaint", changeFrequency: "weekly" as const, priority: 0.84 },
  { path: "/templates/statement", changeFrequency: "weekly" as const, priority: 0.84 },
  {
    path: "/free/illegal-lending-report",
    changeFrequency: "weekly" as const,
    priority: 0.82,
  },
  {
    path: "/free/jeonse-damage-report",
    changeFrequency: "weekly" as const,
    priority: 0.82,
  },
  {
    path: "/document-verification",
    changeFrequency: "weekly" as const,
    priority: 0.8,
  },
  { path: "/faq", changeFrequency: "monthly" as const, priority: 0.55 },
  { path: "/guide", changeFrequency: "monthly" as const, priority: 0.55 },
  { path: "/institutions", changeFrequency: "monthly" as const, priority: 0.58 },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  if (isSearchIndexingBlocked()) {
    return [];
  }

  const base = siteOrigin();
  const lastModified = sitemapLastModified();

  return PUBLIC_SITEMAP_ENTRIES.map(({ path, changeFrequency, priority }) => ({
    url: `${base}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
