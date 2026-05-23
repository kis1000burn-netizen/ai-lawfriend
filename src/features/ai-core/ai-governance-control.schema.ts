/**
 * Phase 10-A — AI Governance Control Matrix schema SSOT.
 * @see docs/ai/AIBEOPCHIN_AI_GOVERNANCE_CONTROL_MATRIX.md
 *
 * 9-F = AI·변호사 책임 경계 / 10-A = 조직·역할·사건 AI 사용 통제권
 */
import { z } from "zod";

import { CaseStatusEnum } from "@/lib/definitions/case-status";
import { UserRoleEnum } from "@/lib/definitions/common";

export const PHASE10A_AI_GOVERNANCE_CONTROL_MARKER =
  "PHASE10A_AI_GOVERNANCE_CONTROL" as const;

export const AI_GOVERNANCE_CONTROL_MATRIX_VERSION = "10-A.1" as const;

/** UI 4분할 역할 — Prisma USER → CLIENT 변환 후 사용 */
export type AiGovernanceUiRole = z.infer<typeof UserRoleEnum>;

/** AI 기능 단위 (tenant/feature lock) */
export const AI_GOVERNANCE_FEATURES = [
  "CASE_SUMMARY",
  "CASE_INTELLIGENCE_GRAPH",
  "CONTRADICTION_RADAR",
  "LAWYER_JUDGMENT_LEDGER",
  "DOCUMENT_PARAGRAPH",
] as const;

export type AiGovernanceFeature = (typeof AI_GOVERNANCE_FEATURES)[number];

/** 통제 매트릭스 5축 + tenant cost lock */
export const AI_GOVERNANCE_CONTROL_DIMENSIONS = [
  "AI_MASTER_ENABLE",
  "CASE_ELIGIBILITY",
  "ROLE_INVOKE",
  "ROLE_VIEW",
  "CLIENT_RELEASE",
  "TENANT_COST_LOCK",
] as const;

export type AiGovernanceControlDimension =
  (typeof AI_GOVERNANCE_CONTROL_DIMENSIONS)[number];

export const AI_GOVERNANCE_CONTROL_ACTIONS = [
  "AI_MASTER_TOGGLE",
  "AI_INVOKE",
  "AI_VIEW_RESULT",
  "AI_CLIENT_VISIBLE_RELEASE",
] as const;

export type AiGovernanceControlAction = (typeof AI_GOVERNANCE_CONTROL_ACTIONS)[number];

export const aiGovernanceFeatureViewRolesSchema = z.object({
  CASE_SUMMARY: z.array(UserRoleEnum).min(1),
  CASE_INTELLIGENCE_GRAPH: z.array(UserRoleEnum).min(1),
  CONTRADICTION_RADAR: z.array(UserRoleEnum).min(1),
  LAWYER_JUDGMENT_LEDGER: z.array(UserRoleEnum).min(1),
  DOCUMENT_PARAGRAPH: z.array(UserRoleEnum).min(1),
});

export type AiGovernanceFeatureViewRoles = z.infer<
  typeof aiGovernanceFeatureViewRolesSchema
>;

export const aiGovernanceFeatureInvokeRolesSchema = z.object({
  CASE_SUMMARY: z.array(UserRoleEnum).min(1),
  CASE_INTELLIGENCE_GRAPH: z.array(UserRoleEnum).min(1),
  CONTRADICTION_RADAR: z.array(UserRoleEnum).min(1),
  LAWYER_JUDGMENT_LEDGER: z.array(UserRoleEnum).min(1),
  DOCUMENT_PARAGRAPH: z.array(UserRoleEnum).min(1),
});

export type AiGovernanceFeatureInvokeRoles = z.infer<
  typeof aiGovernanceFeatureInvokeRolesSchema
>;

export const aiGovernanceTenantPolicySchema = z.object({
  tenantId: z.string().min(1),
  aiEnabled: z.boolean().default(true),
  allowedFeatures: z.array(z.enum(AI_GOVERNANCE_FEATURES)).min(1),
  /** 조직별 LLM 비용/호출 상한 (optional enforcement hook) */
  monthlyTokenBudget: z.number().int().nonnegative().optional(),
  maxLlmCallsPerCase: z.number().int().nonnegative().optional(),
});

export type AiGovernanceTenantPolicy = z.infer<typeof aiGovernanceTenantPolicySchema>;

export const aiGovernanceControlMatrixSchema = z.object({
  matrixVersion: z.literal(AI_GOVERNANCE_CONTROL_MATRIX_VERSION),
  /** 누가 AI 마스터 스위치를 켤 수 있는가 */
  masterEnableRoles: z.array(UserRoleEnum).min(1),
  /** 사건 상태 — AI invoke 허용 */
  allowedCaseStatuses: z.array(CaseStatusEnum).min(1),
  /** 의뢰인 공개(9-F CLIENT_VISIBLE) 최소 사건 상태 */
  clientVisibleMinCaseStatus: CaseStatusEnum,
  roleInvoke: aiGovernanceFeatureInvokeRolesSchema,
  roleView: aiGovernanceFeatureViewRolesSchema,
  tenantPolicy: aiGovernanceTenantPolicySchema,
});

export type AiGovernanceControlMatrix = z.infer<typeof aiGovernanceControlMatrixSchema>;

export const aiGovernanceGateResultSchema = z.object({
  allowed: z.boolean(),
  action: z.enum(AI_GOVERNANCE_CONTROL_ACTIONS),
  feature: z.enum(AI_GOVERNANCE_FEATURES).optional(),
  dimension: z.enum(AI_GOVERNANCE_CONTROL_DIMENSIONS).optional(),
  deniedReason: z.string().optional(),
  controlCode: z.string().optional(),
});

export type AiGovernanceGateResult = z.infer<typeof aiGovernanceGateResultSchema>;

export function parseAiGovernanceControlMatrix(
  input: unknown,
): AiGovernanceControlMatrix {
  return aiGovernanceControlMatrixSchema.parse(input);
}
