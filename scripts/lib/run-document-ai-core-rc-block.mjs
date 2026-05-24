import fs from "node:fs";
import path from "node:path";
import { assertPredeployMasterOrGate } from "./predeploy-gate-assertions.mjs";

/**
 * Document AI Core RC block (Tier 1 — Phase 8-E frozen).
 */
export function runDocumentAiCoreRcBlock(execSync, root, label = "verify:aibeopchin-ai-core-rc") {
  function readFile(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
  }

  function assertFileExists(relativePath) {
    const full = path.join(root, relativePath);
    if (!fs.existsSync(full)) {
      throw new Error(`Missing required file for Phase 8-E: ${relativePath}`);
    }
  }

  const phaseScripts = [
    "verify:post-ops-critical-fix",
    "verify:aibeopchin-ai-core-phase8a",
    "verify:aibeopchin-ai-core-phase8b",
    "verify:aibeopchin-ai-core-phase8c",
    "verify:aibeopchin-ai-core-phase8d",
  ];

  for (const script of phaseScripts) {
    console.log(`[${label}] Tier1 running npm run ${script} …`);
    execSync(`npm run ${script}`, { stdio: "inherit", cwd: root });
  }

  const rcSummaryPath = "docs/ai/AIBEOPCHIN_AI_CORE_RC_LOCK_SUMMARY.md";
  const rcChecklistPath = "docs/ai/AIBEOPCHIN_AI_CORE_PREDEPLOY_CLOSURE_CHECKLIST.md";
  assertFileExists(rcSummaryPath);
  assertFileExists(rcChecklistPath);

  const rcSummary = readFile(rcSummaryPath);
  const rcChecklist = readFile(rcChecklistPath);
  const rcLockTs = readFile("src/features/ai-core/ai-rc-lock.ts");
  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  const readme = readFile("docs/ai/README.md");
  const predeploy = readFile("scripts/predeploy-check.ts");
  const envExample = readFile(".env.example");

  const tag8e = "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE8E-RC-PREDEPLOY-CLOSURE";
  if (!impl.includes(tag8e)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag8e}`);
  }

  for (const fragment of [
    "Phase **8‑E**",
    tag8e,
    "AIBEOPCHIN_AI_CORE_PREDEPLOY_CLOSURE_CHECKLIST",
    "verify:aibeopchin-ai-core-rc",
    "generationMode",
  ]) {
    if (!rcSummary.includes(fragment)) {
      throw new Error(`${rcSummaryPath} missing Phase 8-E marker "${fragment}"`);
    }
  }

  for (const fragment of [
    tag8e,
    "verify:aibeopchin-ai-core-rc",
    "OPENAI_API_KEY",
    "audit-policy",
    "PHASE8D_DOCUMENT_PARAGRAPH_AI_DEPRECATED_SHIM",
    "predeploy:check",
    "20260418180000_domain_definitions_phase1",
  ]) {
    if (!rcChecklist.includes(fragment)) {
      throw new Error(`${rcChecklistPath} missing Phase 8-E marker "${fragment}"`);
    }
  }

  if (!rcLockTs.includes("AI_CORE_RC_LOCK_MARKER_PHASE8E")) {
    throw new Error("ai-rc-lock.ts missing AI_CORE_RC_LOCK_MARKER_PHASE8E");
  }

  for (const envKey of [
    "OPENAI_API_KEY",
    "OPENAI_DOCUMENT_GENERATE_MODEL",
    "OPENAI_PARAGRAPH_REWRITE_MODEL",
  ]) {
    if (!envExample.includes(envKey)) {
      throw new Error(`.env.example must document ${envKey} (Phase 8-E provider env)`);
    }
  }

  const migrationDirs = ["20260418180000_domain_definitions_phase1"];
  for (const dir of migrationDirs) {
    const migrationSql = path.join(root, "prisma", "migrations", dir, "migration.sql");
    if (!fs.existsSync(migrationSql)) {
      throw new Error(`Missing AI Core baseline migration: prisma/migrations/${dir}/migration.sql`);
    }
    const sql = fs.readFileSync(migrationSql, "utf8");
    if (!sql.includes("generationMode")) {
      throw new Error(`Baseline migration ${dir} must include generationMode`);
    }
  }

  const evidenceStack = [
    "EVIDENCE-20260523-AIBEOPCHIN-POST-OPS-CRITICAL-FIX",
    "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE8A-DOCUMENT-UNIFICATION-SPEC",
    "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE8B-ROUTE-MIGRATION",
    "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE8C-LEGACY-CLEANUP-PROMPT-BINDING",
    "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE8D-NATIVE-CONTEXT-AUDIT-CLOSURE",
  ];
  for (const tag of evidenceStack) {
    if (!impl.includes(tag)) {
      throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag} (Phase 8-E RC requires full stack)`);
    }
  }

  assertFileExists("src/app/api/admin/ai-core/audit-policy/route.ts");
  assertFileExists("tests/e2e/aibeopchin-ai-core-audit-smoke.spec.ts");

  for (const shim of [
    "src/features/document-drafts/document-paragraph-ai.engine.ts",
    "src/features/document-drafts/document-paragraph-ai.prompts.ts",
    "src/features/document-drafts/document-paragraph-ai.utils.ts",
  ]) {
    const content = readFile(shim);
    if (!content.includes("PHASE8D_DOCUMENT_PARAGRAPH_AI_DEPRECATED_SHIM")) {
      throw new Error(`${shim} missing deprecated shim marker (Phase 8-E RC)`);
    }
  }

  const generationMode = readFile("src/features/ai-core/generation-mode-runtime.ts");
  for (const mode of ["MANUAL_ONLY", "AI_GENERATE", "AI_REGENERATE", "LOCK_AFTER_APPROVAL"]) {
    if (!generationMode.includes(`"${mode}"`)) {
      throw new Error(`generation-mode-runtime missing ${mode} (Phase 8-E RC)`);
    }
  }

  if (!readme.includes("./AIBEOPCHIN_AI_CORE_RC_LOCK_SUMMARY.md")) {
    throw new Error("docs/ai/README.md must link AIBEOPCHIN_AI_CORE_RC_LOCK_SUMMARY.md (Phase 8-E)");
  }

  assertPredeployMasterOrGate(predeploy, "verify:aibeopchin-ai-core-rc", "Phase 8-E AI Core RC");

  console.log(`[${label}] Tier1 running document ai-core Vitest …`);
  execSync("npm run test -- src/features/ai-core src/lib/document-ai.test.ts", {
    stdio: "inherit",
    cwd: root,
  });
}
