/**
 * Product Phase 31-D — Marketplace listing / service catalog policy SSOT.
 */
import { MARKETPLACE_LISTINGS } from "./marketplace-service-catalog.registry";
import type { MarketplaceListingServiceCatalogResult } from "./marketplace-service-catalog.schema";
import { MARKETPLACE_CATALOG_VERSION } from "./marketplace-service-catalog.schema";

export const MARKETPLACE_CATALOG_POLICY_MARKER_PHASE31D =
  "phase31d-marketplace-catalog-policy" as const;

export function assembleMarketplaceListingServiceCatalog(input: {
  networkSlug: string;
  publishedListingIds: Set<string>;
  generatedAt?: string;
}): MarketplaceListingServiceCatalogResult {
  const listings = MARKETPLACE_LISTINGS.map((listing) => ({
    ...listing,
    published: input.publishedListingIds.has(listing.listingId),
  }));

  const required = listings.filter((listing) => listing.required);
  const publishedRequired = required.filter((listing) => listing.published).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((publishedRequired / required.length) * 100);

  return {
    version: MARKETPLACE_CATALOG_VERSION,
    networkSlug: input.networkSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    listings,
    completionRate,
    marketplaceCatalogReady: publishedRequired === required.length,
  };
}
