import Link from "next/link";

export default function TemplatesIndexPage() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-semibold tracking-tight">문서 템플릿</h1>
      <p className="mt-2 text-neutral-600">
        소장·진술서 등 법률 문서 작성에 참고할 수 있는 템플릿 안내 페이지입니다.
      </p>
      <ul className="mt-6 list-disc space-y-2 pl-5 text-neutral-800">
        <li>
          <Link href="/templates/complaint" className="text-aibeop-green underline hover:text-aibeop-deep">
            소장 템플릿
          </Link>
        </li>
        <li>
          <Link href="/templates/statement" className="text-aibeop-green underline hover:text-aibeop-deep">
            진술서 템플릿
          </Link>
        </li>
      </ul>
    </main>
  );
}
