import { describe, expect, it } from "vitest";
import { validateLitigationUploadFile } from "./document-upload.schema";

describe("document-upload.schema (Phase 13-B)", () => {
  it("accepts allowed mime types", () => {
    expect(() =>
      validateLitigationUploadFile(
        new File(["x"], "a.pdf", { type: "application/pdf" }),
      ),
    ).not.toThrow();
  });

  it("rejects unsupported mime types", () => {
    expect(() =>
      validateLitigationUploadFile(
        new File(["x"], "a.exe", { type: "application/octet-stream" }),
      ),
    ).toThrow("지원하지 않는");
  });
});
