import { DashboardActionCard } from "@/components/dashboard/dashboard-action-card";

type Props = {
  guidanceCaseHref?: string | null;
};

export function ClientNextActions({
  guidanceCaseHref = null,
}: Props) {
  const diagnosisHref =
    guidanceCaseHref && guidanceCaseHref.trim().length > 0
      ? guidanceCaseHref.trim()
      : "/cases";
  const diagnosisDesc = guidanceCaseHref
    ? "기관 안내·체크리스트·조사 힌트를 한 화면에서 확인합니다."
    : "사건 목록에서 사건을 고른 뒤, 상세 상단에서 사건 진단 카드를 여세요.";
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
      <DashboardActionCard
        label="Reference"
        title="사건 진단 카드"
        description={diagnosisDesc}
        href={diagnosisHref}
        ctaLabel="진단 카드 열기 →"
      />
      <DashboardActionCard
        label="Start"
        title="새 사건 정리하기"
        description="질문 흐름에 따라 사건의 기본 정보와 경위를 정리합니다."
        href="/cases/new"
        ctaLabel="새 사건 만들기 →"
      />
      <DashboardActionCard
        label="Continue"
        title="진행 중 사건 보기"
        description="이전에 입력한 사건과 인터뷰 진행 상태를 확인합니다."
        href="/cases"
        ctaLabel="사건 목록 열기 →"
      />
      <DashboardActionCard
        label="Files"
        title="첨부자료 정리하기"
        description="계약서, 문자, 사진 등 사건 관련 자료를 사건에 연결합니다."
        href="/cases"
        ctaLabel="자료 연결하기 →"
      />
      <DashboardActionCard
        label="Guide"
        title="이용 안내 보기"
        description="AI법친이 어떤 역할을 하고, 어떤 한계가 있는지 확인합니다."
        href="/guide"
        ctaLabel="안내 읽기 →"
      />
    </div>
  );
}
