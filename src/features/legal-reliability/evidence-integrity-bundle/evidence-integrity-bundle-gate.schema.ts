/**
 * Product Phase 47-C — EvidenceIntegrityBundleGate schema (Zod SSOT).
 */
import { z } from "zod";

export const EVIDENCE_INTEGRITY_BUNDLE_GATE_SCHEMA_MARKER_47C =
  "phase47c-evidence-integrity-bundle-gate-schema" as const;

export const EVIDENCE_INTEGRITY_BUNDLE_GATE_VERSION = "47-C.1" as const;

export const EVIDENCE_INTEGRITY_BUNDLE_GATE_ITEM_IDS = ["BUNDLED_RC_LOCK", "BUNDLED_VERIFY_SCRIPT", "LEGAL_RELIABILITY_CROSS_LINK"] as const;

export const evidenceintegritybundlegateItemSchema = z.object({
  itemId: z.enum(EVIDENCE_INTEGRITY_BUNDLE_GATE_ITEM_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const evidenceintegritybundlegateResultSchema = z.object({
  version: z.literal("47-C.1"),
  legalReliabilityScopeSlug: z.string().min(1),
  bundledPhase: z.literal("42-F"),
  bundledVerifyScript: z.literal("verify:aibeopchin-evidence-integrity-rc"),
  generatedAt: z.string().datetime(),
  items: z.array(evidenceintegritybundlegateItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  evidenceIntegrityBundleGateReady: z.boolean(),
  lawyerReviewRequired: z.literal(true),
});

export type EvidenceIntegrityBundleGateResult = z.infer<typeof evidenceintegritybundlegateResultSchema>;
