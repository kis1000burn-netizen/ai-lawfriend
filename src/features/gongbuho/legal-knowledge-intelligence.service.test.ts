import { describe, expect, it } from "vitest";

import {
  pickLegalKnowledgeBottleneckStage,
  readBriefComplianceNoRawUgc,
  readIntakeComplianceNoRawUgc,
  readReviewAttestationNoUgcOrPii,
  LEGAL_KNOWLEDGE_PHASE4I_INTELLIGENCE_POLICY_MARKER,
} from "@/lib/gongbuho/legal-knowledge-intelligence-policy";
import {
  assertLegalKnowledgeIntelligenceDashboardMetaOnly,
  LEGAL_KNOWLEDGE_PHASE4I_INTELLIGENCE_SERVICE_MARKER,
} from "./legal-knowledge-intelligence.service";

describe("legal-knowledge-intelligence (Phase 4-I)", () => {
  it("exposes policy marker", () => {
    expect(LEGAL_KNOWLEDGE_PHASE4I_INTELLIGENCE_POLICY_MARKER).toBe(
      "PHASE4I_GONGBUHO_LEGAL_KNOWLEDGE_INTELLIGENCE_DASHBOARD",
    );
  });

  it("exposes service marker", () => {
    expect(LEGAL_KNOWLEDGE_PHASE4I_INTELLIGENCE_SERVICE_MARKER).toBe(
      "phase4i-gongbuho-legal-knowledge-intelligence-dashboard",
    );
  });

  it("reads compliance flags from JSON meta", () => {
    expect(readIntakeComplianceNoRawUgc({ noRawUgcStored: true })).toBe(true);
    expect(readBriefComplianceNoRawUgc({ noRawUgcStored: false })).toBe(false);
    expect(readReviewAttestationNoUgcOrPii({ noUgcOrPiiInReviewNotes: true })).toBe(true);
  });

  it("picks bottleneck stage by max count", () => {
    expect(
      pickLegalKnowledgeBottleneckStage({
        INTAKE_PRE_BRIEF: 2,
        BRIEF_AWAITING_REVIEW: 9,
        REVIEW_APPROVED_NO_PACKET: 1,
        PACKET_DRAFT_NOT_APPROVED: 0,
      }),
    ).toBe("BRIEF_AWAITING_REVIEW");
  });

  it("dashboard snapshot excludes body field keys", () => {
    const sample = assertLegalKnowledgeIntelligenceDashboardMetaOnly({
      generatedAt: new Date().toISOString(),
      backlog: {
        intakeByStatus: {} as never,
        briefByStatus: {} as never,
        reviewByStatus: {} as never,
      },
      funnel: {
        totalIntakes: 0,
        intakesWithBrief: 0,
        intakesWithApprovedReview: 0,
        intakesPacketDraftLinked: 0,
        intakesPacketApproved: 0,
        reviewsApproved: 0,
        reviewsWithPacketDraft: 0,
        rates: {
          intakeToBriefPct: null,
          briefToApprovedReviewPct: null,
          approvedReviewToPacketDraftPct: null,
          intakeToPacketApprovedPct: null,
        },
      },
      caseTypeDemand: [],
      demandGap: {
        activePipelineCount: 0,
        withoutBriefCount: 0,
        awaitingLawyerReviewCount: 0,
        approvedNotCompiledCount: 0,
        packetDraftNotApprovedCount: 0,
      },
      lawyerReviewSla: {
        slaHoursDefault: 72,
        pendingReviewCount: 0,
        briefsAwaitingReviewCount: 0,
        overduePendingReviewCount: 0,
        overdueBriefsAwaitingReviewCount: 0,
        avgHoursReviewDecisionTime: null,
        bottleneckStage: "INTAKE_PRE_BRIEF",
      },
      complianceMeta: {
        intakeNoRawUgcPass: 0,
        intakeNoRawUgcFail: 0,
        briefNoRawUgcPass: 0,
        briefNoRawUgcFail: 0,
        reviewAttestationPass: 0,
        reviewAttestationFail: 0,
      },
    });
    expect(sample.funnel.totalIntakes).toBe(0);
  });
});
