import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { NotFoundError } from "@/lib/errors";
import {
  getSupplementRequestDetailService,
  markSupplementRequestViewedByClientService,
  updateSupplementRequestService,
} from "@/features/supplement-request/supplement-request.service";
import {
  supplementRequestDetailParamSchema,
  updateSupplementRequestSchema,
} from "@/features/supplement-request/supplement-request.validators";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    caseId: string;
    requestId: string;
  }>;
};

function assertRequestBelongsToCase(caseId: string, requestCaseId: string) {
  if (caseId !== requestCaseId) {
    throw new NotFoundError("보완요청을 찾을 수 없습니다.");
  }
}

export async function GET(_: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const params = await context.params;
    const { caseId, requestId } = supplementRequestDetailParamSchema.parse(params);

    const result = await getSupplementRequestDetailService(currentUser, requestId);
    assertRequestBelongsToCase(caseId, result.caseId);

    if (currentUser.role === "USER") {
      const viewed = await markSupplementRequestViewedByClientService(currentUser, requestId);
      return ok(viewed);
    }

    return ok(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const params = await context.params;
    const { caseId, requestId } = supplementRequestDetailParamSchema.parse(params);

    const detail = await getSupplementRequestDetailService(currentUser, requestId);
    assertRequestBelongsToCase(caseId, detail.caseId);

    const body = await request.json();
    const input = updateSupplementRequestSchema.parse(body);

    const result = await updateSupplementRequestService(currentUser, requestId, input);

    return ok(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
