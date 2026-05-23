type CaseStatusCardProps = {
  caseTitle: string;
  caseDescription: string | null;
  caseStatus: string;
  interviewStatus: string;
  documentStatus: string;
  createdAt: string;
  updatedAt: string;
  facts: {
    interviewCompleted: boolean;
    hasDraftDocument: boolean;
    hasApprovedDocument: boolean;
    hasLockedDocument: boolean;
  };
};

function FactBadge({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        active ? "bg-black text-white" : "bg-gray-100 text-aibeop-subtle"
      }`}
    >
      {label}
    </span>
  );
}

export function CaseStatusCard(props: CaseStatusCardProps) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-xl font-semibold">{props.caseTitle}</h1>
          <p className="mt-2 text-sm text-aibeop-muted">
            {props.caseDescription || "사건 설명이 없습니다."}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
          <div className="rounded-xl border bg-gray-50 p-3">
            <div className="text-xs text-aibeop-subtle">사건 상태</div>
            <div className="mt-1 font-semibold">{props.caseStatus}</div>
          </div>
          <div className="rounded-xl border bg-gray-50 p-3">
            <div className="text-xs text-aibeop-subtle">인터뷰 상태</div>
            <div className="mt-1 font-semibold">{props.interviewStatus}</div>
          </div>
          <div className="rounded-xl border bg-gray-50 p-3">
            <div className="text-xs text-aibeop-subtle">문서 상태</div>
            <div className="mt-1 font-semibold">{props.documentStatus}</div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <FactBadge label="인터뷰 완료" active={props.facts.interviewCompleted} />
        <FactBadge label="초안 문서 있음" active={props.facts.hasDraftDocument} />
        <FactBadge label="승인 문서 있음" active={props.facts.hasApprovedDocument} />
        <FactBadge label="잠금 문서 있음" active={props.facts.hasLockedDocument} />
      </div>

      <div className="mt-4 grid gap-2 text-xs text-aibeop-subtle sm:grid-cols-2">
        <div>생성일: {new Date(props.createdAt).toLocaleString()}</div>
        <div>수정일: {new Date(props.updatedAt).toLocaleString()}</div>
      </div>
    </div>
  );
}
