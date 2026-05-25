/**
 * Product Phase 47-D — ClaimEvidenceJudgmentGraphBundleGate schema (Zod SSOT).
 */
import { z } from "zod";

export const CLAIM_EVIDENCE_JUDGMENT_GRAPH_BUNDLE_GATE_SCHEMA_MARKER_47D =
  "phase47d-claim-evidence-judgment-graph-bundle-gate-schema" as const;

export const CLAIM_EVIDENCE_JUDGMENT_GRAPH_BUNDLE_GATE_VERSION = "47-D.1" as const;

export const CLAIM_EVIDENCE_JUDGMENT_GRAPH_BUNDLE_GATE_ITEM_IDS = ["BUNDLED_RC_LOCK", "BUNDLED_VERIFY_SCRIPT", "LEGAL_RELIABILITY_CROSS_LINK"] as const;

export const claimevidencejudgmentgraphbundlegateItemSchema = z.object({
  itemId: z.enum(CLAIM_EVIDENCE_JUDGMENT_GRAPH_BUNDLE_GATE_ITEM_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const claimevidencejudgmentgraphbundlegateResultSchema = z.object({
  version: z.literal("47-D.1"),
  legalReliabilityScopeSlug: z.string().min(1),
  bundledPhase: z.literal("43-F"),
  bundledVerifyScript: z.literal("verify:aibeopchin-claim-evidence-judgment-graph-rc"),
  generatedAt: z.string().datetime(),
  items: z.array(claimevidencejudgmentgraphbundlegateItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  claimEvidenceJudgmentGraphBundleGateReady: z.boolean(),
  lawyerReviewRequired: z.literal(true),
});

export type ClaimEvidenceJudgmentGraphBundleGateResult = z.infer<typeof claimevidencejudgmentgraphbundlegateResultSchema>;
