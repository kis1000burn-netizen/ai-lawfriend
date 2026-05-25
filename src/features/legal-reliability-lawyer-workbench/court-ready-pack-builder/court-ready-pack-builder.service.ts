/**
 * Product Phase 48-E — Court-ready Pack Builder UX service.
 */
import { COURT_READY_PACK_BUILDER_UX_ITEMS, LEGAL_RELIABILITY_LAWYER_WORKBENCH_DEFAULT_SCOPE_SLUG } from "./court-ready-pack-builder.registry";
import { assembleCourtReadyPackBuilderUx } from "./court-ready-pack-builder.policy";
import type { CourtReadyPackBuilderUxResult } from "./court-ready-pack-builder.schema";

export const COURT_READY_PACK_BUILDER_UX_SERVICE_MARKER_48E = "phase48e-court-ready-pack-builder-service" as const;

export function buildCourtReadyPackBuilderUx(input?: {
  workbenchScopeSlug?: string;
  definedItemIds?: string[];
}): CourtReadyPackBuilderUxResult {
  const definedItemIds = new Set(
    input?.definedItemIds ??
      COURT_READY_PACK_BUILDER_UX_ITEMS.filter((item) => item.required).map((item) => item.itemId),
  );

  return assembleCourtReadyPackBuilderUx({
    workbenchScopeSlug: input?.workbenchScopeSlug ?? LEGAL_RELIABILITY_LAWYER_WORKBENCH_DEFAULT_SCOPE_SLUG,
    definedItemIds,
  });
}
