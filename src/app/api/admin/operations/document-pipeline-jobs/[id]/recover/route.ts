import { ok, handleApiError } from "@/lib/api-response";
import { requireRoleApi } from "@/lib/auth/guards";
import { operatorDocumentPipelineRecoverInputSchema } from "@/features/platform/reliability/document-pipeline-recovery.schema";
import { operatorRecoverDocumentPipelineJobService } from "@/features/platform/reliability/document-pipeline-recovery.service";

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
    const parsed = operatorDocumentPipelineRecoverInputSchema.parse(body);

    const result = await operatorRecoverDocumentPipelineJobService(auth.user, id, parsed);
    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}
