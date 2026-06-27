import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { createCaseSchema } from "../../src/features/cases/case.validators";

/**
 * diagnostic-engine:auto-generated
 * 첫 실전 적용 — 회원가입·로그인·권한·사건접수 MVP 흐름의 patchset 검증용 fixture
 */
const manifest = JSON.parse(
  fs.readFileSync(path.join(__dirname, "mvp-flow-first-practical.manifest.json"), "utf8"),
);

describe("mvp-flow-first-practical.generated", () => {
  it("loads auto-generated MVP flow manifest", () => {
    expect(manifest.manifestId).toBe("mvp-flow-first-practical-v1");
    expect(manifest.flows.length).toBeGreaterThanOrEqual(4);
  });

  it("keeps auth and case intake entry paths registered", () => {
    const entryPaths = manifest.flows.map((flow: { entryPath: string }) => flow.entryPath);
    expect(entryPaths).toContain("src/app/api/auth/signup/route.ts");
    expect(entryPaths).toContain("src/app/api/auth/login/route.ts");
    expect(entryPaths).toContain("src/features/cases/case.validators.ts");
  });

  it("validates minimal case intake input in patchset sandbox", () => {
    const parsed = createCaseSchema.safeParse({
      title: "진단 엔진 MVP 사건 접수",
      description: "patchset sandbox validation",
      category: "GENERAL",
    });
    expect(parsed.success).toBe(true);
  });

  it("does not expose raw user identifiers in manifest labels", () => {
    for (const flow of manifest.flows) {
      expect(JSON.stringify(flow)).not.toMatch(/@example\.com/);
      expect(flow.label.length).toBeGreaterThan(0);
    }
  });
});
