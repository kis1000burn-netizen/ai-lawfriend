import { beforeEach, describe, expect, it, vi } from "vitest";

const authMocks = vi.hoisted(() => ({
  requireSessionUser: vi.fn(),
}));

const serviceMocks = vi.hoisted(() => ({
  getSupplementRequestDetailService: vi.fn(),
  updateSupplementRequestService: vi.fn(),
  markSupplementRequestViewedByClientService: vi.fn(),
}));

vi.mock("@/lib/auth/require-session-user", () => authMocks);
vi.mock("@/features/supplement-request/supplement-request.service", () => serviceMocks);

import { GET, PATCH } from "./route";

const sessionUser = {
  id: "cm1aaa1111111111111111111",
  email: "user@example.com",
  name: "테스트 사용자",
  role: "USER" as const,
  status: "ACTIVE" as const,
};

const caseId = "cm1case111111111111111111";
const requestId = "cm1req1111111111111111111";

describe("supplement-request detail route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.requireSessionUser.mockResolvedValue(sessionUser);
    serviceMocks.getSupplementRequestDetailService.mockResolvedValue({
      id: requestId,
      caseId,
      status: "SENT",
      statusLogs: [],
      auditLogs: [],
    });
    serviceMocks.markSupplementRequestViewedByClientService.mockImplementation(
      async (_user, id) => ({
        id,
        caseId,
        status: "CLIENT_VIEWED",
        statusLogs: [],
        auditLogs: [],
      }),
    );
  });

  it("3) 상세 GET route", async () => {
    const response = await GET(
      new Request(`http://localhost/api/cases/${caseId}/supplement-requests/${requestId}`),
      { params: Promise.resolve({ caseId, requestId }) },
    );

    expect(response.status).toBe(200);
    expect(serviceMocks.getSupplementRequestDetailService).toHaveBeenCalledWith(
      sessionUser,
      requestId,
    );
    expect(serviceMocks.markSupplementRequestViewedByClientService).toHaveBeenCalledWith(
      sessionUser,
      requestId,
    );
  });

  it("4) 수정 PATCH route", async () => {
    serviceMocks.updateSupplementRequestService.mockResolvedValueOnce({
      id: requestId,
      caseId,
      title: "수정 제목",
    });

    const response = await PATCH(
      new Request(`http://localhost/api/cases/${caseId}/supplement-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "수정 제목",
          description: "수정 설명",
          dueAt: "",
        }),
      }),
      { params: Promise.resolve({ caseId, requestId }) },
    );

    expect(response.status).toBe(200);
    expect(serviceMocks.updateSupplementRequestService).toHaveBeenCalledWith(
      sessionUser,
      requestId,
      {
        title: "수정 제목",
        description: "수정 설명",
        dueAt: "",
      },
    );
  });

  it("12) caseId/requestId 불일치 차단", async () => {
    serviceMocks.getSupplementRequestDetailService.mockResolvedValueOnce({
      id: requestId,
      caseId: "cm1other111111111111111111",
      status: "SENT",
      statusLogs: [],
      auditLogs: [],
    });

    const response = await GET(
      new Request(`http://localhost/api/cases/${caseId}/supplement-requests/${requestId}`),
      { params: Promise.resolve({ caseId, requestId }) },
    );

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.code).toBe("NOT_FOUND");
  });
});
