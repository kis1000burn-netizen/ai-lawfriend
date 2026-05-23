import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/get-session-user";
import { assertPermission, permissionContextFromSession } from "@/lib/authz";
import { hasPermission } from "@/lib/definitions";
import { prismaRoleToDefinitionRole } from "@/lib/role-map";
import { DocumentTemplateListClient } from "@/components/admin/document-template-list-client";
import type { QuestionSetStatus } from "@/lib/definitions";

const PAGE_SIZE = 20;

function parseListPage(raw: string | undefined): number {
  const n = Number.parseInt(raw ?? "1", 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

export default async function AdminDocumentTemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ catalog?: string; page?: string }>;
}) {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect("/login");
  }

  assertPermission("documentTemplate.read", permissionContextFromSession(sessionUser, {}));

  const role = prismaRoleToDefinitionRole(sessionUser.role);
  const canCreate = hasPermission(role, "documentTemplate.create");

  const resolvedSearch = await searchParams;
  const rawCatalog = resolvedSearch.catalog?.trim().toUpperCase();
  const catalogWhere: QuestionSetStatus | undefined =
    rawCatalog === "DRAFT" || rawCatalog === "PUBLISHED" || rawCatalog === "ARCHIVED"
      ? rawCatalog
      : undefined;

  const where = catalogWhere ? { catalogStatus: catalogWhere } : {};

  let page = parseListPage(resolvedSearch.page);
  const total = await prisma.documentTemplate.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (page > totalPages) page = totalPages;

  const items = await prisma.documentTemplate.findMany({
    where,
    orderBy: [{ updatedAt: "desc" }],
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">문서 템플릿 관리자</h1>
          <p className="mt-1 text-sm text-aibeop-subtle">
            섹션·문단·생성 규칙을 담은 템플릿 정의를 관리합니다.{" "}
            <strong className="font-medium text-aibeop-subtle">초안</strong> 편집 후{" "}
            <strong className="font-medium text-aibeop-subtle">게시</strong>하면 사건 문서 생성 시
            선택되고, <strong className="font-medium text-aibeop-subtle">보관</strong>하면 목록·편집
            화면에서 읽기만 가능하며 사건 생성에도 나타나지 않습니다.{" "}
            <span className="text-aibeop-muted">
              <strong className="font-medium text-aibeop-subtle">템플릿 생성</strong> 화면과{" "}
              <strong className="font-medium text-aibeop-subtle">편집</strong> 화면 모두 같은 카탈로그
              용어·게시 전 운영 안내를 씁니다.
            </span>
          </p>
          <p className="mt-2 text-xs leading-relaxed text-aibeop-subtle">
            카탈로그 상태(초안·게시됨·보관됨) 라벨은{" "}
            <Link href="/admin/question-sets" className="font-medium text-aibeop-subtle underline">
              인터뷰 질문셋 관리
            </Link>
            화면의 상태 열과 <strong className="font-medium text-aibeop-muted">같은 한글 라벨</strong>을
            씁니다. 목록은 <strong className="font-medium text-aibeop-muted">수정일 최신 순</strong>이며, 한 페이지에{" "}
            <strong className="font-medium text-aibeop-muted">{PAGE_SIZE}건</strong>까지 표시합니다. 주소의{" "}
            <span className="whitespace-nowrap font-mono text-[0.7rem]">?catalog=</span>
            (DRAFT·PUBLISHED·ARCHIVED)는 저장소에 저장된 <strong className="font-medium text-aibeop-muted">catalogStatus</strong>
            와 같은 값만 목록에 나오게 하는 필터입니다.{" "}
            <span className="whitespace-nowrap font-mono text-[0.7rem]">?page=</span>는 같은 필터 안에서
            다음·이전 묶음으로 넘길 때 쓰며, 칩을 바꾸면 1페이지로 돌아갑니다. 편집기에서 게시·보관 후 돌아오면 아래
            칩으로 같은 상태만 모아 확인할 수 있습니다.
          </p>
          <p className="mt-1 text-xs leading-relaxed text-amber-900/90">
            <strong className="font-semibold">게시 운영</strong> — 서버는 게시 시{" "}
            <strong className="font-semibold">마지막 저장분</strong> 정의 JSON 스키마와{" "}
            <strong className="font-semibold">섹션 ≥1·문단 합계 ≥1</strong>만 검사합니다. 조건을
            맞춘 뒤에도 실패하면 편집기에서 「저장」 여부를 먼저 확인하세요. 그 외 문단 내용·필수
            플래그 등은 이 단계에서 막지 않습니다.
          </p>
          <p className="mt-1 text-xs text-aibeop-subtle">
            다른 관리 화면:{" "}
            <Link href="/admin" className="font-medium text-aibeop-subtle underline">
              관리자 콘솔
            </Link>
          </p>
        </div>

        {canCreate ? (
          <Link
            href="/admin/document-templates/new"
            className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white"
            title="초안 레코드 생성 후 편집기로 이동합니다"
          >
            템플릿 생성
          </Link>
        ) : null}
      </div>

      <DocumentTemplateListClient
        canCreate={canCreate}
        catalogQuery={catalogWhere ?? null}
        pagination={{
          page,
          pageSize: PAGE_SIZE,
          total,
          totalPages,
        }}
        items={items.map((item) => ({
          id: item.id,
          code: item.code,
          version: item.version,
          type: item.type,
          title: item.title,
          catalogStatus: item.catalogStatus,
          updatedAt: item.updatedAt.toISOString(),
        }))}
      />
    </div>
  );
}
