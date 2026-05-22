import { describe, expect, it, vi } from "vitest";
import {
  isHttpLegacyLawyerVerificationFileUrl,
  isLawyerVerificationLegacyExternalOnlyDoc,
} from "./lawyer-verification-legacy-policy";

describe("lawyer-verification-legacy-policy", () => {
  it("isHttpLegacyLawyerVerificationFileUrl", () => {
    expect(isHttpLegacyLawyerVerificationFileUrl("https://a/b")).toBe(true);
    expect(isHttpLegacyLawyerVerificationFileUrl("http://a/b")).toBe(true);
    expect(isHttpLegacyLawyerVerificationFileUrl("file:///x")).toBe(false);
    expect(isHttpLegacyLawyerVerificationFileUrl(null)).toBe(false);
  });

  it("isLawyerVerificationLegacyExternalOnlyDoc", () => {
    expect(
      isLawyerVerificationLegacyExternalOnlyDoc({
        fileUrl: "https://x/y",
        storageKey: null,
      }),
    ).toBe(true);
    expect(
      isLawyerVerificationLegacyExternalOnlyDoc({
        fileUrl: "https://x/y",
        storageKey: "lawyer-verification/lp/k",
      }),
    ).toBe(false);
    expect(
      isLawyerVerificationLegacyExternalOnlyDoc({
        fileUrl: null,
        storageKey: null,
      }),
    ).toBe(false);
  });
});
