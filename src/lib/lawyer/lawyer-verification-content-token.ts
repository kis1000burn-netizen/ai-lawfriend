import { createHmac, timingSafeEqual } from "node:crypto";

function getContentTokenSecret(): string {
  const s =
    process.env.LAWYER_VERIFICATION_DOWNLOAD_TOKEN_SECRET?.trim() ||
    process.env.JWT_SECRET?.trim();
  if (!s) {
    throw new Error("LAWYER_VERIFICATION_DOWNLOAD_TOKEN_SECRET 또는 JWT_SECRET 이 필요합니다.");
  }
  return s;
}

/** 로컬 스토리지용: 관리자 열람 후 단기 스트리밍 URL 파라미터 생성. */
export function buildLawyerVerificationContentTokenQueryParts(input: {
  lawyerProfileId: string;
  documentId: string;
  ttlSec: number;
}): { exp: number; sig: string } {
  const exp = Math.floor(Date.now() / 1000) + input.ttlSec;
  const sig = createHmac("sha256", getContentTokenSecret())
    .update(`${exp}.${input.lawyerProfileId}.${input.documentId}`)
    .digest("hex");
  return { exp, sig };
}

export function verifyLawyerVerificationContentToken(input: {
  exp: number;
  sig: string;
  lawyerProfileId: string;
  documentId: string;
}): boolean {
  if (!Number.isFinite(input.exp) || input.exp <= 0) return false;
  if (Math.floor(Date.now() / 1000) > input.exp) return false;
  if (!/^[a-f0-9]{64}$/i.test(input.sig)) return false;
  const expected = createHmac("sha256", getContentTokenSecret())
    .update(`${input.exp}.${input.lawyerProfileId}.${input.documentId}`)
    .digest("hex");
  try {
    return timingSafeEqual(Buffer.from(input.sig, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}
