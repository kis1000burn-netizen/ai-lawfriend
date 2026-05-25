/**
 * Product Phase 46-E — NeutralPackReviewWorkspace SSOT.
 */
import type { NeutralPackReviewWorkspaceResult } from "./neutral-pack-review-workspace.schema";

export const NEUTRAL_PACK_REVIEW_WORKSPACE_REGISTRY_MARKER_46E =
  "phase46e-neutral-pack-review-workspace-registry" as const;

export const NEUTRAL_LITIGATION_REVIEW_PACK_DEFAULT_SCOPE_SLUG = "neutral-litigation-review-pack-001" as const;

type NeutralPackReviewWorkspaceItem = Omit<NeutralPackReviewWorkspaceResult["items"][number], "defined">;

export const NEUTRAL_PACK_REVIEW_WORKSPACE_ITEMS: NeutralPackReviewWorkspaceItem[] = [
  { itemId: "PACK_SECTION_REVIEW", label: "Neutral pack section review", required: true },
  { itemId: "EXPORT_READINESS_GATE", label: "Export readiness gate", required: true },
  { itemId: "OFFICIAL_CLARIFICATION_ACK", label: "Official clarification acknowledgment", required: true },
  { itemId: "NEUTRAL_PACK_LAWYER_REVIEW", label: "Lawyer review of neutral pack", required: true },
];
