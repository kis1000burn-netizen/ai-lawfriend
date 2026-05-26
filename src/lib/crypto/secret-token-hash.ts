import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const SECRET_TOKEN_HASH_MARKER = "aibeop-secret-token-hash-v2" as const;
const V2_PREFIX = "v2:";

function resolveTokenPepper(): string {
  const pepper = process.env.SECRET_TOKEN_PEPPER?.trim();
  if (pepper) {
    return pepper;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("Missing SECRET_TOKEN_PEPPER in production.");
  }
  const jwtSecret = process.env.JWT_SECRET?.trim() || "dev-only-insecure-key";
  return `${jwtSecret}:aibeop-token-pepper-v1`;
}

function legacySha256(value: string): string {
  return createHash("sha256").update(value.trim()).digest("hex");
}

/** 접근 토큰·PIN 등 — v2 HMAC(pepper), legacy SHA-256 검증 호환 */
export function hashSecretToken(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error("hash 대상 값이 비어 있습니다.");
  }
  const digest = createHmac("sha256", resolveTokenPepper()).update(trimmed).digest("hex");
  return `${V2_PREFIX}${digest}`;
}

export function verifySecretToken(input: {
  value: string;
  storedHash: string;
}): boolean {
  const stored = input.storedHash.trim();
  if (!stored) {
    return false;
  }

  try {
    if (stored.startsWith(V2_PREFIX)) {
      return timingSafeEqual(
        Buffer.from(hashSecretToken(input.value)),
        Buffer.from(stored),
      );
    }
    return timingSafeEqual(
      Buffer.from(legacySha256(input.value)),
      Buffer.from(stored),
    );
  } catch {
    return false;
  }
}
