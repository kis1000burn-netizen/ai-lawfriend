import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

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

describe("POST /api/admin/gongbuho 패킷 생성", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("STAFF는 CREATE_PACKET 불가로 403", async () => {
    const res = await POST(
      new NextRequest("http://localhost/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packetJson: {
            code: "X",
            version: "1.0.0",
            name: "N",
            domain: "D",
          },
        }),
      }),
    );

    expect(res.status).toBe(403);
    const j = await res.json();
    expect(j.ok).toBe(false);
    expect(j.code).toBe("FORBIDDEN");
  });
});
