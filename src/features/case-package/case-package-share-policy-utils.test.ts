import { createHash } from "node:crypto";
import { describe, expect, it, vi } from "vitest";

import {
  buildCasePackageConsentSnapshot,
  evaluateCasePackageAccess,
  generateCasePackagePublicCode,
  hashOptionalPin,
  issueCasePackageAccessToken,
  resolveCasePackageShareStatus,
  verifyOptionalPin,
} from "./case-package-share-policy-utils";

describe("case-package-share-policy-utils", () => {
  it("generates public code with fixed format", () => {
    expect(
      generateCasePackagePublicCode({
        year: 2026,
        sequence: 184,
      }),
    ).toBe("AIF-2026-000184");
  });

  it("rejects invalid public code sequence", () => {
    expect(() =>
      generateCasePackagePublicCode({
        year: 2026,
        sequence: 1000000,
      }),
    ).toThrow("sequence");
  });

  it("issues access token and hash", () => {
    const result = issueCasePackageAccessToken();
    expect(result.plainToken.length).toBeGreaterThan(10);
    expect(result.tokenHash).not.toBe(result.plainToken);
    expect(result.tokenHash.startsWith("v2:")).toBe(true);
  });

  it("verifies legacy sha256 pin hashes", () => {
    const legacyPinHash = createHash("sha256").update("1234").digest("hex");
    expect(verifyOptionalPin({ pin: "1234", pinHash: legacyPinHash })).toBe(true);
  });

  it("hashes and verifies optional pin", () => {
    const pinHash = hashOptionalPin("1234");
    expect(verifyOptionalPin({ pin: "1234", pinHash })).toBe(true);
    expect(verifyOptionalPin({ pin: "9999", pinHash })).toBe(false);
  });

  it("builds consent snapshot with defaults", () => {
    const snapshot = buildCasePackageConsentSnapshot({
      ownerUserId: "user_1",
      caseId: "case_1",
      targetLawyerUserId: "lawyer_1",
      consentedAt: new Date("2026-05-01T00:00:00.000Z"),
      expiresAt: "2026-05-08T00:00:00.000Z",
    });

    expect(snapshot.ownerUserId).toBe("user_1");
    expect(snapshot.caseId).toBe("case_1");
    expect(snapshot.targetLawyerUserId).toBe("lawyer_1");
    expect(snapshot.scope.allowSummary).toBe(true);
    expect(snapshot.scope.allowDocumentDraft).toBe(false);
    expect(snapshot.downloadPermissions.allowAttachmentDownload).toBe(false);
    expect(snapshot.consentedAt).toBe("2026-05-01T00:00:00.000Z");
    expect(snapshot.expiresAt).toBe("2026-05-08T00:00:00.000Z");
  });

  it("resolves revoked status first", () => {
    expect(
      resolveCasePackageShareStatus({
        status: "ACTIVE",
        revokedAt: "2026-05-01T00:00:00.000Z",
      }),
    ).toBe("REVOKED");
  });

  it("resolves expired status", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-02T00:00:00.000Z"));

    expect(
      resolveCasePackageShareStatus({
        status: "ACTIVE",
        expiresAt: "2026-05-01T00:00:00.000Z",
      }),
    ).toBe("EXPIRED");

    vi.useRealTimers();
  });

  it("allows valid lawyer access", () => {
    const decision = evaluateCasePackageAccess({
      publicCode: "AIF-2026-000184",
      shareExists: true,
      status: "ACTIVE",
      isLawyerAuthenticated: true,
      lawyerMatchesShare: true,
    });

    expect(decision).toEqual({
      allowed: true,
      code: "ALLOW",
      message: "사건 패키지 접근이 허용되었습니다.",
    });
  });

  it("blocks missing public code", () => {
    const decision = evaluateCasePackageAccess({
      publicCode: "",
      shareExists: true,
      status: "ACTIVE",
      isLawyerAuthenticated: true,
      lawyerMatchesShare: true,
    });

    expect(decision.code).toBe("INVALID_PUBLIC_CODE");
    expect(decision.allowed).toBe(false);
  });

  it("blocks unauthenticated lawyer", () => {
    const decision = evaluateCasePackageAccess({
      publicCode: "AIF-2026-000184",
      shareExists: true,
      status: "ACTIVE",
      isLawyerAuthenticated: false,
      lawyerMatchesShare: true,
    });

    expect(decision.code).toBe("LAWYER_AUTH_REQUIRED");
    expect(decision.allowed).toBe(false);
  });

  it("blocks invalid pin when pin is required", () => {
    const decision = evaluateCasePackageAccess({
      publicCode: "AIF-2026-000184",
      shareExists: true,
      status: "ACTIVE",
      isLawyerAuthenticated: true,
      lawyerMatchesShare: true,
      pinRequired: true,
      pinValid: false,
    });

    expect(decision.code).toBe("INVALID_PIN");
    expect(decision.allowed).toBe(false);
  });
});
