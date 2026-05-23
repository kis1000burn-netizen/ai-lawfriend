import { describe, expect, it } from "vitest";
import {
  AIBEOPCHIN_BEOP_CODEPOINT,
  AIBEOPCHIN_BEOP_RADICAL_STROKE_COUNT,
  AIBEOPCHIN_BEOP_STROKES,
  AIBEOPCHIN_BEOP_UNICODE,
  AIBEOPCHIN_BEOP_VIEWBOX,
  buildBeopLogoTransform,
  buildBeopMirrorXTransform,
  resolveBeopStrokeDrawDuration,
  resolveBeopStrokeCycleDuration,
  resolveBeopStrokeDelay,
} from "@/lib/branding/aibeopchin-beop-strokes";

describe("aibeopchin-beop-strokes", () => {
  it("targets the standard han character 法 (U+6CD5)", () => {
    expect(AIBEOPCHIN_BEOP_UNICODE).toBe("法");
    expect(AIBEOPCHIN_BEOP_CODEPOINT).toBe("U+6CD5");
    expect(AIBEOPCHIN_BEOP_UNICODE.codePointAt(0)?.toString(16)).toBe("6cd5");
  });

  it("defines eight strokes in writing order with 氵 radical first", () => {
    expect(AIBEOPCHIN_BEOP_STROKES).toHaveLength(8);
    expect(AIBEOPCHIN_BEOP_RADICAL_STROKE_COUNT).toBe(3);
    expect(AIBEOPCHIN_BEOP_STROKES.slice(0, 3).every((stroke) => stroke.isRadical)).toBe(
      true,
    );
    expect(AIBEOPCHIN_BEOP_STROKES.map((s) => s.order)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8,
    ]);
  });

  it("builds logo transform with mirror and left 180 rotation", () => {
    const transform = buildBeopLogoTransform({ mirrorX: true, rotateLeft180: true });
    expect(transform).toContain("scale(-1 1)");
    expect(transform).toContain("rotate(-180)");
  });

  it("builds horizontal mirror transform only when requested", () => {
    expect(buildBeopMirrorXTransform()).toContain("scale(-1 1)");
    expect(buildBeopMirrorXTransform()).not.toContain("rotate(-180)");
  });

  it("uses hanzi-writer coordinate paths (curves, not stick figures)", () => {
    for (const stroke of AIBEOPCHIN_BEOP_STROKES) {
      expect(stroke.d.length).toBeGreaterThan(20);
      expect(stroke.d).toMatch(/^M /);
    }

    expect(AIBEOPCHIN_BEOP_VIEWBOX).toBe("0 0 1024 900");
  });

  it("accumulates stroke delays monotonically", () => {
    const delays = AIBEOPCHIN_BEOP_STROKES.map((_, index) =>
      resolveBeopStrokeDelay(index),
    );

    for (let i = 1; i < delays.length; i += 1) {
      expect(delays[i]).toBeGreaterThan(delays[i - 1]!);
    }
  });

  it("cycle duration covers draw, celebrate hold, and restart buffer", () => {
    const draw = resolveBeopStrokeDrawDuration();
    const cycle = resolveBeopStrokeCycleDuration();

    expect(draw).toBeGreaterThan(3);
    expect(cycle).toBeGreaterThan(draw);
  });
});
