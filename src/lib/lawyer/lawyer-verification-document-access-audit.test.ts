import { describe, expect, it } from "vitest";
import {
  buildLawyerVerificationDocumentAccessAuditMetadata,
  legacyLawyerVerificationUrlHostForAudit,
} from "./lawyer-verification-document-access-audit";

describe("lawyer-verification-document-access-audit", () => {
  it("legacyLawyerVerificationUrlHostForAudit 는 hostname 만 반환한다", () => {
    expect(legacyLawyerVerificationUrlHostForAudit("https://cdn.example.com/path?q=1")).toBe(
      "cdn.example.com",
    );
    expect(legacyLawyerVerificationUrlHostForAudit("not-a-url")).toBeNull();
  });

  it("buildLawyerVerificationDocumentAccessAuditMetadata 가 스키마 버전·필드를 고정한다", () => {
    const m = buildLawyerVerificationDocumentAccessAuditMetadata({
      lawyerProfileId: "lp1",
      documentId: "d1",
      verificationDocumentType: "ID",
      accessMode: "signed_redirect",
      hasStorageKey: true,
      signedUrlTtlSec: 120,
    });
    expect(m.schemaVersion).toBe(1);
    expect(m.accessMode).toBe("signed_redirect");
    expect(m.hasStorageKey).toBe(true);
    expect(m.signedUrlTtlSec).toBe(120);
    expect("storageKey" in m).toBe(false);
  });
});
