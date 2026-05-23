import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/get-session-user";
import { assertPermission, permissionContextFromSession } from "@/lib/authz";
import {
  formatLegalFormSourceLabel,
  LEGAL_FORM_SOURCE_PROVIDER_LABELS,
} from "@/lib/legal-form-source";

function getStatusClassName(status: "ACTIVE" | "INACTIVE" | "ARCHIVED") {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-100 text-emerald-700";
    case "INACTIVE":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-gray-200 text-aibeop-subtle";
  }
}

function getStatusLabel(status: "ACTIVE" | "INACTIVE" | "ARCHIVED") {
  switch (status) {
    case "ACTIVE":
      return "활성";
    case "INACTIVE":
      return "비활성";
    default:
      return "보관";
  }
}

export default async function AdminLegalFormSourcesPage() {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect("/login");
  }

  assertPermission("legalFormSource.read", permissionContextFromSession(sessionUser, {}));

  const items = await prisma.legalFormSource.findMany({
    orderBy: [{ status: "asc" }, { provider: "asc" }, { sourceName: "asc" }],
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">공식서식 소스 관리자</h1>
          <p className="mt-1 text-sm text-aibeop-subtle">
            공식기관 서식 원천자료의 출처, 문서유형, 상태, 해시를 관리합니다.
          </p>
        </div>

        <Link
          href="/admin/legal-form-sources/new"
          className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white"
        >
          소스 등록
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-aibeop-muted">
        <Link href="/admin/document-templates" className="underline hover:text-aibeop-text">
          문서 템플릿 관리자
        </Link>
        <span className="text-gray-300" aria-hidden>
          |
        </span>
        <Link href="/admin/question-sets" className="underline hover:text-aibeop-text">
          인터뷰 질문셋 관리
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-aibeop-subtle">
            <tr>
              <th className="px-4 py-3">상태</th>
              <th className="px-4 py-3">서식</th>
              <th className="px-4 py-3">출처군</th>
              <th className="px-4 py-3">문서유형</th>
              <th className="px-4 py-3">해시</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => {
              const statusClassName = getStatusClassName(item.status);
              const statusLabel = getStatusLabel(item.status);

              return <tr key={item.id}>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClassName}`}
                  >
                    {statusLabel}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-aibeop-text">
                    {formatLegalFormSourceLabel(item)}
                  </div>
                  <div className="mt-1 text-xs text-aibeop-subtle">{item.sourceUrl}</div>
                </td>
                <td className="px-4 py-3 text-aibeop-subtle">
                  {LEGAL_FORM_SOURCE_PROVIDER_LABELS[item.provider]}
                </td>
                <td className="px-4 py-3 text-aibeop-subtle">
                  {item.documentType}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-aibeop-muted">
                  {item.fileHash ?? "-"}
                </td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}