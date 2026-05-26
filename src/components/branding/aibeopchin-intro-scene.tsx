"use client";

import { motion } from "framer-motion";
import { AibeopchinCharacter } from "@/components/brand/aibeopchin-character";
import { KoreanPhraseBlock } from "@/components/ui/korean-lines";
import {
  AIBEOPCHIN_HERO_DESCRIPTION_LINES,
  AIBEOPCHIN_HERO_HEADING_LINES,
  AIBEOPCHIN_HERO_TAGLINE_LINES,
} from "@/lib/branding/aibeopchin-marketing-copy";
import { AIBEOPCHIN_BRAND_COPY } from "@/lib/branding/aibeopchin-logo-config";
import { AIBEOPCHIN_INTRO_TIMELINE } from "@/lib/branding/aibeopchin-intro-timeline";
import {
  KOREAN_BODY_TEXT_CLASS,
  KOREAN_EYEBROW_CLASS,
  KOREAN_HERO_HEADING_CLASS,
  KOREAN_TAGLINE_CLASS,
} from "@/lib/ui/korean-mobile-typography.policy";

type Props = {
  reducedMotion?: boolean;
};

export function AibeopchinIntroScene({ reducedMotion = false }: Readonly<Props>) {
  return (
    <section
      className="relative overflow-hidden rounded-[1.5rem] border border-aibeop-line/10 bg-aibeop-deep px-4 py-10 shadow-2xl shadow-aibeop-deep/30 sm:rounded-[2rem] sm:px-6 sm:py-12 md:px-10 md:py-16"
      aria-labelledby="aibeopchin-hero-heading"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(220,252,231,0.18),transparent_36%),radial-gradient(circle_at_20%_80%,rgba(34,197,94,0.16),transparent_30%)]" />

      <motion.div
        className="absolute inset-x-6 top-8 h-px bg-gradient-to-r from-transparent via-aibeop-pale/60 to-transparent sm:inset-x-10 sm:top-10"
        initial={reducedMotion ? false : { scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{
          delay: reducedMotion ? 0 : AIBEOPCHIN_INTRO_TIMELINE.particles.delay,
          duration: reducedMotion ? 0.2 : 1.2,
        }}
      />

      <div className="relative z-10">
        <motion.div
          className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 rounded-[1.5rem] border border-white/10 bg-white/[0.04] px-4 py-5 shadow-soft backdrop-blur-md sm:gap-5 sm:rounded-[2rem] sm:px-6 sm:py-6 md:flex-row md:justify-center"
          initial={reducedMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: reducedMotion ? 0 : AIBEOPCHIN_INTRO_TIMELINE.lockup.delay * 0.25,
            duration: 0.65,
            ease: "easeOut",
          }}
        >
          <AibeopchinCharacter variant="hero" size={112} className="shrink-0" />

          <div className="min-w-0 text-center md:text-left">
            <p className={`${KOREAN_EYEBROW_CLASS} text-aibeop-pale/90`}>
              {AIBEOPCHIN_BRAND_COPY.eyebrow}
            </p>
            <p className="mt-2 text-3xl font-black tracking-[-0.05em] text-white sm:text-4xl md:text-5xl">
              AI법친
            </p>
            <KoreanPhraseBlock
              as="p"
              phrases={AIBEOPCHIN_HERO_TAGLINE_LINES}
              className={`mt-2 ${KOREAN_TAGLINE_CLASS} text-white/78`}
            />
          </div>
        </motion.div>

        <motion.div
          className="mx-auto mt-6 max-w-3xl text-center sm:mt-8"
          initial={reducedMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: reducedMotion ? 0 : AIBEOPCHIN_INTRO_TIMELINE.cta.delay + 0.15,
            duration: 0.7,
          }}
        >
          <p className={`${KOREAN_EYEBROW_CLASS} text-aibeop-pale/80`}>
            {AIBEOPCHIN_BRAND_COPY.eyebrow}
          </p>

          <KoreanPhraseBlock
            as="h1"
            id="aibeopchin-hero-heading"
            phrases={AIBEOPCHIN_HERO_HEADING_LINES}
            className={`mt-4 ${KOREAN_HERO_HEADING_CLASS} text-white sm:mt-5`}
          />

          <KoreanPhraseBlock
            as="p"
            phrases={AIBEOPCHIN_HERO_DESCRIPTION_LINES}
            className={`mx-auto mt-4 max-w-2xl ${KOREAN_BODY_TEXT_CLASS} text-base text-white/72 sm:mt-5 md:text-lg`}
          />
        </motion.div>
      </div>
    </section>
  );
}
