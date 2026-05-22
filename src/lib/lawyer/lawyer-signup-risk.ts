import { createHmac } from "node:crypto";

/** 서약 문구·DB에 기록되는 버전 토큰(문구 변경 시 함께 올릴 것) */
export const LAWYER_VERIFICATION_INTEGRITY_ATTESTATION_VERSION =
  "lawyer-verify-attest-v1";

/**
 * IP 지문용 salt. 운영에서는 `LAWYER_SIGNUP_RISK_IP_SALT`(16자 이상) 권장.
 * 미설정 시 JWT_SECRET 기반 파생(배포 환경마다 달라질 수 있어 별도 salt 권장).
 */
export function getLawyerSignupIpFingerprintSalt(): string {
  const custom = process.env.LAWYER_SIGNUP_RISK_IP_SALT?.trim();
  if (custom && custom.length >= 16) return custom;
  const jwt = process.env.JWT_SECRET?.trim() ?? "dev-jwt-placeholder";
  return `${jwt}:lawyer_signup_ip_v1`;
}

/** `X-Forwarded-For` 첫 홉만 사용(프록시 전제). */
export function signupClientIpCandidate(headers: Headers): string | null {
  const xf = headers.get("x-forwarded-for");
  const firstFromXff = xf?.split(",")[0]?.trim();
  if (firstFromXff && firstFromXff.length <= 128) return firstFromXff;
  const real = headers.get("x-real-ip")?.trim();
  if (real && real.length <= 128) return real;
  return null;
}

export function signupIpFingerprintHmacSha256(rawIp: string | null): string | null {
  const ip = rawIp?.trim();
  if (!ip) return null;
  return createHmac("sha256", getLawyerSignupIpFingerprintSalt())
    .update(ip.toLowerCase())
    .digest("hex");
}

export function truncateSignupUserAgent(ua: string | null): string | null {
  const t = ua?.trim();
  if (!t) return null;
  return t.slice(0, 512);
}

export function signupRiskFingerprintFromHeaders(headers: Headers): {
  ipFingerprint: string | null;
  userAgentPrefix: string | null;
} {
  const ipFingerprint = signupIpFingerprintHmacSha256(signupClientIpCandidate(headers));
  const userAgentPrefix = truncateSignupUserAgent(headers.get("user-agent"));
  return { ipFingerprint, userAgentPrefix };
}
