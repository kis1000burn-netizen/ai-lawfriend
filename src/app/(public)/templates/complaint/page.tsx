import Link from "next/link";

export default function ComplaintTemplatePage() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-semibold tracking-tight">소장 템플릿</h1>
      <p className="mt-2 text-neutral-600">
        MVP 골격 페이지입니다. 실제 제출 전 반드시 변호사 등 전문가의 검토를 받으시기 바랍니다.
      </p>
      <p className="mt-6">
        <Link href="/templates" className="text-aibeop-green underline hover:text-aibeop-deep">
          문서 템플릿 목록
        </Link>
      </p>
    </main>
  );
}
