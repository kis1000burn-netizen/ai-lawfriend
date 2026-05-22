import { describe, expect, it, vi, beforeEach } from "vitest";
import { Prisma } from "@prisma/client";

const prismaMocks = vi.hoisted(() => ({
  gongbuhoPacket: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  gongbuhoTrace: {
    create: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    gongbuhoPacket: prismaMocks.gongbuhoPacket,
    gongbuhoTrace: prismaMocks.gongbuhoTrace,
  },
}));

import {
  applyGongbuhoToCase,
  approveGongbuhoPacket,
  archiveGongbuhoPacket,
  createGongbuhoPacketDraft,
  findApprovedPacketForApply,
} from "@/features/gongbuho/gongbuho-packet.service";

const approverAdmin = {
  id: "admin-approver",
  email: "a@x.com",
  name: "A",
  role: "ADMIN",
  status: "ACTIVE",
} as const;

const sampleParsed = {
  code: "LAW-FRAUD-001",
  version: "1.0.0",
  name: "n",
  domain: "AI법친",
  caseType: "FRAUD",
  knowledgeMap: [],
} as const;

const draftRow = {
  id: "pack1",
  code: sampleParsed.code,
  version: sampleParsed.version,
  name: sampleParsed.name,
  domain: sampleParsed.domain,
  caseType: sampleParsed.caseType,
  packetJson: { expertReviewPoints: ["a"], humanApproval: {} },
  status: "DRAFT" as const,
};

const approvedPacketRow = {
  ...draftRow,
  status: "APPROVED" as const,
  approvedAt: new Date(),
};

describe("gongbuho-packet.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("생성 중 P2002면 ConflictError", async () => {
    prismaMocks.gongbuhoPacket.create.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError("uniq", {
        code: "P2002",
        clientVersion: "test",
      }),
    );
    await expect(
      createGongbuhoPacketDraft("u1", sampleParsed),
    ).rejects.toMatchObject({ code: "CONFLICT", statusCode: 409 });
  });

  it("생성 성공 시 DRAFT + packetJson", async () => {
    prismaMocks.gongbuhoPacket.create.mockResolvedValueOnce({
      id: "new1",
      status: "DRAFT",
    });
    await createGongbuhoPacketDraft("u1", sampleParsed);
    expect(prismaMocks.gongbuhoPacket.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "DRAFT",
          createdByUserId: "u1",
          code: "LAW-FRAUD-001",
        }),
      }),
    );
  });

  it("ARCHIVED 승인 시도 불가", async () => {
    prismaMocks.gongbuhoPacket.findUnique.mockResolvedValueOnce({
      id: "p1",
      status: "ARCHIVED",
    });
    await expect(
      approveGongbuhoPacket({ gongbuhoId: "p1", approver: approverAdmin }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      details: expect.objectContaining({ code: "GONGBUHO_PACKET_NOT_APPROVABLE" }),
    });
  });

  it("이미 APPROVED면 idempotent", async () => {
    prismaMocks.gongbuhoPacket.findUnique.mockResolvedValueOnce({
      ...approvedPacketRow,
    });
    const r = await approveGongbuhoPacket({
      gongbuhoId: approvedPacketRow.id,
      approver: approverAdmin,
    });
    expect(r.alreadyApproved).toBe(true);
    expect(prismaMocks.gongbuhoPacket.update).not.toHaveBeenCalled();
  });

  it("ARCHIVED 상태 보관 API는 멱등", async () => {
    prismaMocks.gongbuhoPacket.findUnique.mockResolvedValueOnce({
      id: "arc1",
      status: "ARCHIVED",
      code: sampleParsed.code,
      version: sampleParsed.version,
      name: "",
      domain: "",
      caseType: null,
      packetJson: {},
    });
    const r = await archiveGongbuhoPacket({
      gongbuhoId: "arc1",
      actor: approverAdmin as never,
    });
    expect(r.alreadyArchived).toBe(true);
    expect(prismaMocks.gongbuhoPacket.update).not.toHaveBeenCalled();
  });

  it("DRAFT에서 보관 처리 시 상태만 ARCHIVED로 갱신", async () => {
    prismaMocks.gongbuhoPacket.findUnique.mockResolvedValueOnce({
      ...draftRow,
      packetJson: draftRow.packetJson,
    });
    prismaMocks.gongbuhoPacket.update.mockResolvedValueOnce({
      ...draftRow,
      status: "ARCHIVED",
    });

    const r = await archiveGongbuhoPacket({
      gongbuhoId: draftRow.id,
      actor: approverAdmin as never,
    });

    expect(r.alreadyArchived).toBe(false);
    expect(prismaMocks.gongbuhoPacket.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: draftRow.id },
        data: { status: "ARCHIVED" },
      }),
    );
  });

  it("explicit 코드 버전 매칭이 DRAFT이면 적용 불가(NotFound류)", async () => {
    prismaMocks.gongbuhoPacket.findFirst.mockResolvedValueOnce(null);
    await expect(
      findApprovedPacketForApply({
        caseCategory: "FRAUD",
        code: "LAW-FRAUD-001",
        version: "1.0.0",
      }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      statusCode: 404,
    });
  });

  it("복수 APPROVED 후보 시 AMBIGUOUS_GONGBUHO_PACKET", async () => {
    prismaMocks.gongbuhoPacket.findMany.mockResolvedValueOnce([
      { id: "a", code: "C1", version: "1.0.0" },
      { id: "b", code: "C2", version: "1.0.0" },
    ]);
    await expect(
      findApprovedPacketForApply({ caseCategory: "FRAUD" }),
    ).rejects.toMatchObject({
      details: expect.objectContaining({ code: "AMBIGUOUS_GONGBUHO_PACKET" }),
    });
  });

  it("적용 성공 시 Trace 생성", async () => {
    prismaMocks.gongbuhoPacket.findFirst.mockResolvedValueOnce({
      ...approvedPacketRow,
    });
    prismaMocks.gongbuhoTrace.create.mockResolvedValueOnce({
      id: "t1",
    });
    const r = await applyGongbuhoToCase({
      caseId: "case1",
      actorUserId: "actor-apply-1",
      caseSnapshot: { category: "FRAUD", status: "CREATED", title: "x" },
      explicit: {
        code: "LAW-FRAUD-001",
        version: "1.0.0",
      },
    });
    expect(r.trace.id).toBe("t1");
    expect(prismaMocks.gongbuhoTrace.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          caseId: "case1",
          gongbuhoPacketId: approvedPacketRow.id,
          validationResult: expect.objectContaining({
            policy: "APPROVED_ONLY",
            gongbuhoPhase4Flow: expect.objectContaining({
              applied: expect.objectContaining({
                traceEvent: "GONGBUHO_APPLIED_TO_CASE",
                actorUserId: "actor-apply-1",
              }),
            }),
          }),
        }),
      }),
    );
  });
});
