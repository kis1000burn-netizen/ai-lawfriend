type Props = {
  message?: string;
};

export function DashboardPermissionNote({
  message = "계정 역할과 승인 상태에 따라 표시되는 작업 공간과 기능이 달라질 수 있습니다.",
}: Props) {
  return (
    <div
      className="rounded-2xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm font-semibold leading-relaxed text-amber-950 sm:px-5 sm:py-3.5 sm:leading-6"
      role="note"
    >
      {message}
    </div>
  );
}
