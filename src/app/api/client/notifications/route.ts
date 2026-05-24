import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { listClientPortalNotificationCenterItems } from "@/features/client-portal/client-portal-push-notification.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const currentUser = await requireSessionUser();
    const items = await listClientPortalNotificationCenterItems(currentUser);
    return ok({ items });
  } catch (error) {
    return toErrorResponse(error);
  }
}
