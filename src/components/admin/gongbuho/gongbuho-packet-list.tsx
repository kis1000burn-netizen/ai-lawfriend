import Link from "next/link";
import { gongbuhoPacketStatusBadgeClass } from "@/features/gongbuho/admin-gongbuho-ui-model";

export type GongbuhoPacketAdminListRow = {
  id: string;
  code: string;
  version: string;
  name: string;
  domain: string;
  caseType: string | null;
  status: string;
  createdAt: string;
  approvedAt: string | null;
};

type GongbuhoPacketListProps = {
  items: GongbuhoPacketAdminListRow[];
};

export function GongbuhoPacketList({ items }: Readonly<GongbuhoPacketListProps>) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600">
        등록된 공부호 패킷이 없습니다. POST 시드 또는 관리자 API를 통해 패킷을 추가할 수 있습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-[960px] w-full border-collapse text-left text-sm">
        <thead className="bg-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-600">
          <tr>
            <th className="border-b border-slate-200 px-3 py-3">상태</th>
            <th className="border-b border-slate-200 px-3 py-3">code</th>
            <th className="border-b border-slate-200 px-3 py-3">version</th>
            <th className="border-b border-slate-200 px-3 py-3">name</th>
            <th className="border-b border-slate-200 px-3 py-3">domain</th>
            <th className="border-b border-slate-200 px-3 py-3">caseType</th>
            <th className="border-b border-slate-200 px-3 py-3">createdAt</th>
            <th className="border-b border-slate-200 px-3 py-3">approvedAt</th>
            <th className="border-b border-slate-200 px-3 py-3"> </th>
          </tr>
        </thead>
        <tbody className="text-slate-800">
          {items.map((row) => (
            <tr key={row.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/90">
              <td className="px-3 py-2 align-middle">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${gongbuhoPacketStatusBadgeClass(row.status)}`}
                >
                  {row.status}
                </span>
              </td>
              <td className="px-3 py-2 font-mono text-xs">{row.code}</td>
              <td className="px-3 py-2 font-mono text-xs">{row.version}</td>
              <td className="px-3 py-2">{row.name}</td>
              <td className="px-3 py-2 text-slate-600">{row.domain}</td>
              <td className="px-3 py-2 font-mono text-xs text-slate-600">
                {row.caseType ?? "—"}
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-xs text-slate-600">
                {new Date(row.createdAt).toLocaleString("ko-KR")}
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-xs text-slate-600">
                {row.approvedAt ? new Date(row.approvedAt).toLocaleString("ko-KR") : "—"}
              </td>
              <td className="px-3 py-2 text-right">
                <Link
                  href={`/admin/gongbuho/${row.id}`}
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
