"use client";

type Props = {
  summary: {
    includedParagraphCount: number;
    lockedParagraphCount: number;
    paragraphCount: number;
    recentRewriteCount: number;
    approvalLocked: boolean;
  };
};

export default function DocumentApprovalReviewPanel({ summary }: Props) {
  const checklist = [
    {
      label: "포함 문단 수 확인",
      value: `${summary.includedParagraphCount}개`,
    },
    {
      label: "잠금 문단 수 확인",
      value: `${summary.lockedParagraphCount}개`,
    },
    {
      label: "최근 재생성 이력 확인",
      value: `${summary.recentRewriteCount}건`,
    },
    {
      label: "승인 잠금 여부",
      value: summary.approvalLocked ? "잠금됨" : "잠금 아님",
    },
  ];

  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">승인 전 검토 패널</h3>
        <span
          className={`rounded-full px-3 py-1 text-xs ${
            summary.approvalLocked
              ? "bg-red-100 text-red-700"
              : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {summary.approvalLocked ? "승인 잠금 상태" : "검토 가능"}
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {checklist.map((item) => (
          <div key={item.label} className="rounded-xl border bg-neutral-50 p-3">
            <div className="text-xs text-aibeop-subtle">{item.label}</div>
            <div className="mt-1 font-medium">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-dashed bg-neutral-50 p-4">
        <h4 className="mb-2 text-sm font-medium">승인 전 체크리스트</h4>
        <ul className="space-y-2 text-sm text-aibeop-subtle">
          <li>• 최종 포함 문단이 실제 제출 문서 목적과 일치하는지 확인</li>
          <li>• 최근 AI 재생성된 문단의 diff를 검토했는지 확인</li>
          <li>• 사람이 수정한 핵심 문단은 잠금 처리 여부를 확인</li>
          <li>• 승인 후에는 승인 잠금 버전 기준으로 출력됨을 확인</li>
        </ul>
      </div>
    </section>
  );
}
