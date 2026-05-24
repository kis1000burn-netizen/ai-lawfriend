/**
 * Product Phase 20-A — Template payload validation (metadata-only variables).
 */
import type { ExternalMessageSendPayload } from "./external-message-adapter.schema";

export const REAL_MESSAGING_TEMPLATE_POLICY_MARKER_PHASE20A =
  "phase20a-real-messaging-template-policy" as const;

export const EXTERNAL_MESSAGE_ALLOWED_TEMPLATE_VARIABLE_KEYS = [
  "noticeBody",
  "portalPath",
  "documentTitle",
  "deadlineLabel",
  "caseTitle",
  "clientNameMasked",
  "templateCode",
] as const;

const MAX_VARIABLE_VALUE_LENGTH = 500;

export function validateExternalMessageTemplatePolicy(
  payload: ExternalMessageSendPayload,
): { ok: true } | { ok: false; reason: string } {
  const { templateKey, variables } = payload.template;

  if (!templateKey.trim()) {
    return { ok: false, reason: "TEMPLATE_KEY_REQUIRED" };
  }

  for (const [key, value] of Object.entries(variables)) {
    if (value.length > MAX_VARIABLE_VALUE_LENGTH) {
      return { ok: false, reason: "TEMPLATE_VARIABLE_TOO_LONG" };
    }
    if (key.toLowerCase().includes("password") || key.toLowerCase().includes("secret")) {
      return { ok: false, reason: "FORBIDDEN_TEMPLATE_VARIABLE_KEY" };
    }
  }

  return { ok: true };
}

export function buildTemplateSafeVariableSummary(
  payload: ExternalMessageSendPayload,
): Record<string, string> {
  const out: Record<string, string> = {
    templateKey: payload.template.templateKey,
  };
  if (payload.template.providerTemplateCode) {
    out.templateCode = payload.template.providerTemplateCode;
  }
  if (payload.safeLink?.portalPath) {
    out.portalPath = payload.safeLink.portalPath;
  }
  const noticeBody = payload.template.variables.noticeBody;
  if (noticeBody) {
    out.noticeBody = noticeBody.slice(0, 200);
  }
  return out;
}
