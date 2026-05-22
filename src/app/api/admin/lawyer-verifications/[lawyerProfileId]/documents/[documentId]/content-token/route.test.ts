import { beforeEach, describe, expect, it, vi } from "vitest";

const docMocks = vi.hoisted(() => ({
  findFirst: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    lawyerVerificationDocument: docMocks,
  },
}));

const verifyTokenMock = vi.hoisted(() => vi.fn());
vi.mock("@/lib/lawyer/lawyer-verification-content-token", () => ({
  verifyLawyerVerificationContentToken: verifyTokenMock,
}));

const storageGetMock = vi.hoisted(() => vi.fn());
vi.mock("@/features/illegal-lending/storage/illegal-lending-storage", () => ({
  getIllegalLendingStorage: () => ({ get: storageGetMock }),
}));

import { GET } from "./route";

describe("GET .../documents/.../content-token (로컬 단기 토큰 스트리밍)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("t·missing sig 이면 400", async () => {
    const res = await GET(
      new Request("http://localhost/a?t=9999999999"),
      { params: Promise.resolve({ lawyerProfileId: "lp1", documentId: "d1" }) },
    );
    expect(res.status).toBe(400);
  });

  it("토큰 검증 실패 시 403", async () => {
    verifyTokenMock.mockReturnValueOnce(false);
    const exp = Math.floor(Date.now() / 1000) + 60;
    const res = await GET(
      new Request(`http://localhost/a?t=${exp}&sig=deadbeef`),
      { params: Promise.resolve({ lawyerProfileId: "lp1", documentId: "d1" }) },
    );
    expect(res.status).toBe(403);
  });

  it("storageKey 없는 문서면 404", async () => {
    verifyTokenMock.mockReturnValueOnce(true);
    const exp = Math.floor(Date.now() / 1000) + 60;
    docMocks.findFirst.mockResolvedValueOnce(null);
    const res = await GET(
      new Request(`http://localhost/a?t=${exp}&sig=${"c".repeat(64)}`),
      { params: Promise.resolve({ lawyerProfileId: "lp1", documentId: "d1" }) },
    );
    expect(res.status).toBe(404);
  });

  it("스토리지 get 실패 시 502", async () => {
    verifyTokenMock.mockReturnValueOnce(true);
    const exp = Math.floor(Date.now() / 1000) + 60;
    docMocks.findFirst.mockResolvedValueOnce({
      storageKey: "lawyer-verification/lp1/x.pdf",
      mimeType: "application/pdf",
      fileName: "x.pdf",
    });
    storageGetMock.mockRejectedValueOnce(new Error("no key"));
    const res = await GET(
      new Request(`http://localhost/a?t=${exp}&sig=${"a".repeat(64)}`),
      { params: Promise.resolve({ lawyerProfileId: "lp1", documentId: "d1" }) },
    );
    expect(res.status).toBe(502);
  });

  it("한글 파일명도 Content-Disposition 오류 없이 200", async () => {
    verifyTokenMock.mockReturnValueOnce(true);
    const exp = Math.floor(Date.now() / 1000) + 60;
    docMocks.findFirst.mockResolvedValueOnce({
      storageKey: "lawyer-verification/lp1/x.pdf",
      mimeType: "application/pdf",
      fileName: "증빙.pdf",
    });
    storageGetMock.mockResolvedValueOnce({
      body: Buffer.from("x"),
      contentType: "application/pdf",
    });
    const res = await GET(
      new Request(`http://localhost/a?t=${exp}&sig=${"d".repeat(64)}`),
      { params: Promise.resolve({ lawyerProfileId: "lp1", documentId: "d1" }) },
    );
    expect(res.status).toBe(200);
  });

  it("정상 시 바이너리와 Cache-Control private 반환", async () => {
    verifyTokenMock.mockReturnValueOnce(true);
    const exp = Math.floor(Date.now() / 1000) + 60;
    docMocks.findFirst.mockResolvedValueOnce({
      storageKey: "lawyer-verification/lp1/x.pdf",
      mimeType: "application/pdf",
      fileName: "proof.pdf",
    });
    storageGetMock.mockResolvedValueOnce({
      body: Buffer.from("%PDF-1.4"),
      contentType: "application/pdf",
    });
    const res = await GET(
      new Request(`http://localhost/a?t=${exp}&sig=${"b".repeat(64)}`),
      { params: Promise.resolve({ lawyerProfileId: "lp1", documentId: "d1" }) },
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("private, no-store");
    expect(res.headers.get("Content-Type")).toBe("application/pdf");
    const buf = Buffer.from(await res.arrayBuffer());
    expect(buf.toString()).toBe("%PDF-1.4");
  });
});
