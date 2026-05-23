import { describe, expect, it } from "vitest";
import {
  AIBEOPCHIN_LOGO_HEADER_SLOT_HEIGHT_PX,
  resolveLogoCelebrateLayout,
} from "@/lib/branding/aibeopchin-logo-celebrate";

describe("aibeopchin-logo-celebrate", () => {
  it("keeps header slot height fixed while widening to fill header", () => {
    const layout = resolveLogoCelebrateLayout("xs", "header");

    expect(layout.containerHeight).toBe(AIBEOPCHIN_LOGO_HEADER_SLOT_HEIGHT_PX);
    expect(layout.celebrateHeight).toBe(AIBEOPCHIN_LOGO_HEADER_SLOT_HEIGHT_PX);
    expect(layout.celebrateWidth).toBe(AIBEOPCHIN_LOGO_HEADER_SLOT_HEIGHT_PX);
    expect(layout.celebrateScale).toBeCloseTo(
      AIBEOPCHIN_LOGO_HEADER_SLOT_HEIGHT_PX / layout.baseHeight,
    );
    expect(layout.celebrateWidth).toBeGreaterThan(layout.baseWidth);
    expect(layout.textPushPx).toBeGreaterThan(0);
  });

  it("uses transform scale for panel surface instead of resizing glyph", () => {
    const layout = resolveLogoCelebrateLayout("lg", "panel");

    expect(layout.celebrateScale).toBeGreaterThan(1);
    expect(layout.celebrateWidth).toBeGreaterThan(layout.baseWidth);
    expect(layout.textPushPx).toBeGreaterThan(0);
  });
});
