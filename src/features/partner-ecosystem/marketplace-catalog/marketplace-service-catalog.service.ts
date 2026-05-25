/**
 * Product Phase 31-D — Marketplace listing / service catalog service.
 */
import { PARTNER_ECOSYSTEM_DEFAULT_NETWORK_SLUG } from "../partner-program/partner-program-model.registry";
import { MARKETPLACE_LISTINGS } from "./marketplace-service-catalog.registry";
import { assembleMarketplaceListingServiceCatalog } from "./marketplace-service-catalog.policy";
import type { MarketplaceListingServiceCatalogResult } from "./marketplace-service-catalog.schema";

export const MARKETPLACE_CATALOG_SERVICE_MARKER_PHASE31D =
  "phase31d-marketplace-catalog-service" as const;

export function buildMarketplaceListingServiceCatalog(input?: {
  networkSlug?: string;
  publishedListingIds?: string[];
}): MarketplaceListingServiceCatalogResult {
  const publishedListingIds = new Set(
    input?.publishedListingIds ??
      MARKETPLACE_LISTINGS.filter((listing) => listing.required).map(
        (listing) => listing.listingId,
      ),
  );

  return assembleMarketplaceListingServiceCatalog({
    networkSlug: input?.networkSlug ?? PARTNER_ECOSYSTEM_DEFAULT_NETWORK_SLUG,
    publishedListingIds,
  });
}
