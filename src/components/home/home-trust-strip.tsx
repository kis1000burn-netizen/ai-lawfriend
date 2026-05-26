import Link from "next/link";
import { KoreanPhraseBlock } from "@/components/ui/korean-lines";
import { AIBEOPCHIN_HOME_TRUST_ITEMS } from "@/lib/branding/aibeopchin-marketing-copy";
import { KOREAN_BODY_COMPACT_CLASS, KOREAN_HEADING_CLASS } from "@/lib/ui/korean-mobile-typography.policy";

export function HomeTrustStrip() {
  return (
    <section
      className="border-y border-aibeop-line bg-aibeop-soft"
      aria-labelledby="home-trust-heading"
    >
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-5 sm:py-10 md:px-8">
        <h2 id="home-trust-heading" className={`${KOREAN_HEADING_CLASS} text-lg font-bold text-aibeop-text`}>
          신뢰·보안·면책
        </h2>
        <div className="mt-5 grid gap-4 sm:mt-6 md:grid-cols-3">
          {AIBEOPCHIN_HOME_TRUST_ITEMS.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-aibeop-line bg-aibeop-surface p-4 shadow-soft sm:p-5"
            >
              <p className={`${KOREAN_HEADING_CLASS} text-sm font-semibold text-aibeop-text`}>{item.title}</p>
              <KoreanPhraseBlock
                as="p"
                phrases={item.bodyLines}
                className={`mt-2 ${KOREAN_BODY_COMPACT_CLASS} font-medium text-aibeop-muted`}
              />
            </div>
          ))}
        </div>
        <p className={`mt-5 flex flex-wrap gap-x-4 gap-y-2 sm:mt-6 ${KOREAN_BODY_COMPACT_CLASS} text-aibeop-muted`}>
          <Link
            href="/guide"
            className="font-medium underline underline-offset-4 hover:text-aibeop-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aibeop-green"
          >
            이용 안내
          </Link>
          <Link
            href="/faq"
            className="font-medium underline underline-offset-4 hover:text-aibeop-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aibeop-green"
          >
            FAQ
          </Link>
        </p>
      </div>
    </section>
  );
}
