/**
 * Product Phase 32-D — Vendor security questionnaire pack schema (Zod SSOT).
 */
import { z } from "zod";

export const VENDOR_SECURITY_QUESTIONNAIRE_SCHEMA_MARKER_PHASE32D =
  "phase32d-vendor-security-questionnaire-schema" as const;

export const VENDOR_SECURITY_QUESTIONNAIRE_VERSION = "32-D.1" as const;

export const VENDOR_QUESTIONNAIRE_SECTION_IDS = [
  "CUSTOMER_QUESTIONNAIRE",
  "DATA_FLOW_DIAGRAM",
  "SUBPROCESSOR_LIST",
  "WEBHOOK_SECURITY",
  "BACKUP_DR",
  "LOG_RETENTION",
] as const;

export const vendorQuestionnaireSectionSchema = z.object({
  sectionId: z.enum(VENDOR_QUESTIONNAIRE_SECTION_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  prepared: z.boolean(),
});

export const vendorSecurityQuestionnaireResultSchema = z.object({
  version: z.literal(VENDOR_SECURITY_QUESTIONNAIRE_VERSION),
  reviewScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  sections: z.array(vendorQuestionnaireSectionSchema).min(1),
  completionRate: z.number().min(0).max(100),
  vendorQuestionnairePackReady: z.boolean(),
});

export type VendorQuestionnaireSectionId = (typeof VENDOR_QUESTIONNAIRE_SECTION_IDS)[number];
export type VendorSecurityQuestionnaireResult = z.infer<
  typeof vendorSecurityQuestionnaireResultSchema
>;
