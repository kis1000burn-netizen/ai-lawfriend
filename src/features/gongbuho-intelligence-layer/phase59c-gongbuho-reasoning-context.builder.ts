/**
 * Product Phase 59-C — Gongbuho Reasoning Context builder SSOT.
 */
import type {
  ConfirmedFact,
  EvidenceLink,
  GongbuhoMemoryPacket,
  GongbuhoMemorySourceTrace,
  JudgmentReference,
  LawyerConfirmedIssue,
} from "./phase59a-gongbuho-memory-packet.schema";
import {
  canUseAsStrongReasoningGround,
  isRealTimeLegalSignalStale,
} from "./phase59b-real-time-legal-signal-compiler";
import type { RealTimeLegalSignal } from "./phase59b-real-time-legal-signal.schema";
import { isRealTimeLegalSignalBlockedStatus } from "./phase59b-real-time-legal-signal.policy";
import { REAL_TIME_LEGAL_SIGNAL_STRONG_REASONING_STATUS } from "./phase59b-real-time-legal-signal.schema";
import {
  canIncludeMemoryItemInStrongReasoning,
  canIncludeRealTimeSignalInContext,
  evaluateReasoningScopeMatch,
} from "./phase59c-gongbuho-reasoning-context.policy";
import {
  gongbuhoReasoningContextBundleSchema,
  PHASE59C_GONGBUHO_REASONING_CONTEXT_VERSION,
  type GongbuhoReasoningContextBundle,
  type GongbuhoReasoningContextPurpose,
} from "./phase59c-gongbuho-reasoning-context.schema";

export const PHASE59C_GONGBUHO_REASONING_CONTEXT_BUILDER_MARKER =
  "phase59c-gongbuho-reasoning-context-builder" as const;

type BuildGongbuhoReasoningContextBundleInput = {
  caseId: string;
  tenantId: string;
  memoryPacket: GongbuhoMemoryPacket;
  realTimeSignals: RealTimeLegalSignal[];
  purpose?: GongbuhoReasoningContextPurpose;
  auditRef: string;
  now?: Date;
};

type MemoryItem = {
  reviewStatus: ConfirmedFact["reviewStatus"];
  sourceTraceIds: string[];
};

function packetScopeAllowed(
  memoryPacket: GongbuhoMemoryPacket,
  caseId: string,
  tenantId: string,
) {
  return evaluateReasoningScopeMatch({
    targetCaseId: caseId,
    targetTenantId: tenantId,
    itemCaseId: memoryPacket.caseId,
    itemTenantId: memoryPacket.tenantId,
  }).allowed;
}

function filterMemoryItems<T extends MemoryItem>(items: T[]) {
  const included: T[] = [];
  let aiCandidateMemoryCount = 0;

  for (const item of items) {
    const decision = canIncludeMemoryItemInStrongReasoning(item);
    if (decision.allowed) {
      included.push(item);
      continue;
    }
    if (item.reviewStatus === "AI_CANDIDATE") {
      aiCandidateMemoryCount += 1;
    }
  }

  return { included, aiCandidateMemoryCount };
}

function classifySignalExclusion(signal: RealTimeLegalSignal, now: Date) {
  if (signal.status === "CONFLICTED" || signal.conflictStatus === "CONFLICTED") {
    return "conflicted" as const;
  }
  if (signal.status === "STALE" || isRealTimeLegalSignalStale(signal, now)) {
    return "stale" as const;
  }
  if (
    signal.status !== REAL_TIME_LEGAL_SIGNAL_STRONG_REASONING_STATUS ||
    isRealTimeLegalSignalBlockedStatus(signal.status)
  ) {
    return "unapproved" as const;
  }
  if (!canUseAsStrongReasoningGround(signal, now).allowed) {
    return "unapproved" as const;
  }
  return "other" as const;
}

function bucketApprovedSignal(signal: RealTimeLegalSignal) {
  if (signal.signalKind === "STATUTE" || signal.signalKind === "ADMIN_GUIDANCE") {
    return "statutes" as const;
  }
  if (
    signal.signalKind === "PRECEDENT" ||
    signal.signalKind === "COURT_PRACTICE_TREND" ||
    signal.signalKind === "INTERNAL_CASE_PATTERN"
  ) {
    return "judgments" as const;
  }
  return "operationalSignals" as const;
}

export function buildGongbuhoReasoningContextBundle(
  input: BuildGongbuhoReasoningContextBundleInput,
): GongbuhoReasoningContextBundle {
  const now = input.now ?? new Date();
  const purpose = input.purpose ?? "STRONG_REASONING";

  if (!packetScopeAllowed(input.memoryPacket, input.caseId, input.tenantId)) {
    throw new Error("NO_CROSS_CASE_MEMORY_MERGE_WITHOUT_POLICY");
  }

  const confirmedFacts = filterMemoryItems(input.memoryPacket.confirmedFacts);
  const evidenceMap = filterMemoryItems(input.memoryPacket.evidenceMap);
  const judgmentLinks = filterMemoryItems(input.memoryPacket.judgmentLinks);
  const lawyerConfirmedIssues = filterMemoryItems(input.memoryPacket.lawyerConfirmedIssues);

  const aiCandidateMemoryCount =
    confirmedFacts.aiCandidateMemoryCount +
    evidenceMap.aiCandidateMemoryCount +
    judgmentLinks.aiCandidateMemoryCount +
    lawyerConfirmedIssues.aiCandidateMemoryCount;

  const statutes: RealTimeLegalSignal[] = [];
  const judgments: RealTimeLegalSignal[] = [];
  const operationalSignals: RealTimeLegalSignal[] = [];

  let unapprovedSignalCount = 0;
  let conflictedSignalCount = 0;
  let staleSignalCount = 0;

  for (const signal of input.realTimeSignals) {
    const decision = canIncludeRealTimeSignalInContext({
      signal,
      targetCaseId: input.caseId,
      targetTenantId: input.tenantId,
      purpose,
      now,
    });

    if (decision.allowed) {
      const bucket = bucketApprovedSignal(signal);
      if (bucket === "statutes") statutes.push(signal);
      if (bucket === "judgments") judgments.push(signal);
      if (bucket === "operationalSignals") operationalSignals.push(signal);
      continue;
    }

    const exclusion = classifySignalExclusion(signal, now);
    if (exclusion === "conflicted") conflictedSignalCount += 1;
    else if (exclusion === "stale") staleSignalCount += 1;
    else if (exclusion === "unapproved") unapprovedSignalCount += 1;
    else unapprovedSignalCount += 1;
  }

  const sourceTrace: GongbuhoMemorySourceTrace[] = [...input.memoryPacket.sourceTrace];

  for (const signal of [...statutes, ...judgments, ...operationalSignals]) {
    sourceTrace.push({
      traceId: signal.sourceTrace.traceId,
      sourceKind: "REAL_TIME_LEGAL_SIGNAL",
      sourceRef: signal.signalId,
      sourcePhase: "59-B",
      capturedAt: signal.fetchedAt,
    });
  }

  const bundle = {
    caseId: input.caseId,
    tenantId: input.tenantId,
    bundleVersion: PHASE59C_GONGBUHO_REASONING_CONTEXT_VERSION,
    purpose,
    memoryGrounds: {
      confirmedFacts: confirmedFacts.included,
      evidenceMap: evidenceMap.included as EvidenceLink[],
      judgmentLinks: judgmentLinks.included as JudgmentReference[],
      lawyerConfirmedIssues: lawyerConfirmedIssues.included as LawyerConfirmedIssue[],
    },
    approvedRealTimeSignals: {
      statutes,
      judgments,
      operationalSignals,
    },
    reasoningLimits: {
      strongReasoningOnlyFromConfirmedOrLocked: true as const,
      approvedSignalsOnly: true as const,
      noRawClientFactGlobalLearning: true as const,
      caseScopeOnly: true as const,
      tenantIsolationRequired: true as const,
    },
    excludedItems: {
      aiCandidateMemoryCount,
      unapprovedSignalCount,
      conflictedSignalCount,
      staleSignalCount,
    },
    sourceTrace,
    auditRef: input.auditRef,
    builtAt: now.toISOString(),
  };

  return gongbuhoReasoningContextBundleSchema.parse(bundle);
}
