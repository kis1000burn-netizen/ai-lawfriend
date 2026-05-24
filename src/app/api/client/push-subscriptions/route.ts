import { z } from "zod";
import { created, ok, toErrorResponse } from "@/lib/domain-api-response";
import { ValidationError } from "@/lib/errors";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import {
  disableClientPortalWebPush,
  getClientPortalPushSurfaceState,
  registerClientPortalPushSubscription,
  unregisterClientPortalPushSubscription,
} from "@/features/client-portal/client-portal-push-notification.service";

export const dynamic = "force-dynamic";

const registerSchema = z.object({
  endpoint: z.string().url().max(2000),
  keys: z.object({
    p256dh: z.string().min(1).max(500),
    auth: z.string().min(1).max(500),
  }),
  userAgent: z.string().max(500).optional(),
});

const deleteSchema = z.object({
  endpoint: z.string().url().max(2000).optional(),
  disableAll: z.boolean().optional(),
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

export async function POST(request: Request) {
  try {
    const currentUser = await requireSessionUser();
    const body = registerSchema.parse(await request.json());
    const row = await registerClientPortalPushSubscription(currentUser.id, {
      endpoint: body.endpoint,
      p256dh: body.keys.p256dh,
      auth: body.keys.auth,
      userAgent: body.userAgent ?? request.headers.get("user-agent"),
    });
    return created({ id: row.id, endpoint: row.endpoint });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const currentUser = await requireSessionUser();
    const body = deleteSchema.parse(await request.json().catch(() => ({})));

    if (body.disableAll) {
      await disableClientPortalWebPush(currentUser.id);
      return ok({ removed: "all" });
    }

    if (!body.endpoint) {
      throw new ValidationError("endpoint 또는 disableAll이 필요합니다.");
    }

    await unregisterClientPortalPushSubscription(currentUser.id, body.endpoint);
    return ok({ removed: body.endpoint });
  } catch (error) {
    return toErrorResponse(error);
  }
}
