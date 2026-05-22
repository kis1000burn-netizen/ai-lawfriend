import { redirect } from "next/navigation";
import { documentExportService } from "@/features/document-exports/document-export.service";
import {
  getSessionUser,
  redirectLawyerToVerificationUnlessApproved,
} from "@/lib/auth/session";

type PageProps = {
  params: Promise<{
    documentId: string;
  }>;
};

export default async function DocumentPrintPage({ params }: PageProps) {
  const { documentId } = await params;
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect("/login");
  }

  await redirectLawyerToVerificationUnlessApproved(sessionUser);

  const result = await documentExportService.getApprovedPrintableDocument(
    documentId,
    sessionUser,
  );

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="mx-auto mb-4 flex max-w-5xl flex-wrap gap-2">
        <a
          href={`/api/documents/${documentId}/print`}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
        >
          새 창 인쇄용 HTML 열기
        </a>
        <a
          href={`/api/documents/${documentId}/pdf`}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          승인본 PDF 다운로드
        </a>
        <a
          href={`/documents/${documentId}`}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
        >
          문서 상세로 돌아가기
        </a>
      </div>

      <div className="mx-auto mb-4 max-w-5xl rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="text-sm font-semibold text-neutral-900">승인본 출력 안내</div>
        <p className="mt-1 text-sm text-neutral-600">
          이 출력 미리보기는 현재 편집본이 아니라 승인 잠금 버전을 기준으로 렌더링됩니다. 법인 헤더,
          사건번호, 워터마크, 서명란이 포함된 대외 제출형 양식입니다.
        </p>
      </div>

      <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <iframe
          title="approved-print-preview"
          srcDoc={result.printableHtml}
          className="h-[1200px] w-full border-0"
        />
      </div>
    </div>
  );
}
