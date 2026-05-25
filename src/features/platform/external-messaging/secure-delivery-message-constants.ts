/**
 * Client-safe secure delivery message constants (no server transports).
 */
import type { ExternalMessageSendSurface } from "./external-message-adapter.schema";

export const SECURE_DELIVERY_TEMPLATE_BY_SURFACE: Record<
  ExternalMessageSendSurface,
  string
> = {
  DOCUMENT_DELIVERY: "CLIENT_DOC_SHARE_V1",
  SUPPLEMENT_REQUEST: "SUPPLEMENT_REQUEST_V1",
  COURT_DEADLINE_REMINDER: "COURT_DEADLINE_REMINDER_V1",
  CLIENT_PORTAL_MESSAGE: "CLIENT_PORTAL_MESSAGE_V1",
  SYSTEM_NOTICE: "SYSTEM_NOTICE_V1",
};

export const SECURE_DELIVERY_NOTICE_BY_SURFACE: Record<ExternalMessageSendSurface, string> = {
  DOCUMENT_DELIVERY:
    "[AI법친] 변호사가 사건 관련 서류를 공유했습니다. 보안 포털에서 확인해 주세요.",
  SUPPLEMENT_REQUEST: "[AI법친] 보완 요청이 도착했습니다. 보안 포털에서 확인해 주세요.",
  COURT_DEADLINE_REMINDER: "[AI법친] 사건 기한 알림이 있습니다. 보안 포털에서 확인해 주세요.",
  CLIENT_PORTAL_MESSAGE: "[AI법친] 포털에 새 메시지가 있습니다. 보안 포털에서 확인해 주세요.",
  SYSTEM_NOTICE: "[AI법친] 시스템 안내가 있습니다. 보안 포털에서 확인해 주세요.",
};
