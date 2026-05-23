import type { GongbuhoPacketStatus } from "@prisma/client";
import Link from "next/link";
import { GongbuhoPacketList } from "@/components/admin/gongbuho/gongbuho-packet-list";
import { GongbuhoPacketListFilters } from "@/components/admin/gongbuho/gongbuho-packet-list-filters";
import { requireStaffOrPlatformAdminPage } from "@/lib/auth/require-staff-or-platform-admin-page";
import { listGongbuhoPacketsForAdmin } from "@/features/gongbuho/gongbuho-packet.service";
import { adminListGongbuhoPacketsQuerySchema } from "@/lib/validators/gongbuho";

type PageProps = {
  searchParams?: Promise<
    Partial<Record<string, string | string[] | undefined>>
  >;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function AdminGongbuhoPacketsPage({ searchParams }: PageProps) {
  await requireStaffOrPlatformAdminPage();

  const sp = searchParams ? await searchParams : {};
  const queryParsed = adminListGongbuhoPacketsQuerySchema.safeParse({
    status: firstParam(sp.status),
    caseType: firstParam(sp.caseType)?.trim() || undefined,
    code: firstParam(sp.code)?.trim() || undefined,
  });

  const filters = queryParsed.success ? queryParsed.data : {};

  const rows = await listGongbuhoPacketsForAdmin(filters);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">공부호 패킷</h1>
        <p className="mt-1 text-sm text-slate-600">
          운영(STAFF) 및 플랫폼 관리자가 GongbuhoPacket 목록을 조회합니다. packetJson 은 상세에서만
          표시합니다. Legal Knowledge 파이프라인 Intake·Brief는{" "}
          <Link
            href="/admin/gongbuho/legal-knowledge"
            className="font-medium text-slate-900 underline"
          >
            Legal Knowledge
          </Link>{" "}
          메뉴에서 운영합니다.
        </p>
      </div>

      <GongbuhoPacketListFilters
        currentStatus={
          filters.status ? (filters.status as GongbuhoPacketStatus) : ""
        }
        currentCaseType={filters.caseType ?? ""}
        currentCode={filters.code ?? ""}
      />

      <GongbuhoPacketList
        items={rows.map((r) => ({
          id: r.id,
          code: r.code,
          version: r.version,
          name: r.name,
          domain: r.domain,
          caseType: r.caseType ?? null,
          status: r.status,
          createdAt: r.createdAt.toISOString(),
          approvedAt: r.approvedAt?.toISOString() ?? null,
        }))}
      />
    </div>
  );
}
