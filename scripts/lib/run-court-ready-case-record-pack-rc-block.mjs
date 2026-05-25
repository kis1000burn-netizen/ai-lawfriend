import fs from "node:fs";
import path from "node:path";

const EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-COURT-READY-CASE-RECORD-PACK-PHASE44A-CASE-SUMMARY-PACK",
  "EVIDENCE-20260525-AIBEOPCHIN-COURT-READY-CASE-RECORD-PACK-PHASE44B-ISSUE-TABLE-PACK",
  "EVIDENCE-20260525-AIBEOPCHIN-COURT-READY-CASE-RECORD-PACK-PHASE44C-EVIDENCE-LIST-PACK",
  "EVIDENCE-20260525-AIBEOPCHIN-COURT-READY-CASE-RECORD-PACK-PHASE44D-JUDGMENT-PROCEDURE-PACK",
  "EVIDENCE-20260525-AIBEOPCHIN-COURT-READY-CASE-RECORD-PACK-PHASE44E-LAWYER-COURT-READY-REVIEW",
  "EVIDENCE-20260525-AIBEOPCHIN-COURT-READY-CASE-RECORD-PACK-PHASE44F-RC",
];

const PREREQ = [
  "EVIDENCE-20260525-AIBEOPCHIN-CLAIM-EVIDENCE-JUDGMENT-GRAPH-PHASE43F-RC",
  "EVIDENCE-20260525-AIBEOPCHIN-EVIDENCE-INTEGRITY-PHASE42F-RC",
];

const SUB = [
  "verify:aibeopchin-court-ready-case-record-pack-phase44a",
  "verify:aibeopchin-court-ready-case-record-pack-phase44b",
  "verify:aibeopchin-court-ready-case-record-pack-phase44c",
  "verify:aibeopchin-court-ready-case-record-pack-phase44d",
  "verify:aibeopchin-court-ready-case-record-pack-phase44e",
];

export function runCourtReadyCaseRecordPackRcBlock(
  execSync,
  root,
  label = "verify:aibeopchin-court-ready-case-record-pack-rc",
) {
  const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
  const exists = (p) => {
    if (!fs.existsSync(path.join(root, p))) throw new Error(`Missing ${p}`);
  };
  const inc = (p, terms) => {
    const c = read(p);
    for (const t of terms) if (!c.includes(t)) throw new Error(`Missing "${t}" in ${p}`);
  };

  exists("src/features/court-ready-case-record-pack/court-ready-case-record-pack-rc-lock.ts");
  exists("docs/platform/AIBEOPCHIN_COURT_READY_CASE_RECORD_PACK_RC_LOCK_SUMMARY.md");
  exists("src/features/court-ready-case-record-pack/shared/court-ready-case-record-pack-types.schema.ts");

  inc("src/features/court-ready-case-record-pack/court-ready-case-record-pack-rc-lock.ts", [
    "phase44f-court-ready-case-record-pack-rc-gate",
    "NO_AUTOMATIC_COURT_SUBMISSION",
    "NO_E_FILING_AUTO_UPLOAD",
    "NO_COURT_READY_BEFORE_LAWYER_REVIEW",
    "NO_INTERNAL_STRATEGY_GRAPH_IN_DEFAULT_PACK",
    "NO_SENSITIVE_CLIENT_COUNSELING_AUTO_INCLUDE",
  ]);

  inc("docs/platform/AIBEOPCHIN_COURT_READY_CASE_RECORD_PACK_RC_LOCK_SUMMARY.md", [
    "44-A",
    "43-F",
    "no automatic court submission",
    "lawyer review",
  ]);

  inc("docs/OPERATIONS_INDEX.md", ["Product 44-F", "COURT_READY_CASE_RECORD_PACK_RC_LOCK_SUMMARY"]);

  inc("src/features/court-ready-case-record-pack/case-summary-pack/case-summary-pack.service.ts", [
    "buildCaseSummaryPack",
  ]);
  inc("src/features/court-ready-case-record-pack/issue-table-pack/issue-table-pack.service.ts", [
    "buildIssueTablePack",
  ]);
  inc("src/features/court-ready-case-record-pack/evidence-list-pack/evidence-list-pack.service.ts", [
    "buildEvidenceListPack",
  ]);
  inc("src/features/court-ready-case-record-pack/judgment-procedure-pack/judgment-procedure-pack.service.ts", [
    "buildJudgmentProcedurePack",
  ]);
  inc(
    "src/features/court-ready-case-record-pack/lawyer-court-ready-review/lawyer-court-ready-review-workspace.service.ts",
    ["buildLawyerCourtReadyReviewWorkspace"],
  );

  inc("src/features/court-ready-case-record-pack/shared/court-ready-case-record-pack-types.schema.ts", [
    "courtReadyCaseRecordPackSchema",
    "automaticCourtSubmission",
    "internalStrategyGraphIncluded",
  ]);

  inc("docs/platform/AIBEOPCHIN_CLAIM_EVIDENCE_JUDGMENT_GRAPH_RC_LOCK_SUMMARY.md", [
    "Court-Ready Case Record Pack",
  ]);

  inc("docs/platform/AIBEOPCHIN_COURT_READY_CASE_RECORD_PACK_RC_LOCK_SUMMARY.md", [
    "Judicial Transparency",
  ]);

  const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  for (const tag of [...EVIDENCE_TAGS, ...PREREQ]) {
    if (!impl.includes(tag)) throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
  }

  const pkg = read("package.json");
  if (!pkg.includes("verify:aibeopchin-court-ready-case-record-pack-rc")) {
    throw new Error("missing master verify script");
  }
  for (const s of SUB) if (!pkg.includes(s)) throw new Error(`missing ${s}`);

  inc("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["44-F", "Court-Ready Case Record Pack"]);

  for (const script of SUB) {
    console.log(`[${label}] ${script} …`);
    execSync(`npm run ${script}`, { stdio: "inherit", cwd: root });
  }

  execSync(
    "npm run test -- src/features/court-ready-case-record-pack/court-ready-case-record-pack-rc-lock.test.ts",
    { stdio: "inherit", cwd: root },
  );
}
