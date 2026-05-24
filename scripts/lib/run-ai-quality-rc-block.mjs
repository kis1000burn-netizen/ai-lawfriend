import fs from "node:fs";
import path from "node:path";

/**
 * Shared AI Quality / Case Pack RC block (Product Phase 23-F).
 * Bundles 23-A~E static gates + Phase 22-F/10-D product cross-link.
 */
export function createAiQualityRcFsHelpers(root) {
  function readFile(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), "utf8");
  }

  function assertFileExists(relativePath) {
    const full = path.join(root, relativePath);
    if (!fs.existsSync(full)) {
      throw new Error(`Missing required AI Quality RC file: ${relativePath}`);
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
  "EVIDENCE-20260524-AIBEOPCHIN-AI-QUALITY-PHASE23A-OUTPUT-QUALITY-EVALUATION",
  "EVIDENCE-20260524-AIBEOPCHIN-AI-QUALITY-PHASE23B-LAWYER-REVIEW-FEEDBACK-LOOP",
  "EVIDENCE-20260524-AIBEOPCHIN-AI-QUALITY-PHASE23C-CASE-PACK-BUILDER",
  "EVIDENCE-20260524-AIBEOPCHIN-AI-QUALITY-PHASE23D-EVIDENCE-TIMELINE-ISSUE-PACK",
  "EVIDENCE-20260524-AIBEOPCHIN-AI-QUALITY-PHASE23E-CLIENT-SAFE-CASE-PROGRESS-PACK",
  "EVIDENCE-20260524-AIBEOPCHIN-AI-QUALITY-PHASE23F-RC",
];

const PREREQ_EVIDENCE_TAGS = [
  "EVIDENCE-20260524-AIBEOPCHIN-TENANT-PHASE22F-RC",
  "EVIDENCE-20260523-AIBEOPCHIN-AI-CORE-PHASE10D-AI-GOVERNANCE-RC-CLOSURE",
];

const SUB_VERIFY_SCRIPTS = [
  "verify:aibeopchin-ai-quality-phase23a",
  "verify:aibeopchin-ai-quality-phase23b",
  "verify:aibeopchin-ai-quality-phase23c",
  "verify:aibeopchin-ai-quality-phase23d",
  "verify:aibeopchin-ai-quality-phase23e",
];

export function runAiQualityRcBlock(execSync, root, label = "verify:aibeopchin-ai-quality-rc") {
  const { readFile, assertFileExists, assertIncludes } = createAiQualityRcFsHelpers(root);

  assertFileExists("src/features/ai-quality/ai-quality-case-pack-rc-lock.ts");
  assertFileExists("src/features/ai-quality/ai-quality-case-pack-rc-lock.test.ts");
  assertFileExists("docs/platform/AIBEOPCHIN_AI_QUALITY_CASE_PACK_RC_LOCK_SUMMARY.md");
  assertFileExists("docs/operations/AIBEOPCHIN_AI_QUALITY_CASE_PACK_RC_RUNBOOK.md");

  assertIncludes("src/features/ai-quality/ai-quality-case-pack-rc-lock.ts", [
    "AI_QUALITY_CASE_PACK_RC_LOCK_MARKER_PHASE23F",
    "verify:aibeopchin-ai-quality-rc",
    "AI_QUALITY_CASE_PACK_RC_PRODUCT_CROSS_LINK",
    "AI_QUALITY_CASE_PACK_RC_CLIENT_SAFE_MARKER",
  ]);

  assertIncludes("docs/platform/AIBEOPCHIN_AI_QUALITY_CASE_PACK_RC_LOCK_SUMMARY.md", [
    "23-A",
    "23-E",
    "23-F",
    "verify:aibeopchin-ai-quality-rc",
    "22-F",
    "10-D",
    "client-safe",
  ]);

  assertIncludes("docs/operations/AIBEOPCHIN_AI_QUALITY_CASE_PACK_RC_RUNBOOK.md", [
    "verify:aibeopchin-ai-quality-rc",
    "Operator checklist",
    "23-A",
    "23-E",
  ]);

  assertIncludes("docs/OPERATIONS_INDEX.md", [
    "AIBEOPCHIN_AI_QUALITY_CASE_PACK_RC_LOCK_SUMMARY.md",
    "AIBEOPCHIN_AI_QUALITY_CASE_PACK_RC_RUNBOOK.md",
    "Product 23-F",
  ]);

  assertIncludes("src/features/ai-quality/ai-output-quality-evaluation.service.ts", [
    "evaluateAiOutputAgainstGoldenEntry",
  ]);

  assertIncludes("src/features/ai-quality/lawyer-review-feedback-loop.service.ts", [
    "recordLawyerReviewFeedback",
  ]);

  assertIncludes("src/features/ai-quality/case-pack-builder.service.ts", [
    "buildCasePackForCase",
  ]);

  assertIncludes("src/features/ai-quality/evidence-timeline-issue-pack.service.ts", [
    "buildEvidenceTimelineIssuePackForCase",
  ]);

  assertIncludes("src/features/ai-quality/client-safe-case-progress-pack.service.ts", [
    "buildClientSafeCaseProgressPackForCase",
  ]);

  assertIncludes("src/features/ai-core/client-safe-disclosure.schema.ts", [
    "CLIENT_SAFE_BLOCKED_CATEGORIES",
  ]);

  const impl = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  for (const tag of [...EVIDENCE_TAGS, ...PREREQ_EVIDENCE_TAGS]) {
    if (!impl.includes(tag)) {
      throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
    }
  }

  const pkg = readFile("package.json");
  if (!pkg.includes("verify:aibeopchin-ai-quality-rc")) {
    throw new Error("package.json must define verify:aibeopchin-ai-quality-rc");
  }
  for (const script of SUB_VERIFY_SCRIPTS) {
    if (!pkg.includes(script)) {
      throw new Error(`package.json must define ${script}`);
    }
  }

  assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["23-F"]);

  for (const script of SUB_VERIFY_SCRIPTS) {
    console.log(`[${label}] ${script} …`);
    execSync(`npm run ${script}`, { stdio: "inherit", cwd: root });
  }

  console.log(`[${label}] ai-quality-case-pack-rc-lock Vitest …`);
  execSync("npm run test -- src/features/ai-quality/ai-quality-case-pack-rc-lock.test.ts", {
    stdio: "inherit",
    cwd: root,
  });
}
