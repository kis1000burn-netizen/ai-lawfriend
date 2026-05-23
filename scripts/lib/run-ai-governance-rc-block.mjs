import fs from "node:fs";
import path from "node:path";

/**
 * Shared AI Governance RC block (Tier 3).
 * Used by verify:aibeopchin-ai-governance-rc AND verify:aibeopchin-ai-core-rc Tier 3.
 * Must NOT exec the standalone npm script (no circular calls).
 */
export function createAiGovernanceRcFsHelpers(root) {
  function readFile(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
  }

  function assertFileExists(relativePath) {
    const full = path.join(root, relativePath);
    if (!fs.existsSync(full)) {
      throw new Error(`Missing required AI Governance RC file: ${relativePath}`);
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

export function assertAiGovernanceEnvValidForRcFromProcessEnv() {
  const rawEnabled = process.env.AI_GOVERNANCE_AI_ENABLED?.trim().toLowerCase();
  if (rawEnabled !== undefined && rawEnabled !== "" && !["true", "false", "1", "0"].includes(rawEnabled)) {
    throw new Error(
      `Invalid AI_GOVERNANCE_AI_ENABLED="${process.env.AI_GOVERNANCE_AI_ENABLED}" — expected true|false|1|0 or unset`,
    );
  }

  for (const key of ["AI_GOVERNANCE_MONTHLY_TOKEN_BUDGET", "AI_GOVERNANCE_MAX_LLM_CALLS_PER_CASE"]) {
    const raw = process.env[key]?.trim();
    if (!raw) {
      continue;
    }
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0) {
      throw new Error(`Invalid ${key}="${raw}" — expected a non-negative number or unset`);
    }
  }
}

export function runAiGovernanceRcBlock(execSync, root, label = "verify:ai-governance-rc") {
  const { readFile, assertFileExists, assertIncludes } = createAiGovernanceRcFsHelpers(root);

  for (const script of [
    "verify:aibeopchin-ai-governance-control",
    "verify:aibeopchin-ai-governance-audit",
    "verify:aibeopchin-client-safe-disclosure",
  ]) {
    console.log(`[${label}] running npm run ${script} …`);
    execSync(`npm run ${script}`, { stdio: "inherit", cwd: root });
  }

  assertFileExists("docs/ai/AIBEOPCHIN_AI_GOVERNANCE_RC_LOCK_SUMMARY.md");
  assertFileExists("docs/ai/AIBEOPCHIN_AI_GOVERNANCE_PREDEPLOY_CLOSURE_CHECKLIST.md");
  assertFileExists("src/features/ai-core/ai-governance-rc-lock.ts");

  const rcLock = readFile("src/features/ai-core/ai-rc-lock.ts");
  if (rcLock.includes('"verify:aibeopchin-ai-governance-rc"')) {
    throw new Error(
      "ai-rc-lock Tier3 script list must not include verify:aibeopchin-ai-governance-rc (circular risk)",
    );
  }

  assertIncludes("docs/ai/AIBEOPCHIN_AI_GOVERNANCE_CONTROL_MATRIX.md", [
    "Phase **10‑A**",
    "assertCaseSummaryAiGovernanceAllowsInvoke",
    "clientVisibleMinCaseStatus",
    "10-A.1",
  ]);

  assertIncludes("docs/ai/AIBEOPCHIN_AI_GOVERNANCE_AUDIT_USAGE_METERING_SPEC.md", [
    "Phase **10‑B**",
    "assertCaseSummaryGovernanceAndMeterAllowsInvoke",
    "10-B.1",
  ]);

  assertIncludes("docs/ai/AIBEOPCHIN_CLIENT_SAFE_DISCLOSURE_LAYER_SPEC.md", [
    "Phase **10‑C**",
    "applyClientSafeDisclosureToSummaryResult",
    "10-C.1",
  ]);

  assertIncludes("src/features/ai-core/case-summary-ai-core-runtime.service.ts", [
    "assertCaseSummaryGovernanceAndMeterAllowsInvoke",
    "filterIntelligenceGraphForRole",
    "applyClientSafeDisclosureToSummaryResult",
    "clientSafeDisclosure",
  ]);

  assertIncludes("src/app/api/cases/[caseId]/summary/generate/route.ts", [
    "Phase 10-A",
    "Phase 10-B",
    "Phase 10-C",
  ]);

  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  const tagClosure = "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE10D-AI-GOVERNANCE-RC-CLOSURE";
  if (!impl.includes(tagClosure)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tagClosure}`);
  }

  for (const tag of [
    "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE10A-AI-GOVERNANCE-CONTROL-MATRIX",
    "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE10B-AI-GOVERNANCE-AUDIT-USAGE-METERING",
    "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE10C-CLIENT-SAFE-DISCLOSURE-LAYER",
  ]) {
    if (!impl.includes(tag)) {
      throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
    }
  }

  const envExample = readFile(".env.example");
  for (const envKey of [
    "AI_GOVERNANCE_AI_ENABLED",
    "AI_GOVERNANCE_TENANT_ID",
    "AI_GOVERNANCE_MONTHLY_TOKEN_BUDGET",
    "AI_GOVERNANCE_MAX_LLM_CALLS_PER_CASE",
  ]) {
    if (!envExample.includes(envKey)) {
      throw new Error(`.env.example must document ${envKey}`);
    }
  }

  assertAiGovernanceEnvValidForRcFromProcessEnv();

  const readme = readFile("docs/ai/README.md");
  if (!readme.includes("| **10-D** |") || !readme.includes("RC LOCKED")) {
    throw new Error("docs/ai/README.md must include Phase **10-D** RC LOCKED row");
  }

  console.log(`[${label}] running AI Governance Vitest bundle …`);
  execSync(
    "npm run test -- src/features/ai-core/ai-governance-control.schema.test.ts src/features/ai-core/ai-governance-policy.service.test.ts src/features/ai-core/ai-governance-validator.test.ts src/features/ai-core/ai-governance-audit.schema.test.ts src/features/ai-core/ai-governance-usage-meter.service.test.ts src/features/ai-core/ai-governance-audit.service.test.ts src/features/ai-core/client-safe-disclosure.schema.test.ts src/features/ai-core/client-safe-disclosure.service.test.ts src/features/ai-core/client-safe-disclosure-validator.test.ts",
    { stdio: "inherit", cwd: root },
  );
}
