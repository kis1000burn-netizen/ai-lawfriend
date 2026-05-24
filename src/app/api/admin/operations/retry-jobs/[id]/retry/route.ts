import { ok, handleApiError } from "@/lib/api-response";
import { requireRoleApi } from "@/lib/auth/guards";
import { operatorRetryJobInputSchema } from "@/features/platform/reliability/retry-job.schema";
import { operatorQueueRetryJobService } from "@/features/platform/reliability/retry-job.service";

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
    const parsed = operatorRetryJobInputSchema.parse(body);

    const result = await operatorQueueRetryJobService(auth.user, id, parsed.operatorNote);
    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}
