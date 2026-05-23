import { requireStaffOrPlatformAdminApi } from "@/lib/auth/require-staff-or-platform-admin-api";
import { assertGongbuhoOperation } from "@/lib/gongbuho/gongbuho-permissions";
import { ok, toErrorResponse, fail } from "@/lib/domain-api-response";
import { getLegalKnowledgeIntake } from "@/features/gongbuho/legal-knowledge-pipeline.service";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ intakeId: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const user = await requireStaffOrPlatformAdminApi();
    assertGongbuhoOperation(user, "LEGAL_KNOWLEDGE_READ");
    const { intakeId } = await params;
    const intake = await getLegalKnowledgeIntake(intakeId);
    return ok({ intake });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    if (err.status === 401 || err.status === 403) {
      return fail(err.message, err.status, {
        code: err.status === 401 ? "UNAUTHORIZED" : "FORBIDDEN",
      });
    }
    return toErrorResponse(error);
  }
}
