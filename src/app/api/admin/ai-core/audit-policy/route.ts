import { requireStaffOrPlatformAdminApi } from "@/lib/auth/require-staff-or-platform-admin-api";
import { getAiCoreAuditPolicySnapshot } from "@/features/ai-core/ai-core-audit-policy";
import { ok, fail, toErrorResponse } from "@/lib/domain-api-response";

export const dynamic = "force-dynamic";

function handleAuthError(error: unknown) {
  const err = error as Error & { status?: number };
  if (typeof err.status === "number" && (err.status === 401 || err.status === 403)) {
    return fail(err.message ?? "권한 오류", err.status, {
      code: err.status === 401 ? "UNAUTHORIZED" : "FORBIDDEN",
    });
  }
  return null;
}

/** Phase 8-D — AI Core audit policy SSOT (STAFF+). E2E smoke 대상. */
export async function GET() {
  try {
    await requireStaffOrPlatformAdminApi();
    return ok({ policy: getAiCoreAuditPolicySnapshot() });
  } catch (error: unknown) {
    return handleAuthError(error) ?? toErrorResponse(error);
  }
}
