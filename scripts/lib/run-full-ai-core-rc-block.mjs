import fs from "node:fs";
import path from "node:path";
import {
  assertPredeployMasterOrGate,
  FULL_LEGAL_OPS_PLATFORM_RC_MASTER_VERIFY,
} from "./predeploy-gate-assertions.mjs";

/**
 * Shared Full AI Core RC master block (Phase 12-A).
 * Used at end of verify:aibeopchin-ai-core-rc AND referenced by verify:aibeopchin-full-ai-core-rc.
 * Must NOT exec verify:aibeopchin-full-ai-core-rc (no circular calls).
 */
export function createFullAiCoreRcFsHelpers(root) {
  function readFile(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
  }

  function assertFileExists(relativePath) {
    const full = path.join(root, relativePath);
    if (!fs.existsSync(full)) {
      throw new Error(`Missing required Full AI Core RC file: ${relativePath}`);
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

export function runFullAiCoreRcBlock(execSync, root, label = "verify:full-ai-core-rc") {
  const { readFile, assertFileExists, assertIncludes } = createFullAiCoreRcFsHelpers(root);

  assertFileExists("docs/ai/AIBEOPCHIN_FULL_AI_CORE_RC_LOCK_SUMMARY.md");
  assertFileExists("docs/ai/AIBEOPCHIN_FULL_AI_CORE_PREDEPLOY_MASTER_CHECKLIST.md");
  assertFileExists("src/features/ai-core/full-ai-core-rc-lock.ts");

  const rcLock = readFile("src/features/ai-core/ai-rc-lock.ts");
  if (rcLock.includes('"verify:aibeopchin-full-ai-core-rc"')) {
    throw new Error(
      "ai-rc-lock must not include verify:aibeopchin-full-ai-core-rc (circular risk with master wrapper)",
    );
  }

  for (const flag of [
    "AI_CORE_RC_INCLUDES_CASE_SUMMARY_PHASE9C = true",
    "AI_CORE_RC_INCLUDES_AI_GOVERNANCE_PHASE10D = true",
    "AI_CORE_RC_INCLUDES_CLIENT_DISCLOSURE_PHASE11D = true",
    "AI_CORE_RC_INCLUDES_FULL_MASTER_PHASE12A = true",
  ]) {
    if (!rcLock.includes(flag)) {
      throw new Error(`ai-rc-lock.ts missing Full AI Core RC flag: ${flag}`);
    }
  }

  assertIncludes("docs/ai/AIBEOPCHIN_FULL_AI_CORE_RC_LOCK_SUMMARY.md", [
    "Phase **12‑A**",
    "Tier 1",
    "Tier 4",
    "verify:aibeopchin-ai-core-rc",
    "predeploy:check",
  ]);

  assertIncludes("docs/ai/AIBEOPCHIN_FULL_AI_CORE_PREDEPLOY_MASTER_CHECKLIST.md", [
    "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE12A-FULL-AI-CORE-RC-CLOSURE",
    "verify:aibeopchin-full-ai-core-rc",
    "20260418180000_domain_definitions_phase1",
    "20260525120000_case_intelligence_snapshot_phase11a",
    "20260525130000_case_client_disclosure_release_phase11b",
    "filterIntelligenceGraphForRole",
    "getClientDisclosureDelivery",
  ]);

  assertIncludes("src/features/ai-core/full-ai-core-rc-lock.ts", [
    "FULL_AI_CORE_RC_LOCK_MARKER_PHASE12A",
    "phase12a-full-ai-core-rc-predeploy-master-closure",
    "FULL_AI_CORE_RC_PREDEPLOY_EVIDENCE_TAG",
  ]);

  for (const tierDoc of [
    "docs/ai/AIBEOPCHIN_AI_CORE_RC_LOCK_SUMMARY.md",
    "docs/ai/AIBEOPCHIN_CASE_SUMMARY_RC_LOCK_SUMMARY.md",
    "docs/ai/AIBEOPCHIN_AI_GOVERNANCE_RC_LOCK_SUMMARY.md",
    "docs/ai/AIBEOPCHIN_CLIENT_DISCLOSURE_RC_LOCK_SUMMARY.md",
  ]) {
    assertFileExists(tierDoc);
  }

  const envExample = readFile(".env.example");
  for (const envKey of [
    "OPENAI_API_KEY",
    "OPENAI_DOCUMENT_GENERATE_MODEL",
    "OPENAI_PARAGRAPH_REWRITE_MODEL",
    "OPENAI_CASE_SUMMARY_MODEL",
    "CASE_SUMMARY_AI_MODE",
    "AI_GOVERNANCE_AI_ENABLED",
    "AI_GOVERNANCE_TENANT_ID",
    "AI_GOVERNANCE_MONTHLY_TOKEN_BUDGET",
    "AI_GOVERNANCE_MAX_LLM_CALLS_PER_CASE",
  ]) {
    if (!envExample.includes(envKey)) {
      throw new Error(`.env.example must document ${envKey} (Phase 12-A Full AI Core RC env SSOT)`);
    }
  }

  for (const migrationDir of [
    "20260418180000_domain_definitions_phase1",
    "20260525120000_case_intelligence_snapshot_phase11a",
    "20260525130000_case_client_disclosure_release_phase11b",
  ]) {
    const migrationPath = path.join(root, "prisma/migrations", migrationDir, "migration.sql");
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Missing Full AI Core RC migration: ${migrationDir}`);
    }
  }

  const domainMigration = readFile(
    "prisma/migrations/20260418180000_domain_definitions_phase1/migration.sql",
  );
  if (!domainMigration.includes("generationMode")) {
    throw new Error("Document baseline migration must include generationMode (Tier 1)");
  }

  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  const tag12a = "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE12A-FULL-AI-CORE-RC-CLOSURE";
  if (!impl.includes(tag12a)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag12a}`);
  }

  for (const tag of [
    "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE8E-RC-PREDEPLOY-CLOSURE",
    "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE9C-CASE-SUMMARY-RC-CLOSURE",
    "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE10D-AI-GOVERNANCE-RC-CLOSURE",
    "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE11D-CLIENT-DISCLOSURE-RC-CLOSURE",
  ]) {
    if (!impl.includes(tag)) {
      throw new Error(`IMPLEMENTATION_EVIDENCE.md missing tier RC tag ${tag} (Phase 12-A stack)`);
    }
  }

  const readme = readFile("docs/ai/README.md");
  if (!readme.includes("| **12-A** |") || !readme.includes("RC LOCKED")) {
    throw new Error("docs/ai/README.md must include Phase **12-A** RC LOCKED row");
  }
  if (!readme.includes("AIBEOPCHIN_FULL_AI_CORE_RC_LOCK_SUMMARY.md")) {
    throw new Error("docs/ai/README.md must link AIBEOPCHIN_FULL_AI_CORE_RC_LOCK_SUMMARY.md (Phase 12-A)");
  }

  const predeploy = readFile("scripts/predeploy-check.ts");
  assertPredeployMasterOrGate(predeploy, "verify:aibeopchin-ai-core-rc", "Phase 12-A AI Core RC");
  if (
    !predeploy.includes(FULL_LEGAL_OPS_PLATFORM_RC_MASTER_VERIFY) &&
    !predeploy.includes("verify:canonical-sources")
  ) {
    throw new Error(
      "scripts/predeploy-check.ts must run verify:canonical-sources (CaseStatus SSOT) or Full Legal Ops Platform RC master gate",
    );
  }
  if (predeploy.includes("verify:aibeopchin-full-ai-core-rc")) {
    throw new Error(
      "scripts/predeploy-check.ts must NOT add verify:aibeopchin-full-ai-core-rc (12-A uses ai-core-rc internally)",
    );
  }

  assertIncludes("src/app/api/cases/[caseId]/summary/generate/route.ts", [
    "Phase 11-C",
    "getClientDisclosureDelivery",
    "isClientSafeDisclosureAudience",
    "invokeCaseSummaryGenerate",
  ]);

  assertIncludes("src/features/ai-core/client-disclosure-delivery.service.ts", [
    "intelligenceGraph: undefined",
    "CaseClientDisclosureRelease",
    "mapClientDisclosureDeliveryToSummaryShape",
  ]);

  assertIncludes("src/features/ai-core/case-summary-ai-core-runtime.service.ts", [
    "filterIntelligenceGraphForRole",
    "buildCaseIntelligenceGraphRuntime",
  ]);

  assertIncludes("src/features/ai-core/ai-governance-policy.service.ts", [
    "filterIntelligenceGraphForRole",
    "LAWYER",
    "STAFF",
  ]);

  assertIncludes("prisma/schema.prisma", [
    "model CaseIntelligenceSnapshot",
    "model CaseClientDisclosureRelease",
  ]);

  assertIncludes("src/features/ai-core/case-intelligence-review.service.ts", [
    "canPersistIntelligenceJudgment(access)",
    "refreshCaseIntelligenceReviewSnapshot",
  ]);

  console.log(`[${label}] running Full AI Core role-binding Vitest spot …`);
  execSync(
    "npm run test -- src/features/ai-core/case-intelligence-review.permissions.test.ts src/features/ai-core/client-disclosure-delivery.service.test.ts src/features/ai-core/client-safe-disclosure.service.test.ts src/features/ai-core/ai-governance-policy.service.test.ts",
    { stdio: "inherit", cwd: root },
  );
}
