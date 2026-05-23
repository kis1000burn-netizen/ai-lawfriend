import { requireStaffOrPlatformAdminApi } from "@/lib/auth/require-staff-or-platform-admin-api";
import { assertGongbuhoOperation } from "@/lib/gongbuho/gongbuho-permissions";
import {
  assertLegalKnowledgeIntelligenceDashboardMetaOnly,
  getLegalKnowledgeIntelligenceDashboard,
} from "@/features/gongbuho/legal-knowledge-intelligence.service";
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
 * Phase 4-I — Legal Knowledge Intelligence Dashboard 집계(메타만).
 * GET `/api/admin/gongbuho/legal-knowledge/dashboard`
 */
export async function GET() {
  try {
    const user = await requireStaffOrPlatformAdminApi();
    assertGongbuhoOperation(user, "LEGAL_KNOWLEDGE_READ");

    const dashboard = assertLegalKnowledgeIntelligenceDashboardMetaOnly(
      await getLegalKnowledgeIntelligenceDashboard(),
    );

    return ok({ dashboard });
  } catch (error: unknown) {
    return handleAuthError(error) ?? toErrorResponse(error);
  }
}
