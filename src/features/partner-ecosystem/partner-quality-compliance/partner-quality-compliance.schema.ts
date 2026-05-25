/**
 * Product Phase 31-E — Partner quality / compliance review schema (Zod SSOT).
 */
import { z } from "zod";

export const PARTNER_QUALITY_COMPLIANCE_SCHEMA_MARKER_PHASE31E =
  "phase31e-partner-quality-compliance-schema" as const;

export const PARTNER_QUALITY_COMPLIANCE_VERSION = "31-E.1" as const;

export const PARTNER_COMPLIANCE_ITEM_IDS = [
  "BAR_ADMISSION_VERIFIED",
  "CONFLICT_CHECK_POLICY",
  "DATA_HANDLING_ATTESTATION",
  "SERVICE_LEVEL_COMMITMENT",
  "BRAND_GUIDELINE_ACK",
] as const;

export const partnerComplianceItemSchema = z.object({
  itemId: z.enum(PARTNER_COMPLIANCE_ITEM_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  approved: z.boolean(),
});

export const partnerQualityComplianceReviewResultSchema = z.object({
  version: z.literal(PARTNER_QUALITY_COMPLIANCE_VERSION),
  networkSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  items: z.array(partnerComplianceItemSchema).min(1),
  approvalRate: z.number().min(0).max(100),
  partnerComplianceReady: z.boolean(),
});

export type PartnerComplianceItemId = (typeof PARTNER_COMPLIANCE_ITEM_IDS)[number];
export type PartnerQualityComplianceReviewResult = z.infer<
  typeof partnerQualityComplianceReviewResultSchema
>;
