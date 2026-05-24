import { ok, handleApiError } from "@/lib/api-response";
import { requireRoleApi } from "@/lib/auth/guards";
import { operatorExternalMessageRedeliverInputSchema } from "@/features/platform/reliability/external-message-redelivery.schema";
import { operatorRedeliverExternalMessageService } from "@/features/platform/reliability/external-message-redelivery.service";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    const auth = await requireRoleApi("ADMIN");
    if (!auth.ok) {
      return auth.response;
    }

    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const parsed = operatorExternalMessageRedeliverInputSchema.parse(body);

    const result = await operatorRedeliverExternalMessageService(auth.user, id, parsed);
    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}
