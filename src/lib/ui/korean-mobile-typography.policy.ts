/**
 * 한글 가독성 타이포그래피 SSOT.
 *
 * 원칙
 * - PC·모바일 정보 중요도는 동등 (법률·면책·업무 문구 모두 동일 기준).
 * - 좁은 뷰포트: 반응형 우선 레이아웃 + 어절/구절(띄어쓰기) 경계 줄정리.
 * - 넓은 뷰포트: 동일 카피를 자연스러운 문단으로 연결 (별도 수동 `<br>` 불필요).
 *
 * 카피 줄 배열: `src/lib/branding/aibeopchin-marketing-copy.ts`
 * 렌더: `KoreanPhraseBlock` (`src/components/ui/korean-lines.tsx`)
 */
export const KOREAN_MOBILE_TYPOGRAPHY_MARKER = "korean-mobile-typography-v1" as const;

/** 본문 — 어절 경계 유지, 좁은 화면 가독성 leading */
export const KOREAN_BODY_TEXT_CLASS =
  "break-keep text-pretty leading-[1.65] sm:leading-7" as const;

/** 짧은 설명·카드 본문 */
export const KOREAN_BODY_COMPACT_CLASS =
  "break-keep text-pretty text-sm leading-[1.6] sm:leading-6" as const;

/** 섹션·카드 제목 */
export const KOREAN_HEADING_CLASS =
  "break-keep text-pretty leading-[1.35] sm:leading-snug" as const;

/** 히어로 h1 */
export const KOREAN_HERO_HEADING_CLASS =
  "break-keep text-pretty text-3xl font-black leading-[1.35] tracking-tight md:text-5xl md:leading-[1.2]" as const;

/** 서브 헤드 (홈 섹션 h2) */
export const KOREAN_SECTION_HEADING_CLASS =
  "break-keep text-pretty text-2xl font-black leading-[1.35] sm:text-3xl sm:leading-snug" as const;

/** 영문 eyebrow */
export const KOREAN_EYEBROW_CLASS =
  "break-keep text-xs font-semibold uppercase tracking-[0.18em] sm:tracking-[0.28em] md:tracking-[0.35em]" as const;

/** lockup 태그라인·짧은 슬로건 */
export const KOREAN_TAGLINE_CLASS =
  "break-keep text-pretty text-sm font-medium leading-[1.5] sm:text-base sm:leading-normal" as const;

/**
 * 좁은 뷰포트: phrase마다 block 줄(띄어쓰기 경계 유지)
 * md+: inline + 공백으로 한 문단
 */
export const KOREAN_PHRASE_INLINE_CLASS = "block md:inline" as const;

export const KOREAN_PHRASE_GAP_CLASS = "hidden md:inline" as const;
