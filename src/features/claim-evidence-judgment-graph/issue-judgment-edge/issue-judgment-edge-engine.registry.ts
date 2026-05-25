/**
 * Product Phase 43-C — IssueJudgmentEdgeEngine SSOT.
 */
import type { IssueJudgmentEdgeEngineResult } from "./issue-judgment-edge-engine.schema";

export const ISSUE_JUDGMENT_EDGE_ENGINE_REGISTRY_MARKER_43C =
  "phase43c-issue-judgment-edge-engine-registry" as const;

export const CLAIM_EVIDENCE_JUDGMENT_GRAPH_DEFAULT_SCOPE_SLUG = "claim-evidence-judgment-graph-001" as const;

type IssueJudgmentEdgeEngineItem = Omit<IssueJudgmentEdgeEngineResult["items"][number], "defined">;

export const ISSUE_JUDGMENT_EDGE_ENGINE_ITEMS: IssueJudgmentEdgeEngineItem[] = [
  { itemId: "ISSUE_JUDGMENT_EDGE", label: "Issue to judgment reference edge", required: true },
  { itemId: "CLAIM_JUDGMENT_EDGE", label: "Claim to judgment reference edge", required: true },
  { itemId: "JUDGMENT_ISSUE_ALIGNMENT", label: "Judgment-issue alignment notes", required: true },
  { itemId: "JUDGMENT_EDGE_LAWYER_REVIEW", label: "Lawyer review of issue-judgment edges", required: true },
];
