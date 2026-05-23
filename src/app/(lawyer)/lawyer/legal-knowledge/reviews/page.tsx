import Link from "next/link";
import { LegalKnowledgeLawyerBriefList } from "@/components/lawyer/legal-knowledge-lawyer-brief-list";
import { listLegalKnowledgeBriefsForLawyerReview } from "@/features/gongbuho/legal-knowledge-pipeline.service";
import { requireApprovedLawyer } from "@/lib/auth/session";

export default async function LawyerLegalKnowledgeReviewsPage() {
  await requireApprovedLawyer();
  const rows = await listLegalKnowledgeBriefsForLawyerReview();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-aibeop-text">공부호 Legal Knowledge 검수</h1>
          <p className="mt-2 text-sm leading-6 text-aibeop-muted">
            <code className="text-xs">READY_FOR_LAWYER_REVIEW</code> 상태의 Research Brief만 표시됩니다.
            승인 후 패킷 컴파일·APPROVED는 관리자가 수행합니다.
          </p>
        </div>
        <Link
          href="/lawyer"
          className="rounded-xl border border-aibeop-line bg-aibeop-surface px-4 py-2 text-sm font-semibold text-aibeop-deep hover:bg-aibeop-soft"
        >
          ← 변호사 홈
        </Link>
      </div>

      <LegalKnowledgeLawyerBriefList
        items={rows.map((r) => ({
          id: r.id,
          demandKeywordSnapshot: r.demandKeywordSnapshot,
          targetCaseType: r.targetCaseType,
          legalIssueOutline: r.legalIssueOutline,
          canonicalSourceRefs: r.canonicalSourceRefs,
          updatedAt: r.updatedAt.toISOString(),
        }))}
      />
    </div>
  );
}
