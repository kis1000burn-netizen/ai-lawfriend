import Link from "next/link";
import { notFound } from "next/navigation";
import { LegalKnowledgeLawyerReviewPanel } from "@/components/lawyer/legal-knowledge-lawyer-review-panel";
import { getLegalKnowledgeBriefForLawyerReview } from "@/features/gongbuho/legal-knowledge-pipeline.service";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { requireApprovedLawyer } from "@/lib/auth/session";

type Props = {
  params: Promise<{ briefId: string }>;
};

export default async function LawyerLegalKnowledgeReviewDetailPage({ params }: Props) {
  await requireApprovedLawyer();
  const { briefId } = await params;

  let row;
  try {
    row = await getLegalKnowledgeBriefForLawyerReview(briefId);
  } catch (e) {
    if (e instanceof NotFoundError || e instanceof ValidationError) notFound();
    throw e;
  }

  return (
    <div className="space-y-6">
      <Link
        href="/lawyer/legal-knowledge/reviews"
        className="inline-flex rounded-xl border border-aibeop-line bg-aibeop-surface px-4 py-2 text-sm font-semibold text-aibeop-deep hover:bg-aibeop-soft"
      >
        ← 검수 대기 목록
      </Link>

      <LegalKnowledgeLawyerReviewPanel
        brief={{
          id: row.id,
          demandKeywordSnapshot: row.demandKeywordSnapshot,
          targetCaseType: row.targetCaseType,
          legalIssueOutline: row.legalIssueOutline,
          canonicalSourceRefs: row.canonicalSourceRefs,
          status: row.status,
        }}
      />
    </div>
  );
}
