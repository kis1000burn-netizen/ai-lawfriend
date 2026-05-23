import { describe, expect, it, vi, beforeEach } from "vitest";

import { ForbiddenError, ValidationError } from "@/lib/errors";

const prismaMocks = vi.hoisted(() => ({
  caseFindUnique: vi.fn(),
  voiceTranscriptFindFirst: vi.fn(),
}));

const repoMocks = vi.hoisted(() => ({
  createSupplementRequestRepository: vi.fn(),
  createSupplementRequestItemRepository: vi.fn(),
  appendSupplementRequestAuditLogRepository: vi.fn(),
  appendSupplementRequestStatusLogRepository: vi.fn(),
  updateSupplementRequestRepository: vi.fn(),
  findSupplementRequestByIdRepository: vi.fn(),
}));

const permissionMocks = vi.hoisted(() => ({
  getCaseAccessContext: vi.fn(),
}));

const interviewMocks = vi.hoisted(() => ({
  saveInterviewAnswer: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    case: { findUnique: prismaMocks.caseFindUnique },
    voiceTranscript: { findFirst: prismaMocks.voiceTranscriptFindFirst },
  },
}));

vi.mock("@/features/supplement-request/supplement-request.repository", () => repoMocks);
vi.mock("@/features/cases/case.permissions", () => permissionMocks);
vi.mock("@/features/case-interview/case-interview.service", () => interviewMocks);

import {
  buildVoiceLawyerSupplementDescription,
  buildVoiceLawyerSupplementItemPrompt,
  createVoiceLawyerSupplementQuestion,
  mergeVoiceSupplementItemsToInterviewOnAccepted,
  VOICE_LAWYER_SUPPLEMENT_SERVICE_MARKER_PHASE5H_UI_4,
  VOICE_LAWYER_SUPPLEMENT_SOURCE_MARKER,
} from "@/features/voice/voice-lawyer-supplement.service";

const lawyerUser = {
  id: "law1",
  email: "law@x.com",
  name: "Lawyer",
  role: "LAWYER" as const,
  status: "ACTIVE" as const,
};

describe("voice-lawyer-supplement.service (Phase 5-H-UI-4)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    permissionMocks.getCaseAccessContext.mockResolvedValue({ canWriteCase: true });
    prismaMocks.caseFindUnique.mockResolvedValue({
      id: "case1",
      ownerUserId: "user1",
      title: "사건",
    });
    prismaMocks.voiceTranscriptFindFirst.mockResolvedValue({ id: "tr1" });
    repoMocks.createSupplementRequestRepository.mockResolvedValue({
      id: "req1",
      status: "DRAFT",
      caseId: "case1",
    });
    repoMocks.createSupplementRequestItemRepository.mockResolvedValue({
      id: "item1",
      requestId: "req1",
      interviewQuestionKey: "q1",
      sourceMarker: VOICE_LAWYER_SUPPLEMENT_SOURCE_MARKER,
    });
    repoMocks.updateSupplementRequestRepository.mockResolvedValue({
      id: "req1",
      status: "SENT",
      caseId: "case1",
    });
  });

  it("exports service markers", () => {
    expect(VOICE_LAWYER_SUPPLEMENT_SERVICE_MARKER_PHASE5H_UI_4).toContain(
      "phase5h-ui-4-voice-lawyer-supplement-question",
    );
    expect(VOICE_LAWYER_SUPPLEMENT_SOURCE_MARKER).toContain("voice-lawyer-review-supplement");
  });

  it("builds default supplement prompts without transcript body", () => {
    expect(buildVoiceLawyerSupplementItemPrompt({ questionLabel: "사건 경위" })).toContain(
      "사건 경위",
    );
    expect(buildVoiceLawyerSupplementDescription("사건 경위")).toContain("인터뷰 답변");
  });

  it("creates supplement request, item, and sends immediately", async () => {
    const result = await createVoiceLawyerSupplementQuestion(lawyerUser, "case1", {
      questionKey: "q1",
      questionLabel: "사건 경위",
      sendImmediately: true,
    });

    expect(repoMocks.createSupplementRequestRepository).toHaveBeenCalled();
    expect(repoMocks.createSupplementRequestItemRepository).toHaveBeenCalledWith(
      expect.objectContaining({
        interviewQuestionKey: "q1",
        voiceTranscriptId: "tr1",
        sourceMarker: VOICE_LAWYER_SUPPLEMENT_SOURCE_MARKER,
      }),
    );
    expect(repoMocks.updateSupplementRequestRepository).toHaveBeenCalled();
    expect(result.supplementHubPath).toBe("/cases/case1/supplement");
  });

  it("rejects when no confirmed transcript exists", async () => {
    prismaMocks.voiceTranscriptFindFirst.mockResolvedValue(null);
    await expect(
      createVoiceLawyerSupplementQuestion(lawyerUser, "case1", {
        questionKey: "q1",
        sendImmediately: true,
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("rejects non-lawyer roles", async () => {
    await expect(
      createVoiceLawyerSupplementQuestion(
        { ...lawyerUser, role: "USER" },
        "case1",
        { questionKey: "q1", sendImmediately: true },
      ),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("merges accepted voice supplement responses into interview answers", async () => {
    repoMocks.findSupplementRequestByIdRepository.mockResolvedValue({
      id: "req1",
      caseId: "case1",
      items: [
        {
          id: "item1",
          interviewQuestionKey: "q1",
          sourceMarker: VOICE_LAWYER_SUPPLEMENT_SOURCE_MARKER,
        },
      ],
      responses: [
        {
          requestItemId: "item1",
          responseText: "보완된 답변",
        },
      ],
    });

    const result = await mergeVoiceSupplementItemsToInterviewOnAccepted(
      lawyerUser,
      "case1",
      "req1",
    );

    expect(interviewMocks.saveInterviewAnswer).toHaveBeenCalledWith(lawyerUser, {
      caseId: "case1",
      questionKey: "q1",
      value: "보완된 답변",
    });
    expect(result.mergedQuestionKeys).toEqual(["q1"]);
  });
});
