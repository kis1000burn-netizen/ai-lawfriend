import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMocks = vi.hoisted(() => ({
  findFirst: vi.fn(),
  update: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    lawyerProfile: prismaMocks,
  },
}));

const requireAdminApi = vi.hoisted(() => vi.fn());
const requireStaffOrPlatformAdminApi = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth/require-admin-api", () => ({
  requireAdminApi,
}));

vi.mock("@/lib/auth/require-staff-or-platform-admin-api", () => ({
  requireStaffOrPlatformAdminApi,
}));

const writeAuditLog = vi.hoisted(() => vi.fn());

vi.mock("@/lib/audit-log", () => ({
  writeAuditLog,
}));

import { GET, PATCH } from "./route";

describe("GET /api/admin/lawyer-verifications/[lawyerProfileId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireStaffOrPlatformAdminApi).mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
    } as never);
  });

  it("프로필이 없으면 404", async () => {
    prismaMocks.findFirst.mockResolvedValueOnce(null);
    const res = await GET(
      new Request("http://localhost"),
      { params: Promise.resolve({ lawyerProfileId: "missing" }) },
    );
    expect(res.status).toBe(404);
  });

  it("LAWYER 프로필이면 ok", async () => {
    prismaMocks.findFirst.mockResolvedValueOnce({
      id: "lp1",
      userId: "u1",
      registrationNumber: "12345",
      barAssociation: "서울",
      officeName: "법무법인",
      officeAddress: null,
      officePhone: null,
      websiteUrl: null,
      specialtiesNote: null,
      verificationStatus: "PENDING",
      submittedAt: new Date(),
      reviewedAt: null,
      reviewedById: null,
      rejectionReason: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        id: "u1",
        email: "a@b.com",
        name: "홍변호사",
        phone: null,
        status: "ACTIVE",
        role: "LAWYER",
      },
      reviewedBy: null,
      verificationDocuments: [{ id: "d1", fileUrl: "https://secret.example/x", type: "ID", fileName: "a.pdf", uploadedAt: new Date() }],
    });

    const res = await GET(
      new Request("http://localhost"),
      { params: Promise.resolve({ lawyerProfileId: "lp1" }) },
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.data.profile.id).toBe("lp1");
    expect(body.data.profile.verificationDocuments[0].fileUrl).toBeUndefined();
    expect(body.data.profile.verificationDocuments[0].id).toBe("d1");
  });
});

describe("PATCH /api/admin/lawyer-verifications/[lawyerProfileId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireAdminApi).mockResolvedValue({ id: "admin-1", role: "ADMIN" } as never);
  });

  it("정지(SUSPENDED) 시 사유 없으면 422", async () => {
    prismaMocks.findFirst.mockResolvedValue({
      id: "lp1",
      verificationStatus: "PENDING",
      userId: "u1",
      user: { email: "a@b.com" },
    });

    const res = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationStatus: "SUSPENDED" }),
      }),
      { params: Promise.resolve({ lawyerProfileId: "lp1" }) },
    );
    expect(res.status).toBe(422);
    expect(prismaMocks.update).not.toHaveBeenCalled();
  });

  it("반려 시 사유 없으면 422", async () => {
    prismaMocks.findFirst.mockResolvedValue({
      id: "lp1",
      verificationStatus: "PENDING",
      userId: "u1",
      user: { email: "a@b.com" },
    });

    const res = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationStatus: "REJECTED", rejectionReason: "  " }),
      }),
      { params: Promise.resolve({ lawyerProfileId: "lp1" }) },
    );
    expect(res.status).toBe(422);
    expect(prismaMocks.update).not.toHaveBeenCalled();
  });

  it("승인 시 rejectionReason 을 비우고 reviewedById 기록", async () => {
    prismaMocks.findFirst.mockResolvedValue({
      id: "lp1",
      verificationStatus: "PENDING",
      userId: "u1",
      user: { email: "a@b.com" },
    });
    prismaMocks.update.mockResolvedValue({
      id: "lp1",
      verificationStatus: "APPROVED",
      reviewedAt: new Date(),
      reviewedById: "admin-1",
      rejectionReason: null,
      user: { id: "u1", email: "a@b.com", name: "홍" },
    });

    const res = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verificationStatus: "APPROVED",
          rejectionReason: "무시됨",
        }),
      }),
      { params: Promise.resolve({ lawyerProfileId: "lp1" }) },
    );
    expect(res.status).toBe(200);
    expect(prismaMocks.update).toHaveBeenCalledWith({
      where: { id: "lp1" },
      data: {
        verificationStatus: "APPROVED",
        rejectionReason: null,
        reviewedById: "admin-1",
        reviewedAt: expect.any(Date),
      },
      select: {
        id: true,
        verificationStatus: true,
        reviewedAt: true,
        reviewedById: true,
        rejectionReason: true,
        user: { select: { id: true, email: true, name: true } },
      },
    });
    expect(writeAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "LAWYER_VERIFICATION_APPROVED",
        entityType: "LAWYER_PROFILE",
        entityId: "lp1",
      }),
    );
  });
});
