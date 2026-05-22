import { describe, expect, it, vi, beforeEach } from "vitest";
import { ForbiddenError, NotFoundError } from "@/lib/errors";

const mockUser = {
  id: "owner-1",
  email: "o@x.com",
  role: "USER",
} as const;

vi.mock("@/lib/auth/require-session-user", () => ({
  requireSessionUser: vi.fn(async () => mockUser),
}));

const getCtx = vi.hoisted(() => vi.fn());
vi.mock("@/features/cases/case.permissions", () => ({
  getCaseAccessContext: getCtx,
}));

const getInterview = vi.hoisted(() => vi.fn());
const bindInterview = vi.hoisted(() => vi.fn());

vi.mock("@/features/gongbuho/gongbuho-interview-binding.service", () => ({
  getCaseGongbuhoInterview: getInterview,
  bindCaseGongbuhoInterview: bindInterview,
}));

import { GET } from "./route";
import { POST } from "./bind/route";

const CASE_ID = "cjld2cyqh0001t9rmn839i921";
const PACKET_ID = "cjld2cyqh0002t9rmn839i922";
const QUESTION_SET_ID = "cjld2cyqh0003t9rmn839i924";

describe("GET /api/cases/[caseId]/gongbuho/interview", () => {
  beforeEach(() => vi.clearAllMocks());

  it("무권한 403", async () => {
    getCtx.mockRejectedValueOnce(new ForbiddenError());
    const res = await GET(new Request("http://localhost", { method: "GET" }), {
      params: Promise.resolve({ caseId: CASE_ID }),
    });
    expect(res.status).toBe(403);
  });

  it("무사건 접근 불가 시 404", async () => {
    getCtx.mockRejectedValueOnce(new NotFoundError());
    const res = await GET(new Request("http://localhost", { method: "GET" }), {
      params: Promise.resolve({ caseId: CASE_ID }),
    });
    expect(res.status).toBe(404);
  });

  it("서비스 null 시 404", async () => {
    getCtx.mockResolvedValueOnce({ canRead: true });
    getInterview.mockResolvedValueOnce(null);
    const res = await GET(new Request("http://localhost", { method: "GET" }), {
      params: Promise.resolve({ caseId: CASE_ID }),
    });
    expect(res.status).toBe(404);
  });

  it("바인드 미설정 페이로드", async () => {
    getCtx.mockResolvedValueOnce({ canRead: true });
    getInterview.mockResolvedValueOnce({ caseId: CASE_ID, bound: false });
    const res = await GET(new Request("http://localhost", { method: "GET" }), {
      params: Promise.resolve({ caseId: CASE_ID }),
    });
    expect(res.status).toBe(200);
    const j = await res.json();
    expect(j.ok).toBe(true);
    expect(j.data.bound).toBe(false);
  });
});

describe("POST …/interview/bind", () => {
  beforeEach(() => vi.clearAllMocks());

  it("수정 불가 시 403", async () => {
    getCtx.mockResolvedValueOnce({ canWriteCase: false, canRead: true });
    const res = await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auto: true }),
      }),
      { params: Promise.resolve({ caseId: CASE_ID }) },
    );
    expect(res.status).toBe(403);
    expect(bindInterview).not.toHaveBeenCalled();
  });

  it("바인드 성공 201", async () => {
    getCtx.mockResolvedValueOnce({ canWriteCase: true });
    bindInterview.mockResolvedValueOnce({
      caseId: CASE_ID,
      bound: true,
      gongbuhoPacket: { id: PACKET_ID, code: "LAW-X", version: "1", name: null },
      questionSet: { id: QUESTION_SET_ID, title: "T", status: "PUBLISHED", isActive: true },
      questions: [],
    });

    const res = await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gongbuhoPacketId: PACKET_ID,
          questionSetId: QUESTION_SET_ID,
        }),
      }),
      { params: Promise.resolve({ caseId: CASE_ID }) },
    );

    expect(res.status).toBe(201);
    expect(bindInterview).toHaveBeenCalledWith(
      CASE_ID,
      expect.any(Object),
      mockUser.id,
    );
    const j = await res.json();
    expect(j.ok).toBe(true);
    expect(j.data.bound).toBe(true);
  });
});
