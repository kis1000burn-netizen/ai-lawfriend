/**
 * Product Phase 29-B — Customer success activity schema (Zod SSOT).
 */
import { z } from "zod";

export const CUSTOMER_SUCCESS_ACTIVITY_SCHEMA_MARKER_PHASE29B =
  "phase29b-customer-success-activity-schema" as const;

export const CUSTOMER_SUCCESS_ACTIVITY_VERSION = "29-B.1" as const;

export const CUSTOMER_SUCCESS_ACTIVITY_TYPES = [
  "ONBOARDING_MEETING",
  "TRAINING_SESSION",
  "FEATURE_INQUIRY",
  "INCIDENT_NOTICE",
  "EXPANSION_PROPOSAL",
  "RENEWAL_DISCUSSION",
  "COMPLAINT_RISK_RESPONSE",
] as const;

export const recordCustomerSuccessActivityInputSchema = z.object({
  tenantId: z.string().min(1),
  activityType: z.enum(CUSTOMER_SUCCESS_ACTIVITY_TYPES),
  summary: z.string().min(1).max(2000),
  ownerUserId: z.string().optional(),
  riskSignal: z.string().max(500).optional(),
  nextActionAt: z.string().datetime().optional(),
});

export const customerSuccessActivityRecordSchema = recordCustomerSuccessActivityInputSchema.extend({
  id: z.string().min(1),
  createdAt: z.string().datetime(),
});

export const customerSuccessActivitySummarySchema = z.object({
  version: z.literal(CUSTOMER_SUCCESS_ACTIVITY_VERSION),
  tenantId: z.string().min(1),
  activityCount: z.number().min(0),
  recentActivities: z.array(customerSuccessActivityRecordSchema),
  csActivityLogReady: z.boolean(),
});

export type RecordCustomerSuccessActivityInput = z.infer<
  typeof recordCustomerSuccessActivityInputSchema
>;
export type CustomerSuccessActivitySummary = z.infer<typeof customerSuccessActivitySummarySchema>;
