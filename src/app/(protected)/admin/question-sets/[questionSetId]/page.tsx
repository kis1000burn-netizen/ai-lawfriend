import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/get-session-user";
import { assertPermission, permissionContextFromSession } from "@/lib/authz";
import { QuestionSetEditor } from "@/components/admin/question-set-editor";

function parseJsonStringArray(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.filter((x): x is string => typeof x === "string");
  }
  return [];
}

export default async function AdminQuestionSetDetailPage({
  params,
}: {
  params: Promise<{ questionSetId: string }>;
}) {
  const { questionSetId } = await params;
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect("/login");
  }

  assertPermission("questionSet.read", permissionContextFromSession(sessionUser, {}));

  const item = await prisma.questionSet.findUnique({
    where: { id: questionSetId },
  });

  if (!item) {
    notFound();
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap gap-2 text-sm">
        <Link href="/admin/question-sets" className="text-aibeop-muted underline hover:text-aibeop-text">
          ← 질문셋 목록
        </Link>
      </div>

      <QuestionSetEditor
        item={{
          id: item.id,
          code: item.code ?? "",
          version: item.version,
          title: item.name,
          description: item.description,
          catalogStatus: item.catalogStatus,
          supportedDocumentTypes: parseJsonStringArray(item.supportedDocumentTypes),
          visibleToRoles: parseJsonStringArray(item.visibleToRoles),
          definitionJson: item.definitionJson,
          publishedAt: item.publishedAt?.toISOString() ?? null,
          archivedAt: item.archivedAt?.toISOString() ?? null,
          updatedAt: item.updatedAt.toISOString(),
        }}
      />
    </div>
  );
}
