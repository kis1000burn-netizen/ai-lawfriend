/**
 * Product Phase 30-D — Enterprise security review pack schema (Zod SSOT).
 */
import { z } from "zod";

export const ENTERPRISE_SECURITY_REVIEW_SCHEMA_MARKER_PHASE30D =
  "phase30d-enterprise-security-review-schema" as const;

export const ENTERPRISE_SECURITY_REVIEW_VERSION = "30-D.1" as const;

export const SECURITY_REVIEW_ITEM_IDS = [
  "AUTH_SSO_MFA",
  "RBAC_TENANT_ISOLATION",
  "DATA_ENCRYPTION",
  "AUDIT_LOG_RETENTION",
  "PII_REDACTION",
  "INCIDENT_RESPONSE",
  "VULNERABILITY_SCAN",
] as const;

export const securityReviewItemSchema = z.object({
  itemId: z.enum(SECURITY_REVIEW_ITEM_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  approved: z.boolean(),
});

export const enterpriseSecurityReviewPackResultSchema = z.object({
  version: z.literal(ENTERPRISE_SECURITY_REVIEW_VERSION),
  generatedAt: z.string().datetime(),
  items: z.array(securityReviewItemSchema).min(1),
  approvalRate: z.number().min(0).max(100),
  securityReviewPackReady: z.boolean(),
});

export type SecurityReviewItemId = (typeof SECURITY_REVIEW_ITEM_IDS)[number];
export type EnterpriseSecurityReviewPackResult = z.infer<
  typeof enterpriseSecurityReviewPackResultSchema
>;
