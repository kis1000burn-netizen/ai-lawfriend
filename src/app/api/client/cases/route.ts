import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { listClientPortalCasesService } from "@/features/client-portal/client-portal.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const currentUser = await requireSessionUser();
    const items = await listClientPortalCasesService(currentUser);
    return ok({ items });
  } catch (error) {
    return toErrorResponse(error);
  }
}
