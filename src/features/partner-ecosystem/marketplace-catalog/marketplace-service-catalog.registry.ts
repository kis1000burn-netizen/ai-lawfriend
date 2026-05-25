/**
 * Product Phase 31-D — Marketplace listing / service catalog SSOT.
 */
import type { MarketplaceListingServiceCatalogResult } from "./marketplace-service-catalog.schema";

export const MARKETPLACE_CATALOG_REGISTRY_MARKER_PHASE31D =
  "phase31d-marketplace-catalog-registry" as const;

type MarketplaceListing = Omit<
  MarketplaceListingServiceCatalogResult["listings"][number],
  "published"
>;

export const MARKETPLACE_LISTINGS: MarketplaceListing[] = [
  { listingId: "CONSULTATION_PACKAGE", label: "Consultation package listing", required: true },
  { listingId: "DOCUMENT_REVIEW_SERVICE", label: "Document review service listing", required: true },
  {
    listingId: "LITIGATION_SUPPORT_BUNDLE",
    label: "Litigation support bundle listing",
    required: true,
  },
  {
    listingId: "EXPERT_WITNESS_REFERRAL",
    label: "Expert witness referral listing",
    required: true,
  },
  { listingId: "BRANCH_WHITE_LABEL", label: "Branch white-label listing", required: false },
];
