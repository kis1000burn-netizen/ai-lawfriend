import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{
    caseId: string;
    documentId: string;
  }>;
};

/** 이전 경로 호환: 문서 상세는 `/documents/[documentId]` 로 통일 */
export default async function CaseDocumentDraftDetailRedirect({ params }: PageProps) {
  const { documentId } = await params;
  redirect(`/documents/${documentId}`);
}
