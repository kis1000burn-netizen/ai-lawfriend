import Link from "next/link";
import { KoreanPhraseBlock } from "@/components/ui/korean-lines";
import {
  AIBEOPCHIN_HOME_ROLE_CARDS,
  AIBEOPCHIN_HOME_ROLE_HEADING_LINES,
  AIBEOPCHIN_HOME_ROLE_SUBCOPY_LINES,
} from "@/lib/branding/aibeopchin-marketing-copy";
import {
  KOREAN_BODY_COMPACT_CLASS,
  KOREAN_EYEBROW_CLASS,
  KOREAN_HEADING_CLASS,
  KOREAN_SECTION_HEADING_CLASS,
} from "@/lib/ui/korean-mobile-typography.policy";

const roles = [
  {
    ...AIBEOPCHIN_HOME_ROLE_CARDS[0],
    primary: { href: "/signup", label: "회원가입" },
    secondary: { href: "/login?redirect=/dashboard", label: "로그인 → 대시보드" },
  },
  {
    ...AIBEOPCHIN_HOME_ROLE_CARDS[1],
    primary: { href: "/login?redirect=/lawyer", label: "변호사 로그인" },
  },
  {
    ...AIBEOPCHIN_HOME_ROLE_CARDS[2],
    primary: { href: "/login?redirect=/admin", label: "관리자 로그인" },
  },
] as const;

export function HomeRoleEntryCards() {
  return (
    <section
      className="mx-auto max-w-7xl px-4 py-12 sm:px-5 sm:py-14 md:px-8"
      aria-labelledby="home-role-entry-heading"
    >
      <div className="mb-6 sm:mb-8">
        <p className={`${KOREAN_EYEBROW_CLASS} text-aibeop-green normal-case tracking-normal sm:tracking-wide`}>
          Role Entry
        </p>
        <KoreanPhraseBlock
          as="h2"
          id="home-role-entry-heading"
          phrases={AIBEOPCHIN_HOME_ROLE_HEADING_LINES}
          className={`mt-2 ${KOREAN_SECTION_HEADING_CLASS} text-aibeop-text`}
        />
        <KoreanPhraseBlock
          as="p"
          phrases={AIBEOPCHIN_HOME_ROLE_SUBCOPY_LINES}
          className={`mt-3 max-w-2xl ${KOREAN_BODY_COMPACT_CLASS} text-aibeop-muted`}
        />
      </div>

      <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
        {roles.map((role) => (
          <div
            key={role.title}
            className="flex flex-col rounded-3xl border border-aibeop-line bg-aibeop-surface p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-xl sm:p-6"
          >
            <h3 className={`${KOREAN_HEADING_CLASS} text-xl font-bold text-aibeop-text`}>{role.title}</h3>
            <KoreanPhraseBlock
              as="p"
              phrases={role.bodyLines}
              className={`mt-3 flex-1 ${KOREAN_BODY_COMPACT_CLASS} text-aibeop-muted`}
            />
            <div className="mt-6 flex flex-col gap-2">
              <Link
                href={role.primary.href}
                className="rounded-xl bg-aibeop-green py-2.5 text-center text-sm font-semibold text-white transition hover:bg-aibeop-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aibeop-green"
              >
                {role.primary.label}
              </Link>
              {"secondary" in role ? (
                <Link
                  href={role.secondary.href}
                  className="rounded-xl border border-aibeop-line py-2.5 text-center text-sm font-medium text-aibeop-text transition hover:bg-aibeop-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aibeop-green"
                >
                  {role.secondary.label}
                </Link>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
