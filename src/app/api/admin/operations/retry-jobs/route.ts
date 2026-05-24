import { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api-response";
import { requireRoleApi } from "@/lib/auth/guards";
import { retryJobListQuerySchema } from "@/features/platform/reliability/retry-job.schema";
import { listRetryJobsService } from "@/features/platform/reliability/retry-job.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireRoleApi("ADMIN");
    if (!auth.ok) {
      return auth.response;
    }

    const searchParams = request.nextUrl.searchParams;
    const query = retryJobListQuerySchema.parse({
      page: searchParams.get("page") ?? undefined,
      pageSize: searchParams.get("pageSize") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      sourceType: searchParams.get("sourceType") ?? undefined,
      retryable: searchParams.get("retryable") ?? undefined,
      caseId: searchParams.get("caseId") ?? undefined,
    });

    const result = await listRetryJobsService(auth.user, query);
    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}
