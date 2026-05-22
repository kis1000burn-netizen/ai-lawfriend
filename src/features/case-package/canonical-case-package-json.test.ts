import { describe, expect, it } from "vitest";
import { canonicalStringifyCasePackageSnapshot } from "./canonical-case-package-json";

describe("canonicalStringifyCasePackageSnapshot", () => {
  it("is stable under key reorder", () => {
    const a = { z: 1, a: { m: 2, b: true } };
    const b = { a: { b: true, m: 2 }, z: 1 };
    expect(canonicalStringifyCasePackageSnapshot(a)).toEqual(
      canonicalStringifyCasePackageSnapshot(b),
    );
  });

  it("omits undefined object keys like JSON stringify", () => {
    expect(
      canonicalStringifyCasePackageSnapshot({ x: undefined, y: 1 }),
    ).toEqual(canonicalStringifyCasePackageSnapshot({ y: 1 }));
  });
});
