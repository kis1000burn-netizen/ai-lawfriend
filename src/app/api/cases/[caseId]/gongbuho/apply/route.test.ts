import { describe, expect, it, vi, beforeEach } from "vitest";
import { NotFoundError } from "@/lib/errors";

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
vi.mock("@/features/cases/case.permissions", () => ({
  getCaseAccessContext: getCtx,
}));

import { POST } from "./route";

/** Zod `.cuid()` 형식 검증용 고정 문자열 (DB 존재와 무관) */
const SAMPLE_CASE_CID = "cjld2cyqh0001t9rmn839i921";

describe("POST /api/cases/[caseId]/gongbuho/apply", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("canWriteCase false 이면 403", async () => {
    getCtx.mockResolvedValueOnce({
      canWriteCase: false,
      canRead: true,
    });
    const res = await POST(
      new Request("http://localhost/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }),
      {
        params: Promise.resolve({
          caseId: SAMPLE_CASE_CID,
        }),
      },
    );
    expect(res.status).toBe(403);
    const j = await res.json();
    expect(j.ok).toBe(false);
  });

  it("사건 접근 불가 시 404", async () => {
    getCtx.mockRejectedValueOnce(new NotFoundError("사건을 찾을 수 없습니다."));
    const res = await POST(
      new Request("http://localhost/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }),
      {
        params: Promise.resolve({
          caseId: SAMPLE_CASE_CID,
        }),
      },
    );
    expect(res.status).toBe(404);
  });
});
