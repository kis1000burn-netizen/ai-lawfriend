import { describe, expect, it, vi, beforeEach } from "vitest";

const prismaMocks = vi.hoisted(() => ({
  caseFindUnique: vi.fn(),
  gongbuhoPacketFindMany: vi.fn(),
  gongbuhoTraceFindMany: vi.fn(),
  gongbuhoTraceFindFirst: vi.fn(),
  questionSetFindMany: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    case: {
      findUnique: prismaMocks.caseFindUnique,
    },
    gongbuhoPacket: {
      findMany: prismaMocks.gongbuhoPacketFindMany,
    },
    gongbuhoTrace: {
      findMany: prismaMocks.gongbuhoTraceFindMany,
      findFirst: prismaMocks.gongbuhoTraceFindFirst,
    },
    questionSet: {
      findMany: prismaMocks.questionSetFindMany,
    },
  },
}));

import {
  collectGongbuhoPacketIdsFromRecentQuestionSets,
  getCaseGongbuhoCandidates,
  normalizeCaseCategoryForGongbuho,
} from "./gongbuho-case-candidate.service";

const CASE_ID = "cjld2cyqh0001t9rmn839i921";
const PACKET = {
  id: "pack-a",
  code: "LAW-FRAUD-001",
  version: "1.0.0",
  name: "사기 공부호",
};

describe("normalizeCaseCategoryForGongbuho", () => {
  it("빈 문자열 및 공백 → null", () => {
    expect(normalizeCaseCategoryForGongbuho("")).toBeNull();
    expect(normalizeCaseCategoryForGongbuho("   ")).toBeNull();
  });

  it("트림 적용", () => {
    expect(normalizeCaseCategoryForGongbuho("  FRAUD  ")).toBe("FRAUD");
  });
});

describe("collectGongbuhoPacketIdsFromRecentQuestionSets", () => {
  it("후보 패킷 id 에 매칭하는 envelope 만 반환", async () => {
    prismaMocks.questionSetFindMany.mockResolvedValueOnce([
      { definitionJson: { source: "GONGBUHO", gongbuho: { packetId: PACKET.id } } },
      {
        definitionJson: {
          source: "GONGBUHO",
          gongbuho: { packetId: "other", code: PACKET.code, version: PACKET.version },
        },
      },
    ]);
    const r = await collectGongbuhoPacketIdsFromRecentQuestionSets(new Set([PACKET.id]));
    expect(r.has(PACKET.id)).toBe(true);
    expect(r.has("other")).toBe(false);
  });
});

describe("getCaseGongbuhoCandidates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMocks.gongbuhoTraceFindMany.mockResolvedValue([]);
    prismaMocks.gongbuhoTraceFindFirst.mockResolvedValue(null);
  });

  it("사건 없음 → null", async () => {
    prismaMocks.caseFindUnique.mockResolvedValueOnce(null);
    await expect(getCaseGongbuhoCandidates(CASE_ID)).resolves.toBeNull();
    expect(prismaMocks.gongbuhoPacketFindMany).not.toHaveBeenCalled();
  });

  it("카테고리 없음 시 후보 빈 배열 · NO_APPROVED_PACKET · resolutionReason", async () => {
    prismaMocks.caseFindUnique.mockResolvedValueOnce({ id: CASE_ID, category: null });
    await expect(getCaseGongbuhoCandidates(CASE_ID)).resolves.toEqual(
      expect.objectContaining({
        caseId: CASE_ID,
        caseType: null,
        candidates: [],
        selectionPolicy: "NO_APPROVED_PACKET",
        resolutionReason: "CASE_TYPE_REQUIRED",
        latestTrace: null,
      }),
    );
    expect(prismaMocks.gongbuhoPacketFindMany).not.toHaveBeenCalled();
  });

  it("카테고리는 있으나 APPROVED 0개 · NO_APPROVED_PACKET · QuestionSet 스캔 없음", async () => {
    prismaMocks.caseFindUnique.mockResolvedValueOnce({
      id: CASE_ID,
      category: "FRAUD",
    });
    prismaMocks.gongbuhoPacketFindMany.mockResolvedValueOnce([]);
    const r = await getCaseGongbuhoCandidates(CASE_ID);
    expect(r!.selectionPolicy).toBe("NO_APPROVED_PACKET");
    expect(r!.resolutionReason).toBeUndefined();
    expect(r!.candidates).toEqual([]);
    expect(prismaMocks.questionSetFindMany).not.toHaveBeenCalled();
  });

  it("단일 후보 · AUTO 정책 · draft 플래그", async () => {
    prismaMocks.caseFindUnique.mockResolvedValueOnce({
      id: CASE_ID,
      category: "FRAUD",
    });
    prismaMocks.gongbuhoPacketFindMany.mockResolvedValueOnce([PACKET]);
    prismaMocks.gongbuhoTraceFindMany.mockResolvedValueOnce([]);
    prismaMocks.questionSetFindMany.mockResolvedValueOnce([
      { definitionJson: { source: "GONGBUHO", gongbuho: { packetId: PACKET.id } } },
    ]);

    const r = await getCaseGongbuhoCandidates(CASE_ID);
    expect(r!.selectionPolicy).toBe("AUTO_IF_SINGLE_APPROVED");
    expect(r!.candidates).toHaveLength(1);
    expect(r!.candidates[0]!.questionSetDraftProjected).toBe(true);
    expect(r!.candidates[0]!.traceApplied).toBe(false);
  });

  it("복수 후보 · REQUIRE 정책", async () => {
    prismaMocks.caseFindUnique.mockResolvedValueOnce({
      id: CASE_ID,
      category: "FRAUD",
    });
    prismaMocks.gongbuhoPacketFindMany.mockResolvedValueOnce([
      PACKET,
      { ...PACKET, id: "pack-b", code: "LAW-X", version: "2.0.0" },
    ]);
    prismaMocks.questionSetFindMany.mockResolvedValueOnce([]);

    const r = await getCaseGongbuhoCandidates(CASE_ID);
    expect(r!.selectionPolicy).toBe("REQUIRE_CODE_VERSION_IF_MULTIPLE");
    expect(r!.candidates).toHaveLength(2);
  });

  it("Trace 적용 이력 · latestTrace riskFlags 카운트", async () => {
    prismaMocks.caseFindUnique.mockResolvedValueOnce({
      id: CASE_ID,
      category: "FRAUD",
    });
    prismaMocks.gongbuhoPacketFindMany.mockResolvedValueOnce([PACKET]);
    prismaMocks.questionSetFindMany.mockResolvedValueOnce([]);
    prismaMocks.gongbuhoTraceFindMany.mockResolvedValueOnce([
      { gongbuhoPacketId: PACKET.id },
    ]);
    const created = new Date("2026-05-01T12:00:00.000Z");
    prismaMocks.gongbuhoTraceFindFirst.mockResolvedValueOnce({
      id: "tr1",
      gongbuhoPacketId: PACKET.id,
      code: PACKET.code,
      version: PACKET.version,
      createdAt: created,
      humanApprovalStatus: "PENDING",
      riskFlags: [{ k: "X" }],
    });

    const r = await getCaseGongbuhoCandidates(CASE_ID);
    expect(r!.candidates[0]!.traceApplied).toBe(true);
    expect(r!.latestTrace).toMatchObject({
      id: "tr1",
      riskFlagsCount: 1,
      humanApprovalStatus: "PENDING",
    });
    expect(r!.latestTrace!.createdAt).toBe("2026-05-01T12:00:00.000Z");
  });
});
