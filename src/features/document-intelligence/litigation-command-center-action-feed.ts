/**
 * Phase 14-C — Command Center action feed (AuditLog-aligned).
 */
import { z } from "zod";
import {
  LITIGATION_CMD_CENTER_AUDIT_ENTITY_TYPE,
} from "./litigation-command-center-audit";

export const PHASE14C_LITIGATION_COMMAND_CENTER_ACTION_FEED_MARKER =
  "PHASE14C_LITIGATION_COMMAND_CENTER_ACTION_FEED" as const;

export const LITIGATION_CMD_CENTER_AUDIT_ACTIONS = [
  "LITIGATION_CMD_CENTER_TASK_STATUS_UPDATED",
  "LITIGATION_CMD_CENTER_DEADLINE_UPDATED",
  "LITIGATION_CMD_CENTER_SUPPLEMENT_SENT",
  "LITIGATION_CMD_CENTER_SUPPLEMENT_REVIEW_STARTED",
  "LITIGATION_CMD_CENTER_DRAFT_GENERATED",
] as const;

export const COMMAND_CENTER_COLLABORATION_FEED_ACTIONS = [
  "CASE_CONVERSATION_MESSAGE_ADOPTED",
  "CASE_CONVERSATION_ATTACHMENT_ADOPTED",
] as const;

export const COMMAND_CENTER_DEADLINE_FEED_ACTIONS = [
  "LITIGATION_DEADLINE_MANUAL_CREATED",
  "LITIGATION_DEADLINE_NOTIFY_SCHEDULED",
  "LITIGATION_DEADLINE_IN_APP_SENT",
] as const;

export const COMMAND_CENTER_SECURE_DOCUMENT_FEED_ACTIONS = [
  "CASE_SHARED_DOCUMENT_CREATED",
  "CASE_DOCUMENT_DELIVERY_SENT",
  "CASE_DOCUMENT_DELIVERY_SKIPPED",
  "CASE_SHARED_DOCUMENT_VIEWED",
] as const;

export const COMMAND_CENTER_ACTION_FEED_ACTIONS = [
  ...LITIGATION_CMD_CENTER_AUDIT_ACTIONS,
  ...COMMAND_CENTER_COLLABORATION_FEED_ACTIONS,
  ...COMMAND_CENTER_DEADLINE_FEED_ACTIONS,
  ...COMMAND_CENTER_SECURE_DOCUMENT_FEED_ACTIONS,
] as const;

export type CommandCenterActionFeedAction =
  (typeof COMMAND_CENTER_ACTION_FEED_ACTIONS)[number];

export const litigationCommandCenterActionFeedItemSchema = z.object({
  id: z.string(),
  auditAction: z.enum(COMMAND_CENTER_ACTION_FEED_ACTIONS),
  message: z.string(),
  entityId: z.string(),
  occurredAt: z.string().datetime(),
  source: z.enum(["AUDIT", "OPTIMISTIC"]),
  outcome: z.enum(["SUCCESS", "PENDING", "FAILED"]),
});

export type LitigationCommandCenterActionFeedItem = z.infer<
  typeof litigationCommandCenterActionFeedItemSchema
>;

type AuditRow = {
  id: string;
  action: string;
  message: string | null;
  entityId: string;
  createdAt: Date;
};

export function mapAuditLogToCommandCenterFeedItem(
  row: AuditRow,
): LitigationCommandCenterActionFeedItem | null {
  const actionParsed = z
    .enum(COMMAND_CENTER_ACTION_FEED_ACTIONS)
    .safeParse(row.action);
  if (!actionParsed.success) {
    return null;
  }

  return litigationCommandCenterActionFeedItemSchema.parse({
    id: row.id,
    auditAction: actionParsed.data,
    message: row.message ?? defaultMessageForAuditAction(actionParsed.data),
    entityId: row.entityId,
    occurredAt: row.createdAt.toISOString(),
    source: "AUDIT",
    outcome: "SUCCESS",
  });
}

export function defaultMessageForAuditAction(
  action: CommandCenterActionFeedAction,
): string {
  switch (action) {
    case "LITIGATION_CMD_CENTER_TASK_STATUS_UPDATED":
      return "소송 지휘실 — 업무 상태 변경";
    case "LITIGATION_CMD_CENTER_DEADLINE_UPDATED":
      return "소송 지휘실 — 기일·마감 변경";
    case "LITIGATION_CMD_CENTER_SUPPLEMENT_SENT":
      return "소송 지휘실 — 보완요청 발송(DRAFT→SENT)";
    case "LITIGATION_CMD_CENTER_SUPPLEMENT_REVIEW_STARTED":
      return "소송 지휘실 — 보완요청 재검토 시작";
    case "LITIGATION_CMD_CENTER_DRAFT_GENERATED":
      return "소송 지휘실 — 준비서면 컨텍스트에서 초안 생성";
    case "CASE_CONVERSATION_MESSAGE_ADOPTED":
      return "사건 대화 — CLIENT_STATEMENT 검토 큐 등록";
    case "CASE_CONVERSATION_ATTACHMENT_ADOPTED":
      return "사건 대화 첨부 — 증거 후보 검토 큐 등록";
    case "LITIGATION_DEADLINE_MANUAL_CREATED":
      return "재판기일·마감 수동 등록";
    case "LITIGATION_DEADLINE_NOTIFY_SCHEDULED":
      return "기일 알림 예약 — 의뢰인·담당자";
    case "LITIGATION_DEADLINE_IN_APP_SENT":
      return "기일 앱 내 알림 발송";
    case "CASE_SHARED_DOCUMENT_CREATED":
      return "의뢰인 보안 문서 공유 생성";
    case "CASE_DOCUMENT_DELIVERY_SENT":
      return "문서 공유 알림 발송";
    case "CASE_DOCUMENT_DELIVERY_SKIPPED":
      return "문서 공유 알림 스킵(동의·설정)";
    case "CASE_SHARED_DOCUMENT_VIEWED":
      return "의뢰인 보안 문서 열람";
    default:
      return "소송 지휘실 작업";
  }
}

export type LitigationCmdCenterAuditAction =
  (typeof LITIGATION_CMD_CENTER_AUDIT_ACTIONS)[number];

export function auditActionForOptimisticKind(
  kind: "task" | "deadline" | "supplement" | "supplementReview" | "draft",
): LitigationCmdCenterAuditAction {
  switch (kind) {
    case "task":
      return "LITIGATION_CMD_CENTER_TASK_STATUS_UPDATED";
    case "deadline":
      return "LITIGATION_CMD_CENTER_DEADLINE_UPDATED";
    case "supplement":
      return "LITIGATION_CMD_CENTER_SUPPLEMENT_SENT";
    case "supplementReview":
      return "LITIGATION_CMD_CENTER_SUPPLEMENT_REVIEW_STARTED";
    case "draft":
      return "LITIGATION_CMD_CENTER_DRAFT_GENERATED";
  }
}

export { LITIGATION_CMD_CENTER_AUDIT_ENTITY_TYPE };
