import { beforeEach, describe, expect, it, vi } from "vitest";

const saveLawyerVerificationUpload = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
    storageKey: "lawyer-verification/lp-test/ffffffffffff-a.pdf",
    bucket: null as string | null,
    mimeType: "application/pdf",
    sizeBytes: 4,
    checksum: "61".repeat(32),
  }),
);

vi.mock("@/lib/lawyer/lawyer-verification-storage", async () => {
  const actual = await vi.importActual<typeof import("@/lib/lawyer/lawyer-verification-storage")>(
    "@/lib/lawyer/lawyer-verification-storage",
  );
  return {
    ...actual,
    saveLawyerVerificationUpload,
  };
});

const docCreate = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({
  prisma: {
    lawyerVerificationDocument: { create: docCreate },
  },
}));

import { createLawyerVerificationDocumentFromForm } from "./lawyer-verification-document-upload";

describe("createLawyerVerificationDocumentFromForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    docCreate.mockResolvedValue({
      id: "doc-1",
      type: "LEGAL_REPRESENTATIVE_ID",
      fileName: "a.pdf",
      storageKey: "lawyer-verification/lp-test/ffffffffffff-a.pdf",
      uploadedAt: new Date(),
      mimeType: "application/pdf",
      sizeBytes: 4,
    });
  });

  it("PDF 업로드 시 201 과 storageKey 를 반환한다", async () => {
    const form = new FormData();
    form.set("type", "LEGAL_REPRESENTATIVE_ID");
    form.set(
      "file",
      new File([new Uint8Array([1, 2, 3, 4])], "a.pdf", { type: "application/pdf" }),
    );

    const res = await createLawyerVerificationDocumentFromForm("lp-test", form);
    expect(res.status).toBe(201);
    const json = (await res.json()) as {
      ok: boolean;
      data?: { document?: { storageKey?: string } };
    };
    expect(json.ok).toBe(true);
    expect(json.data?.document?.storageKey).toContain("lawyer-verification/");
    expect(saveLawyerVerificationUpload).toHaveBeenCalled();
  });
});
