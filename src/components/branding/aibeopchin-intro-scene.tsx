"use client";

import { motion } from "framer-motion";
import { AibeopchinCharacter } from "@/components/brand/aibeopchin-character";
import { AIBEOPCHIN_BRAND_COPY } from "@/lib/branding/aibeopchin-logo-config";
import { AIBEOPCHIN_INTRO_TIMELINE } from "@/lib/branding/aibeopchin-intro-timeline";

type Props = {
  reducedMotion?: boolean;
};

export function AibeopchinIntroScene({ reducedMotion = false }: Readonly<Props>) {
  return (
    <section
      className="relative overflow-hidden rounded-[2rem] border border-aibeop-line/10 bg-aibeop-deep px-6 py-12 shadow-2xl shadow-aibeop-deep/30 md:px-10 md:py-16"
      aria-labelledby="aibeopchin-hero-heading"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(220,252,231,0.18),transparent_36%),radial-gradient(circle_at_20%_80%,rgba(34,197,94,0.16),transparent_30%)]" />

      <motion.div
        className="absolute inset-x-10 top-10 h-px bg-gradient-to-r from-transparent via-aibeop-pale/60 to-transparent"
        initial={reducedMotion ? false : { scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{
          delay: reducedMotion ? 0 : AIBEOPCHIN_INTRO_TIMELINE.particles.delay,
          duration: reducedMotion ? 0.2 : 1.2,
        }}
      />

      <div className="relative z-10">
        <motion.div
          className="mx-auto flex w-full max-w-3xl flex-col items-center gap-5 rounded-[2rem] border border-white/10 bg-white/[0.04] px-6 py-6 shadow-soft backdrop-blur-md md:flex-row md:justify-center"
          initial={reducedMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: reducedMotion ? 0 : AIBEOPCHIN_INTRO_TIMELINE.lockup.delay * 0.25,
            duration: 0.65,
            ease: "easeOut",
          }}
        >
          <AibeopchinCharacter size={96} className="shrink-0" />

          <div className="text-center md:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-aibeop-pale/90">
              {AIBEOPCHIN_BRAND_COPY.eyebrow}
            </p>
            <p className="mt-2 text-4xl font-black tracking-[-0.05em] text-white md:text-5xl">
              AI법친
            </p>
            <p className="mt-2 text-sm font-medium text-white/78 md:text-base">
              법률의 문턱을 낮추는 AI 동반자
            </p>
          </div>
        </motion.div>

        <motion.div
          className="mx-auto mt-8 max-w-3xl text-center"
          initial={reducedMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: reducedMotion ? 0 : AIBEOPCHIN_INTRO_TIMELINE.cta.delay + 0.15,
            duration: 0.7,
          }}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-aibeop-pale/80">
            {AIBEOPCHIN_BRAND_COPY.eyebrow}
          </p>

          <h1
            id="aibeopchin-hero-heading"
            className="mt-5 text-3xl font-black tracking-tight text-white md:text-5xl"
          >
            사건의 흐름을 정리하고,
            <br className="hidden md:block" />
            법률 문서의 시작점을 함께 만듭니다.
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/72 md:text-lg">
            {AIBEOPCHIN_BRAND_COPY.description}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
