import { describe, expect, it, vi, beforeEach } from "vitest";
import { ForbiddenError, NotFoundError } from "@/lib/errors";

const mockUser = {
  id: "user-owner",
  email: "u@x.com",
  name: "U",
  role: "USER",
  status: "ACTIVE",
} as const;

vi.mock("@/lib/auth/require-session-user", () => ({
  requireSessionUser: vi.fn(async () => mockUser),
}));

const getCtx = vi.hoisted(() => vi.fn());
const getCandidates = vi.hoisted(() => vi.fn());

vi.mock("@/features/cases/case.permissions", () => ({
  getCaseAccessContext: getCtx,
}));

vi.mock("@/features/gongbuho/gongbuho-case-candidate.service", () => ({
  getCaseGongbuhoCandidates: getCandidates,
}));

import { GET } from "./route";

const SAMPLE_CASE_CID = "cjld2cyqh0001t9rmn839i921";

describe("GET /api/cases/[caseId]/gongbuho/candidates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("접근 권한 없음 403", async () => {
    getCtx.mockRejectedValueOnce(new ForbiddenError());
    const res = await GET(new Request("http://localhost/", { method: "GET" }), {
      params: Promise.resolve({ caseId: SAMPLE_CASE_CID }),
    });
    expect(res.status).toBe(403);
  });

  it("사건 없음 시 getCaseAccessContext 404", async () => {
    getCtx.mockRejectedValueOnce(new NotFoundError("사건을 찾을 수 없습니다."));
    const res = await GET(new Request("http://localhost/", { method: "GET" }), {
      params: Promise.resolve({ caseId: SAMPLE_CASE_CID }),
    });
    expect(res.status).toBe(404);
  });

  it("후보 서비스 null 시 404(비정합 방어)", async () => {
    getCtx.mockResolvedValueOnce({ canRead: true });
    getCandidates.mockResolvedValueOnce(null);
    const res = await GET(new Request("http://localhost/", { method: "GET" }), {
      params: Promise.resolve({ caseId: SAMPLE_CASE_CID }),
    });
    expect(res.status).toBe(404);
  });

  it("유효 payload 200", async () => {
    getCtx.mockResolvedValueOnce({ canRead: true });
    getCandidates.mockResolvedValueOnce({
      caseId: SAMPLE_CASE_CID,
      caseType: "FRAUD",
      candidates: [
        {
          id: "p1",
          code: "LAW-FRAUD-001",
          version: "1.0.0",
          name: "N",
          status: "APPROVED",
          questionSetDraftProjected: false,
          traceApplied: false,
        },
      ],
      selectionPolicy: "AUTO_IF_SINGLE_APPROVED",
      latestTrace: null,
    });
    const res = await GET(new Request("http://localhost/", { method: "GET" }), {
      params: Promise.resolve({ caseId: SAMPLE_CASE_CID }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.data.selectionPolicy).toBe("AUTO_IF_SINGLE_APPROVED");
    expect(body.data.candidates).toHaveLength(1);
  });

  it("잘못된 사건 id · zod 400", async () => {
    getCtx.mockResolvedValueOnce({});
    const res = await GET(new Request("http://localhost/", { method: "GET" }), {
      params: Promise.resolve({ caseId: "bad" }),
    });
    expect(res.status).toBe(400);
  });
});
