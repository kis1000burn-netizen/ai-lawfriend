/**
 * Product Phase 20-B — Safe email subject/body (secure link · no legal body).
 */
import { env } from "@/lib/env";
import type { ExternalMessageSendPayload } from "./external-message-adapter.schema";

export const REAL_MESSAGING_EMAIL_BODY_BUILDER_MARKER_PHASE20B =
  "phase20b-real-messaging-email-body-builder" as const;

const SUBJECT_PREFIX = "[AI법친]";

const TEMPLATE_SUBJECT_LABELS: Record<string, string> = {
  CLIENT_DOC_SHARE_V1: "문서 공유 알림",
  SUPPLEMENT_REQUEST_V1: "보완 요청",
  COURT_DEADLINE_REMINDER_V1: "기한 알림",
  CLIENT_PORTAL_MESSAGE_V1: "포털 메시지",
  SYSTEM_NOTICE_V1: "시스템 안내",
};

const MAX_NOTICE_SNIPPET = 300;
const MAX_SUBJECT_TITLE = 80;

export type SafeEmailContent = {
  subject: string;
  textBody: string;
  htmlBody: string;
  portalUrl: string;
};

export function buildSafeEmailSubject(payload: ExternalMessageSendPayload): string {
  const label =
    TEMPLATE_SUBJECT_LABELS[payload.template.templateKey] ?? "알림";
  const title = payload.template.variables.documentTitle?.trim().slice(0, MAX_SUBJECT_TITLE);
  if (title) {
    return `${SUBJECT_PREFIX} ${label}: ${title}`;
  }
  return `${SUBJECT_PREFIX} ${label}`;
}

export function buildSafeEmailContent(
  payload: ExternalMessageSendPayload,
  baseUrl: string = env.APP_BASE_URL,
): SafeEmailContent {
  if (!payload.safeLink?.portalPath) {
    throw new Error("SAFE_LINK_REQUIRED_FOR_EMAIL_BODY");
  }

  const portalUrl = `${baseUrl.replace(/\/$/, "")}${payload.safeLink.portalPath}`;
  const noticeSnippet =
    payload.template.variables.noticeBody?.trim().slice(0, MAX_NOTICE_SNIPPET) ??
    "새 알림이 도착했습니다. 보안 포털에서 확인해 주세요.";

  const subject = buildSafeEmailSubject(payload);
  const textBody = [
    noticeSnippet,
    "",
    "아래 보안 링크에서 확인할 수 있습니다.",
    portalUrl,
    "",
    "※ 법률 문서 본문은 이메일로 전송되지 않습니다.",
    "※ 첨부파일은 포함되지 않습니다.",
  ].join("\n");

  const htmlBody = [
    `<p>${escapeHtml(noticeSnippet)}</p>`,
    `<p><a href="${escapeHtml(portalUrl)}">보안 포털에서 확인</a></p>`,
    `<p><small>법률 문서 본문·첨부파일은 이메일로 전송되지 않습니다.</small></p>`,
  ].join("\n");

  return { subject, textBody, htmlBody, portalUrl };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
