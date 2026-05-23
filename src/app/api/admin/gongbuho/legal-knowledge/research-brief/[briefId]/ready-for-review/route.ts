import { requireStaffOrPlatformAdminApi } from "@/lib/auth/require-staff-or-platform-admin-api";
import { assertGongbuhoOperation } from "@/lib/gongbuho/gongbuho-permissions";
import { ok, fail, toErrorResponse } from "@/lib/domain-api-response";
import { markLegalKnowledgeResearchBriefReadyForReview } from "@/features/gongbuho/legal-knowledge-pipeline.service";
import { writeGongbuhoAuditLog } from "@/lib/gongbuho/gongbuho-audit-log";
import type { CanonicalSourceRefInput } from "@/lib/gongbuho/legal-knowledge-pipeline-gates";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ briefId: string }> };

export async function POST(_req: Request, { params }: Params) {
  try {
    const user = await requireStaffOrPlatformAdminApi();
    assertGongbuhoOperation(user, "LEGAL_KNOWLEDGE_WRITE");
    const { briefId } = await params;
    const brief = await markLegalKnowledgeResearchBriefReadyForReview(
      briefId,
      user.id,
    );
    const refs = brief.canonicalSourceRefs as CanonicalSourceRefInput[];
    await writeGongbuhoAuditLog({
      actorUserId: user.id,
      event: "GONGBUHO_LEGAL_KNOWLEDGE_RESEARCH_BRIEF_READY",
      entityType: "LEGAL_KNOWLEDGE_RESEARCH_BRIEF",
      entityId: brief.id,
      metadata: {
        intakeId: brief.intakeId,
        citationKeys: refs.map((r) => r.citationKey),
        role: user.role,
      },
    });
    return ok({ brief });
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
