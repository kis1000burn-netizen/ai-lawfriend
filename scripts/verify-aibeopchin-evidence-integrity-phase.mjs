import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const phases = [
  {
    id: "42a",
    tag: "EVIDENCE-20260525-AIBEOPCHIN-EVIDENCE-INTEGRITY-PHASE42A-FILE-HASH",
    service:
      "src/features/evidence-integrity/file-hash/evidence-file-hash-original-preservation.service.ts",
    policy:
      "src/features/evidence-integrity/file-hash/evidence-file-hash-original-preservation.policy.ts",
    runbook: "docs/operations/AIBEOPCHIN_EVIDENCE_FILE_HASH_ORIGINAL_PRESERVATION_RUNBOOK.md",
    buildFn: "buildEvidenceFileHashOriginalPreservation",
    gate: "evidenceFileHashOriginalPreservationReady",
    policyTerms: ["ORIGINAL_FILE_PRESERVED"],
    test: "src/features/evidence-integrity/file-hash/evidence-file-hash-original-preservation.test.ts",
    roadmap: "42-A",
  },
  {
    id: "42b",
    tag: "EVIDENCE-20260525-AIBEOPCHIN-EVIDENCE-INTEGRITY-PHASE42B-CHAIN-OF-CUSTODY",
    service: "src/features/evidence-integrity/chain-of-custody/evidence-chain-of-custody-log.service.ts",
    policy: "src/features/evidence-integrity/chain-of-custody/evidence-chain-of-custody-log.policy.ts",
    runbook: "docs/operations/AIBEOPCHIN_EVIDENCE_CHAIN_OF_CUSTODY_LOG_RUNBOOK.md",
    buildFn: "buildEvidenceChainOfCustodyLog",
    gate: "evidenceChainOfCustodyLogReady",
    policyTerms: ["evidenceChainOfCustodyLogReady"],
    test: "src/features/evidence-integrity/chain-of-custody/evidence-chain-of-custody-log.test.ts",
    roadmap: "42-B",
  },
  {
    id: "42c",
    tag: "EVIDENCE-20260525-AIBEOPCHIN-EVIDENCE-INTEGRITY-PHASE42C-EXTRACT-LINKAGE",
    service: "src/features/evidence-integrity/extract-linkage/ai-extract-to-source-linkage.service.ts",
    policy: "src/features/evidence-integrity/extract-linkage/ai-extract-to-source-linkage.policy.ts",
    runbook: "docs/operations/AIBEOPCHIN_AI_EXTRACT_TO_SOURCE_LINKAGE_RUNBOOK.md",
    buildFn: "buildAiExtractToSourceLinkage",
    gate: "aiExtractToSourceLinkageReady",
    policyTerms: ["NO_AI_EXTRACT_REPLACES_ORIGINAL"],
    test: "src/features/evidence-integrity/extract-linkage/ai-extract-to-source-linkage.test.ts",
    roadmap: "42-C",
  },
  {
    id: "42d",
    tag: "EVIDENCE-20260525-AIBEOPCHIN-EVIDENCE-INTEGRITY-PHASE42D-REVIEW-TAMPER",
    service: "src/features/evidence-integrity/review-tamper/evidence-review-tamper-warning.service.ts",
    policy: "src/features/evidence-integrity/review-tamper/evidence-review-tamper-warning.policy.ts",
    runbook: "docs/operations/AIBEOPCHIN_EVIDENCE_REVIEW_TAMPER_WARNING_RUNBOOK.md",
    buildFn: "buildEvidenceReviewTamperWarning",
    gate: "evidenceReviewTamperWarningReady",
    policyTerms: ["TAMPER_WARNING_REQUIRED"],
    test: "src/features/evidence-integrity/review-tamper/evidence-review-tamper-warning.test.ts",
    roadmap: "42-D",
  },
  {
    id: "42e",
    tag: "EVIDENCE-20260525-AIBEOPCHIN-EVIDENCE-INTEGRITY-PHASE42E-LAWYER-REVIEW",
    service:
      "src/features/evidence-integrity/lawyer-review/lawyer-evidence-integrity-review-workspace.service.ts",
    policy:
      "src/features/evidence-integrity/lawyer-review/lawyer-evidence-integrity-review-workspace.policy.ts",
    runbook: "docs/operations/AIBEOPCHIN_LAWYER_EVIDENCE_INTEGRITY_REVIEW_WORKSPACE_RUNBOOK.md",
    buildFn: "buildLawyerEvidenceIntegrityReviewWorkspace",
    gate: "lawyerEvidenceIntegrityReviewWorkspaceReady",
    policyTerms: ["ORIGINAL_EVIDENCE_TRACE_REQUIRED"],
    test: "src/features/evidence-integrity/lawyer-review/lawyer-evidence-integrity-review-workspace.test.ts",
    roadmap: "42-E",
  },
];

const phaseId = process.argv[2];
const phase = phases.find((p) => p.id === phaseId);
if (!phase) throw new Error(`Unknown phase ${phaseId}`);

function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}
function assertIncludes(p, terms) {
  const c = read(p);
  for (const t of terms) if (!c.includes(t)) throw new Error(`Missing "${t}" in ${p}`);
}

for (const f of [phase.service, phase.runbook]) {
  if (!fs.existsSync(path.join(root, f))) throw new Error(`Missing ${f}`);
}

assertIncludes(phase.service, [phase.buildFn]);
assertIncludes(phase.policy, [phase.gate, ...phase.policyTerms]);
assertIncludes(phase.runbook, [phase.roadmap]);
assertIncludes("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", [phase.roadmap]);
if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(phase.tag)) {
  throw new Error(`Missing ${phase.tag}`);
}
if (!read("package.json").includes(`verify:aibeopchin-evidence-integrity-phase${phaseId}`)) {
  throw new Error(`missing verify script ${phaseId}`);
}

execSync(`npm run test -- ${phase.test}`, { stdio: "inherit", cwd: root });
console.log(`verify:aibeopchin-evidence-integrity-phase${phaseId} PASS`);
