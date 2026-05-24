import { describe, expect, it, vi } from "vitest";
import {
  buildP4MigrationStorageKey,
  migrateLawyerVerificationDocumentRow,
} from "./lawyer-verification-fileurl-migration";

describe("lawyer-verification-fileurl-migration", () => {
  it("buildP4MigrationStorageKey 는 고정 프리픽스와 documentId 를 포함한다", () => {
    const k = buildP4MigrationStorageKey("lp1", "doc9", "증빙.pdf");
    expect(k).toMatch(/^lawyer-verification\/lp1\/p4-migrate-doc9-/);
    expect(k).not.toContain("..");
  });

  it("eligible 아니면 SKIP_NOT_ELIGIBLE", async () => {
    const prisma = { lawyerVerificationDocument: { update: vi.fn() } };
    const r = await migrateLawyerVerificationDocumentRow(prisma as never, {
      id: "d1",
      lawyerProfileId: "lp",
      fileName: "a.pdf",
      fileUrl: null,
      type: "ID",
      storageKey: null,
    }, true);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.failure.error).toBe("SKIP_NOT_ELIGIBLE");
      expect(r.failure.stage).toBe("eligibility");
    }
  });

  it("dry-run 은 다운로드·MIME 검증 후 wouldMigrate 만 반환", async () => {
    const body = Buffer.from("%PDF-1.4 test");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        headers: {
          get: (name: string) => (name.toLowerCase() === "content-type" ? "application/pdf" : null),
        },
        arrayBuffer: () => Promise.resolve(body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength)),
      }),
    );
    const prisma = { lawyerVerificationDocument: { update: vi.fn() } };
    const r = await migrateLawyerVerificationDocumentRow(
      prisma as never,
      {
        id: "doc-x",
        lawyerProfileId: "lp-x",
        fileName: "x.pdf",
        fileUrl: "https://legacy.example/doc.pdf",
        type: "ID",
        storageKey: null,
      },
      true,
    );
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.wouldMigrate?.documentId).toBe("doc-x");
      expect(r.wouldMigrate?.mimeType).toBe("application/pdf");
    }
    expect(prisma.lawyerVerificationDocument.update).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
