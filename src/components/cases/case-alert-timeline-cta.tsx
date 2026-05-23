import Link from "next/link";
import { buildCaseTimelineHref } from "@/lib/alerts/case-links";

type Props = {
  caseId: string;
  latestOpenAlertId?: string | null;
};

export function CaseAlertTimelineCta({ caseId, latestOpenAlertId }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm font-semibold text-aibeop-text">경고와 사건 타임라인 연결</div>
          <div className="mt-1 text-sm text-aibeop-muted">
            현재 경고에 대한 후속 조치나 메모를 사건 타임라인에 남겨 운영 흐름을 이어갈 수 있습니다.
          </div>
        </div>

        <Link
          href={buildCaseTimelineHref(caseId, latestOpenAlertId)}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          타임라인 메모로 이동
        </Link>
      </div>
    </div>
  );
}
