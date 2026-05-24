import { z } from "zod";
import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import {
  getClientPortalPushSurfaceState,
  updateClientPortalNotificationPreferences,
} from "@/features/client-portal/client-portal-push-notification.service";

export const dynamic = "force-dynamic";

const patchSchema = z
  .object({
    webPushOptIn: z.boolean().optional(),
    kakaoOptIn: z.boolean().optional(),
    emailOptIn: z.boolean().optional(),
    documentShareNoticeEnabled: z.boolean().optional(),
    litigationDeadlineReminderEnabled: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one preference field is required",
  });

export async function GET() {
  try {
    const currentUser = await requireSessionUser();
    const state = await getClientPortalPushSurfaceState(currentUser.id);
    return ok(state);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const currentUser = await requireSessionUser();
    const body = patchSchema.parse(await request.json());
    const updated = await updateClientPortalNotificationPreferences(currentUser.id, body);
    return ok({
      preferences: {
        webPushOptIn: updated.webPushOptIn,
        kakaoOptIn: updated.kakaoOptIn,
        emailOptIn: updated.emailOptIn,
        documentShareNoticeEnabled: updated.documentShareNoticeEnabled,
        litigationDeadlineReminderEnabled: updated.litigationDeadlineReminderEnabled,
      },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
