/* [FILE-027] 문서 상세·`case.status` 는 서버 `getDocumentDetail` DTO; 사건 상태·전이는 `PATCH/POST` `/api/cases/.../status`·`transition` 축(Batch A). */
import { notFound, redirect } from "next/navigation";
import { redirectLawyerToVerificationUnlessApproved } from "@/lib/auth/session";
import { getSessionUser } from "@/lib/get-session-user";
import { documentDetailService } from "@/features/documents/document-detail.service";
import DocumentDetailClient from "@/components/cases/document-detail-client";
import DocumentParagraphEditorPanel from "@/components/cases/document-paragraph-editor-panel";
import DocumentParagraphPanel from "@/components/cases/document-paragraph-panel";
import DocumentParagraphVersionPanel from "@/components/cases/document-paragraph-version-panel";

type PageProps = {
  params: Promise<{
    documentId: string;
  }>;
};

export default async function DocumentDetailPage({ params }: PageProps) {
  const { documentId } = await params;
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect("/login");
  }

  await redirectLawyerToVerificationUnlessApproved(sessionUser);

  try {
    const document = await documentDetailService.getDocumentDetail(
      documentId,
      sessionUser,
    );
    const generationTrace =
      "generationTrace" in document ? document.generationTrace : null;

    return (
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div>
            <DocumentDetailClient
              initialDocument={{
                id: document.id ?? documentId,
                caseId: document.caseId ?? null,
                title: document.title ?? "",
                content: document.content ?? "",
                type: document.type ?? "GENERAL",
                status: document.status ?? "DRAFT",
                updatedAt: document.updatedAt
                  ? new Date(
                      document.updatedAt as string | number | Date,
                    ).toISOString()
                  : null,
                reviewComment: document.reviewComment,
                case: document.case
                  ? {
                      id: document.case.id,
                      title: document.case.title,
                      status: document.case.status,
                    }
                  : null,
                generationTrace: generationTrace
                  ? {
                      templateCode: generationTrace.templateCode,
                      templateVersion: generationTrace.templateVersion,
                      templateTitle: generationTrace.templateTitle,
                      sourceProvider: generationTrace.sourceProvider,
                      sourceName: generationTrace.sourceName,
                      sourceUrl: generationTrace.sourceUrl,
                      sourceHash: generationTrace.sourceHash,
                      sourceStatus: generationTrace.sourceStatus,
                      sourceNote: generationTrace.sourceNote,
                      generatedSnapshotAt: generationTrace.generatedSnapshotAt
                        ? new Date(
                            generationTrace.generatedSnapshotAt as
                              | string
                              | number
                              | Date,
                          ).toISOString()
                        : null,
                      approvedSnapshotAt: generationTrace.approvedSnapshotAt
                        ? new Date(
                            generationTrace.approvedSnapshotAt as
                              | string
                              | number
                              | Date,
                          ).toISOString()
                        : null,
                    }
                  : null,
              }}
              sessionUser={{
                id: sessionUser.id,
                role: sessionUser.role ?? null,
              }}
            />
          </div>

          <div className="space-y-6">
            <DocumentParagraphPanel documentId={documentId} />
            <DocumentParagraphVersionPanel documentId={documentId} />
          </div>
        </div>

        <DocumentParagraphEditorPanel documentId={documentId} />
      </div>
    );
  } catch (error) {
    const status =
      typeof error === "object" && error !== null
        ? "statusCode" in error &&
            typeof (error as { statusCode?: unknown }).statusCode === "number"
          ? (error as { statusCode: number }).statusCode
          : "status" in error &&
              typeof (error as { status?: unknown }).status === "number"
            ? (error as { status: number }).status
            : undefined
        : undefined;
    if (status === 404) {
      notFound();
    }
    if (status === 403) {
      redirect("/dashboard");
    }

    throw error;
  }
}
