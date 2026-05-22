import type { MetadataRoute } from "next";

import { ROBOTS_DISALLOW_PREFIXES } from "@/lib/robots-disallow-policy";
import { isSearchIndexingBlocked } from "@/lib/site-indexing-policy";
import { siteOrigin } from "@/lib/site-origin";

export default function robots(): MetadataRoute.Robots {
  if (isSearchIndexingBlocked()) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  const origin = siteOrigin();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [...ROBOTS_DISALLOW_PREFIXES],
    },
    sitemap: `${origin}/sitemap.xml`,
  };
}
