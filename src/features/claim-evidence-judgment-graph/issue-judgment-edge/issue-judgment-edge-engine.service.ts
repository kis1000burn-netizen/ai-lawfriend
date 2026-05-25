/**
 * Product Phase 43-C — IssueJudgmentEdgeEngine service.
 */
import {
  CLAIM_EVIDENCE_JUDGMENT_GRAPH_DEFAULT_SCOPE_SLUG,
  ISSUE_JUDGMENT_EDGE_ENGINE_ITEMS,
} from "./issue-judgment-edge-engine.registry";
import { assembleIssueJudgmentEdgeEngine } from "./issue-judgment-edge-engine.policy";
import type { IssueJudgmentEdgeEngineResult } from "./issue-judgment-edge-engine.schema";

export const ISSUE_JUDGMENT_EDGE_ENGINE_SERVICE_MARKER_43C =
  "phase43c-issue-judgment-edge-engine-service" as const;

export function buildIssueJudgmentEdgeEngine(input?: {
  caseGraphScopeSlug?: string;
  definedItemIds?: string[];
}): IssueJudgmentEdgeEngineResult {
  const definedItemIds = new Set(
    input?.definedItemIds ??
      ISSUE_JUDGMENT_EDGE_ENGINE_ITEMS.filter((item) => item.required).map((item) => item.itemId),
  );

  return assembleIssueJudgmentEdgeEngine({
    caseGraphScopeSlug: input?.caseGraphScopeSlug ?? CLAIM_EVIDENCE_JUDGMENT_GRAPH_DEFAULT_SCOPE_SLUG,
    definedItemIds,
  });
}
