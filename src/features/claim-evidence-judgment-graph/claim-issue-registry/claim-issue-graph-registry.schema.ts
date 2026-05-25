/**
 * Product Phase 43-A — ClaimIssueGraphRegistry schema (Zod SSOT).
 */
import { z } from "zod";

export const CLAIM_ISSUE_GRAPH_REGISTRY_SCHEMA_MARKER_43A =
  "phase43a-claim-issue-graph-registry-schema" as const;

export const CLAIM_ISSUE_GRAPH_REGISTRY_VERSION = "43-A.1" as const;

export const CLAIM_ISSUE_GRAPH_REGISTRY_ITEM_IDS = [
  "CLAIM_NODE_REGISTRY",
  "ISSUE_NODE_REGISTRY",
  "BURDEN_OF_PROOF_NODE",
  "GRAPH_SCOPE_METADATA",
  "REGISTRY_LAWYER_REVIEW",
] as const;

export const claimIssueGraphRegistryItemSchema = z.object({
  itemId: z.enum(CLAIM_ISSUE_GRAPH_REGISTRY_ITEM_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const claimIssueGraphRegistryResultSchema = z.object({
  version: z.literal("43-A.1"),
  caseGraphScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  items: z.array(claimIssueGraphRegistryItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  claimIssueGraphRegistryReady: z.boolean(),
  lawyerReviewRequired: z.literal(true),
});

export type ClaimIssueGraphRegistryItemId = (typeof CLAIM_ISSUE_GRAPH_REGISTRY_ITEM_IDS)[number];
export type ClaimIssueGraphRegistryResult = z.infer<typeof claimIssueGraphRegistryResultSchema>;
