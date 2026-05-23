import { describe, expect, it, vi, beforeEach } from "vitest";

const prismaMocks = vi.hoisted(() => ({
  legalKnowledgeDemandIntake: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  legalKnowledgeResearchBrief: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    findMany: vi.fn(),
  },
  legalKnowledgeLawyerReviewDecision: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  gongbuhoPacket: {
    create: vi.fn(),
  },
  $transaction: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    legalKnowledgeDemandIntake: prismaMocks.legalKnowledgeDemandIntake,
    legalKnowledgeResearchBrief: prismaMocks.legalKnowledgeResearchBrief,
    legalKnowledgeLawyerReviewDecision:
      prismaMocks.legalKnowledgeLawyerReviewDecision,
    gongbuhoPacket: prismaMocks.gongbuhoPacket,
    $transaction: prismaMocks.$transaction,
  },
}));

import {
  compileLegalKnowledgePacketDraft,
  createLegalKnowledgeResearchBrief,
  getLegalKnowledgeBriefForLawyerReview,
} from "@/features/gongbuho/legal-knowledge-pipeline.service";

const intakeReady = {
  id: "intake-1",
  status: "READY_FOR_RESEARCH",
  intakeCompliance: { noRawUgcStored: true },
  caseTypeMapping: { mappedCaseType: "JEONSE" },
  querySignature: { normalizedKeyword: "전세보증금 반환" },
};

const briefBody = {
  packetIntent: "NEW_PACKET" as const,
  canonicalSourceRefs: [
    {
      sourceKind: "STATUTE" as const,
      citationKey: "민법 제565조",
      summaryPointer: "임대차 종료",
    },
  ],
  legalIssueOutline: "전세보증금 반환 분쟁",
  structureHints: {
    suggestedQuestionThemes: ["보증금 액수"],
    suggestedOutputSections: ["사실관계"],
    suggestedForbiddenThemes: ["확정적 승소"],
  },
};

describe("legal-knowledge-pipeline.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMocks.$transaction.mockImplementation(
      async (fn: (tx: typeof prismaMocks) => Promise<unknown>) => fn(prismaMocks),
    );
  });

  it("READY_FOR_RESEARCH 이전 brief 생성을 차단한다", async () => {
    prismaMocks.legalKnowledgeDemandIntake.findUnique.mockResolvedValue({
      ...intakeReady,
      status: "DRAFT",
    });

    await expect(
      createLegalKnowledgeResearchBrief("intake-1", "admin-1", briefBody),
    ).rejects.toMatchObject({
      details: { code: "LEGAL_KNOWLEDGE_INTAKE_NOT_READY_FOR_RESEARCH" },
    });
  });

  it("Lawyer 승인 없이 compile-packet-draft를 차단한다", async () => {
    prismaMocks.legalKnowledgeLawyerReviewDecision.findUnique.mockResolvedValue({
      id: "review-1",
      decision: "REJECT",
      status: "REJECTED",
      gongbuhoPacketId: null,
      intakeId: "intake-1",
      researchBriefId: "brief-1",
      researchBrief: {
        canonicalSourceRefs: briefBody.canonicalSourceRefs,
        targetCaseType: "JEONSE",
        structureHints: briefBody.structureHints,
        demandKeywordSnapshot: "전세보증금 반환",
        intake: { intakeCompliance: { noRawUgcStored: true } },
      },
    });

    await expect(
      compileLegalKnowledgePacketDraft({
        reviewId: "review-1",
        currentUserId: "admin-1",
        body: {
          code: "LAW-JEONSE-001",
          version: "1.0.0",
          name: "전세 공부호",
          domain: "AI법친",
        },
      }),
    ).rejects.toMatchObject({
      details: { code: "LEGAL_KNOWLEDGE_LAWYER_APPROVAL_REQUIRED" },
    });
  });

  it("승인된 review로 DRAFT 패킷을 생성한다", async () => {
    prismaMocks.legalKnowledgeLawyerReviewDecision.findUnique.mockResolvedValue({
      id: "review-1",
      decision: "APPROVE_FOR_PACKET_DRAFT",
      status: "APPROVED",
      gongbuhoPacketId: null,
      intakeId: "intake-1",
      researchBriefId: "brief-1",
      researchBrief: {
        canonicalSourceRefs: briefBody.canonicalSourceRefs,
        targetCaseType: "JEONSE",
        structureHints: briefBody.structureHints,
        demandKeywordSnapshot: "전세보증금 반환",
        intake: { intakeCompliance: { noRawUgcStored: true } },
      },
    });

    prismaMocks.gongbuhoPacket.create.mockResolvedValue({
      id: "packet-1",
      code: "LAW-JEONSE-001",
      version: "1.0.0",
      status: "DRAFT",
    });
    prismaMocks.legalKnowledgeLawyerReviewDecision.update.mockResolvedValue({});
    prismaMocks.legalKnowledgeDemandIntake.update.mockResolvedValue({});

    const result = await compileLegalKnowledgePacketDraft({
      reviewId: "review-1",
      currentUserId: "admin-1",
      body: {
        code: "LAW-JEONSE-001",
        version: "1.0.0",
        name: "전세 공부호",
        domain: "AI법친",
      },
    });

    expect(result.packet.id).toBe("packet-1");
    expect(prismaMocks.gongbuhoPacket.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "DRAFT",
          caseType: "JEONSE",
        }),
      }),
    );
  });

  it("변호사 포털은 READY_FOR_LAWYER_REVIEW 가 아니면 Brief 상세 거부", async () => {
    prismaMocks.legalKnowledgeResearchBrief.findUnique.mockResolvedValue({
      id: "brief-1",
      status: "DRAFT",
      intake: {},
      lawyerReviews: [],
    });

    await expect(getLegalKnowledgeBriefForLawyerReview("brief-1")).rejects.toMatchObject({
      details: { code: "LEGAL_KNOWLEDGE_BRIEF_NOT_READY_FOR_LAWYER" },
    });
  });
});
