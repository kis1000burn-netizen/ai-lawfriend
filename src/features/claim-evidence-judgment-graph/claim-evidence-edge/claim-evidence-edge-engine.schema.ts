/**
 * Product Phase 43-B — ClaimEvidenceEdgeEngine schema (Zod SSOT).
 */
import { z } from "zod";

export const CLAIM_EVIDENCE_EDGE_ENGINE_SCHEMA_MARKER_43B =
  "phase43b-claim-evidence-edge-engine-schema" as const;

export const CLAIM_EVIDENCE_EDGE_ENGINE_VERSION = "43-B.1" as const;

export const CLAIM_EVIDENCE_EDGE_ENGINE_ITEM_IDS = [
  "CLAIM_EVIDENCE_EDGE",
  "EVIDENCE_ISSUE_EDGE",
  "WEAK_EVIDENCE_RISK",
  "EDGE_LAWYER_REVIEW",
] as const;

export const claimEvidenceEdgeEngineItemSchema = z.object({
  itemId: z.enum(CLAIM_EVIDENCE_EDGE_ENGINE_ITEM_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const claimEvidenceEdgeEngineResultSchema = z.object({
  version: z.literal("43-B.1"),
  caseGraphScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  items: z.array(claimEvidenceEdgeEngineItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  claimEvidenceEdgeEngineReady: z.boolean(),
  lawyerReviewRequired: z.literal(true),
});

export type ClaimEvidenceEdgeEngineItemId = (typeof CLAIM_EVIDENCE_EDGE_ENGINE_ITEM_IDS)[number];
export type ClaimEvidenceEdgeEngineResult = z.infer<typeof claimEvidenceEdgeEngineResultSchema>;
