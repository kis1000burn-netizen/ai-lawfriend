import { describe, expect, it } from "vitest";
import {
  AIBEOPCHIN_LOGO_RAINBOW_7,
  pickRandomLogoRainbowColor,
} from "@/lib/branding/aibeopchin-logo-rainbow";

describe("aibeopchin-logo-rainbow", () => {
  it("picks one of the 7 rainbow colors", () => {
    const color = pickRandomLogoRainbowColor(() => 0.99);

    expect(AIBEOPCHIN_LOGO_RAINBOW_7).toContain(color);
  });

  it("uses deterministic index from injected random", () => {
    expect(pickRandomLogoRainbowColor(() => 0)).toBe(AIBEOPCHIN_LOGO_RAINBOW_7[0]);
    expect(pickRandomLogoRainbowColor(() => 0.5)).toBe(
      AIBEOPCHIN_LOGO_RAINBOW_7[3],
    );
  });
});
