/**
 * Phase 10-B — AI Governance usage meter (in-memory SSOT for invoke/token/case limits).
 * @see docs/ai/AIBEOPCHIN_AI_GOVERNANCE_AUDIT_USAGE_METERING_SPEC.md
 */
import type { AiGovernanceControlMatrix } from "./ai-governance-control.schema";
import { AI_GOVERNANCE_FEATURES, type AiGovernanceFeature } from "./ai-governance-control.schema";
import {
  AI_GOVERNANCE_AUDIT_VERSION,
  type AiGovernanceFeatureUsage,
  type AiGovernanceMeterGateResult,
  type AiGovernanceUsageMeterSnapshot,
  aiGovernanceUsageMeterSnapshotSchema,
} from "./ai-governance-audit.schema";
import { resolveDefaultAiGovernanceControlMatrix } from "./ai-governance-policy.service";

export const PHASE10B_AI_GOVERNANCE_USAGE_METER_MARKER =
  "PHASE10B_AI_GOVERNANCE_USAGE_METER" as const;

type TenantMeterBucket = {
  periodKey: string;
  featureUsage: Record<AiGovernanceFeature, AiGovernanceFeatureUsage>;
  tenantMonthlyTokensUsed: number;
};

type CaseMeterBucket = {
  llmCallsUsed: number;
};

const tenantMeters = new Map<string, TenantMeterBucket>();
const caseMeters = new Map<string, CaseMeterBucket>();

function emptyFeatureUsage(): Record<AiGovernanceFeature, AiGovernanceFeatureUsage> {
  return Object.fromEntries(
    AI_GOVERNANCE_FEATURES.map((feature) => [
      feature,
      { invokeCount: 0, llmCallCount: 0, totalTokens: 0 },
    ]),
  ) as Record<AiGovernanceFeature, AiGovernanceFeatureUsage>;
}

export function resolveMeterPeriodKey(date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function tenantBucketKey(tenantId: string, periodKey: string): string {
  return `${tenantId}::${periodKey}`;
}

function caseBucketKey(tenantId: string, caseId: string): string {
  return `${tenantId}::${caseId}`;
}

function getTenantBucket(tenantId: string, periodKey: string): TenantMeterBucket {
  const key = tenantBucketKey(tenantId, periodKey);
  const existing = tenantMeters.get(key);
  if (existing) {
    return existing;
  }
  const bucket: TenantMeterBucket = {
    periodKey,
    featureUsage: emptyFeatureUsage(),
    tenantMonthlyTokensUsed: 0,
  };
  tenantMeters.set(key, bucket);
  return bucket;
}

function getCaseBucket(tenantId: string, caseId: string): CaseMeterBucket {
  const key = caseBucketKey(tenantId, caseId);
  const existing = caseMeters.get(key);
  if (existing) {
    return existing;
  }
  const bucket: CaseMeterBucket = { llmCallsUsed: 0 };
  caseMeters.set(key, bucket);
  return bucket;
}

export function buildAiGovernanceUsageMeterSnapshot(input: {
  tenantId: string;
  caseId?: string;
  matrix?: AiGovernanceControlMatrix;
  at?: Date;
}): AiGovernanceUsageMeterSnapshot {
  const matrix = input.matrix ?? resolveDefaultAiGovernanceControlMatrix(input.tenantId);
  const periodKey = resolveMeterPeriodKey(input.at);
  const tenantBucket = getTenantBucket(matrix.tenantPolicy.tenantId, periodKey);
  const caseBucket = input.caseId
    ? getCaseBucket(matrix.tenantPolicy.tenantId, input.caseId)
    : undefined;
  const budget = matrix.tenantPolicy.monthlyTokenBudget;
  const caseLimit = matrix.tenantPolicy.maxLlmCallsPerCase;

  return aiGovernanceUsageMeterSnapshotSchema.parse({
    meterVersion: AI_GOVERNANCE_AUDIT_VERSION,
    tenantId: matrix.tenantPolicy.tenantId,
    periodKey,
    caseId: input.caseId,
    featureUsage: tenantBucket.featureUsage,
    tenantMonthlyTokensUsed: tenantBucket.tenantMonthlyTokensUsed,
    tenantMonthlyTokenBudget: budget,
    caseLlmCallsUsed: caseBucket?.llmCallsUsed,
    caseLlmCallLimit: caseLimit,
    budgetExceeded: budget !== undefined && tenantBucket.tenantMonthlyTokensUsed >= budget,
    caseLimitExceeded:
      caseLimit !== undefined &&
      caseBucket !== undefined &&
      caseBucket.llmCallsUsed >= caseLimit,
  });
}

export function evaluateAiGovernanceMeterGate(input: {
  tenantId?: string;
  caseId?: string;
  feature: AiGovernanceFeature;
  matrix?: AiGovernanceControlMatrix;
  projectedLlmCall?: boolean;
  projectedTokens?: number;
  at?: Date;
}): AiGovernanceMeterGateResult {
  const matrix = input.matrix ?? resolveDefaultAiGovernanceControlMatrix(input.tenantId);
  const snapshot = buildAiGovernanceUsageMeterSnapshot({
    tenantId: matrix.tenantPolicy.tenantId,
    caseId: input.caseId,
    matrix,
    at: input.at,
  });

  const projectedTokens = input.projectedTokens ?? 0;
  const budget = matrix.tenantPolicy.monthlyTokenBudget;
  if (
    budget !== undefined &&
    snapshot.tenantMonthlyTokensUsed + projectedTokens > budget
  ) {
    return {
      allowed: false,
      controlCode: "TENANT_TOKEN_BUDGET_EXCEEDED",
      deniedReason: `Tenant monthly token budget exceeded (${snapshot.tenantMonthlyTokensUsed}/${budget})`,
      meterSnapshot: {
        ...snapshot,
        budgetExceeded: true,
      },
    };
  }

  if (input.projectedLlmCall && input.caseId) {
    const caseLimit = matrix.tenantPolicy.maxLlmCallsPerCase;
    const used = snapshot.caseLlmCallsUsed ?? 0;
    if (caseLimit !== undefined && used + 1 > caseLimit) {
      return {
        allowed: false,
        controlCode: "CASE_LLM_LIMIT_EXCEEDED",
        deniedReason: `Case LLM call limit exceeded (${used}/${caseLimit})`,
        meterSnapshot: {
          ...snapshot,
          caseLimitExceeded: true,
        },
      };
    }
  }

  void input.feature;
  return {
    allowed: true,
    meterSnapshot: snapshot,
  };
}

export function recordAiGovernanceFeatureUsage(input: {
  tenantId?: string;
  caseId?: string;
  feature: AiGovernanceFeature;
  matrix?: AiGovernanceControlMatrix;
  llmInvoked?: boolean;
  tokensUsed?: number;
  at?: Date;
}): AiGovernanceUsageMeterSnapshot {
  const matrix = input.matrix ?? resolveDefaultAiGovernanceControlMatrix(input.tenantId);
  const periodKey = resolveMeterPeriodKey(input.at);
  const tenantBucket = getTenantBucket(matrix.tenantPolicy.tenantId, periodKey);
  const usage = tenantBucket.featureUsage[input.feature];
  usage.invokeCount += 1;
  if (input.llmInvoked) {
    usage.llmCallCount += 1;
  }
  const tokens = input.tokensUsed ?? 0;
  usage.totalTokens += tokens;
  tenantBucket.tenantMonthlyTokensUsed += tokens;

  if (input.llmInvoked && input.caseId) {
    const caseBucket = getCaseBucket(matrix.tenantPolicy.tenantId, input.caseId);
    caseBucket.llmCallsUsed += 1;
  }

  return buildAiGovernanceUsageMeterSnapshot({
    tenantId: matrix.tenantPolicy.tenantId,
    caseId: input.caseId,
    matrix,
    at: input.at,
  });
}

/** Vitest isolation */
export function resetAiGovernanceUsageMetersForTests(): void {
  tenantMeters.clear();
  caseMeters.clear();
}
