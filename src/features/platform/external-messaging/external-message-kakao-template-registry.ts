/**
 * Product Phase 20-C — Kakao Alimtalk template code registry (approved templates only).
 */
import type { ExternalMessageSendPayload } from "./external-message-adapter.schema";

export const REAL_MESSAGING_KAKAO_TEMPLATE_REGISTRY_MARKER_PHASE20C =
  "phase20c-real-messaging-kakao-template-registry" as const;

export type KakaoAlimtalkTemplateRegistryEntry = {
  providerTemplateCode: string;
  allowedVariableKeys: readonly string[];
  requiredVariableKeys: readonly string[];
  maxNoticeBodyLength: number;
};

export const KAKAO_ALIMTALK_TEMPLATE_REGISTRY = {
  CLIENT_DOC_SHARE_V1: {
    providerTemplateCode: "AIBEOPCHIN_CLIENT_DOC_SHARE_V1",
    allowedVariableKeys: ["noticeBody", "documentTitle", "portalPath", "clientNameMasked"],
    requiredVariableKeys: ["noticeBody", "portalPath"],
    maxNoticeBodyLength: 200,
  },
  SUPPLEMENT_REQUEST_V1: {
    providerTemplateCode: "AIBEOPCHIN_SUPPLEMENT_REQUEST_V1",
    allowedVariableKeys: ["noticeBody", "portalPath", "caseTitle", "clientNameMasked"],
    requiredVariableKeys: ["noticeBody", "portalPath"],
    maxNoticeBodyLength: 180,
  },
  COURT_DEADLINE_REMINDER_V1: {
    providerTemplateCode: "AIBEOPCHIN_COURT_DEADLINE_V1",
    allowedVariableKeys: ["noticeBody", "deadlineLabel", "portalPath", "caseTitle"],
    requiredVariableKeys: ["noticeBody", "portalPath", "deadlineLabel"],
    maxNoticeBodyLength: 180,
  },
  CLIENT_PORTAL_MESSAGE_V1: {
    providerTemplateCode: "AIBEOPCHIN_CLIENT_PORTAL_MSG_V1",
    allowedVariableKeys: ["noticeBody", "portalPath", "clientNameMasked"],
    requiredVariableKeys: ["noticeBody", "portalPath"],
    maxNoticeBodyLength: 200,
  },
  SYSTEM_NOTICE_V1: {
    providerTemplateCode: "AIBEOPCHIN_SYSTEM_NOTICE_V1",
    allowedVariableKeys: ["noticeBody", "portalPath"],
    requiredVariableKeys: ["noticeBody", "portalPath"],
    maxNoticeBodyLength: 160,
  },
} as const satisfies Record<string, KakaoAlimtalkTemplateRegistryEntry>;

export type KakaoAlimtalkTemplateKey = keyof typeof KAKAO_ALIMTALK_TEMPLATE_REGISTRY;

export function getKakaoAlimtalkTemplateEntry(
  templateKey: string,
): KakaoAlimtalkTemplateRegistryEntry | null {
  if (!(templateKey in KAKAO_ALIMTALK_TEMPLATE_REGISTRY)) {
    return null;
  }
  return KAKAO_ALIMTALK_TEMPLATE_REGISTRY[templateKey as KakaoAlimtalkTemplateKey];
}

export function isKakaoAlimtalkTemplateKeyRegistered(templateKey: string): boolean {
  return getKakaoAlimtalkTemplateEntry(templateKey) !== null;
}

export function validateKakaoAlimtalkTemplateRegistry(
  payload: ExternalMessageSendPayload,
): { ok: true; entry: KakaoAlimtalkTemplateRegistryEntry } | { ok: false; reason: string } {
  const { templateKey, providerTemplateCode, variables } = payload.template;

  const entry = getKakaoAlimtalkTemplateEntry(templateKey);
  if (!entry) {
    return { ok: false, reason: "KAKAO_TEMPLATE_KEY_NOT_REGISTERED" };
  }

  if (!providerTemplateCode?.trim()) {
    return { ok: false, reason: "KAKAO_PROVIDER_TEMPLATE_CODE_REQUIRED" };
  }

  if (providerTemplateCode !== entry.providerTemplateCode) {
    return { ok: false, reason: "KAKAO_PROVIDER_TEMPLATE_CODE_MISMATCH" };
  }

  for (const key of Object.keys(variables)) {
    if (!entry.allowedVariableKeys.includes(key)) {
      return { ok: false, reason: "KAKAO_TEMPLATE_VARIABLE_NOT_ALLOWED" };
    }
  }

  for (const requiredKey of entry.requiredVariableKeys) {
    if (requiredKey === "portalPath") {
      if (!payload.safeLink?.portalPath?.trim() && !variables.portalPath?.trim()) {
        return { ok: false, reason: "KAKAO_REQUIRED_TEMPLATE_VARIABLE_MISSING" };
      }
      continue;
    }
    if (!variables[requiredKey]?.trim()) {
      return { ok: false, reason: "KAKAO_REQUIRED_TEMPLATE_VARIABLE_MISSING" };
    }
  }

  const noticeBody = variables.noticeBody;
  if (noticeBody && noticeBody.length > entry.maxNoticeBodyLength) {
    return { ok: false, reason: "KAKAO_NOTICE_BODY_TOO_LONG" };
  }

  return { ok: true, entry };
}
