import { describe, expect, it, vi, beforeEach } from "vitest";

const staffUser = vi.hoisted(() => ({
  id: "staff-1",
  email: "s@x.com",
  name: "S",
  role: "STAFF" as const,
  status: "ACTIVE" as const,
}));

vi.mock("@/lib/auth/require-staff-or-platform-admin-api", () => ({
  requireStaffOrPlatformAdminApi: vi.fn(async () => staffUser),
}));

import { POST } from "./route";

describe("POST /api/admin/gongbuho/[gongbuhoId]/archive", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("STAFF는 assertGongbuhoOperation 로 403", async () => {
    const res = await POST(new Request("http://localhost/", { method: "POST" }), {
      params: Promise.resolve({
        gongbuhoId: "cjld2cyqh0001t9rmn839i921",
      }),
    });
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.code).toBe("FORBIDDEN");
  });
});
