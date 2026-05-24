import Link from "next/link";
import {
  countCanonicalSourceRefs,
  legalKnowledgeBriefStatusBadgeClass,
} from "@/features/gongbuho/admin-gongbuho-legal-knowledge-ui";

export type LegalKnowledgeLawyerBriefListRow = {
  id: string;
  demandKeywordSnapshot: string;
  targetCaseType: string;
  legalIssueOutline: string;
  canonicalSourceRefs: unknown;
  updatedAt: string;
};

type Props = {
  items: LegalKnowledgeLawyerBriefListRow[];
};

export function LegalKnowledgeLawyerBriefList({ items }: Readonly<Props>) {
  if (items.length === 0) {
    return (
      <div
        data-testid="legal-knowledge-lawyer-empty"
        className="rounded-xl border border-dashed border-aibeop-line bg-aibeop-card p-8 text-center text-sm text-aibeop-muted"
      >
        현재 변호사 검수 대기(READY_FOR_LAWYER_REVIEW) Brief가 없습니다.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-aibeop-line rounded-2xl border border-aibeop-line bg-aibeop-card shadow-soft">
      {items.map((row) => (
        <li key={row.id} className="flex flex-wrap items-start justify-between gap-4 px-5 py-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${legalKnowledgeBriefStatusBadgeClass("READY_FOR_LAWYER_REVIEW")}`}
              >
                READY_FOR_LAWYER_REVIEW
              </span>
              <span className="font-mono text-xs text-aibeop-muted">{row.targetCaseType}</span>
            </div>
            <p className="mt-2 font-medium text-aibeop-text">{row.demandKeywordSnapshot}</p>
            <p className="mt-1 line-clamp-2 text-sm text-aibeop-muted">{row.legalIssueOutline}</p>
            <p className="mt-2 text-xs text-aibeop-muted">
              canonicalSourceRefs: {countCanonicalSourceRefs(row.canonicalSourceRefs)}건 ·{" "}
              {new Date(row.updatedAt).toLocaleString("ko-KR")}
            </p>
          </div>
          <Link
            href={`/lawyer/legal-knowledge/reviews/${row.id}`}
            data-testid={`legal-knowledge-lawyer-brief-${row.id}`}
            className="shrink-0 rounded-xl border border-aibeop-line bg-aibeop-surface px-4 py-2 text-sm font-semibold text-aibeop-deep hover:bg-aibeop-soft"
          >
            검수
          </Link>
        </li>
      ))}
    </ul>
  );
}
