import { afterEach, describe, expect, it } from "vitest";
import {
  LAWYER_VERIFICATION_INTEGRITY_ATTESTATION_VERSION,
  signupIpFingerprintHmacSha256,
  truncateSignupUserAgent,
} from "./lawyer-signup-risk";

describe("lawyer-signup-risk", () => {
  const prevSalt = process.env.LAWYER_SIGNUP_RISK_IP_SALT;

  afterEach(() => {
    if (prevSalt === undefined) delete process.env.LAWYER_SIGNUP_RISK_IP_SALT;
    else process.env.LAWYER_SIGNUP_RISK_IP_SALT = prevSalt;
  });

  it("deterministic fingerprint for salt", () => {
    process.env.LAWYER_SIGNUP_RISK_IP_SALT = "x".repeat(16);
    expect(signupIpFingerprintHmacSha256("203.0.113.42")).toBe(
      signupIpFingerprintHmacSha256("203.0.113.42"),
    );
    expect(signupIpFingerprintHmacSha256("203.0.113.42")).not.toEqual(
      signupIpFingerprintHmacSha256("198.51.100.9"),
    );
  });

  it("UA truncate", () => {
    expect(truncateSignupUserAgent("aa" + "b".repeat(600))!.length).toBe(512);
  });

  it("integrity version 상수 존재", () => {
    expect(LAWYER_VERIFICATION_INTEGRITY_ATTESTATION_VERSION.length).toBeGreaterThan(4);
  });
});
