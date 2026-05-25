/**
 * Product Phase 48-C — Claim-Evidence-Judgment Graph Workspace service.
 */
import { CLAIM_EVIDENCE_JUDGMENT_GRAPH_WORKSPACE_ITEMS, LEGAL_RELIABILITY_LAWYER_WORKBENCH_DEFAULT_SCOPE_SLUG } from "./claim-graph-workspace.registry";
import { assembleClaimEvidenceJudgmentGraphWorkspace } from "./claim-graph-workspace.policy";
import type { ClaimEvidenceJudgmentGraphWorkspaceResult } from "./claim-graph-workspace.schema";

export const CLAIM_EVIDENCE_JUDGMENT_GRAPH_WORKSPACE_SERVICE_MARKER_48C = "phase48c-claim-graph-workspace-service" as const;

export function buildClaimEvidenceJudgmentGraphWorkspace(input?: {
  workbenchScopeSlug?: string;
  definedItemIds?: string[];
}): ClaimEvidenceJudgmentGraphWorkspaceResult {
  const definedItemIds = new Set(
    input?.definedItemIds ??
      CLAIM_EVIDENCE_JUDGMENT_GRAPH_WORKSPACE_ITEMS.filter((item) => item.required).map((item) => item.itemId),
  );

  return assembleClaimEvidenceJudgmentGraphWorkspace({
    workbenchScopeSlug: input?.workbenchScopeSlug ?? LEGAL_RELIABILITY_LAWYER_WORKBENCH_DEFAULT_SCOPE_SLUG,
    definedItemIds,
  });
}
