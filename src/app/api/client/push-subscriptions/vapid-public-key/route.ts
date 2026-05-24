import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import {
  isClientPortalWebPushLiveSendEnabled,
  resolveClientPortalVapidPublicKey,
} from "@/features/client-portal/client-portal-push-notification.policy";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireSessionUser();
    return ok({
      publicKey: resolveClientPortalVapidPublicKey(),
      liveSendEnabled: isClientPortalWebPushLiveSendEnabled(),
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
