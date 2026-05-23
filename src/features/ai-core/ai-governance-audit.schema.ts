/**
 * Phase 10-B — AI Governance Audit & Usage Metering schema SSOT.
 * @see docs/ai/AIBEOPCHIN_AI_GOVERNANCE_AUDIT_USAGE_METERING_SPEC.md
 */
import { z } from "zod";

import { CaseStatusEnum } from "@/lib/definitions/case-status";
import { UserRoleEnum } from "@/lib/definitions/common";
import { AI_GOVERNANCE_FEATURES } from "./ai-governance-control.schema";

export const PHASE10B_AI_GOVERNANCE_AUDIT_MARKER =
  "PHASE10B_AI_GOVERNANCE_AUDIT" as const;

export const AI_GOVERNANCE_AUDIT_VERSION = "10-B.1" as const;

export const AI_GOVERNANCE_AUDIT_EVENT_TYPES = [
  "GOVERNANCE_INVOKE_ALLOWED",
  "GOVERNANCE_INVOKE_DENIED",
  "LLM_USAGE_RECORDED",
  "METER_BUDGET_EXCEEDED",
  "METER_CASE_LIMIT_EXCEEDED",
] as const;

export type AiGovernanceAuditEventType =
  (typeof AI_GOVERNANCE_AUDIT_EVENT_TYPES)[number];

export const AI_GOVERNANCE_AUDIT_OUTCOMES = ["ALLOWED", "DENIED"] as const;
export type AiGovernanceAuditOutcome = (typeof AI_GOVERNANCE_AUDIT_OUTCOMES)[number];

export const aiGovernanceFeatureUsageSchema = z.object({
  invokeCount: z.number().int().nonnegative(),
  llmCallCount: z.number().int().nonnegative(),
  totalTokens: z.number().int().nonnegative(),
});

export type AiGovernanceFeatureUsage = z.infer<typeof aiGovernanceFeatureUsageSchema>;

export const aiGovernanceUsageMeterSnapshotSchema = z.object({
  meterVersion: z.literal(AI_GOVERNANCE_AUDIT_VERSION),
  tenantId: z.string().min(1),
  periodKey: z.string().regex(/^\d{4}-\d{2}$/),
  caseId: z.string().optional(),
  featureUsage: z.record(z.enum(AI_GOVERNANCE_FEATURES), aiGovernanceFeatureUsageSchema),
  tenantMonthlyTokensUsed: z.number().int().nonnegative(),
  tenantMonthlyTokenBudget: z.number().int().nonnegative().optional(),
  caseLlmCallsUsed: z.number().int().nonnegative().optional(),
  caseLlmCallLimit: z.number().int().nonnegative().optional(),
  budgetExceeded: z.boolean().default(false),
  caseLimitExceeded: z.boolean().default(false),
});

export type AiGovernanceUsageMeterSnapshot = z.infer<
  typeof aiGovernanceUsageMeterSnapshotSchema
>;

export const aiGovernanceAuditRecordSchema = z.object({
  auditVersion: z.literal(AI_GOVERNANCE_AUDIT_VERSION),
  eventType: z.enum(AI_GOVERNANCE_AUDIT_EVENT_TYPES),
  outcome: z.enum(AI_GOVERNANCE_AUDIT_OUTCOMES),
  tenantId: z.string().min(1),
  actorUserId: z.string().min(1),
  actorRole: UserRoleEnum,
  feature: z.enum(AI_GOVERNANCE_FEATURES),
  caseId: z.string().optional(),
  caseStatus: CaseStatusEnum.optional(),
  invokedAt: z.string().datetime(),
  controlCode: z.string().optional(),
  deniedReason: z.string().max(1000).optional(),
  llmInvoked: z.boolean().default(false),
  tokensUsed: z.number().int().nonnegative().default(0),
  meterSnapshot: aiGovernanceUsageMeterSnapshotSchema.optional(),
});

export type AiGovernanceAuditRecord = z.infer<typeof aiGovernanceAuditRecordSchema>;

export const aiGovernanceMeterGateResultSchema = z.object({
  allowed: z.boolean(),
  controlCode: z.string().optional(),
  deniedReason: z.string().optional(),
  meterSnapshot: aiGovernanceUsageMeterSnapshotSchema,
});

export type AiGovernanceMeterGateResult = z.infer<typeof aiGovernanceMeterGateResultSchema>;

export function parseAiGovernanceAuditRecord(input: unknown): AiGovernanceAuditRecord {
  return aiGovernanceAuditRecordSchema.parse(input);
}
