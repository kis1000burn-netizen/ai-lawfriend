/**
 * Product Phase 43-A — ClaimIssueGraphRegistry service.
 */
import {
  CLAIM_EVIDENCE_JUDGMENT_GRAPH_DEFAULT_SCOPE_SLUG,
  CLAIM_ISSUE_GRAPH_REGISTRY_ITEMS,
} from "./claim-issue-graph-registry.registry";
import { assembleClaimIssueGraphRegistry } from "./claim-issue-graph-registry.policy";
import type { ClaimIssueGraphRegistryResult } from "./claim-issue-graph-registry.schema";

export const CLAIM_ISSUE_GRAPH_REGISTRY_SERVICE_MARKER_43A =
  "phase43a-claim-issue-graph-registry-service" as const;

export function buildClaimIssueGraphRegistry(input?: {
  caseGraphScopeSlug?: string;
  definedItemIds?: string[];
}): ClaimIssueGraphRegistryResult {
  const definedItemIds = new Set(
    input?.definedItemIds ??
      CLAIM_ISSUE_GRAPH_REGISTRY_ITEMS.filter((item) => item.required).map((item) => item.itemId),
  );

  return assembleClaimIssueGraphRegistry({
    caseGraphScopeSlug: input?.caseGraphScopeSlug ?? CLAIM_EVIDENCE_JUDGMENT_GRAPH_DEFAULT_SCOPE_SLUG,
    definedItemIds,
  });
}
