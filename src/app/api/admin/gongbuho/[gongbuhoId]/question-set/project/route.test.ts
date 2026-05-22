import { describe, expect, it, vi, beforeEach } from "vitest";

const writeGongbuhoAuditLogMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/gongbuho/gongbuho-audit-log", () => ({
  writeGongbuhoAuditLog: writeGongbuhoAuditLogMock,
}));

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

const requireStaff = vi.hoisted(() =>
  vi.fn(async () => ({
    id: "admin-1",
    email: "a@x.com",
    role: "ADMIN",
  })),
);

vi.mock("@/lib/auth/require-staff-or-platform-admin-api", () => ({
  requireStaffOrPlatformAdminApi: requireStaff,
}));

import { POST } from "./route";

const SAMPLE_ID = "cjld2cyqh0001t9rmn839i921";

function approvedPacket() {
  return {
    id: SAMPLE_ID,
    code: "LAW-FRAUD-001",
    version: "1.0.0",
    name: "사기 패킷",
    status: "APPROVED",
    packetJson: {
      questionFlow: [{ id: "T1", text: "내용입니다", purpose: "목적" }],
    },
  };
}

describe("POST …/question-set/project", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    writeGongbuhoAuditLogMock.mockReset();
    prismaFindManyQs.mockReset();
    prismaFindManyQs.mockResolvedValue([]);
    prismaFindUniquePacket.mockReset();
    prismaFindUniqueOrThrowQs.mockReset();
    createQuestionSetMock.mockReset();
    requireStaff.mockReset();
    requireStaff.mockImplementation(async () => ({
      id: "admin-1",
      email: "a@x.com",
      role: "ADMIN",
    }));
  });

  it("비 APPROVED 패킷 400 · GONGBUHO_PROJECT_REQUIRES_APPROVED_PACKET", async () => {
    prismaFindUniquePacket.mockResolvedValueOnce({
      ...approvedPacket(),
      status: "REVIEW",
    });
    prismaFindManyQs.mockResolvedValueOnce([]);
    const res = await POST(
      new Request("http://localhost", { method: "POST" }),
      { params: Promise.resolve({ gongbuhoId: SAMPLE_ID }) },
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.details?.code).toBe("GONGBUHO_PROJECT_REQUIRES_APPROVED_PACKET");
  });

  it("패킷 없음 404", async () => {
    prismaFindUniquePacket.mockResolvedValueOnce(null);
    const res = await POST(
      new Request("http://localhost", { method: "POST" }),
      { params: Promise.resolve({ gongbuhoId: SAMPLE_ID }) },
    );
    expect(res.status).toBe(404);
  });

  it("questionFlow 누락 400", async () => {
    prismaFindUniquePacket.mockResolvedValueOnce({
      ...approvedPacket(),
      packetJson: {},
    });
    prismaFindManyQs.mockResolvedValueOnce([]);
    const res = await POST(
      new Request("http://localhost", { method: "POST" }),
      { params: Promise.resolve({ gongbuhoId: SAMPLE_ID }) },
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.details?.code).toBe("GONGBUHO_QUESTION_FLOW_MISSING");
  });

  it("중복 시 409", async () => {
    prismaFindUniquePacket.mockResolvedValueOnce(approvedPacket());
    prismaFindManyQs.mockResolvedValueOnce([
      {
        id: "exist",
        definitionJson: {
          source: "GONGBUHO",
          gongbuho: {
            packetId: SAMPLE_ID,
            code: "LAW-FRAUD-001",
            version: "1.0.0",
          },
        },
      },
    ]);
    const res = await POST(
      new Request("http://localhost", { method: "POST" }),
      { params: Promise.resolve({ gongbuhoId: SAMPLE_ID }) },
    );
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.details?.code).toBe("QUESTION_SET_FROM_GONGBUHO_EXISTS");
  });

  it("STAFF는 Project assertGongbuhoOperation로 403", async () => {
    requireStaff.mockImplementationOnce(async () => ({
      id: "staff-a",
      email: "s@x.com",
      role: "STAFF" as const,
      status: "ACTIVE" as const,
    }));

    prismaFindUniquePacket.mockResolvedValueOnce(null);
    const res = await POST(
      new Request("http://localhost", { method: "POST" }),
      { params: Promise.resolve({ gongbuhoId: SAMPLE_ID }) },
    );

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.code).toBe("FORBIDDEN");
  });

  it("무권한(세션 레벨 403)", async () => {
    requireStaff.mockRejectedValueOnce(
      Object.assign(new Error("관리자 또는 운영(STAFF) 권한이 필요합니다."), {
        status: 403,
      }),
    );
    const res = await POST(
      new Request("http://localhost", { method: "POST" }),
      { params: Promise.resolve({ gongbuhoId: SAMPLE_ID }) },
    );
    expect(res.status).toBe(403);
  });

  it("무로그인(401)", async () => {
    requireStaff.mockRejectedValueOnce(
      Object.assign(new Error("로그인이 필요합니다."), { status: 401 }),
    );
    const res = await POST(
      new Request("http://localhost", { method: "POST" }),
      { params: Promise.resolve({ gongbuhoId: SAMPLE_ID }) },
    );
    expect(res.status).toBe(401);
  });

  it("유효하지 않은 gongbuhoId · zod 400", async () => {
    const res = await POST(
      new Request("http://localhost", { method: "POST" }),
      { params: Promise.resolve({ gongbuhoId: "not-a-cuid" }) },
    );
    expect(res.status).toBe(400);
  });

  it("성공 201 및 응답 형태", async () => {
    prismaFindUniquePacket.mockResolvedValueOnce(approvedPacket());
    prismaFindManyQs.mockResolvedValueOnce([]);
    createQuestionSetMock.mockResolvedValueOnce({ id: "qs-1" });
    prismaFindUniqueOrThrowQs.mockResolvedValueOnce({
      id: "qs-1",
      name: "사기 패킷 · 질문셋 초안",
      catalogStatus: "DRAFT",
    });

    const res = await POST(
      new Request("http://localhost", { method: "POST" }),
      { params: Promise.resolve({ gongbuhoId: SAMPLE_ID }) },
    );

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.data.source).toBe("GONGBUHO");
    expect(body.data.questionSet.status).toBe("DRAFT");
    expect(body.data.questions).toHaveLength(1);
    expect(body.data.questions[0].key).toBe("gongbuho.T1");
    expect(writeGongbuhoAuditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "GONGBUHO_QUESTION_SET_PROJECTED",
        entityType: "QUESTION_SET",
        entityId: "qs-1",
      }),
    );
  });
});
