import { describe, expect, it } from "vitest";
import {
  buildClientPortalMobileUploadFailureMeta,
  CLIENT_PORTAL_MOBILE_CAMERA_CAPTURE,
  CLIENT_PORTAL_MOBILE_UPLOAD_ACCEPT,
  formatClientPortalMobileUploadLimitGuide,
  mapServerUploadErrorToFailureCode,
  validateClientPortalMobileUploadFile,
} from "./client-portal-mobile-upload.policy";
import { MAX_LITIGATION_UPLOAD_BYTES } from "@/features/document-intelligence/document-upload.schema";

describe("client-portal-mobile-upload.policy (Phase 21-B)", () => {
  it("defines camera capture and multi-select accept list", () => {
    expect(CLIENT_PORTAL_MOBILE_CAMERA_CAPTURE).toBe("environment");
    expect(CLIENT_PORTAL_MOBILE_UPLOAD_ACCEPT).toContain("image/jpeg");
    expect(CLIENT_PORTAL_MOBILE_UPLOAD_ACCEPT).toContain("application/pdf");
  });

  it("shows size and format limit guide", () => {
    expect(formatClientPortalMobileUploadLimitGuide()).toContain("15MB");
    expect(formatClientPortalMobileUploadLimitGuide()).toContain("PDF");
  });

  it("rejects oversize and unsupported mime", () => {
    const big = new File(["a"], "big.pdf", { type: "application/pdf" });
    Object.defineProperty(big, "size", { value: MAX_LITIGATION_UPLOAD_BYTES + 1 });
    expect(validateClientPortalMobileUploadFile(big).ok).toBe(false);

    const bad = new File(["x"], "virus.exe", { type: "application/x-msdownload" });
    const result = validateClientPortalMobileUploadFile(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failureCode).toBe("UNSUPPORTED_MIME");
  });

  it("builds monitoring-compatible failure metadata", () => {
    const meta = buildClientPortalMobileUploadFailureMeta({
      failureCode: "NETWORK_ERROR",
      caseId: "clhse9v6n0000qz0123456789",
      fileName: "contract.pdf",
      mimeType: "application/pdf",
      sizeBytes: 1200,
    });
    expect(meta.domain).toBe("client_portal_upload");
    expect(meta.retryEligible).toBe(true);
    expect(meta.metadataOnly).toBe(true);
    expect(meta.redactionPolicyVersion).toBe("19-B");
    expect(meta.attachmentLifecyclePolicy).toBe("19-D");
    expect(meta.fileNameMasked).toContain("***");
  });

  it("maps server messages to failure codes", () => {
    expect(mapServerUploadErrorToFailureCode("파일 크기는 15MB 이하여야 합니다.")).toBe(
      "FILE_TOO_LARGE",
    );
    expect(mapServerUploadErrorToFailureCode("사건당 서류·증거 파일은 최대 30개")).toBe(
      "CASE_FILE_LIMIT",
    );
  });
});
