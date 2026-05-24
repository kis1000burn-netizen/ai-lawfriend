import { buildVoiceDocumentFinalizeGateUiSnapshotForCase } from "@/lib/voice/voice-document-finalize-gate.service";
import { getCaseAccessContext } from "@/features/cases/case.permissions";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors";
import { getSessionUser } from "@/lib/get-session-user";
import { ok, toErrorResponse } from "@/lib/domain-api-response";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ caseId: string }> };

function canViewVoiceDocumentFinalizeGate(role: string): boolean {
  return role === "LAWYER" || role === "ADMIN" || role === "STAFF" || role === "SUPER_ADMIN";
}

/**
 * Phase 5-H-UI-6 — Document Finalize Gate UI snapshot (서버 gate와 동일 평가).
 */
export async function GET(_req: Request, ctx: Params) {
  try {
    const user = await getSessionUser();
    if (!user) {
      throw new UnauthorizedError();
    }
    if (!canViewVoiceDocumentFinalizeGate(user.role)) {
      throw new ForbiddenError("Voice document finalize gate 조회 권한이 없습니다.");
    }

    const { caseId } = await ctx.params;
    const access = await getCaseAccessContext(user, caseId);
    if (!access.canRead) {
      throw new ForbiddenError();
    }

    const snapshot = await buildVoiceDocumentFinalizeGateUiSnapshotForCase(caseId);

    return ok(snapshot);
  } catch (error: unknown) {
    return toErrorResponse(error);
  }
}
