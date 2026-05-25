/**
 * Product Phase 32-E — Certification readiness gap review schema (Zod SSOT).
 */
import { z } from "zod";

export const CERTIFICATION_GAP_REVIEW_SCHEMA_MARKER_PHASE32E =
  "phase32e-certification-gap-review-schema" as const;

export const CERTIFICATION_GAP_REVIEW_VERSION = "32-E.1" as const;

export const CERTIFICATION_GAP_ITEM_IDS = [
  "ISMS_ACCESS_CONTROL",
  "ISO27001_LOGGING",
  "SOC2_CHANGE_MGMT",
  "DATA_GOVERNANCE_RETENTION",
  "INCIDENT_DRILL",
  "AI_GOVERNANCE",
] as const;

export const CERTIFICATION_GAP_STATUSES = ["MET", "PARTIAL", "GAP"] as const;

export const certificationGapItemSchema = z.object({
  gapId: z.enum(CERTIFICATION_GAP_ITEM_IDS),
  label: z.string().min(1),
  framework: z.string().min(1),
  required: z.boolean().default(true),
  status: z.enum(CERTIFICATION_GAP_STATUSES),
});

export const certificationReadinessGapReviewResultSchema = z.object({
  version: z.literal(CERTIFICATION_GAP_REVIEW_VERSION),
  reviewScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  gaps: z.array(certificationGapItemSchema).min(1),
  metCount: z.number().int().min(0),
  partialCount: z.number().int().min(0),
  gapCount: z.number().int().min(0),
  certificationGapReviewReady: z.boolean(),
});

export type CertificationGapItemId = (typeof CERTIFICATION_GAP_ITEM_IDS)[number];
export type CertificationGapStatus = (typeof CERTIFICATION_GAP_STATUSES)[number];
export type CertificationReadinessGapReviewResult = z.infer<
  typeof certificationReadinessGapReviewResultSchema
>;
