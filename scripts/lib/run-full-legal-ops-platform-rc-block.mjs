import fs from "node:fs";
import path from "node:path";

/**
 * Shared Full Legal Ops Platform RC block (Phase 16-A).
 * Used by verify:aibeopchin-full-legal-ops-platform-rc.
 * Must NOT exec predeploy:check (circular risk — build stays in predeploy-check.ts).
 */
export function createFullLegalOpsPlatformRcFsHelpers(root) {
  function readFile(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
  }

  function assertFileExists(relativePath) {
    const full = path.join(root, relativePath);
    if (!fs.existsSync(full)) {
      throw new Error(`Missing required Full Legal Ops Platform RC file: ${relativePath}`);
    }
  }

  function assertIncludes(relativePath, terms) {
    const content = readFile(relativePath);
    for (const term of terms) {
      if (!content.includes(term)) {
        throw new Error(`Missing term "${term}" in ${relativePath}`);
      }
    }
  }

  return { readFile, assertFileExists, assertIncludes };
}

const DOMAIN_VERIFY_SCRIPTS = [
  "verify:aibeopchin-voice-rc",
  "verify:gongbuho-legal-knowledge-rc",
  "verify:aibeopchin-cmb-rc",
  "verify:aibeopchin-ai-core-rc",
  "verify:aibeopchin-legal-document-intelligence-rc",
  "verify:aibeopchin-litigation-command-center-rc",
  "verify:aibeopchin-client-collaboration-portal-full-rc",
];

const PLATFORM_VERIFY_SCRIPTS = [
  "verify:supplement-migration-predeploy",
  "verify:canonical-sources",
];

const EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-FULL-LEGAL-OPS-PLATFORM-PHASE16A-PREDEPLOY-RC",
  "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE12A-FULL-AI-CORE-RC-CLOSURE",
  "EVIDENCE-20260524-AIBEOPCHIN-LEGAL-DOCUMENT-INTELLIGENCE-PHASE13I-RC-PREDEPLOY-CLOSURE",
  "EVIDENCE-20260524-AIBEOPCHIN-LITIGATION-COMMAND-CENTER-PHASE14E-RC-PREDEPLOY-CLOSURE",
  "EVIDENCE-20260524-AIBEOPCHIN-CLIENT-COLLABORATION-PORTAL-PHASE15G-FULL-RC-PREDEPLOY-CLOSURE",
];

export function runFullLegalOpsPlatformRcBlock(
  execSync,
  root,
  label = "verify:full-legal-ops-platform-rc",
  options = {},
) {
  const { skipStaticGates = false } = options;
  const { readFile, assertFileExists, assertIncludes } =
    createFullLegalOpsPlatformRcFsHelpers(root);

  assertFileExists("docs/platform/AIBEOPCHIN_FULL_LEGAL_OPS_PLATFORM_RC_LOCK_SUMMARY.md");
  assertFileExists(
    "docs/platform/AIBEOPCHIN_FULL_LEGAL_OPS_PLATFORM_PREDEPLOY_CLOSURE_CHECKLIST.md",
  );
  assertFileExists("src/features/platform/full-legal-ops-platform-rc-lock.ts");
  assertFileExists("src/features/platform/full-legal-ops-platform-rc-lock.test.ts");
  assertFileExists("scripts/ops-ai-core-role-smoke.mjs");

  assertIncludes("src/features/platform/full-legal-ops-platform-rc-lock.ts", [
    "FULL_LEGAL_OPS_PLATFORM_RC_LOCK_MARKER_PHASE16A",
    "FULL_LEGAL_OPS_PLATFORM_RC_DOMAIN_VERIFY_SCRIPTS",
    "FULL_LEGAL_OPS_PLATFORM_RC_PLATFORM_VERIFY_SCRIPTS",
    "ops:ai-core-role-smoke",
  ]);

  for (const script of DOMAIN_VERIFY_SCRIPTS) {
    console.log(`[${label}] domain RC — npm run ${script} …`);
    execSync(`npm run ${script}`, { stdio: "inherit", cwd: root });
  }

  for (const script of PLATFORM_VERIFY_SCRIPTS) {
    console.log(`[${label}] platform gate — npm run ${script} …`);
    execSync(`npm run ${script}`, { stdio: "inherit", cwd: root });
  }

  if (!skipStaticGates) {
    console.log(`[${label}] static gate — npx tsc --noEmit …`);
    execSync("npx tsc --noEmit", { stdio: "inherit", cwd: root });

    console.log(`[${label}] static gate — npm run lint …`);
    execSync("npm run lint", { stdio: "inherit", cwd: root });

    console.log(`[${label}] static gate — npm run test …`);
    execSync("npm run test", {
      stdio: "inherit",
      cwd: root,
      env: { ...process.env, NODE_ENV: "test" },
    });
  }

  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  for (const tag of EVIDENCE_TAGS) {
    if (!impl.includes(tag)) {
      throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
    }
  }

  const pkg = readFile("package.json");
  if (!pkg.includes("verify:aibeopchin-full-legal-ops-platform-rc")) {
    throw new Error("package.json must define verify:aibeopchin-full-legal-ops-platform-rc");
  }
  if (!pkg.includes("ops:ai-core-role-smoke")) {
    throw new Error("package.json must define ops:ai-core-role-smoke");
  }

  const predeploy = readFile("scripts/predeploy-check.ts");
  if (!predeploy.includes("verify:aibeopchin-full-legal-ops-platform-rc")) {
    throw new Error("scripts/predeploy-check.ts must call Full Legal Ops Platform RC master gate");
  }

  if (predeploy.includes("verify:aibeopchin-voice-rc")) {
    throw new Error(
      "scripts/predeploy-check.ts must not duplicate domain RC gates (use full-legal-ops-platform-rc only)",
    );
  }

  assertIncludes("docs/operations/AIBEOPCHIN_PREDEPLOY_LOCAL_CI_RUNBOOK.md", [
    "ops:ai-core-role-smoke",
    "predeploy:check",
  ]);

  console.log(`[${label}] running full-legal-ops-platform-rc-lock Vitest …`);
  execSync("npm run test -- src/features/platform/full-legal-ops-platform-rc-lock.test.ts", {
    stdio: "inherit",
    cwd: root,
  });
}
