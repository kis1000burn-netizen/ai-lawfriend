/**
 * Phase 15-E — Court schedule & client reminder SSOT.
 */
import { z } from "zod";

export const PHASE15E_LITIGATION_DEADLINE_REMINDER_MARKER =
  "PHASE15E_LITIGATION_DEADLINE_REMINDER" as const;

export const LITIGATION_DEADLINE_REMINDER_VERSION = "15-E.1" as const;

export const DEADLINE_REMINDER_OFFSETS = ["D14", "D7", "D3", "D1", "D0"] as const;
export const deadlineReminderOffsetSchema = z.enum(DEADLINE_REMINDER_OFFSETS);

export const DEADLINE_NOTIFICATION_CHANNELS = [
  "IN_APP",
  "EMAIL",
  "KAKAO_ALIMTALK",
] as const;
export const deadlineNotificationChannelSchema = z.enum(DEADLINE_NOTIFICATION_CHANNELS);

export const createManualDeadlineBodySchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional(),
  dueAt: z.string().datetime(),
  courtName: z.string().trim().max(200).optional(),
  hearingKind: z.string().trim().max(100).optional(),
  clientVisible: z.boolean().default(true),
});

export const scheduleDeadlineNotificationsBodySchema = z.object({
  offsets: z.array(deadlineReminderOffsetSchema).default([...DEADLINE_REMINDER_OFFSETS]),
  channels: z
    .array(deadlineNotificationChannelSchema)
    .default(["IN_APP", "EMAIL", "KAKAO_ALIMTALK"]),
  notifyClient: z.boolean().default(true),
  notifyLawyer: z.boolean().default(true),
  notifyStaff: z.boolean().default(true),
});

export const clientPortalDeadlineSchema = z.object({
  id: z.string().cuid(),
  title: z.string(),
  dueAt: z.string().datetime().nullable(),
  courtName: z.string().nullable().optional(),
  hearingKind: z.string().nullable().optional(),
  displayLine: z.string(),
  isNext: z.boolean().default(false),
});

export const clientPortalDeadlinesResponseSchema = z.object({
  caseId: z.string().cuid(),
  version: z.literal(LITIGATION_DEADLINE_REMINDER_VERSION),
  nextDeadline: clientPortalDeadlineSchema.nullable(),
  deadlines: z.array(clientPortalDeadlineSchema),
  notice: z.string(),
});

export type ClientPortalDeadline = z.infer<typeof clientPortalDeadlineSchema>;

export function offsetDays(offset: z.infer<typeof deadlineReminderOffsetSchema>): number {
  switch (offset) {
    case "D14":
      return 14;
    case "D7":
      return 7;
    case "D3":
      return 3;
    case "D1":
      return 1;
    case "D0":
      return 0;
  }
}

export function computeReminderScheduledAt(
  dueAt: Date,
  offset: z.infer<typeof deadlineReminderOffsetSchema>,
): Date {
  const scheduled = new Date(dueAt);
  scheduled.setUTCDate(scheduled.getUTCDate() - offsetDays(offset));
  scheduled.setUTCHours(9, 0, 0, 0);
  return scheduled;
}

export function formatClientDeadlineDisplayLine(input: {
  dueAt: Date | null;
  courtName?: string | null;
  hearingKind?: string | null;
  title: string;
}): string {
  if (!input.dueAt) {
    return input.title;
  }
  const datePart = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(input.dueAt);
  const parts = [datePart];
  if (input.courtName?.trim()) parts.push(input.courtName.trim());
  if (input.hearingKind?.trim()) parts.push(input.hearingKind.trim());
  else if (input.title.trim()) parts.push(input.title.trim());
  return parts.join(" / ");
}
