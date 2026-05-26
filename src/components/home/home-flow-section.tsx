import { KoreanPhraseBlock } from "@/components/ui/korean-lines";
import {
  AIBEOPCHIN_HOME_FLOW_HEADING_LINES,
  AIBEOPCHIN_HOME_FLOW_STEPS,
} from "@/lib/branding/aibeopchin-marketing-copy";
import {
  KOREAN_BODY_COMPACT_CLASS,
  KOREAN_EYEBROW_CLASS,
  KOREAN_HEADING_CLASS,
  KOREAN_SECTION_HEADING_CLASS,
} from "@/lib/ui/korean-mobile-typography.policy";

export function HomeFlowSection() {
  return (
    <section
      className="mx-auto max-w-7xl px-4 py-12 sm:px-5 sm:py-16 md:px-8"
      aria-labelledby="home-flow-heading"
    >
      <div className="max-w-3xl">
        <p className={`${KOREAN_EYEBROW_CLASS} text-cyan-600 normal-case tracking-normal sm:tracking-wide`}>
          Workflow
        </p>
        <KoreanPhraseBlock
          as="h2"
          id="home-flow-heading"
          phrases={AIBEOPCHIN_HOME_FLOW_HEADING_LINES}
          className={`mt-2 ${KOREAN_SECTION_HEADING_CLASS} text-slate-950`}
        />
      </div>

      <ol className="mt-6 grid list-none gap-4 sm:mt-8 sm:gap-5 md:grid-cols-2 lg:grid-cols-4">
        {AIBEOPCHIN_HOME_FLOW_STEPS.map((step) => (
          <li
            key={step.title}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
          >
            <h3 className={`${KOREAN_HEADING_CLASS} font-bold text-slate-950`}>{step.title}</h3>
            <KoreanPhraseBlock
              as="p"
              phrases={step.bodyLines}
              className={`mt-3 ${KOREAN_BODY_COMPACT_CLASS} text-slate-600`}
            />
          </li>
        ))}
      </ol>
    </section>
  );
}
