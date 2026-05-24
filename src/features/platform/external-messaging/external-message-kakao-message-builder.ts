/**
 * Product Phase 20-C — Safe Kakao Alimtalk variables (allowlisted · secure link only).
 */
import { env } from "@/lib/env";
import type { ExternalMessageSendPayload } from "./external-message-adapter.schema";
import type { KakaoAlimtalkTemplateRegistryEntry } from "./external-message-kakao-template-registry";

export const REAL_MESSAGING_KAKAO_MESSAGE_BUILDER_MARKER_PHASE20C =
  "phase20c-real-messaging-kakao-message-builder" as const;

export type KakaoAlimtalkSafeVariables = Record<string, string>;

export function buildKakaoAlimtalkSafeVariables(
  payload: ExternalMessageSendPayload,
  entry: KakaoAlimtalkTemplateRegistryEntry,
  baseUrl: string = env.APP_BASE_URL,
): KakaoAlimtalkSafeVariables {
  if (!payload.safeLink?.portalPath) {
    throw new Error("SAFE_LINK_REQUIRED_FOR_KAKAO_ALIMTALK");
  }

  const portalUrl = `${baseUrl.replace(/\/$/, "")}${payload.safeLink.portalPath}`;
  const out: KakaoAlimtalkSafeVariables = {};

  for (const key of entry.allowedVariableKeys) {
    const raw = payload.template.variables[key];
    if (raw?.trim()) {
      out[key] = raw.trim();
    }
  }

  if (entry.allowedVariableKeys.includes("portalPath")) {
    out.portalPath = portalUrl;
  }

  if (entry.allowedVariableKeys.includes("noticeBody")) {
    const notice =
      out.noticeBody ??
      payload.template.variables.noticeBody?.trim() ??
      "새 알림이 도착했습니다. 보안 포털에서 확인해 주세요.";
    out.noticeBody = notice.slice(0, entry.maxNoticeBodyLength);
  }

  for (const requiredKey of entry.requiredVariableKeys) {
    if (!out[requiredKey]?.trim()) {
      throw new Error(`KAKAO_REQUIRED_VARIABLE_MISSING:${requiredKey}`);
    }
  }

  return out;
}
