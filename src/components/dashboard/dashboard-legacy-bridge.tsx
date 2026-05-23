/**
 * Living Dashboard 상단과 하단 레거시 작업 블록 사이 시각적 연결용.
 * 기능·라우트 변경 없음.
 */
export function DashboardLegacyBridge() {
  return (
    <div
      className="flex flex-col items-center px-2 py-4 md:py-6"
      aria-hidden="true"
    >
      <div className="h-px w-full max-w-lg bg-gradient-to-r from-transparent via-aibeop-line to-transparent" />
      <p className="mt-3 text-center text-[10px] font-bold uppercase tracking-[0.28em] text-aibeop-deep sm:text-[11px]">
        이어서 · 상세 작업
      </p>
    </div>
  );
}
