import Link from "next/link";
import { redirectLawyerToVerificationUnlessApproved } from "@/lib/auth/session";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { listCasesService } from "@/features/cases/case.service";
import {
  formatDate,
  isSupplementHubCaseStatus,
  statusLabel,
  supplementHubHref,
  supplementHubLinkTitle,
} from "@/features/cases/case.utils";
import { prismaRoleToUiRole } from "@/lib/role-map";

type CasesPageProps = {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
    status?: "CREATED" | "IN_INTERVIEW" | "CLOSED" | "ALL";
  }>;
};

export default async function CasesPage({ searchParams }: CasesPageProps) {
  const currentUser = await requireSessionUser();
  await redirectLawyerToVerificationUnlessApproved(currentUser);
  const resolved = await searchParams;

  const page = Number(resolved.page ?? 1);
  const pageSize = Number(resolved.pageSize ?? 10);
  const search = resolved.search ?? "";
  const status = resolved.status ?? "ALL";

  const result = await listCasesService(currentUser, {
    page,
    pageSize,
    search,
    status,
  });

  const uiRole = prismaRoleToUiRole(currentUser.role);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-aibeop-subtle">사건 관리</p>
          <h1 className="text-3xl font-bold text-aibeop-text">내 사건 목록</h1>
        </div>

        <Link
          href="/cases/new"
          className="aibeop-btn-primary"
        >
          새 사건 등록
        </Link>
      </div>

      <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs leading-relaxed text-aibeop-muted">
        <p>
          「{statusLabel("INTAKE_PENDING")}」·「{statusLabel("REVIEW_PENDING")}」 사건은 목록에서{" "}
          <span className="font-medium text-aibeop-subtle">보완 안내</span>를 눌러{" "}
          <span className="whitespace-nowrap">/cases/[사건ID]/supplement</span> 요약으로 바로 갈 수
          있습니다. 사건 상세 상단 배너와 같은 허브이며, 접수·검토 단계에 맞는 섹션으로 스크롤됩니다.
          링크에 마우스를 올리면 역할별 다음 단계 힌트가 표시됩니다. 접수 보완은 수정·인터뷰·진행 액션,
          검토 대기는 사건 상세의 문서·문단 중심입니다.
        </p>
        {prismaRoleToUiRole(currentUser.role) === "CLIENT" ? (
          <p className="mt-2 text-aibeop-subtle">
            의뢰인: 검토 대기일 때는 담당 측 안내를 기다리며, 필요하면 사건 상세에서 문의·자료를 이어갈
            수 있습니다.
          </p>
        ) : (
          <p className="mt-2 text-aibeop-subtle">
            담당: 검토 대기 사건은 상세 화면에서 초안·문단을 바로 다루고, 의뢰인에게는 보완 안내 URL을
            공유해 단계를 맞출 수 있습니다.
          </p>
        )}
      </div>

      <form
        method="get"
        action="/cases"
        className="grid gap-4 rounded-2xl border bg-white p-4 shadow-sm md:grid-cols-[1fr_180px_120px]"
      >
        <input type="hidden" name="page" value="1" />
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="사건명 / 설명 / 상대방 검색"
          className="rounded-xl border px-4 py-3"
        />

        <select
          name="status"
          defaultValue={status}
          className="rounded-xl border px-4 py-3"
        >
          <option value="ALL">전체 상태</option>
          <option value="CREATED">접수</option>
          <option value="IN_INTERVIEW">진행중</option>
          <option value="CLOSED">종결</option>
        </select>

        <button
          type="submit"
          className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
        >
          검색
        </button>
      </form>

      <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        {result.items.length === 0 ? (
          <div className="p-10 text-center text-aibeop-subtle">
            <p>조건에 맞는 사건이 없습니다.</p>
            <p className="mt-3 text-xs text-aibeop-faint">
              목록 필터(접수·진행중·종결)에 따라 접수 보완·검토 대기 사건이 빠질 수 있습니다. 조건을
              바꾸거나 전체로 두면 보완 안내 열 링크가 보일 수 있습니다.
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y">
            <thead className="bg-slate-50">
              <tr className="text-left text-sm text-aibeop-muted">
                <th scope="col" className="px-4 py-3">
                  사건명
                </th>
                <th scope="col" className="px-4 py-3">
                  카테고리
                </th>
                <th scope="col" className="px-4 py-3">
                  상태
                </th>
                <th scope="col" className="px-4 py-3">
                  등록일
                </th>
                <th scope="col" className="px-4 py-3">
                  진단 카드
                </th>
                <th
                  scope="col"
                  className="px-4 py-3"
                  title="접수 보완·검토 대기만 /supplement 링크. 툴팁에 역할별 힌트"
                >
                  보완 안내
                </th>
              </tr>
            </thead>
            <tbody className="divide-y bg-white">
              {result.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3">
                    <Link
                      href={`/cases/${item.id}`}
                      className="font-medium text-aibeop-text underline"
                    >
                      {item.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-aibeop-muted">
                    {item.category ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-aibeop-subtle">
                    {statusLabel(item.status)}
                  </td>
                  <td className="px-4 py-3 text-aibeop-subtle">
                    {formatDate(item.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Link
                      href={`/cases/${item.id}/guidance`}
                      className="font-medium text-emerald-800 underline"
                    >
                      열기
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {isSupplementHubCaseStatus(item.status) ? (
                      <Link
                        href={supplementHubHref(item.id, item.status, uiRole)}
                        className="font-medium text-aibeop-subtle underline"
                        title={supplementHubLinkTitle(item.status, uiRole)}
                      >
                        보완 안내
                      </Link>
                    ) : (
                      <span className="text-aibeop-disabled" title="이 상태에서는 허브 링크 없음">
                        —
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <div className="flex items-center justify-between rounded-2xl border bg-white p-4 shadow-sm">
        <p className="text-sm text-aibeop-subtle">
          총 {result.pagination.total}건 / {result.pagination.page}페이지 /
          전체 {result.pagination.totalPages}페이지
        </p>

        <div className="flex items-center gap-2">
          <Link
            href={`/cases?page=${Math.max(1, result.pagination.page - 1)}&pageSize=${result.pagination.pageSize}&search=${encodeURIComponent(search)}&status=${status}`}
            className={`rounded-xl border px-4 py-2 text-sm ${
              result.pagination.page <= 1 ? "pointer-events-none opacity-40" : ""
            }`}
          >
            이전
          </Link>
          <Link
            href={`/cases?page=${Math.min(result.pagination.totalPages, result.pagination.page + 1)}&pageSize=${result.pagination.pageSize}&search=${encodeURIComponent(search)}&status=${status}`}
            className={`rounded-xl border px-4 py-2 text-sm ${
              result.pagination.page >= result.pagination.totalPages
                ? "pointer-events-none opacity-40"
                : ""
            }`}
          >
            다음
          </Link>
        </div>
      </div>
    </div>
  );
}
