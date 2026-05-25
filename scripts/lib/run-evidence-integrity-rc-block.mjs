import fs from "node:fs";
import path from "node:path";

export function createEvidenceIntegrityRcFsHelpers(root) {
  function readFile(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
  }
  function assertFileExists(relativePath) {
    if (!fs.existsSync(path.join(root, relativePath))) {
      throw new Error(`Missing required Evidence Integrity RC file: ${relativePath}`);
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
  "EVIDENCE-20260525-AIBEOPCHIN-EVIDENCE-INTEGRITY-PHASE42A-FILE-HASH",
  "EVIDENCE-20260525-AIBEOPCHIN-EVIDENCE-INTEGRITY-PHASE42B-CHAIN-OF-CUSTODY",
  "EVIDENCE-20260525-AIBEOPCHIN-EVIDENCE-INTEGRITY-PHASE42C-EXTRACT-LINKAGE",
  "EVIDENCE-20260525-AIBEOPCHIN-EVIDENCE-INTEGRITY-PHASE42D-REVIEW-TAMPER",
  "EVIDENCE-20260525-AIBEOPCHIN-EVIDENCE-INTEGRITY-PHASE42E-LAWYER-REVIEW",
  "EVIDENCE-20260525-AIBEOPCHIN-EVIDENCE-INTEGRITY-PHASE42F-RC",
];

const PREREQ_EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-SENTENCING-OUTCOME-ASSESSMENT-PHASE41F-RC",
  "EVIDENCE-20260525-AIBEOPCHIN-JUDGMENT-GROUNDED-OUTCOME-ASSESSMENT-PHASE40F-RC",
  "EVIDENCE-20260525-AIBEOPCHIN-ENTERPRISE-SECURITY-COMPLIANCE-PHASE32F-RC",
];

const SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-evidence-integrity-phase42a",
  "verify:aibeopchin-evidence-integrity-phase42b",
  "verify:aibeopchin-evidence-integrity-phase42c",
  "verify:aibeopchin-evidence-integrity-phase42d",
  "verify:aibeopchin-evidence-integrity-phase42e",
];

export function runEvidenceIntegrityRcBlock(
  execSync,
  root,
  label = "verify:aibeopchin-evidence-integrity-rc",
) {
  const { readFile, assertFileExists, assertIncludes } = createEvidenceIntegrityRcFsHelpers(root);

  assertFileExists("src/features/evidence-integrity/evidence-integrity-rc-lock.ts");
  assertFileExists("src/features/evidence-integrity/evidence-integrity-rc-lock.test.ts");
  assertFileExists("docs/platform/AIBEOPCHIN_EVIDENCE_INTEGRITY_RC_LOCK_SUMMARY.md");
  assertFileExists("docs/operations/AIBEOPCHIN_EVIDENCE_INTEGRITY_RC_RUNBOOK.md");
  assertFileExists("src/features/evidence-integrity/shared/evidence-integrity-types.schema.ts");

  assertIncludes("src/features/evidence-integrity/evidence-integrity-rc-lock.ts", [
    "EVIDENCE_INTEGRITY_RC_LOCK_MARKER_PHASE42F",
    "verify:aibeopchin-evidence-integrity-rc",
    "phase42a-evidence-file-hash-original-preservation-gate",
    "phase42-evidence-integrity-policy-only-boundary",
    "NO_AI_EXTRACT_REPLACES_ORIGINAL",
    "ORIGINAL_EVIDENCE_TRACE_REQUIRED",
    "TAMPER_WARNING_REQUIRED",
    "LAWYER_REVIEW_REQUIRED",
  ]);

  assertIncludes("docs/platform/AIBEOPCHIN_EVIDENCE_INTEGRITY_RC_LOCK_SUMMARY.md", [
    "42-A",
    "42-F",
    "41-F",
    "Claim-Evidence-Judgment",
    "no AI extract replaces original",
    "lawyer review required",
  ]);

  assertIncludes("docs/OPERATIONS_INDEX.md", [
    "AIBEOPCHIN_EVIDENCE_INTEGRITY_RC_LOCK_SUMMARY.md",
    "Product 42-F",
  ]);

  assertIncludes(
    "src/features/evidence-integrity/file-hash/evidence-file-hash-original-preservation.service.ts",
    ["buildEvidenceFileHashOriginalPreservation"],
  );
  assertIncludes(
    "src/features/evidence-integrity/chain-of-custody/evidence-chain-of-custody-log.service.ts",
    ["buildEvidenceChainOfCustodyLog"],
  );
  assertIncludes(
    "src/features/evidence-integrity/extract-linkage/ai-extract-to-source-linkage.service.ts",
    ["buildAiExtractToSourceLinkage"],
  );
  assertIncludes(
    "src/features/evidence-integrity/review-tamper/evidence-review-tamper-warning.service.ts",
    ["buildEvidenceReviewTamperWarning"],
  );
  assertIncludes(
    "src/features/evidence-integrity/lawyer-review/lawyer-evidence-integrity-review-workspace.service.ts",
    ["buildLawyerEvidenceIntegrityReviewWorkspace"],
  );

  assertIncludes("src/features/evidence-integrity/shared/evidence-integrity-types.schema.ts", [
    "evidenceFileHashSchema",
    "evidenceChainOfCustodyLogEntrySchema",
    "aiExtractSourceLinkSchema",
    "replacesOriginal",
  ]);

  assertIncludes("docs/platform/AIBEOPCHIN_SENTENCING_OUTCOME_ASSESSMENT_RC_LOCK_SUMMARY.md", [
    "Evidence Integrity",
  ]);

  assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", [
    "Phase 43",
    "Legal Reliability",
  ]);

  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  for (const tag of [...EVIDENCE_TAGS, ...PREREQ_EVIDENCE_TAGS]) {
    if (!impl.includes(tag)) throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
  }

  const pkg = readFile("package.json");
  if (!pkg.includes("verify:aibeopchin-evidence-integrity-rc")) {
    throw new Error("package.json must define verify:aibeopchin-evidence-integrity-rc");
  }
  for (const script of SUB_VERIFY_SCRIPTS) {
    if (!pkg.includes(script)) throw new Error(`package.json must define ${script}`);
  }

  assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["42-F"]);

  for (const script of SUB_VERIFY_SCRIPTS) {
    console.log(`[${label}] ${script} …`);
    execSync(`npm run ${script}`, { stdio: "inherit", cwd: root });
  }

  console.log(`[${label}] evidence-integrity-rc-lock Vitest …`);
  execSync(
    "npm run test -- src/features/evidence-integrity/evidence-integrity-rc-lock.test.ts",
    { stdio: "inherit", cwd: root },
  );
}
