type Props = {
  documentId: string;
  documentStatus?: string | null;
};

export default function DocumentApprovalHistoryPanel({
  documentId,
  documentStatus,
}: Props) {
  void documentId;

  const readOnly =
    documentStatus === "LOCKED" || documentStatus === "ARCHIVED";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-aibeop-text">
        승인본 검증{readOnly ? " (조회)" : ""}
      </h2>
      <p className="mt-1 text-sm text-aibeop-muted">
        승인본 PDF·출력본 하단에 표시된 검증코드로 문서 진위를 확인할 수 있습니다.
      </p>
      {readOnly ? (
        <p className="mt-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-aibeop-muted">
          문서가 잠금 또는 보관된 상태입니다. 아래 링크로 검증 페이지만 이용할 수 있습니다.
        </p>
      ) : null}
      <div className="mt-3">
        <a
          href="/document-verification"
          className="inline-flex rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-aibeop-subtle hover:bg-neutral-50"
        >
          검증 페이지로 이동
        </a>
      </div>
      <div className="mt-2 text-xs text-aibeop-subtle">
        승인본 PDF 하단의 QR 코드를 스캔하면 모바일에서 자동 검증할 수 있습니다.
      </div>
    </section>
  );
}
