/**
 * Product Phase 47-E — CourtReadyCaseRecordPackBundleGate schema (Zod SSOT).
 */
import { z } from "zod";

export const COURT_READY_CASE_RECORD_PACK_BUNDLE_GATE_SCHEMA_MARKER_47E =
  "phase47e-court-ready-case-record-pack-bundle-gate-schema" as const;

export const COURT_READY_CASE_RECORD_PACK_BUNDLE_GATE_VERSION = "47-E.1" as const;

export const COURT_READY_CASE_RECORD_PACK_BUNDLE_GATE_ITEM_IDS = ["BUNDLED_RC_LOCK", "BUNDLED_VERIFY_SCRIPT", "LEGAL_RELIABILITY_CROSS_LINK"] as const;

export const courtreadycaserecordpackbundlegateItemSchema = z.object({
  itemId: z.enum(COURT_READY_CASE_RECORD_PACK_BUNDLE_GATE_ITEM_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const courtreadycaserecordpackbundlegateResultSchema = z.object({
  version: z.literal("47-E.1"),
  legalReliabilityScopeSlug: z.string().min(1),
  bundledPhase: z.literal("44-F"),
  bundledVerifyScript: z.literal("verify:aibeopchin-court-ready-case-record-pack-rc"),
  generatedAt: z.string().datetime(),
  items: z.array(courtreadycaserecordpackbundlegateItemSchema).min(1),
  completionRate: z.number().min(0).max(100),
  courtReadyCaseRecordPackBundleGateReady: z.boolean(),
  lawyerReviewRequired: z.literal(true),
});

export type CourtReadyCaseRecordPackBundleGateResult = z.infer<typeof courtreadycaserecordpackbundlegateResultSchema>;
