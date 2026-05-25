import { describe, expect, it } from "vitest";
import { buildMarketplaceListingServiceCatalog } from "./marketplace-service-catalog.service";

describe("marketplace-service-catalog (Phase 31-D)", () => {
  it("marks marketplaceCatalogReady when required listings published", () => {
    const result = buildMarketplaceListingServiceCatalog();
    expect(result.marketplaceCatalogReady).toBe(true);
  });
});
