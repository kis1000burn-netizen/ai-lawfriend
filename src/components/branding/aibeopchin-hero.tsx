"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { KoreanPhraseBlock } from "@/components/ui/korean-lines";
import {
  AIBEOPCHIN_HERO_CTA_ADMIN_LINES,
  AIBEOPCHIN_HERO_CTA_CLIENT_LINES,
  AIBEOPCHIN_HERO_CTA_LAWYER_LINES,
} from "@/lib/branding/aibeopchin-marketing-copy";
import { AIBEOPCHIN_INTRO_TIMELINE } from "@/lib/branding/aibeopchin-intro-timeline";
import {
  KOREAN_BODY_COMPACT_CLASS,
  KOREAN_HEADING_CLASS,
} from "@/lib/ui/korean-mobile-typography.policy";
import { AibeopchinIntroScene } from "./aibeopchin-intro-scene";

const ctaEnterDelay =
  AIBEOPCHIN_INTRO_TIMELINE.cta.delay + AIBEOPCHIN_INTRO_TIMELINE.cta.duration * 0.1;

export function AibeopchinHero() {
  const reducedMotion = useReducedMotion();

  return (
    <section
      className="relative bg-gradient-to-br from-aibeop-deep via-[#0d2a20] to-aibeop-green text-white"
      aria-label="AI법친 소개 및 역할별 시작"
    >
      <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:gap-10 sm:px-5 md:px-8 md:py-14">
        <AibeopchinIntroScene reducedMotion={Boolean(reducedMotion)} />

        <motion.div
          className="mx-auto grid w-full max-w-5xl gap-4 md:grid-cols-3"
          initial={reducedMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: reducedMotion ? 0 : ctaEnterDelay,
            duration: 0.65,
          }}
        >
          <div className="flex flex-col gap-3 rounded-2xl border border-aibeop-pale/20 bg-aibeop-pale/10 p-4 transition hover:bg-aibeop-pale/15 sm:p-5">
            <p className={`${KOREAN_BODY_COMPACT_CLASS} font-semibold text-aibeop-pale`}>의뢰인</p>
            <h2 className={`${KOREAN_HEADING_CLASS} text-xl font-bold`}>사건 정리 시작</h2>
            <KoreanPhraseBlock
              as="p"
              phrases={AIBEOPCHIN_HERO_CTA_CLIENT_LINES}
              className={`${KOREAN_BODY_COMPACT_CLASS} text-white/75`}
            />
            <div className="mt-auto flex flex-col gap-2">
              <Link
                href="/signup"
                className="rounded-xl bg-white/95 py-2.5 text-center text-sm font-semibold text-aibeop-deep transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aibeop-pale"
              >
                회원가입
              </Link>
              <Link
                href="/login?redirect=/dashboard"
                className="rounded-xl border border-white/25 py-2.5 text-center text-sm font-medium text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aibeop-pale"
              >
                로그인 → 대시보드
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-4 transition hover:bg-white/[0.08] sm:p-5">
            <p className={`${KOREAN_BODY_COMPACT_CLASS} font-semibold text-aibeop-pale`}>변호사</p>
            <h2 className={`${KOREAN_HEADING_CLASS} text-xl font-bold`}>사건 검토 공간</h2>
            <KoreanPhraseBlock
              as="p"
              phrases={AIBEOPCHIN_HERO_CTA_LAWYER_LINES}
              className={`${KOREAN_BODY_COMPACT_CLASS} text-white/75`}
            />
            <Link
              href="/login?redirect=/lawyer"
              className="mt-auto rounded-xl bg-white/10 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aibeop-pale"
            >
              변호사 로그인
            </Link>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-4 transition hover:bg-white/[0.08] sm:p-5">
            <p className={`${KOREAN_BODY_COMPACT_CLASS} font-semibold text-aibeop-pale`}>관리자·운영</p>
            <h2 className={`${KOREAN_HEADING_CLASS} text-xl font-bold`}>운영 관리</h2>
            <KoreanPhraseBlock
              as="p"
              phrases={AIBEOPCHIN_HERO_CTA_ADMIN_LINES}
              className={`${KOREAN_BODY_COMPACT_CLASS} text-white/75`}
            />
            <Link
              href="/login?redirect=/admin"
              className="mt-auto rounded-xl bg-white/10 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aibeop-pale"
            >
              관리자 로그인
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
