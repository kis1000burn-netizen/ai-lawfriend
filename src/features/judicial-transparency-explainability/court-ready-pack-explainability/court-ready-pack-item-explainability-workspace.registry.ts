/**
 * Product Phase 45-E — CourtReadyPackItemExplainabilityWorkspace SSOT.
 */
import type { CourtReadyPackItemExplainabilityWorkspaceResult } from "./court-ready-pack-item-explainability-workspace.schema";

export const COURT_READY_PACK_ITEM_EXPLAINABILITY_WORKSPACE_REGISTRY_MARKER_45E =
  "phase45e-court-ready-pack-item-explainability-workspace-registry" as const;

export const JUDICIAL_TRANSPARENCY_EXPLAINABILITY_DEFAULT_SCOPE_SLUG = "judicial-transparency-explainability-001" as const;

type CourtReadyPackItemExplainabilityWorkspaceItem = Omit<CourtReadyPackItemExplainabilityWorkspaceResult["items"][number], "defined">;

export const COURT_READY_PACK_ITEM_EXPLAINABILITY_WORKSPACE_ITEMS: CourtReadyPackItemExplainabilityWorkspaceItem[] = [
  { itemId: "PACK_ITEM_EXPLAINABILITY_MAP", label: "Pack item explainability map", required: true },
  { itemId: "CANDIDATE_JUDGMENT_RATIONALE", label: "Candidate judgment rationale trace", required: true },
  { itemId: "EXPLAINABILITY_LAWYER_GATE", label: "Explainability lawyer review gate", required: true },
  { itemId: "NO_CLIENT_EXPLAINABILITY_LEAK", label: "No client-visible explainability without review", required: true },
];
