/**
 * Product Phase 43-A — ClaimIssueGraphRegistry SSOT.
 */
import type { ClaimIssueGraphRegistryResult } from "./claim-issue-graph-registry.schema";

export const CLAIM_ISSUE_GRAPH_REGISTRY_REGISTRY_MARKER_43A =
  "phase43a-claim-issue-graph-registry-registry" as const;

export const CLAIM_EVIDENCE_JUDGMENT_GRAPH_DEFAULT_SCOPE_SLUG = "claim-evidence-judgment-graph-001" as const;

type ClaimIssueGraphRegistryItem = Omit<ClaimIssueGraphRegistryResult["items"][number], "defined">;

export const CLAIM_ISSUE_GRAPH_REGISTRY_ITEMS: ClaimIssueGraphRegistryItem[] = [
  { itemId: "CLAIM_NODE_REGISTRY", label: "Claim node registry", required: true },
  { itemId: "ISSUE_NODE_REGISTRY", label: "Issue node registry", required: true },
  { itemId: "BURDEN_OF_PROOF_NODE", label: "Burden of proof node mapping", required: true },
  { itemId: "GRAPH_SCOPE_METADATA", label: "Graph scope metadata", required: true },
  { itemId: "REGISTRY_LAWYER_REVIEW", label: "Lawyer review of claim/issue registry", required: true },
];
