import fs from "node:fs";
import path from "node:path";

/**
 * Shared Client Disclosure RC block (Tier 4).
 * Used by verify:aibeopchin-client-disclosure-rc AND verify:aibeopchin-ai-core-rc Tier 4.
 * Must NOT exec the standalone npm script (no circular calls).
 */
export function createClientDisclosureRcFsHelpers(root) {
  function readFile(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
  }

  function assertFileExists(relativePath) {
    const full = path.join(root, relativePath);
    if (!fs.existsSync(full)) {
      throw new Error(`Missing required Client Disclosure RC file: ${relativePath}`);
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

export function runClientDisclosureRcBlock(execSync, root, label = "verify:client-disclosure-rc") {
  const { readFile, assertFileExists, assertIncludes } = createClientDisclosureRcFsHelpers(root);

  for (const script of [
    "verify:aibeopchin-case-intelligence-graph",
    "verify:aibeopchin-contradiction-radar",
    "verify:aibeopchin-lawyer-judgment-ledger",
    "verify:aibeopchin-lawyer-review-console",
    "verify:aibeopchin-client-disclosure-preview",
    "verify:aibeopchin-client-disclosure-delivery",
  ]) {
    console.log(`[${label}] running npm run ${script} …`);
    execSync(`npm run ${script}`, { stdio: "inherit", cwd: root });
  }

  assertFileExists("docs/ai/AIBEOPCHIN_CLIENT_DISCLOSURE_RC_LOCK_SUMMARY.md");
  assertFileExists("docs/ai/AIBEOPCHIN_CLIENT_DISCLOSURE_PREDEPLOY_CLOSURE_CHECKLIST.md");
  assertFileExists("src/features/ai-core/client-disclosure-rc-lock.ts");

  const rcLock = readFile("src/features/ai-core/ai-rc-lock.ts");
  if (rcLock.includes('"verify:aibeopchin-client-disclosure-rc"')) {
    throw new Error(
      "ai-rc-lock Tier4 script list must not include verify:aibeopchin-client-disclosure-rc (circular risk)",
    );
  }

  assertIncludes("docs/ai/AIBEOPCHIN_LAWYER_REVIEW_CONSOLE_SPEC.md", [
    "Phase **11‑A**",
    "intelligence-review",
    "CaseIntelligenceSnapshot",
    "applyLawyerJudgmentDecision",
  ]);

  assertIncludes("docs/ai/AIBEOPCHIN_CLIENT_DISCLOSURE_PREVIEW_SPEC.md", [
    "Phase **11‑B**",
    "CaseClientDisclosureRelease",
    "projectClientSafeStatements",
    "11-B.1",
  ]);

  assertIncludes("docs/ai/AIBEOPCHIN_CLIENT_DISCLOSURE_DELIVERY_SPEC.md", [
    "Phase **11‑C**",
    "getClientDisclosureDelivery",
    "intelligenceGraph",
    "11-C.1",
  ]);

  assertIncludes("src/app/api/cases/[caseId]/summary/generate/route.ts", [
    "Phase 11-C",
    "getClientDisclosureDelivery",
    "isClientSafeDisclosureAudience",
  ]);

  assertIncludes("src/components/cases/case-detail-client.tsx", [
    "ClientDisclosureDeliveryPanel",
    'currentUser.role === "CLIENT"',
    "intelligence-review",
    "client-disclosure-preview",
  ]);

  assertIncludes("prisma/schema.prisma", [
    "model CaseIntelligenceSnapshot",
    "model CaseClientDisclosureRelease",
  ]);

  for (const migrationDir of [
    "20260525120000_case_intelligence_snapshot_phase11a",
    "20260525130000_case_client_disclosure_release_phase11b",
  ]) {
    const migrationPath = path.join(
      root,
      "prisma/migrations",
      migrationDir,
      "migration.sql",
    );
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Missing Client Disclosure RC migration: ${migrationDir}`);
    }
  }

  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  const tagClosure = "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE11D-CLIENT-DISCLOSURE-RC-CLOSURE";
  if (!impl.includes(tagClosure)) {
    throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tagClosure}`);
  }

  for (const tag of [
    "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE11A-LAWYER-REVIEW-CONSOLE",
    "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE11B-CLIENT-DISCLOSURE-PREVIEW",
    "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE11C-CLIENT-DISCLOSURE-DELIVERY",
  ]) {
    if (!impl.includes(tag)) {
      throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
    }
  }

  const readme = readFile("docs/ai/README.md");
  if (!readme.includes("| **11-D** |") || !readme.includes("RC LOCKED")) {
    throw new Error("docs/ai/README.md must include Phase **11-D** RC LOCKED row");
  }

  assertIncludes("src/features/ai-core/case-intelligence-review.service.ts", [
    "canPersistIntelligenceJudgment",
    "refreshCaseIntelligenceReviewSnapshot",
  ]);

  console.log(`[${label}] running Client Disclosure Vitest bundle …`);
  execSync(
    "npm run test -- src/features/ai-core/case-intelligence-review.service.test.ts src/features/ai-core/case-intelligence-review.permissions.test.ts src/features/ai-core/case-intelligence-review.api.validators.test.ts src/features/ai-core/client-disclosure-preview.service.test.ts src/features/ai-core/client-disclosure-delivery.service.test.ts",
    { stdio: "inherit", cwd: root },
  );
}
