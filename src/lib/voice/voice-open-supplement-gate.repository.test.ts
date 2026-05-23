import { SupplementRequestStatus } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMocks = vi.hoisted(() => ({
  supplementRequestFindMany: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    supplementRequest: { findMany: prismaMocks.supplementRequestFindMany },
  },
}));

vi.mock("@/features/voice/voice-lawyer-supplement.service", () => ({
  VOICE_LAWYER_SUPPLEMENT_SOURCE_MARKER: "phase5h-ui-4-voice-lawyer-review-supplement",
}));

import {
  loadOpenVoiceOriginSupplementsByCaseId,
  TERMINAL_SUPPLEMENT_REQUEST_STATUSES,
  VOICE_OPEN_SUPPLEMENT_GATE_REPOSITORY_MARKER_PHASE5H_UI_5,
} from "@/lib/voice/voice-open-supplement-gate.repository";

describe("voice-open-supplement-gate.repository (Phase 5-H-UI-5)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exports repository marker and terminal statuses", () => {
    expect(VOICE_OPEN_SUPPLEMENT_GATE_REPOSITORY_MARKER_PHASE5H_UI_5).toContain(
      "phase5h-ui-5-voice-open-supplement-finalize-gate",
    );
    expect(TERMINAL_SUPPLEMENT_REQUEST_STATUSES).toEqual(
      expect.arrayContaining([
        SupplementRequestStatus.ACCEPTED,
        SupplementRequestStatus.CLOSED,
        SupplementRequestStatus.CANCELLED,
        SupplementRequestStatus.EXPIRED,
      ]),
    );
  });

  it("loads open voice-origin supplement rows by case", async () => {
    prismaMocks.supplementRequestFindMany.mockResolvedValue([
      {
        id: "req1",
        status: SupplementRequestStatus.SENT,
        items: [{ interviewQuestionKey: "q1" }, { interviewQuestionKey: "q2" }],
      },
    ]);

    const rows = await loadOpenVoiceOriginSupplementsByCaseId("case1");

    expect(prismaMocks.supplementRequestFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          caseId: "case1",
          isDeleted: false,
          status: { notIn: TERMINAL_SUPPLEMENT_REQUEST_STATUSES },
        }),
      }),
    );
    expect(rows).toEqual([
      {
        supplementRequestId: "req1",
        questionKey: "q1",
        status: SupplementRequestStatus.SENT,
      },
      {
        supplementRequestId: "req1",
        questionKey: "q2",
        status: SupplementRequestStatus.SENT,
      },
    ]);
  });
});
