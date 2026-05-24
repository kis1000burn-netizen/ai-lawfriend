"use client";

/**
 * AI법친 CMB Onboarding Intro — 플랫폼 최초 접속 진입화면.
 * Document Intelligence 파이프라인(업로드→분석→변호사 검토→운영 연동) 소개.
 */
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { AibeopchinCharacter } from "@/components/brand/aibeopchin-character";
import { CMB_ONBOARDING_AUTO_DISMISS_MS } from "@/lib/onboarding/cmb-onboarding-config";
import {
  ArrowRightIcon,
  CpuIcon,
  DatabaseIcon,
  ShieldCheckIcon,
  UploadCloudIcon,
  UserCheckIcon,
} from "@/components/onboarding/cmb-onboarding-icons";

export const AIBEOPCHIN_CMB_ONBOARDING_INTRO_MARKER =
  "aibeopchin-cmb-onboarding-intro" as const;

const STEPS = [
  {
    no: "01",
    code: "upload.caseMaterials()",
    ko: "사건 자료·증거를 업로드합니다",
  },
  {
    no: "02",
    code: "ai.classifyAndAnalyze()",
    ko: "AI가 분류·분석·쟁점을 구조화합니다",
  },
  {
    no: "03",
    code: "lawyer.review.confirm()",
    ko: "변호사가 검토·확정합니다",
  },
  {
    no: "04",
    code: "ops.sync.deadlinesTasks()",
    ko: "기일·업무·보완요청으로 연동합니다",
  },
] as const;

const TYPED_PHRASES = [
  "사건 자료를 업로드하세요",
  "핵심 쟁점을 구조화하세요",
  "변호사 검토 후 운영으로 연결하세요",
  "AI는 후보를 만들고, 변호사가 확정합니다",
] as const;

type Step = (typeof STEPS)[number];

type Props = {
  onComplete: () => void;
  exiting?: boolean;
};

function CodeToKoreanRow({
  step,
  index,
  reducedMotion,
}: {
  step: Step;
  index: number;
  reducedMotion: boolean;
}) {
  return (
    <motion.div
      className="grid grid-cols-[52px_1fr_40px_1.6fr] items-center gap-3 border-b border-cyan-200/10 py-4 last:border-0 md:gap-4"
      initial={reducedMotion ? false : { opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: reducedMotion ? 0 : 0.35 + index * 0.42, duration: 0.62 }}
    >
      <div className="font-mono text-sm font-bold text-cyan-300/85">{step.no}</div>
      <div className="font-mono text-xs leading-5 text-cyan-100/70 md:text-sm">
        {step.code}
      </div>
      <ArrowRightIcon className="h-6 w-6 text-cyan-200/80" />
      <div className="text-base font-bold leading-snug text-slate-100 md:text-lg">
        {step.ko}
      </div>
    </motion.div>
  );
}

function FlowChip({
  icon: Icon,
  title,
  desc,
}: {
  icon: typeof UploadCloudIcon;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-cyan-200/15 bg-slate-950/50 px-3 py-4 text-center">
      <Icon className="mx-auto h-7 w-7 text-cyan-100" />
      <div className="mt-2 text-sm font-bold text-cyan-50">{title}</div>
      <div className="mt-1 text-xs leading-5 text-slate-400">{desc}</div>
    </div>
  );
}

export function AibeopchinCmbOnboardingIntro({
  onComplete,
  exiting = false,
}: Readonly<Props>) {
  const reducedMotion = useReducedMotion();
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(
    Math.ceil(CMB_ONBOARDING_AUTO_DISMISS_MS / 1000),
  );

  const activePhrase = TYPED_PHRASES[phraseIndex] ?? TYPED_PHRASES[0];
  const typed = useMemo(
    () => activePhrase.slice(0, charIndex),
    [activePhrase, charIndex],
  );

  useEffect(() => {
    if (reducedMotion) {
      setCharIndex(activePhrase.length);
      return;
    }

    if (charIndex < activePhrase.length) {
      const timer = globalThis.setTimeout(() => setCharIndex((c) => c + 1), 42);
      return () => globalThis.clearTimeout(timer);
    }

    const pause = globalThis.setTimeout(() => {
      setPhraseIndex((i) => (i + 1) % TYPED_PHRASES.length);
      setCharIndex(0);
    }, 2200);

    return () => globalThis.clearTimeout(pause);
  }, [activePhrase, charIndex, reducedMotion]);

  useEffect(() => {
    if (reducedMotion || exiting) {
      return;
    }
    const tick = globalThis.setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => globalThis.clearInterval(tick);
  }, [reducedMotion, exiting]);

  return (
    <motion.main
      className="fixed inset-0 z-[250] flex items-center justify-center overflow-y-auto bg-[#020617] px-4 py-10 text-slate-100"
      data-testid="cmb-onboarding-intro"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cmb-onboarding-title"
      initial={{ opacity: 1 }}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: 0.4 }}
    >
      <section className="relative w-full max-w-6xl">
        <motion.section
          className="relative overflow-hidden rounded-[42px] border border-cyan-300/20 bg-gradient-to-b from-slate-900/95 to-slate-950 px-6 pb-28 pt-8 shadow-2xl md:px-10 md:pt-10"
          initial={reducedMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75 }}
        >
          <div className="absolute inset-0 rounded-[42px] border border-cyan-300/20 shadow-[inset_0_0_50px_rgba(34,211,238,.10)]" />
          <motion.div
            className="absolute -right-20 top-10 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl"
            animate={
              reducedMotion
                ? undefined
                : { opacity: [0.15, 0.45, 0.15], scale: [1, 1.18, 1] }
            }
            transition={{ duration: 4.2, repeat: Infinity }}
          />

          <header className="relative z-10 mb-6 flex flex-col gap-6 border-b border-cyan-200/10 pb-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
              <AibeopchinCharacter variant="hero" size={140} className="shrink-0" />
              <div className="text-center sm:text-left">
                <div
                  id="cmb-onboarding-title"
                  className="text-4xl font-black tracking-[-0.08em] md:text-5xl"
                >
                  AI법친
                </div>
                <div className="mt-1 text-sm tracking-[0.55em] text-cyan-100/70 md:text-base">
                  CMB FRAMEWORK
                </div>
                <p className="mt-2 text-xs text-cyan-200/60">
                  {secondsLeft > 0
                    ? `${secondsLeft}초 후 홈 화면으로 이동합니다`
                    : "잠시 후 홈 화면으로 이동합니다"}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300 lg:gap-8">
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="h-6 w-6 text-cyan-100" />
                보안연결
              </div>
              <div className="hidden h-px w-12 border-t border-dashed border-cyan-200/35 sm:block" />
              <div className="flex items-center gap-2">
                <UserCheckIcon className="h-6 w-6 text-cyan-100" />
                변호사 검토
              </div>
              <div className="hidden h-px w-12 border-t border-dashed border-cyan-200/35 sm:block" />
              <div className="flex items-center gap-2">
                <DatabaseIcon className="h-6 w-6 text-cyan-100" />
                사건 운영 데이터
              </div>
            </div>
          </header>

          <div className="relative z-10 rounded-[30px] border border-cyan-200/15 bg-slate-950/35 px-5 py-4 md:px-7">
            {STEPS.map((step, index) => (
              <CodeToKoreanRow
                key={step.no}
                step={step}
                index={index}
                reducedMotion={!!reducedMotion}
              />
            ))}

            <motion.div
              className="mt-4 grid grid-cols-1 items-center gap-4 rounded-2xl border border-cyan-300/30 bg-cyan-400/8 px-5 py-4 shadow-[0_0_34px_rgba(34,211,238,.12)] md:grid-cols-[1fr_48px_1.7fr]"
              initial={reducedMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reducedMotion ? 0 : 2.15, duration: 0.7 }}
            >
              <div className="font-mono text-sm leading-6 text-cyan-100/70">
                <div>{"// Get Started"}</div>
                <div>.await user.input()</div>
              </div>
              <ArrowRightIcon className="hidden h-8 w-8 text-cyan-200 drop-shadow-[0_0_12px_rgba(34,211,238,.9)] md:mx-auto md:block" />
              <div className="text-xl font-extrabold tracking-[-0.03em] text-cyan-100 md:text-2xl">
                {typed}
                {!reducedMotion ? (
                  <motion.span
                    className="ml-1 inline-block h-6 w-[3px] translate-y-1 bg-cyan-100 md:h-7"
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.75, repeat: Infinity }}
                  />
                ) : null}
              </div>
            </motion.div>
          </div>

          <motion.div
            className="relative z-10 mt-7 grid grid-cols-1 items-center gap-3 rounded-[26px] border border-cyan-200/20 bg-slate-950/40 p-4 sm:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]"
            initial={reducedMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reducedMotion ? 0 : 2.55, duration: 0.7 }}
          >
            <FlowChip icon={UploadCloudIcon} title="사건 자료 업로드" desc="문서·증거 업로드" />
            <ArrowRightIcon className="mx-auto hidden h-6 w-6 text-cyan-200/70 sm:block" />
            <FlowChip icon={CpuIcon} title="AI 분류·분석" desc="핵심 내용 구조화" />
            <ArrowRightIcon className="mx-auto hidden h-6 w-6 text-cyan-200/70 sm:block" />
            <FlowChip icon={UserCheckIcon} title="변호사 검토" desc="전문가 최종 검토" />
            <ArrowRightIcon className="mx-auto hidden h-6 w-6 text-cyan-200/70 sm:block" />
            <FlowChip icon={DatabaseIcon} title="사건 운영 연동" desc="기일·업무·보완요청" />
          </motion.div>

          <p className="relative z-10 mt-6 text-center text-xs leading-5 text-slate-400">
            AI가 생성한 분석은 변호사 검토 전까지 확정되지 않습니다. 최종 법률 판단·문서 확정·
            제출은 변호사가 수행합니다.
          </p>

          <motion.button
            type="button"
            onClick={onComplete}
            className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-4 rounded-2xl border border-amber-200/45 bg-gradient-to-b from-slate-900 to-slate-950 px-10 py-4 text-xl font-extrabold tracking-[0.16em] text-slate-100 shadow-[0_0_36px_rgba(251,191,36,.24)] transition hover:scale-[1.02] hover:border-amber-100 md:px-16 md:py-5 md:text-2xl md:tracking-[0.2em]"
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reducedMotion ? 0 : 3, duration: 0.65 }}
            whileTap={reducedMotion ? undefined : { scale: 0.98 }}
            data-testid="cmb-onboarding-start"
          >
            시작하기
            <ArrowRightIcon className="h-7 w-7 text-amber-200" />
          </motion.button>
        </motion.section>
      </section>
    </motion.main>
  );
}
