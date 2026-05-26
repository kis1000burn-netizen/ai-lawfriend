import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import {
  KOREAN_MOBILE_TYPOGRAPHY_MARKER,
  KOREAN_PHRASE_GAP_CLASS,
  KOREAN_PHRASE_INLINE_CLASS,
} from "@/lib/ui/korean-mobile-typography.policy";

type KoreanPhraseBlockProps<T extends ElementType = "span"> = {
  phrases: readonly string[];
  className?: string;
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, "className" | "children">;

/** 좁은 뷰포트: phrase마다 줄(띄어쓰기 경계) · md+: 한 문단 */
export function KoreanPhraseBlock<T extends ElementType = "span">({
  phrases,
  className = "",
  as,
  ...rest
}: Readonly<KoreanPhraseBlockProps<T>>) {
  const Tag = (as ?? "span") as ElementType;
  return (
    <Tag
      className={className}
      data-typography={KOREAN_MOBILE_TYPOGRAPHY_MARKER}
      {...rest}
    >
      {phrases.map((phrase, index) => (
        <span key={`${phrase}-${index}`} className={KOREAN_PHRASE_INLINE_CLASS}>
          {phrase}
          {index < phrases.length - 1 ? (
            <span className={KOREAN_PHRASE_GAP_CLASS}> </span>
          ) : null}
        </span>
      ))}
    </Tag>
  );
}

type KoreanLineSetProps = {
  mobile: readonly string[];
  desktop?: readonly string[];
  className?: string;
  as?: ElementType;
};

/** mobile/desktop 줄 수·내용이 다를 때만 분기 렌더 */
export function KoreanLineSet({
  mobile,
  desktop,
  className = "",
  as: Tag = "span",
}: Readonly<KoreanLineSetProps>) {
  const desktopLines = desktop ?? mobile;
  const unified =
    mobile.length === desktopLines.length &&
    mobile.every((line, index) => line === desktopLines[index]);

  if (unified) {
    return <KoreanPhraseBlock phrases={mobile} className={className} as={Tag} />;
  }

  return (
    <Tag
      className={className}
      data-typography={KOREAN_MOBILE_TYPOGRAPHY_MARKER}
    >
      <span className="md:hidden">
        <KoreanLineBreaks lines={mobile} />
      </span>
      <span className="hidden md:inline">
        <KoreanLineBreaks lines={desktopLines} />
      </span>
    </Tag>
  );
}

function KoreanLineBreaks({ lines }: Readonly<{ lines: readonly string[] }>) {
  const nodes: ReactNode[] = [];
  lines.forEach((line, index) => {
    if (index > 0) {
      nodes.push(<br key={`br-${index}`} />);
    }
    nodes.push(<span key={`line-${index}`}>{line}</span>);
  });
  return nodes;
}
