/**
 * Product Phase 37-D — Client portal adoption review schema (Zod SSOT).
 */
import { z } from "zod";

export const CLIENT_PORTAL_ADOPTION_SCHEMA_MARKER_PHASE37D =
  "phase37d-client-portal-adoption-schema" as const;

export const CLIENT_PORTAL_ADOPTION_VERSION = "37-D.1" as const;

export const CLIENT_PORTAL_ADOPTION_METRIC_IDS = [
  "CLIENT_LOGIN_ACTIVATION",
  "CASE_STATUS_VIEWS",
  "DOCUMENT_DOWNLOAD",
  "MESSAGE_RESPONSE",
  "MOBILE_PORTAL_USAGE",
] as const;

export const clientPortalAdoptionMetricSchema = z.object({
  metricId: z.enum(CLIENT_PORTAL_ADOPTION_METRIC_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const clientPortalAdoptionReviewResultSchema = z.object({
  version: z.literal(CLIENT_PORTAL_ADOPTION_VERSION),
  adoptionScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  metrics: z.array(clientPortalAdoptionMetricSchema).min(1),
  completionRate: z.number().min(0).max(100),
  clientPortalAdoptionReviewReady: z.boolean(),
});

export type ClientPortalAdoptionMetricId = (typeof CLIENT_PORTAL_ADOPTION_METRIC_IDS)[number];
export type ClientPortalAdoptionReviewResult = z.infer<
  typeof clientPortalAdoptionReviewResultSchema
>;
