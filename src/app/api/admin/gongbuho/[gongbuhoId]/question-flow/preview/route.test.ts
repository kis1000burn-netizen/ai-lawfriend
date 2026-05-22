import { describe, expect, it, vi, beforeEach } from "vitest";

const prismaFindUnique = vi.hoisted(() => vi.fn());
vi.mock("@/lib/prisma", () => ({
  prisma: {
    gongbuhoPacket: {
      findUnique: prismaFindUnique,
    },
  },
}));

vi.mock("@/lib/auth/require-staff-or-platform-admin-api", () => ({
  requireStaffOrPlatformAdminApi: vi.fn(async () => ({
    id: "staff-a",
    email: "s@x.com",
    name: "S",
    role: "STAFF",
    status: "ACTIVE",
  })),
}));

import { POST } from "./route";

const SAMPLE_ID = "cjld2cyqh0001t9rmn839i921";

describe("POST …/question-flow/preview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("DRAFT 패킷이어도 투영 반환(DB 미저장)", async () => {
    prismaFindUnique.mockResolvedValueOnce({
      id: SAMPLE_ID,
      code: "LAW-FRAUD-001",
      version: "1.0.0",
      status: "DRAFT",
      caseType: "FRAUD",
      packetJson: {
        questionFlow: [
          {
            id: "T1",
            text: "질문 본문",
            purpose: "목적 저장",
          },
        ],
      },
    });

    const res = await POST(
      new Request("http://localhost", { method: "POST" }),
      { params: Promise.resolve({ gongbuhoId: SAMPLE_ID }) },
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.data.source).toBe("GONGBUHO");
    expect(body.data.gongbuhoPacket.status).toBe("DRAFT");
    expect(body.data.questions).toHaveLength(1);
    expect(body.data.questions[0].key).toBe("gongbuho.T1");
    expect(body.data.questions[0].description).toBe("목적 저장");
  });

  it("패킷 없음 404", async () => {
    prismaFindUnique.mockResolvedValueOnce(null);
    const res = await POST(
      new Request("http://localhost", { method: "POST" }),
      { params: Promise.resolve({ gongbuhoId: SAMPLE_ID }) },
    );
    expect(res.status).toBe(404);
  });

  it("questionFlow 없음(또는 패킷 객체에 미포함) 시 400", async () => {
    prismaFindUnique.mockResolvedValueOnce({
      id: SAMPLE_ID,
      code: "X",
      version: "1",
      status: "APPROVED",
      caseType: null,
      packetJson: {},
    });
    const res = await POST(
      new Request("http://localhost", { method: "POST" }),
      { params: Promise.resolve({ gongbuhoId: SAMPLE_ID }) },
    );
    expect(res.status).toBe(400);
    const j = await res.json();
    expect(j.details?.code).toBe("GONGBUHO_QUESTION_FLOW_MISSING");
  });
});
