/**
 * Product Phase 31-D — Marketplace listing / service catalog schema (Zod SSOT).
 */
import { z } from "zod";

export const MARKETPLACE_CATALOG_SCHEMA_MARKER_PHASE31D =
  "phase31d-marketplace-catalog-schema" as const;

export const MARKETPLACE_CATALOG_VERSION = "31-D.1" as const;

export const MARKETPLACE_LISTING_IDS = [
  "CONSULTATION_PACKAGE",
  "DOCUMENT_REVIEW_SERVICE",
  "LITIGATION_SUPPORT_BUNDLE",
  "EXPERT_WITNESS_REFERRAL",
  "BRANCH_WHITE_LABEL",
] as const;

export const marketplaceListingSchema = z.object({
  listingId: z.enum(MARKETPLACE_LISTING_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  published: z.boolean(),
});

export const marketplaceListingServiceCatalogResultSchema = z.object({
  version: z.literal(MARKETPLACE_CATALOG_VERSION),
  networkSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  listings: z.array(marketplaceListingSchema).min(1),
  completionRate: z.number().min(0).max(100),
  marketplaceCatalogReady: z.boolean(),
});

export type MarketplaceListingId = (typeof MARKETPLACE_LISTING_IDS)[number];
export type MarketplaceListingServiceCatalogResult = z.infer<
  typeof marketplaceListingServiceCatalogResultSchema
>;
