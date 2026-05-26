import Link from "next/link";
import { KoreanPhraseBlock } from "@/components/ui/korean-lines";
import {
  LANDING_HERO_BODY_LINES,
  LANDING_HERO_HEADING_LINES,
} from "@/lib/branding/aibeopchin-marketing-copy";
import {
  KOREAN_BODY_TEXT_CLASS,
  KOREAN_HERO_HEADING_CLASS,
} from "@/lib/ui/korean-mobile-typography.policy";

export default function LandingHero() {
  return (
    <section className="border-b border-zinc-100 bg-gradient-to-b from-zinc-50 to-white px-4 py-16 sm:px-6 sm:py-20 md:py-28">
      <div className="mx-auto max-w-5xl text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">AI법친</p>
        <KoreanPhraseBlock
          as="h1"
          phrases={LANDING_HERO_HEADING_LINES}
          className={`mt-3 ${KOREAN_HERO_HEADING_CLASS} text-zinc-900 sm:text-5xl`}
        />
        <KoreanPhraseBlock
          as="p"
          phrases={LANDING_HERO_BODY_LINES}
          className={`mx-auto mt-6 max-w-2xl ${KOREAN_BODY_TEXT_CLASS} text-lg text-zinc-600`}
        />
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/signup"
            className="rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800"
          >
            의뢰인으로 시작하기
          </Link>
          <Link
            href="/login?redirect=/dashboard"
            className="rounded-xl border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
          >
            로그인
          </Link>
        </div>
      </div>
    </section>
  );
}
