import { describe, expect, it, vi, beforeEach } from "vitest";
import { ConflictError } from "@/lib/errors";

const caseFindUnique = vi.hoisted(() => vi.fn());
const questionSetFindUnique = vi.hoisted(() => vi.fn());
const gongbuhoPacketFindUnique = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({
  prisma: {
    case: { findUnique: caseFindUnique },
    questionSet: { findUnique: questionSetFindUnique },
    gongbuhoPacket: { findUnique: gongbuhoPacketFindUnique },
  },
}));

const getQuestionSetByIdMock = vi.hoisted(() => vi.fn());
vi.mock("@/features/question-set/question-set.service", () => ({
  getQuestionSetById: getQuestionSetByIdMock,
}));

import {
  assertQuestionSetOperationalForInterview,
  getCaseGongbuhoInterview,
} from "./gongbuho-interview-binding.service";

describe("assertQuestionSetOperationalForInterview", () => {
  it("비활성 → ConflictError", () => {
    expect(() =>
      assertQuestionSetOperationalForInterview({
        catalogStatus: "PUBLISHED",
        isActive: false,
      }),
    ).toThrow(ConflictError);
  });

  it("비게시 상태 → ConflictError", () => {
    expect(() =>
      assertQuestionSetOperationalForInterview({
        catalogStatus: "DRAFT",
        isActive: true,
      }),
    ).toThrow(ConflictError);
  });

  it("PUBLISHED + 활성 통과", () => {
    expect(() =>
      assertQuestionSetOperationalForInterview({
        catalogStatus: "PUBLISHED",
        isActive: true,
      }),
    ).not.toThrow();
  });
});

describe("getCaseGongbuhoInterview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const CASE_ID = "cjld2cyqh0001t9rmn839i921";
  const QS_ID = "qsbind1";

  it("미연결 시 bound:false", async () => {
    caseFindUnique.mockResolvedValueOnce({ id: CASE_ID, questionSetId: null });
    await expect(getCaseGongbuhoInterview(CASE_ID)).resolves.toEqual({
      caseId: CASE_ID,
      bound: false,
    });
  });

  it("연결된 경우 공부호·질문셋 블록", async () => {
    caseFindUnique.mockResolvedValueOnce({ id: CASE_ID, questionSetId: QS_ID });
    getQuestionSetByIdMock.mockResolvedValueOnce({
      id: QS_ID,
      name: "Q",
      questions: [],
    });
    questionSetFindUnique.mockResolvedValueOnce({
      id: QS_ID,
      name: "제목QS",
      catalogStatus: "PUBLISHED",
      isActive: true,
      definitionJson: {
        source: "GONGBUHO",
        gongbuho: {
          packetId: "pak-1",
          code: "LAW-A",
          version: "1.0",
        },
      },
    });
    gongbuhoPacketFindUnique.mockResolvedValueOnce({
      id: "pak-1",
      code: "LAW-A",
      version: "1.0",
      name: "스팸패킷",
    });

    const r = await getCaseGongbuhoInterview(CASE_ID);
    expect(r!.bound).toBe(true);
    if (r && r.bound === true) {
      expect(r.gongbuhoPacket?.name).toBe("스팸패킷");
      expect(r.questionSet.status).toBe("PUBLISHED");
      expect(r.questions).toHaveLength(0);
    }
  });
});
