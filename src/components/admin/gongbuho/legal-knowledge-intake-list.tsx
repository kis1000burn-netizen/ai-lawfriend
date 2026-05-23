"use client";

import Link from "next/link";
import {
  legalKnowledgeIntakeStatusBadgeClass,
  readMappedCaseTypeFromIntake,
  readNormalizedKeywordFromIntake,
} from "@/features/gongbuho/admin-gongbuho-legal-knowledge-ui";

export type LegalKnowledgeIntakeListRow = {
  id: string;
  status: string;
  demandStrength: string;
  querySignature: unknown;
  caseTypeMapping: unknown;
  updatedAt: string;
};

type Props = {
  items: LegalKnowledgeIntakeListRow[];
};

export function LegalKnowledgeIntakeList({ items }: Readonly<Props>) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600">
        등록된 Legal Knowledge Intake가 없습니다. ADMIN은 API 또는 추후 등록 폼으로 Intake를
        추가할 수 있습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-[880px] w-full border-collapse text-left text-sm">
        <thead className="bg-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-600">
          <tr>
            <th className="border-b border-slate-200 px-3 py-3">상태</th>
            <th className="border-b border-slate-200 px-3 py-3">수요 키워드</th>
            <th className="border-b border-slate-200 px-3 py-3">caseType</th>
            <th className="border-b border-slate-200 px-3 py-3">수요 강도</th>
            <th className="border-b border-slate-200 px-3 py-3">수정</th>
            <th className="border-b border-slate-200 px-3 py-3"> </th>
          </tr>
        </thead>
        <tbody className="text-slate-800">
          {items.map((row) => (
            <tr
              key={row.id}
              className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/90"
            >
              <td className="px-3 py-2 align-middle">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${legalKnowledgeIntakeStatusBadgeClass(row.status)}`}
                >
                  {row.status}
                </span>
              </td>
              <td className="px-3 py-2">{readNormalizedKeywordFromIntake(row.querySignature)}</td>
              <td className="px-3 py-2 font-mono text-xs">
                {readMappedCaseTypeFromIntake(row.caseTypeMapping) ?? "—"}
              </td>
              <td className="px-3 py-2 text-xs">{row.demandStrength}</td>
              <td className="px-3 py-2 whitespace-nowrap text-xs text-slate-600">
                {new Date(row.updatedAt).toLocaleString("ko-KR")}
              </td>
              <td className="px-3 py-2 text-right">
                <Link
                  href={`/admin/gongbuho/legal-knowledge/intake/${row.id}`}
                  className="inline-flex rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 hover:bg-slate-100"
                >
                  상세
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
