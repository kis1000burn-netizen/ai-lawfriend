import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { KoreanPhraseBlock } from "@/components/ui/korean-lines";
import { joinKoreanPhrases, AIBEOPCHIN_HERO_DESCRIPTION_LINES } from "@/lib/branding/aibeopchin-marketing-copy";
import { KOREAN_MOBILE_TYPOGRAPHY_MARKER } from "./korean-mobile-typography.policy";

describe("korean-mobile-typography", () => {
  it("renders phrase block with typography marker", () => {
    const { container } = render(
      <KoreanPhraseBlock phrases={["법률의 문턱을 낮추는", "AI 동반자"]} />,
    );
    expect(container.querySelector(`[data-typography="${KOREAN_MOBILE_TYPOGRAPHY_MARKER}"]`)).toBeTruthy();
    expect(container.textContent).toContain("법률의 문턱을 낮추는");
    expect(container.textContent).toContain("AI 동반자");
  });

  it("joins phrase SSOT into a single readable string", () => {
    expect(joinKoreanPhrases(AIBEOPCHIN_HERO_DESCRIPTION_LINES)).toContain(
      "법률 전문가의 판단을 대체하지 않고",
    );
  });
});
