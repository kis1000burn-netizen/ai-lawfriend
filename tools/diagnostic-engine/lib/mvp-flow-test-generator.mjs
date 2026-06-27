import fs from "node:fs";
import path from "node:path";
import { getRepoRoot, writeJson } from "./paths.mjs";
import { loadWorkflowConfig } from "./registry.mjs";

const MVP_FLOWS = [
  {
    flowId: "auth-signup-user",
    label: "의뢰인 회원가입",
    verifyCommand:
      'npm run test -- "src/app/api/auth/signup/route.test.ts"',
    targetTest: "src/app/api/auth/signup/route.test.ts",
    entryPath: "src/app/api/auth/signup/route.ts",
  },
  {
    flowId: "auth-login",
    label: "로그인",
    verifyCommand: 'npm run test -- "src/app/api/auth/login/route.test.ts"',
    targetTest: "src/app/api/auth/login/route.test.ts",
    entryPath: "src/app/api/auth/login/route.ts",
  },
  {
    flowId: "auth-signup-lawyer",
    label: "변호사 회원가입",
    verifyCommand:
      'npm run test -- "src/lib/lawyer/lawyer-signup-risk.test.ts"',
    targetTest: "src/lib/lawyer/lawyer-signup-risk.test.ts",
    entryPath: "src/app/api/auth/signup-lawyer/route.ts",
  },
  {
    flowId: "permission-matrix",
    label: "권한 정의",
    verifyCommand:
      "npx vitest run --config vitest.patchset.config.ts",
    targetTest: "aibeopchin_patchset/tests/case-definitions.test.ts",
    entryPath: "src/lib/definitions/permission-definition.ts",
  },
  {
    flowId: "case-intake-validators",
    label: "사건 접수 입력 검증",
    verifyCommand:
      'npm run test -- "aibeopchin_patchset/tests/mvp-flow-first-practical.generated.test.ts"',
    targetTest: "aibeopchin_patchset/tests/mvp-flow-first-practical.generated.test.ts",
    entryPath: "src/features/cases/case.validators.ts",
  },
  {
    flowId: "case-create-service",
    label: "사건 접수 서비스",
    verifyCommand:
      'npm run test -- "aibeopchin_patchset/tests/mvp-flow-first-practical.generated.test.ts"',
    targetTest: "aibeopchin_patchset/tests/mvp-flow-first-practical.generated.test.ts",
    entryPath: "src/features/cases/case.service.ts",
  },
];

export function buildMvpFlowManifest() {
  const workflow = loadWorkflowConfig();
  const flows = MVP_FLOWS.filter((flow) => workflow.mvpFlowIds.includes(flow.flowId));

  return {
    manifestId: "mvp-flow-first-practical-v1",
    generatedAt: new Date().toISOString(),
    sandboxDir: workflow.patchsetSandboxDir,
    flows: flows.map((flow) => ({
      ...flow,
      generated: true,
    })),
  };
}

export function writeMvpFlowArtifacts() {
  const manifest = buildMvpFlowManifest();
  const repoRoot = getRepoRoot();
  const manifestPath = path.join(
    repoRoot,
    "aibeopchin_patchset/tests/mvp-flow-first-practical.manifest.json",
  );
  const generatedTestPath = path.join(
    repoRoot,
    "aibeopchin_patchset/tests/mvp-flow-first-practical.generated.test.ts",
  );

  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  const generatedTest = `import { describe, expect, it } from "vitest";
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
      expect(JSON.stringify(flow)).not.toMatch(/@example\\.com/);
      expect(flow.label.length).toBeGreaterThan(0);
    }
  });
});
`;

  fs.writeFileSync(generatedTestPath, generatedTest, "utf8");

  const result = {
    stepId: "generate-mvp-flow-tests",
    manifestPath: "aibeopchin_patchset/tests/mvp-flow-first-practical.manifest.json",
    generatedTestPath:
      "aibeopchin_patchset/tests/mvp-flow-first-practical.generated.test.ts",
    flowCount: manifest.flows.length,
    ok: true,
  };

  writeJson("_runtime/mvp-flow-generation.json", result);
  return result;
}

export { MVP_FLOWS };
