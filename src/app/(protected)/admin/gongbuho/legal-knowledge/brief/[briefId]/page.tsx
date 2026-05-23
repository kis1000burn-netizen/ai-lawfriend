import Link from "next/link";
import { notFound } from "next/navigation";
import { LegalKnowledgeBriefReviewPanel } from "@/components/admin/gongbuho/legal-knowledge-brief-review-panel";
import { deriveLegalKnowledgeAdminCapabilities } from "@/features/gongbuho/admin-gongbuho-legal-knowledge-ui";
import { getLegalKnowledgeResearchBrief } from "@/features/gongbuho/legal-knowledge-pipeline.service";
import { NotFoundError } from "@/lib/errors";
import { requireStaffOrPlatformAdminPage } from "@/lib/auth/require-staff-or-platform-admin-page";

type Props = {
  params: Promise<{ briefId: string }>;
};

export default async function AdminLegalKnowledgeBriefDetailPage({ params }: Props) {
  const sessionUser = await requireStaffOrPlatformAdminPage();
  const caps = deriveLegalKnowledgeAdminCapabilities({ role: sessionUser.role });
  const { briefId } = await params;

  let row;
  try {
    row = await getLegalKnowledgeResearchBrief(briefId);
  } catch (e) {
    if (e instanceof NotFoundError) notFound();
    throw e;
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/admin/gongbuho/legal-knowledge/intake/${row.intakeId}`}
        className="inline-flex rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
      >
        ← Intake 상세
      </Link>

      <LegalKnowledgeBriefReviewPanel
        brief={{
          id: row.id,
          intakeId: row.intakeId,
          status: row.status,
          demandKeywordSnapshot: row.demandKeywordSnapshot,
          targetCaseType: row.targetCaseType,
          legalIssueOutline: row.legalIssueOutline,
          canonicalSourceRefs: row.canonicalSourceRefs,
          structureHints: row.structureHints,
          researchCompliance: row.researchCompliance,
        }}
        intakeStatus={row.intake.status}
        reviews={row.lawyerReviews.map((r) => ({
          id: r.id,
          decision: r.decision,
          status: r.status,
          gongbuhoPacketId: r.gongbuhoPacketId,
          createdAt: r.createdAt.toISOString(),
        }))}
        viewerCanWriteBrief={caps.canWriteIntakeOrBrief}
        viewerCanRecordLawyerReview={caps.canRecordLawyerReview}
        viewerCanCompile={caps.canCompilePacketDraft}
        staffReadOnlyBanner={caps.staffReadOnlyBanner}
      />
    </div>
  );
}
