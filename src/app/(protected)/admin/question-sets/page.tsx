import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/get-session-user";
import { assertPermission, permissionContextFromSession } from "@/lib/authz";
import { hasPermission } from "@/lib/definitions";
import { prismaRoleToDefinitionRole } from "@/lib/role-map";
import { QuestionSetListClient } from "@/components/admin/question-set-list-client";

export default async function AdminQuestionSetsPage() {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect("/login");
  }

  assertPermission("questionSet.read", permissionContextFromSession(sessionUser, {}));

  const role = prismaRoleToDefinitionRole(sessionUser.role);
  const canCreate = hasPermission(role, "questionSet.create");

  const items = await prisma.questionSet.findMany({
    orderBy: [{ updatedAt: "desc" }],
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">질문셋 관리자</h1>
          <p className="mt-1 text-sm text-aibeop-subtle">
            섹션·질문·분기·매핑 규칙을 담은 질문셋 정의를 관리합니다. (QUESTION_SET_DEFINITION 기준
            구조체, 게시/보관은 카탈로그 상태로 반영)
          </p>
        </div>

        {canCreate ? (
          <Link
            href="/admin/question-sets/new"
            className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white"
          >
            질문셋 생성
          </Link>
        ) : null}
      </div>

      <QuestionSetListClient
        canCreate={canCreate}
        items={items.map((item) => ({
          id: item.id,
          code: item.code,
          version: item.version,
          title: item.name,
          status: item.catalogStatus,
          publishedAt: item.publishedAt?.toISOString() ?? null,
          archivedAt: item.archivedAt?.toISOString() ?? null,
          updatedAt: item.updatedAt.toISOString(),
        }))}
      />
    </div>
  );
}
