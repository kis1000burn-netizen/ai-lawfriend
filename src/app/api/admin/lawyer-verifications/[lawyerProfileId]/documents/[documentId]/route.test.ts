import { beforeEach, describe, expect, it, vi } from "vitest";

const docMocks = vi.hoisted(() => ({
  findFirst: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    lawyerVerificationDocument: docMocks,
  },
}));

const requireStaffOrPlatformAdminApi = vi.hoisted(() => vi.fn());
vi.mock("@/lib/auth/require-staff-or-platform-admin-api", () => ({
  requireStaffOrPlatformAdminApi,
}));

const writeAuditLog = vi.hoisted(() => vi.fn());
vi.mock("@/lib/audit-log", () => ({ writeAuditLog }));

const signedRedirectMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/lawyer/lawyer-verification-signed-get", () => ({
  createLawyerVerificationAdminSignedRedirectUrl: signedRedirectMock,
  getLawyerVerificationSignedUrlTtlSeconds: () => 120,
}));

import { GET } from "./route";

describe("GET /api/admin/lawyer-verifications/.../documents/... (증빙 열람)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireStaffOrPlatformAdminApi).mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
    } as never);
  });

  it("관리자 세션 후 fileUrl 로 리다이렉트하고 감사로그를 남긴다", async () => {
    docMocks.findFirst.mockResolvedValueOnce({
      id: "doc-1",
      fileUrl: "https://example.com/private/doc.pdf",
      storageKey: null,
      bucket: null,
      fileName: "doc.pdf",
      type: "ID",
    });

    const res = await GET(
      new Request("http://localhost"),
      { params: Promise.resolve({ lawyerProfileId: "lp1", documentId: "doc-1" }) },
    );
    expect([302, 307]).toContain(res.status);
    expect(res.headers.get("location")).toBe("https://example.com/private/doc.pdf");
    expect(writeAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "LAWYER_VERIFICATION_DOCUMENT_ACCESS",
        entityId: "doc-1",
        metadata: expect.objectContaining({
          accessMode: "legacy_access",
          schemaVersion: 1,
          hasStorageKey: false,
          legacyUrlHost: "example.com",
          verificationDocumentType: "ID",
        }),
      }),
    );
  });

  it("fileUrl 이 http(s) 가 아니면 400", async () => {
    docMocks.findFirst.mockResolvedValueOnce({
      id: "doc-2",
      fileUrl: "file:///etc/passwd",
      storageKey: null,
      bucket: null,
      fileName: "x.bin",
      type: "X",
    });
    const res = await GET(
      new Request("http://localhost"),
      { params: Promise.resolve({ lawyerProfileId: "lp1", documentId: "doc-2" }) },
    );
    expect(res.status).toBe(400);
  });

  it("storageKey 가 있으면 fileUrl 이 있어도 signed 경로를 우선한다(P4 이관 후)", async () => {
    signedRedirectMock.mockResolvedValueOnce({
      url: "https://signed.example/migrated",
      expiresAt: new Date("2026-01-01T00:00:00.000Z"),
      accessMode: "signed_redirect",
    });
    docMocks.findFirst.mockResolvedValueOnce({
      id: "doc-both",
      fileUrl: "https://legacy.example/old.pdf",
      storageKey: "lawyer-verification/lp1/migrated.pdf",
      bucket: "bk",
      fileName: "m.pdf",
      type: "ID",
    });
    const res = await GET(
      new Request("http://localhost:3000"),
      { params: Promise.resolve({ lawyerProfileId: "lp1", documentId: "doc-both" }) },
    );
    expect([302, 307]).toContain(res.status);
    expect(res.headers.get("location")).toBe("https://signed.example/migrated");
    expect(signedRedirectMock).toHaveBeenCalled();
  });

  it("storageKey 만 있으면 단기 signed URL 로 리다이렉트하고 감사에 signed_redirect 를 남긴다", async () => {
    signedRedirectMock.mockResolvedValueOnce({
      url: "https://signed.example/get",
      expiresAt: new Date("2026-01-01T00:00:00.000Z"),
      accessMode: "signed_redirect",
    });
    docMocks.findFirst.mockResolvedValueOnce({
      id: "doc-3",
      fileUrl: null,
      storageKey: "lawyer-verification/lp1/abc-id-doc.pdf",
      bucket: "aibeopchin-lawyer-verification",
      fileName: "pending-only.pdf",
      type: "ID",
    });
    const res = await GET(
      new Request("http://localhost:3000"),
      { params: Promise.resolve({ lawyerProfileId: "lp1", documentId: "doc-3" }) },
    );
    expect([302, 307]).toContain(res.status);
    expect(res.headers.get("location")).toBe("https://signed.example/get");
    expect(writeAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "LAWYER_VERIFICATION_DOCUMENT_ACCESS",
        entityId: "doc-3",
        metadata: expect.objectContaining({
          accessMode: "signed_redirect",
          schemaVersion: 1,
          hasStorageKey: true,
          signedUrlTtlSec: 120,
          verificationDocumentType: "ID",
        }),
      }),
    );
    expect(signedRedirectMock).toHaveBeenCalledWith(
      expect.objectContaining({
        storageKey: "lawyer-verification/lp1/abc-id-doc.pdf",
        bucket: "aibeopchin-lawyer-verification",
        lawyerProfileId: "lp1",
        documentId: "doc-3",
      }),
    );
  });

  it("로컬 드라이버 분기 시 감사 accessMode 는 local_content_token", async () => {
    signedRedirectMock.mockResolvedValueOnce({
      url: "http://localhost:3000/api/admin/lawyer-verifications/lp1/doc-loc/content-token?t=1&sig=x",
      expiresAt: new Date("2026-01-01T00:00:00.000Z"),
      accessMode: "local_content_token",
    });
    docMocks.findFirst.mockResolvedValueOnce({
      id: "doc-loc",
      fileUrl: null,
      storageKey: "lawyer-verification/lp1/x.pdf",
      bucket: null,
      fileName: "x.pdf",
      type: "ID",
    });
    const res = await GET(
      new Request("http://localhost:3000"),
      { params: Promise.resolve({ lawyerProfileId: "lp1", documentId: "doc-loc" }) },
    );
    expect([302, 307]).toContain(res.status);
    expect(writeAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          accessMode: "local_content_token",
          schemaVersion: 1,
          hasStorageKey: true,
          signedUrlTtlSec: 120,
        }),
      }),
    );
  });

  it("signed URL 발급 실패 시 502 SIGNED_URL_FAILED", async () => {
    signedRedirectMock.mockRejectedValueOnce(new Error("presign failed"));
    docMocks.findFirst.mockResolvedValueOnce({
      id: "doc-3b",
      fileUrl: null,
      storageKey: "lawyer-verification/lp1/x.pdf",
      bucket: "b",
      fileName: "x.pdf",
      type: "ID",
    });
    const res = await GET(
      new Request("http://localhost"),
      { params: Promise.resolve({ lawyerProfileId: "lp1", documentId: "doc-3b" }) },
    );
    expect(res.status).toBe(502);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe("SIGNED_URL_FAILED");
  });

  it("fileUrl·storageKey 모두 없으면 400", async () => {
    docMocks.findFirst.mockResolvedValueOnce({
      id: "doc-4",
      fileUrl: null,
      storageKey: null,
      bucket: null,
      fileName: "broken.pdf",
      type: "ID",
    });
    const res = await GET(
      new Request("http://localhost"),
      { params: Promise.resolve({ lawyerProfileId: "lp1", documentId: "doc-4" }) },
    );
    expect(res.status).toBe(400);
  });
});
