/**
 * Product Phase 20-C — KAKAO_PROVIDER env branching (DRY_RUN · ALIMTALK).
 */
import type { ExternalMessageProvider } from "./external-message-adapter.schema";

export const REAL_MESSAGING_KAKAO_CONFIG_MARKER_PHASE20C =
  "phase20c-real-messaging-kakao-config" as const;

export const KAKAO_PROVIDER_ENV_KEY = "KAKAO_PROVIDER" as const;

export const RESOLVED_KAKAO_PROVIDERS = ["DRY_RUN", "ALIMTALK"] as const;

export type ResolvedKakaoProvider = (typeof RESOLVED_KAKAO_PROVIDERS)[number];

export type KakaoAlimtalkConfig = {
  apiUrl: string;
  apiKey: string;
  senderKey: string;
  plusFriendId?: string;
};

export function resolveKakaoProvider(
  env: NodeJS.ProcessEnv = process.env,
): ResolvedKakaoProvider {
  const raw = (env[KAKAO_PROVIDER_ENV_KEY] ?? "DRY_RUN").trim().toUpperCase();
  if (raw === "ALIMTALK" || raw === "DRY_RUN") {
    return raw;
  }
  return "DRY_RUN";
}

export function kakaoProviderForResolved(
  resolved: ResolvedKakaoProvider,
): ExternalMessageProvider {
  if (resolved === "ALIMTALK") return "KAKAO_ALIMTALK";
  return "DRY_RUN";
}

export function readKakaoAlimtalkConfig(
  env: NodeJS.ProcessEnv = process.env,
): KakaoAlimtalkConfig | null {
  const apiUrl = env.KAKAO_ALIMTALK_API_URL?.trim();
  const apiKey = env.KAKAO_ALIMTALK_API_KEY?.trim();
  const senderKey = env.KAKAO_ALIMTALK_SENDER_KEY?.trim();
  if (!apiUrl || !apiKey || !senderKey) {
    return null;
  }

  return {
    apiUrl,
    apiKey,
    senderKey,
    plusFriendId: env.KAKAO_ALIMTALK_PLUS_FRIEND_ID?.trim() || undefined,
  };
}
