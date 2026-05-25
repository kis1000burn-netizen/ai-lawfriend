/**
 * Product Phase 36-E — Post-contract risk / change control schema (Zod SSOT).
 */
import { z } from "zod";

export const POST_CONTRACT_RISK_CHANGE_SCHEMA_MARKER_PHASE36E =
  "phase36e-post-contract-risk-change-schema" as const;

export const POST_CONTRACT_RISK_CHANGE_VERSION = "36-E.1" as const;

export const POST_CONTRACT_CONTROL_IDS = [
  "CHANGE_REQUEST_PROCESS",
  "RISK_REGISTER",
  "SCOPE_CHANGE_CONTROL",
  "INCIDENT_ESCALATION",
  "POST_GO_LIVE_REVIEW",
] as const;

export const postContractControlSchema = z.object({
  controlId: z.enum(POST_CONTRACT_CONTROL_IDS),
  label: z.string().min(1),
  required: z.boolean().default(true),
  defined: z.boolean(),
});

export const postContractRiskChangeControlResultSchema = z.object({
  version: z.literal(POST_CONTRACT_RISK_CHANGE_VERSION),
  implementationScopeSlug: z.string().min(1),
  generatedAt: z.string().datetime(),
  controls: z.array(postContractControlSchema).min(1),
  completionRate: z.number().min(0).max(100),
  postContractRiskChangeControlReady: z.boolean(),
});

export type PostContractControlId = (typeof POST_CONTRACT_CONTROL_IDS)[number];
export type PostContractRiskChangeControlResult = z.infer<
  typeof postContractRiskChangeControlResultSchema
>;
