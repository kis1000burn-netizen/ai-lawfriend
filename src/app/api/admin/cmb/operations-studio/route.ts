import { requireStaffOrPlatformAdminApi } from "@/lib/auth/require-staff-or-platform-admin-api";
import {
  assertCmbOperationsStudioDashboardMetaOnly,
  getCmbOperationsStudioDashboard,
} from "@/cmb/ops/cmb-operations-studio.service";
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

/**
 * Phase 6-H — CMB Operations Studio 집계(configJson 미포함).
 * GET `/api/admin/cmb/operations-studio`
 */
export async function GET() {
  try {
    await requireStaffOrPlatformAdminApi();
    const dashboard = assertCmbOperationsStudioDashboardMetaOnly(
      await getCmbOperationsStudioDashboard(),
    );
    return ok({ dashboard });
  } catch (error: unknown) {
    return handleAuthError(error) ?? toErrorResponse(error);
  }
}
