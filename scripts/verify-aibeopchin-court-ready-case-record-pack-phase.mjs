import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const phases = [
  {
    "id": "44a",
    "tag": "EVIDENCE-20260525-AIBEOPCHIN-COURT-READY-CASE-RECORD-PACK-PHASE44A-CASE-SUMMARY-PACK",
    "service": "src/features/court-ready-case-record-pack/case-summary-pack/case-summary-pack.service.ts",
    "policy": "src/features/court-ready-case-record-pack/case-summary-pack/case-summary-pack.policy.ts",
    "runbook": "docs/operations/AIBEOPCHIN_CASE_SUMMARY_PACK_RUNBOOK.md",
    "buildFn": "buildCaseSummaryPack",
    "gate": "caseSummaryPackReady",
    "policyTerms": [
      "caseSummaryPackReady"
    ],
    "test": "src/features/court-ready-case-record-pack/case-summary-pack/case-summary-pack.test.ts",
    "roadmap": "44-A"
  },
  {
    "id": "44b",
    "tag": "EVIDENCE-20260525-AIBEOPCHIN-COURT-READY-CASE-RECORD-PACK-PHASE44B-ISSUE-TABLE-PACK",
    "service": "src/features/court-ready-case-record-pack/issue-table-pack/issue-table-pack.service.ts",
    "policy": "src/features/court-ready-case-record-pack/issue-table-pack/issue-table-pack.policy.ts",
    "runbook": "docs/operations/AIBEOPCHIN_ISSUE_TABLE_PACK_RUNBOOK.md",
    "buildFn": "buildIssueTablePack",
    "gate": "issueTablePackReady",
    "policyTerms": [
      "issueTablePackReady"
    ],
    "test": "src/features/court-ready-case-record-pack/issue-table-pack/issue-table-pack.test.ts",
    "roadmap": "44-B"
  },
  {
    "id": "44c",
    "tag": "EVIDENCE-20260525-AIBEOPCHIN-COURT-READY-CASE-RECORD-PACK-PHASE44C-EVIDENCE-LIST-PACK",
    "service": "src/features/court-ready-case-record-pack/evidence-list-pack/evidence-list-pack.service.ts",
    "policy": "src/features/court-ready-case-record-pack/evidence-list-pack/evidence-list-pack.policy.ts",
    "runbook": "docs/operations/AIBEOPCHIN_EVIDENCE_LIST_PACK_RUNBOOK.md",
    "buildFn": "buildEvidenceListPack",
    "gate": "evidenceListPackReady",
    "policyTerms": [
      "evidenceListPackReady"
    ],
    "test": "src/features/court-ready-case-record-pack/evidence-list-pack/evidence-list-pack.test.ts",
    "roadmap": "44-C"
  },
  {
    "id": "44d",
    "tag": "EVIDENCE-20260525-AIBEOPCHIN-COURT-READY-CASE-RECORD-PACK-PHASE44D-JUDGMENT-PROCEDURE-PACK",
    "service": "src/features/court-ready-case-record-pack/judgment-procedure-pack/judgment-procedure-pack.service.ts",
    "policy": "src/features/court-ready-case-record-pack/judgment-procedure-pack/judgment-procedure-pack.policy.ts",
    "runbook": "docs/operations/AIBEOPCHIN_JUDGMENT_PROCEDURE_PACK_RUNBOOK.md",
    "buildFn": "buildJudgmentProcedurePack",
    "gate": "judgmentProcedurePackReady",
    "policyTerms": [
      "judgmentProcedurePackReady"
    ],
    "test": "src/features/court-ready-case-record-pack/judgment-procedure-pack/judgment-procedure-pack.test.ts",
    "roadmap": "44-D"
  },
  {
    "id": "44e",
    "tag": "EVIDENCE-20260525-AIBEOPCHIN-COURT-READY-CASE-RECORD-PACK-PHASE44E-LAWYER-COURT-READY-REVIEW",
    "service": "src/features/court-ready-case-record-pack/lawyer-court-ready-review/lawyer-court-ready-review-workspace.service.ts",
    "policy": "src/features/court-ready-case-record-pack/lawyer-court-ready-review/lawyer-court-ready-review-workspace.policy.ts",
    "runbook": "docs/operations/AIBEOPCHIN_LAWYER_COURT_READY_REVIEW_WORKSPACE_RUNBOOK.md",
    "buildFn": "buildLawyerCourtReadyReviewWorkspace",
    "gate": "lawyerCourtReadyReviewWorkspaceReady",
    "policyTerms": [
      "NO_AUTOMATIC_COURT_SUBMISSION",
      "NO_E_FILING_AUTO_UPLOAD",
      "NO_COURT_READY_BEFORE_LAWYER_REVIEW",
      "NO_INTERNAL_STRATEGY_GRAPH_IN_DEFAULT_PACK",
      "NO_SENSITIVE_CLIENT_COUNSELING_AUTO_INCLUDE"
    ],
    "test": "src/features/court-ready-case-record-pack/lawyer-court-ready-review/lawyer-court-ready-review-workspace.test.ts",
    "roadmap": "44-E"
  }
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
if (!read("package.json").includes(`verify:aibeopchin-court-ready-case-record-pack-phase${phaseId}`)) {
  throw new Error(`missing verify script ${phaseId}`);
}

execSync(`npm run test -- ${phase.test}`, { stdio: "inherit", cwd: root });
console.log(`verify:aibeopchin-court-ready-case-record-pack-phase${phaseId} PASS`);
