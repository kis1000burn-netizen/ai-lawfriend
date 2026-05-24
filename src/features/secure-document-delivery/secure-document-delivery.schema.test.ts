import { describe, expect, it } from "vitest";
import {
  buildSecurePortalPath,
  generateSecureLinkToken,
  hashSecureLinkToken,
  KAKAO_DOCUMENT_NOTICE_BODY,
  SECURE_DOCUMENT_DELIVERY_VERSION,
} from "./secure-document-delivery.schema";

describe("secure-document-delivery.schema (Phase 15-F)", () => {
  it("exposes delivery version", () => {
    expect(SECURE_DOCUMENT_DELIVERY_VERSION).toBe("15-F.1");
  });

  it("builds secure portal path without file attachment in notice", () => {
    expect(buildSecurePortalPath("case1", "share1")).toBe(
      "/client/cases/case1?tab=shared&share=share1",
    );
    expect(KAKAO_DOCUMENT_NOTICE_BODY).not.toContain("첨부");
  });

  it("hashes secure link tokens consistently", () => {
    const { token, hash } = generateSecureLinkToken();
    expect(hashSecureLinkToken(token)).toBe(hash);
  });
});
