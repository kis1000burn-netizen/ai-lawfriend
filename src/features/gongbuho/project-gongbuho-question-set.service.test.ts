import { describe, expect, it, vi, beforeEach } from "vitest";
import { ConflictError, NotFoundError, ValidationError } from "@/lib/errors";

const prismaFindUniquePacket = vi.hoisted(() => vi.fn());
const prismaFindManyQs = vi.hoisted(() => vi.fn());
const prismaFindUniqueOrThrowQs = vi.hoisted(() => vi.fn());
const createQuestionSetMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({
  prisma: {
    gongbuhoPacket: {
      findUnique: prismaFindUniquePacket,
    },
    questionSet: {
      findMany: prismaFindManyQs,
      findUniqueOrThrow: prismaFindUniqueOrThrowQs,
    },
  },
}));

vi.mock("@/features/question-set/question-set.service", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@/features/question-set/question-set.service")>();
  return {
    ...mod,
    createQuestionSet: createQuestionSetMock,
  };
});

import {
  findExistingQuestionSetForGongbuhoIdentity,
  isQuestionSetDefinitionLinkedToSameGongbuhoIdentity,
  projectGongbuhoPacketToQuestionSetDraft,
} from "./project-gongbuho-question-set.service";

const SAMPLE_ID = "cjld2cyqh0001t9rmn839i921";

describe("isQuestionSetDefinitionLinkedToSameGongbuhoIdentity", () => {
  const id = { packetId: "p1", code: "LAW-A", version: "1.0.0" };

  it("packetId 일치 시 true", () => {
    expect(
      isQuestionSetDefinitionLinkedToSameGongbuhoIdentity(
        { source: "GONGBUHO", gongbuho: { packetId: "p1", code: "X", version: "9" } },
        id,
      ),
    ).toBe(true);
  });

  it("code+version 동시 일치 시 true (다른 packetId여도)", () => {
    expect(
      isQuestionSetDefinitionLinkedToSameGongbuhoIdentity(
        { source: "GONGBUHO", gongbuho: { packetId: "old", code: "LAW-A", version: "1.0.0" } },
        id,
      ),
    ).toBe(true);
  });

  it("source가 GONGBUHO가 아니면 false", () => {
    expect(
      isQuestionSetDefinitionLinkedToSameGongbuhoIdentity(
        { source: "OTHER", gongbuho: { packetId: "p1", code: "LAW-A", version: "1.0.0" } },
        id,
      ),
    ).toBe(false);
  });

  it("불일치 시 false", () => {
    expect(
      isQuestionSetDefinitionLinkedToSameGongbuhoIdentity(
        { source: "GONGBUHO", gongbuho: { packetId: "p2", code: "LAW-B", version: "2.0.0" } },
        id,
      ),
    ).toBe(false);
  });
});

describe("findExistingQuestionSetForGongbuhoIdentity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaFindManyQs.mockReset();
    prismaFindManyQs.mockResolvedValue([]);
  });

  it("스캔 결과에서 첫 일치 행 id 반환", async () => {
    prismaFindManyQs.mockResolvedValueOnce([
      { id: "other", definitionJson: { source: "GONGBUHO", gongbuho: { packetId: "x" } } },
      { id: "hit", definitionJson: { source: "GONGBUHO", gongbuho: { packetId: SAMPLE_ID } } },
    ]);

    const r = await findExistingQuestionSetForGongbuhoIdentity({
      packetId: SAMPLE_ID,
      code: "LAW-FRAUD-001",
      version: "1.0.0",
    });
    expect(r).toEqual({ id: "hit" });
  });
});

describe("projectGongbuhoPacketToQuestionSetDraft", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaFindManyQs.mockReset();
    prismaFindManyQs.mockResolvedValue([]);
    prismaFindUniquePacket.mockReset();
    prismaFindUniqueOrThrowQs.mockReset();
    createQuestionSetMock.mockReset();
  });

  it("패킷 없음 → NotFoundError", async () => {
    prismaFindUniquePacket.mockResolvedValueOnce(null);
    await expect(
      projectGongbuhoPacketToQuestionSetDraft({ gongbuhoPacketId: SAMPLE_ID }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("비 APPROVED → ValidationError", async () => {
    prismaFindUniquePacket.mockResolvedValueOnce({
      id: SAMPLE_ID,
      code: "X",
      version: "1",
      name: "N",
      status: "DRAFT",
      packetJson: { questionFlow: [{ id: "T1", text: "q" }] },
    });
    prismaFindManyQs.mockResolvedValueOnce([]);
    await expect(
      projectGongbuhoPacketToQuestionSetDraft({ gongbuhoPacketId: SAMPLE_ID }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      details: { code: "GONGBUHO_PROJECT_REQUIRES_APPROVED_PACKET" },
    });
  });

  it("중복 envelope → ConflictError", async () => {
    prismaFindUniquePacket.mockResolvedValueOnce({
      id: SAMPLE_ID,
      code: "LAW-X",
      version: "2.0.0",
      name: "테스트 패킷",
      status: "APPROVED",
      packetJson: { questionFlow: [{ id: "T1", text: "질문" }] },
    });
    prismaFindManyQs.mockResolvedValueOnce([
      {
        id: "existing-id",
        definitionJson: {
          source: "GONGBUHO",
          gongbuho: { packetId: "other-pack", code: "LAW-X", version: "2.0.0" },
        },
      },
    ]);
    await expect(
      projectGongbuhoPacketToQuestionSetDraft({ gongbuhoPacketId: SAMPLE_ID }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("성공 시 createQuestionSet에 envelope·순서·비활성 전달 및 DRAFT 응답", async () => {
    prismaFindUniquePacket.mockResolvedValueOnce({
      id: SAMPLE_ID,
      code: "LAW-FRAUD-001",
      version: "1.0.0",
      name: "사기사건 패킷",
      status: "APPROVED",
      packetJson: {
        questionFlow: [
          { id: "Q2", text: "두 번째" },
          { id: "Q1", text: "첫 번째" },
        ],
      },
    });
    prismaFindManyQs.mockResolvedValueOnce([]);
    createQuestionSetMock.mockResolvedValueOnce({ id: "qs-new" });
    prismaFindUniqueOrThrowQs.mockResolvedValueOnce({
      id: "qs-new",
      name: "사기사건 패킷 · 질문셋 초안",
      catalogStatus: "DRAFT",
    });

    const res = await projectGongbuhoPacketToQuestionSetDraft({
      gongbuhoPacketId: SAMPLE_ID,
    });

    expect(res.source).toBe("GONGBUHO");
    expect(res.gongbuhoPacket.id).toBe(SAMPLE_ID);
    expect(res.questionSet.status).toBe("DRAFT");
    expect(res.questions.map((q) => q.key)).toEqual(["gongbuho.Q2", "gongbuho.Q1"]);
    expect(res.questions.map((q) => q.order)).toEqual([1, 2]);

    expect(createQuestionSetMock).toHaveBeenCalledTimes(1);
    const callArg = createQuestionSetMock.mock.calls[0][0];
    expect(callArg.isActive).toBe(false);
    expect(callArg.definitionJson).toMatchObject({
      source: "GONGBUHO",
      gongbuho: expect.objectContaining({
        packetId: SAMPLE_ID,
        code: "LAW-FRAUD-001",
        version: "1.0.0",
      }),
    });
    expect(typeof callArg.definitionJson.gongbuho.projectedAt).toBe("string");
    expect(callArg.definitionJson.gongbuho.projectedAt).toMatch(/\d{4}-\d{2}-\d{2}T/);
  });

  it("questionFlow 누락 시 ValidationError (투영기 코드)", async () => {
    prismaFindUniquePacket.mockResolvedValueOnce({
      id: SAMPLE_ID,
      code: "Z",
      version: "1",
      name: "N",
      status: "APPROVED",
      packetJson: {},
    });
    prismaFindManyQs.mockResolvedValueOnce([]);
    await expect(
      projectGongbuhoPacketToQuestionSetDraft({ gongbuhoPacketId: SAMPLE_ID }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      details: { code: "GONGBUHO_QUESTION_FLOW_MISSING" },
    });
  });

  it("questionFlow 검증 오류 시 ValidationError", async () => {
    prismaFindUniquePacket.mockResolvedValueOnce({
      id: SAMPLE_ID,
      code: "Z",
      version: "1",
      name: "N",
      status: "APPROVED",
      packetJson: { questionFlow: [{ id: "", text: "x" }] },
    });
    prismaFindManyQs.mockResolvedValueOnce([]);
    await expect(
      projectGongbuhoPacketToQuestionSetDraft({ gongbuhoPacketId: SAMPLE_ID }),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});
