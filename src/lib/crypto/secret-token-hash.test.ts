import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { hashSecretToken, verifySecretToken } from "./secret-token-hash";

describe("secret-token-hash", () => {
  it("hashes with v2 prefix and verifies", () => {
    const stored = hashSecretToken("sample-token");
    expect(stored.startsWith("v2:")).toBe(true);
    expect(
      verifySecretToken({
        value: "sample-token",
        storedHash: stored,
      }),
    ).toBe(true);
  });

  it("still verifies legacy sha256 hashes", () => {
    const legacy = createHash("sha256").update("legacy-pin").digest("hex");
    expect(
      verifySecretToken({
        value: "legacy-pin",
        storedHash: legacy,
      }),
    ).toBe(true);
  });
});
