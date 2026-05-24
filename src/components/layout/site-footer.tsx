export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-aibeop-line bg-aibeop-surface/95">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 text-sm text-aibeop-muted md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <div className="text-base font-extrabold text-aibeop-text">AI법친</div>
          <div className="mt-1 font-medium">www.ai법친.com</div>
          <div className="mt-2 text-xs leading-5 text-aibeop-muted">
            AI법친은 변호사의 판단과 책임 아래 법률업무를 보조하는 AI 업무지원 플랫폼입니다.
          </div>
        </div>

        <div className="space-y-1 rounded-2xl border border-aibeop-line bg-aibeop-accentSoft px-4 py-3 md:text-right">
          <div>운영사: (주)누리온홀딩스</div>
          <div>법률고문: 양 희 완</div>
          <div>연락처: 010-5945-5925</div>
        </div>
      </div>
    </footer>
  );
}