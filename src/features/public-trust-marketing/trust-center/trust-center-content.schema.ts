/**
 * Product Phase 33-A — Trust center content pack schema (Zod SSOT).
 */
import { z } from "zod";

export const TRUST_CENTER_CONTENT_SCHEMA_MARKER_PHASE33A =
  "phase33a-trust-center-content-schema" as const;

export const TRUST_CENTER_CONTENT_VERSION = "33-A.1" as const;

export const TRUST_CENTER_SECTION_IDS = [
  "DATA_SECURITY",
  "PRIVACY_POLICY",
  "UPTIME_SLA",
  "SUBPROCESSORS",
  "INCIDENT_RESPONSE",
  "COMPLIANCE_STATUS",
] as const;

export const trustCenterSectionSchema = z.object({
  sectionId: z.enum(TRUST_CENTER_SECTION_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  published: z.boolean(),
});

export const trustCenterContentPackResultSchema = z.object({
  version: z.literal(TRUST_CENTER_CONTENT_VERSION),
  launchScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  sections: z.array(trustCenterSectionSchema).min(1),
  completionRate: z.number().min(0).max(100),
  trustCenterContentReady: z.boolean(),
});

export type TrustCenterSectionId = (typeof TRUST_CENTER_SECTION_IDS)[number];
export type TrustCenterContentPackResult = z.infer<typeof trustCenterContentPackResultSchema>;
