/**
 * Product Phase 46-E — NeutralPackReviewWorkspace service.
 */
import {
  NEUTRAL_LITIGATION_REVIEW_PACK_DEFAULT_SCOPE_SLUG,
  NEUTRAL_PACK_REVIEW_WORKSPACE_ITEMS,
} from "./neutral-pack-review-workspace.registry";
import { assembleNeutralPackReviewWorkspace } from "./neutral-pack-review-workspace.policy";
import type { NeutralPackReviewWorkspaceResult } from "./neutral-pack-review-workspace.schema";

export const NEUTRAL_PACK_REVIEW_WORKSPACE_SERVICE_MARKER_46E =
  "phase46e-neutral-pack-review-workspace-service" as const;

export function buildNeutralPackReviewWorkspace(input?: {
  neutralPackScopeSlug?: string;
  definedItemIds?: string[];
}): NeutralPackReviewWorkspaceResult {
  const definedItemIds = new Set(
    input?.definedItemIds ??
      NEUTRAL_PACK_REVIEW_WORKSPACE_ITEMS.filter((item) => item.required).map((item) => item.itemId),
  );

  return assembleNeutralPackReviewWorkspace({
    neutralPackScopeSlug: input?.neutralPackScopeSlug ?? NEUTRAL_LITIGATION_REVIEW_PACK_DEFAULT_SCOPE_SLUG,
    definedItemIds,
  });
}
