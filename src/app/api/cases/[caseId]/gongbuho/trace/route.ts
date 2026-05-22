import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { caseIdParamSchema } from "@/features/cases/case.validators";
import { getCaseAccessContext } from "@/features/cases/case.permissions";
import { listGongbuhoTracesForCase } from "@/features/gongbuho/gongbuho-packet.service";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    caseId: string;
  }>;
};

export async function GET(_req: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const params = await context.params;
    const { caseId } = caseIdParamSchema.parse(params);

    await getCaseAccessContext(currentUser, caseId);

    const items = await listGongbuhoTracesForCase(caseId);
    return ok({ items });
  } catch (error: unknown) {
    return toErrorResponse(error);
  }
}
