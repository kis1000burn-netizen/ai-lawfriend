/**
 * Phase 10-B — AI Governance audit build/persist (invoke · denial · metering).
 * @see docs/ai/AIBEOPCHIN_AI_GOVERNANCE_AUDIT_USAGE_METERING_SPEC.md
 */
import type { CaseStatus } from "@/lib/definitions/case-status";
import type { SessionUser } from "@/lib/auth/session";
import { ForbiddenError } from "@/lib/errors";

import type { AiGovernanceGateResult } from "./ai-governance-control.schema";
import type { AiGovernanceFeature } from "./ai-governance-control.schema";
import {
  assertCaseSummaryAiGovernanceAllowsInvoke,
  resolveDefaultAiGovernanceControlMatrix,
  sessionUserToGovernanceRole,
} from "./ai-governance-policy.service";
import {
  AI_GOVERNANCE_AUDIT_VERSION,
  type AiGovernanceAuditRecord,
  aiGovernanceAuditRecordSchema,
  type AiGovernanceUsageMeterSnapshot,
} from "./ai-governance-audit.schema";
import {
  buildAiGovernanceUsageMeterSnapshot,
  evaluateAiGovernanceMeterGate,
  recordAiGovernanceFeatureUsage,
} from "./ai-governance-usage-meter.service";
import { recordTenantAiUsageFromGovernanceInvoke } from "@/features/platform/tenant-metering/tenant-metering-bridge.service";

export const PHASE10B_AI_GOVERNANCE_AUDIT_SERVICE_MARKER =
  "PHASE10B_AI_GOVERNANCE_AUDIT_SERVICE" as const;

export type BuildAiGovernanceAuditRecordInput = {
  eventType: AiGovernanceAuditRecord["eventType"];
  outcome: AiGovernanceAuditRecord["outcome"];
  tenantId?: string;
  actorUserId: string;
  actorRole: AiGovernanceAuditRecord["actorRole"];
  feature: AiGovernanceFeature;
  caseId?: string;
  caseStatus?: CaseStatus;
  invokedAt?: string;
  controlCode?: string;
  deniedReason?: string;
  llmInvoked?: boolean;
  tokensUsed?: number;
  meterSnapshot?: AiGovernanceUsageMeterSnapshot;
};

export function buildAiGovernanceAuditRecord(
  input: BuildAiGovernanceAuditRecordInput,
): AiGovernanceAuditRecord {
  const tenantId =
    input.tenantId ??
    process.env.AI_GOVERNANCE_TENANT_ID?.trim() ??
    resolveDefaultAiGovernanceControlMatrix().tenantPolicy.tenantId;

  return aiGovernanceAuditRecordSchema.parse({
    auditVersion: AI_GOVERNANCE_AUDIT_VERSION,
    eventType: input.eventType,
    outcome: input.outcome,
    tenantId,
    actorUserId: input.actorUserId,
    actorRole: input.actorRole,
    feature: input.feature,
    caseId: input.caseId,
    caseStatus: input.caseStatus,
    invokedAt: input.invokedAt ?? new Date().toISOString(),
    controlCode: input.controlCode,
    deniedReason: input.deniedReason,
    llmInvoked: input.llmInvoked ?? false,
    tokensUsed: input.tokensUsed ?? 0,
    meterSnapshot:
      input.meterSnapshot ??
      buildAiGovernanceUsageMeterSnapshot({ tenantId, caseId: input.caseId }),
  });
}

export function validateAiGovernanceAuditRecord(
  input: unknown,
): { passed: boolean; issues: string[]; record: AiGovernanceAuditRecord } {
  const record = aiGovernanceAuditRecordSchema.parse(input);
  const issues: string[] = [];

  if (record.outcome === "DENIED" && !record.deniedReason?.trim()) {
    issues.push("DENIED audit requires deniedReason");
  }
  if (record.outcome === "DENIED" && !record.controlCode?.trim()) {
    issues.push("DENIED audit requires controlCode");
  }
  if (record.llmInvoked && record.tokensUsed < 0) {
    issues.push("tokensUsed must be non-negative");
  }

  return { passed: issues.length === 0, issues, record };
}

export async function persistAiGovernanceAuditRecord(input: {
  actorUserId: string;
  caseId?: string;
  record: AiGovernanceAuditRecord;
  message?: string;
}): Promise<void> {
  const { writeAuditLog } = await import("@/lib/audit-log");

  await writeAuditLog({
    actorUserId: input.actorUserId,
    action: `AI_GOVERNANCE_${input.record.eventType}`,
    entityType: input.caseId ? "CASE" : "TENANT",
    entityId: input.caseId ?? input.record.tenantId,
    message:
      input.message ??
      (input.record.outcome === "DENIED"
        ? `AI governance denied (${input.record.controlCode ?? "unknown"})`
        : `AI governance ${input.record.eventType}`),
    metadata: input.record,
  });
}

export async function persistAiGovernanceDenialAudit(input: {
  currentUser: SessionUser;
  caseId?: string;
  caseStatus?: CaseStatus;
  feature: AiGovernanceFeature;
  gate: AiGovernanceGateResult | { allowed: false; controlCode?: string; deniedReason?: string };
  meterSnapshot?: AiGovernanceUsageMeterSnapshot;
}): Promise<AiGovernanceAuditRecord> {
  const eventType =
    input.gate.controlCode === "TENANT_TOKEN_BUDGET_EXCEEDED"
      ? "METER_BUDGET_EXCEEDED"
      : input.gate.controlCode === "CASE_LLM_LIMIT_EXCEEDED"
        ? "METER_CASE_LIMIT_EXCEEDED"
        : "GOVERNANCE_INVOKE_DENIED";

  const record = buildAiGovernanceAuditRecord({
    eventType,
    outcome: "DENIED",
    actorUserId: input.currentUser.id,
    actorRole: sessionUserToGovernanceRole(input.currentUser),
    feature: input.feature,
    caseId: input.caseId,
    caseStatus: input.caseStatus,
    controlCode: input.gate.controlCode,
    deniedReason: input.gate.deniedReason,
    meterSnapshot: input.meterSnapshot,
  });

  await persistAiGovernanceAuditRecord({
    actorUserId: input.currentUser.id,
    caseId: input.caseId,
    record,
  });

  return record;
}

export async function recordAiGovernanceInvokeAudit(input: {
  currentUser: SessionUser;
  caseId?: string;
  caseStatus?: CaseStatus;
  feature: AiGovernanceFeature;
  llmInvoked: boolean;
  tokensUsed?: number;
}): Promise<AiGovernanceAuditRecord> {
  const meterSnapshot = recordAiGovernanceFeatureUsage({
    caseId: input.caseId,
    feature: input.feature,
    llmInvoked: input.llmInvoked,
    tokensUsed: input.tokensUsed ?? 0,
  });

  const record = buildAiGovernanceAuditRecord({
    eventType: input.llmInvoked ? "LLM_USAGE_RECORDED" : "GOVERNANCE_INVOKE_ALLOWED",
    outcome: "ALLOWED",
    actorUserId: input.currentUser.id,
    actorRole: sessionUserToGovernanceRole(input.currentUser),
    feature: input.feature,
    caseId: input.caseId,
    caseStatus: input.caseStatus,
    llmInvoked: input.llmInvoked,
    tokensUsed: input.tokensUsed ?? 0,
    meterSnapshot,
  });

  await persistAiGovernanceAuditRecord({
    actorUserId: input.currentUser.id,
    caseId: input.caseId,
    record,
  });

  await recordTenantAiUsageFromGovernanceInvoke({
    caseId: input.caseId,
    feature: input.feature,
    llmInvoked: input.llmInvoked,
    tokensUsed: input.tokensUsed ?? 0,
  });

  return record;
}

export async function assertCaseSummaryGovernanceAndMeterAllowsInvoke(input: {
  currentUser: SessionUser;
  caseId: string;
  caseStatus: CaseStatus;
  projectedLlmCall: boolean;
  projectedTokens?: number;
}): Promise<void> {
  const governance = assertCaseSummaryAiGovernanceAllowsInvoke({
    currentUser: input.currentUser,
    caseStatus: input.caseStatus,
  });

  if (!governance.allowed) {
    await persistAiGovernanceDenialAudit({
      currentUser: input.currentUser,
      caseId: input.caseId,
      caseStatus: input.caseStatus,
      feature: "CASE_SUMMARY",
      gate: governance,
    });
    throw new ForbiddenError(governance.deniedReason ?? "AI governance denied");
  }

  if (input.projectedLlmCall) {
    const meter = evaluateAiGovernanceMeterGate({
      caseId: input.caseId,
      feature: "CASE_SUMMARY",
      projectedLlmCall: true,
      projectedTokens: input.projectedTokens ?? 0,
    });
    if (!meter.allowed) {
      await persistAiGovernanceDenialAudit({
        currentUser: input.currentUser,
        caseId: input.caseId,
        caseStatus: input.caseStatus,
        feature: "CASE_SUMMARY",
        gate: {
          allowed: false,
          controlCode: meter.controlCode,
          deniedReason: meter.deniedReason,
        },
        meterSnapshot: meter.meterSnapshot,
      });
      throw new ForbiddenError(meter.deniedReason ?? "AI usage meter denied");
    }
  }
}
