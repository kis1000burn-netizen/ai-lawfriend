import fs from "node:fs";
import path from "node:path";

/**
 * Shared Data Governance RC block (Phase 19-F).
 * Bundles 19-A~E static gates + Phase 18 reliability cross-link.
 */
export function createDataGovernanceRcFsHelpers(root) {
  function readFile(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
  }

  function assertFileExists(relativePath) {
    const full = path.join(root, relativePath);
    if (!fs.existsSync(full)) {
      throw new Error(`Missing required Data Governance RC file: ${relativePath}`);
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

const EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-DATA-GOVERNANCE-PHASE19A-DATA-RETENTION-POLICY",
  "EVIDENCE-20260524-AIBEOPCHIN-DATA-GOVERNANCE-PHASE19B-PII-LEGAL-REDACTION",
  "EVIDENCE-20260524-AIBEOPCHIN-DATA-GOVERNANCE-PHASE19C-AUDIT-LOG-RETENTION-EXPORT",
  "EVIDENCE-20260524-AIBEOPCHIN-DATA-GOVERNANCE-PHASE19D-ATTACHMENT-LIFECYCLE-EXPIRY",
  "EVIDENCE-20260524-AIBEOPCHIN-DATA-GOVERNANCE-PHASE19E-ADMIN-VISIBILITY",
  "EVIDENCE-20260524-AIBEOPCHIN-DATA-GOVERNANCE-PHASE19F-RC",
];

const PHASE18_PREREQ_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-RELIABILITY-PHASE18E-RC",
];

const SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-data-governance-phase19a",
  "verify:aibeopchin-data-governance-phase19b",
  "verify:aibeopchin-data-governance-phase19c",
  "verify:aibeopchin-data-governance-phase19d",
  "verify:aibeopchin-data-governance-phase19e",
];

export function runDataGovernanceRcBlock(
  execSync,
  root,
  label = "verify:aibeopchin-data-governance-rc",
) {
  const { readFile, assertFileExists, assertIncludes } = createDataGovernanceRcFsHelpers(root);

  assertFileExists("src/features/data-governance/data-governance-rc-lock.ts");
  assertFileExists("src/features/data-governance/data-governance-rc-lock.test.ts");
  assertFileExists("src/features/data-governance/data-governance-purge-execution.policy.ts");
  assertFileExists("src/features/data-governance/data-governance-purge-preview.service.ts");
  assertFileExists("src/features/data-governance/data-governance-purge-dry-run.service.ts");
  assertFileExists("docs/platform/AIBEOPCHIN_DATA_GOVERNANCE_RC_LOCK_SUMMARY.md");
  assertFileExists("docs/operations/AIBEOPCHIN_DATA_GOVERNANCE_RC_RUNBOOK.md");

  assertIncludes("src/features/data-governance/data-governance-rc-lock.ts", [
    "DATA_GOVERNANCE_RC_LOCK_MARKER_PHASE19F",
    "verify:aibeopchin-data-governance-rc",
    "DATA_GOVERNANCE_RC_PHASE18_CROSS_LINK",
    "DATA_GOVERNANCE_PURGE_OPERATOR_CONFIRMATION_PHRASE",
    "DRY_RUN",
  ]);

  assertIncludes("src/features/data-governance/data-governance-purge-execution.policy.ts", [
    "BUNDLED_RC_VERIFY",
    "LEGAL_HOLD_RECHECK",
    "ROLLBACK_WARNING_ACK",
    "LIMITED_EXECUTION_FLAG",
  ]);

  assertIncludes("src/features/data-governance/data-governance-purge-dry-run.service.ts", [
    "DATA_GOVERNANCE_PURGE_DRY_RUN_AUDIT_ACTION",
    "actualExecutionPerformed: false",
    "writeAuditLog",
  ]);

  assertIncludes("docs/platform/AIBEOPCHIN_DATA_GOVERNANCE_RC_LOCK_SUMMARY.md", [
    "19-A",
    "19-E",
    "19-F",
    "verify:aibeopchin-data-governance-rc",
    "dry-run",
  ]);

  assertIncludes("docs/operations/AIBEOPCHIN_DATA_GOVERNANCE_RC_RUNBOOK.md", [
    "verify:aibeopchin-data-governance-rc",
    "confirmation phrase",
    "Phase 18",
  ]);

  assertIncludes("docs/OPERATIONS_INDEX.md", [
    "AIBEOPCHIN_DATA_GOVERNANCE_RC_LOCK_SUMMARY.md",
    "AIBEOPCHIN_DATA_GOVERNANCE_RC_RUNBOOK.md",
    "Phase 19-F",
  ]);

  assertIncludes("src/app/(protected)/admin/operations/data-governance/page.tsx", [
    "getDataGovernancePurgePreviewSnapshot",
    "evaluateDataGovernancePurgeUnlockGates",
  ]);

  assertIncludes("src/components/admin/operations/data-governance-console.tsx", [
    "DataGovernancePurgeRcPanel",
  ]);

  assertIncludes("src/components/admin/operations/data-governance-purge-rc-panel.tsx", [
    "Dry-run export",
    "disabled",
  ]);

  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  for (const tag of [...EVIDENCE_TAGS, ...PHASE18_PREREQ_TAGS]) {
    if (!impl.includes(tag)) {
      throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
    }
  }

  const pkg = readFile("package.json");
  if (!pkg.includes("verify:aibeopchin-data-governance-rc")) {
    throw new Error("package.json must define verify:aibeopchin-data-governance-rc");
  }
  for (const script of SUB_VERIFY_SCRIPTS) {
    if (!pkg.includes(script)) {
      throw new Error(`package.json must define ${script}`);
    }
  }

  assertIncludes("docs/platform/AIBEOPCHIN_RELIABILITY_RC_LOCK_SUMMARY.md", [
    "Phase 19",
    "data-governance",
  ]);

  for (const script of SUB_VERIFY_SCRIPTS) {
    console.log(`[${label}] ${script} …`);
    execSync(`npm run ${script}`, { stdio: "inherit", cwd: root });
  }

  console.log(`[${label}] data-governance-rc-lock Vitest …`);
  execSync("npm run test -- src/features/data-governance/data-governance-rc-lock.test.ts", {
    stdio: "inherit",
    cwd: root,
  });

  console.log(`[${label}] purge-execution.policy Vitest …`);
  execSync(
    "npm run test -- src/features/data-governance/data-governance-purge-execution.policy.test.ts",
    { stdio: "inherit", cwd: root },
  );
}
