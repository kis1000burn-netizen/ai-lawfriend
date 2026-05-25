import { describe, expect, it } from "vitest";
import {
  gongbuhoLearningTraceSchema,
  gongbuhoMemoryPacketSchema,
  isGongbuhoMemoryStrongReviewStatus,
  PHASE59A_GONGBUHO_MEMORY_PACKET_SCHEMA_MARKER,
  PHASE59A_GONGBUHO_MEMORY_PACKET_VERSION,
} from "./phase59a-gongbuho-memory-packet.schema";

const baseTrace = {
  traceId: "trace-1",
  sourceKind: "CASE_INTERVIEW" as const,
  sourceRef: "interview:answer-1",
  capturedAt: "2026-05-26T00:00:00.000Z",
};

const basePacketInput = {
  packetId: "gmp-1",
  caseId: "case-1",
  tenantId: "tenant-1",
  status: "ACTIVE" as const,
  confidenceLevel: "MEDIUM" as const,
  reviewStatus: "AI_CANDIDATE" as const,
  confirmedFacts: [],
  disputedFacts: [],
  clientWeaknesses: [],
  opponentClaims: [],
  evidenceMap: [],
  judgmentLinks: [],
  lawyerConfirmedIssues: [],
  sourceTrace: [baseTrace],
  caseScopeOnly: true as const,
  tenantIsolationRequired: true as const,
  createdAt: "2026-05-26T00:00:00.000Z",
  updatedAt: "2026-05-26T00:00:00.000Z",
};

describe("Phase 59-A Gongbuho Memory Packet schema", () => {
  it("parses a minimal memory packet with case and tenant scope flags", () => {
    const parsed = gongbuhoMemoryPacketSchema.parse(basePacketInput);

    expect(parsed.caseScopeOnly).toBe(true);
    expect(parsed.tenantIsolationRequired).toBe(true);
    expect(parsed.sourceTrace).toHaveLength(1);
    expect(PHASE59A_GONGBUHO_MEMORY_PACKET_VERSION).toBe("59-A.0");
    expect(PHASE59A_GONGBUHO_MEMORY_PACKET_SCHEMA_MARKER).toBe(
      "phase59a-gongbuho-memory-packet-schema",
    );
  });

  it("requires lawyer review for client weakness entries", () => {
    const parsed = gongbuhoMemoryPacketSchema.parse({
      ...basePacketInput,
      clientWeaknesses: [
        {
          weaknessId: "weak-1",
          title: "입금 성격 불명확",
          internalReason: "대여금 vs 투자금 해석 여지",
          lawyerReviewRequired: true,
          reviewStatus: "AI_CANDIDATE",
          severity: "HIGH",
          linkedClaimIds: ["claim-1"],
          linkedEvidenceIds: [],
          sourceTraceIds: ["trace-1"],
        },
      ],
    });

    expect(parsed.clientWeaknesses[0]?.lawyerReviewRequired).toBe(true);
    expect(parsed.clientWeaknesses[0]?.reviewStatus).toBe("AI_CANDIDATE");
  });

  it("treats only LAWYER_CONFIRMED and LOCKED as strong review statuses", () => {
    expect(isGongbuhoMemoryStrongReviewStatus("AI_CANDIDATE")).toBe(false);
    expect(isGongbuhoMemoryStrongReviewStatus("LAWYER_CONFIRMED")).toBe(true);
    expect(isGongbuhoMemoryStrongReviewStatus("LOCKED")).toBe(true);
  });

  it("parses GongbuhoLearningTrace with anonymized reuse flags", () => {
    const parsed = gongbuhoLearningTraceSchema.parse({
      traceId: "learn-1",
      caseId: "case-1",
      tenantId: "tenant-1",
      aiSuggestionType: "WEAKNESS",
      suggestionId: "sugg-1",
      memoryPacketId: "gmp-1",
      lawyerDecision: "APPROVED",
      finalOutcome: "HELPFUL",
      reusablePattern: true,
      reusableScope: "GLOBAL_ANONYMIZED",
      anonymizedBeforeReuse: true,
      auditEventRef: "audit:learn-1",
      createdAt: "2026-05-26T00:00:00.000Z",
    });

    expect(parsed.reusableScope).toBe("GLOBAL_ANONYMIZED");
    expect(parsed.anonymizedBeforeReuse).toBe(true);
  });
});
