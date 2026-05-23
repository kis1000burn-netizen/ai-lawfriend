import { QaEvidenceAssistantClient } from "@/components/admin/qa-evidence/qa-evidence-assistant-client";

export default function AdminQaEvidencePage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-aibeop-subtle">
          AI Evidence Assistant
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-aibeop-text">
          QA Closure 반영 보조
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-aibeop-muted">
          QA/운영 실측 결과 원문을 분석해 closure 공식 확정 표 초안, 회신 원문 정리본,
          4.6 follow-up tracker 초안을 생성합니다. AI 분석 결과는 공식 확정이 아니며,
          사람 승인 후에만 문서에 반영할 수 있습니다.
        </p>
      </section>

      <QaEvidenceAssistantClient />
    </main>
  );
}
