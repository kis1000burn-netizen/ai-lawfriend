import fs from "node:fs";
import path from "node:path";

const EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-JUDICIAL-TRANSPARENCY-EXPLAINABILITY-PHASE45A-SOURCE-PROVENANCE-TRACE",
  "EVIDENCE-20260525-AIBEOPCHIN-JUDICIAL-TRANSPARENCY-EXPLAINABILITY-PHASE45B-JUDGMENT-CLAIM-EXPLAINABILITY",
  "EVIDENCE-20260525-AIBEOPCHIN-JUDICIAL-TRANSPARENCY-EXPLAINABILITY-PHASE45C-SIMILARITY-UNCERTAINTY-SIGNAL",
  "EVIDENCE-20260525-AIBEOPCHIN-JUDICIAL-TRANSPARENCY-EXPLAINABILITY-PHASE45D-LAWYER-CORRECTION-REVIEWER-TRACE",
  "EVIDENCE-20260525-AIBEOPCHIN-JUDICIAL-TRANSPARENCY-EXPLAINABILITY-PHASE45E-COURT-READY-PACK-EXPLAINABILITY",
  "EVIDENCE-20260525-AIBEOPCHIN-JUDICIAL-TRANSPARENCY-EXPLAINABILITY-PHASE45F-RC",
];

const PREREQ = [
  "EVIDENCE-20260525-AIBEOPCHIN-COURT-READY-CASE-RECORD-PACK-PHASE44F-RC",
  "EVIDENCE-20260525-AIBEOPCHIN-CLAIM-EVIDENCE-JUDGMENT-GRAPH-PHASE43F-RC",
];

const SUB = [
  "verify:aibeopchin-judicial-transparency-explainability-phase45a",
  "verify:aibeopchin-judicial-transparency-explainability-phase45b",
  "verify:aibeopchin-judicial-transparency-explainability-phase45c",
  "verify:aibeopchin-judicial-transparency-explainability-phase45d",
  "verify:aibeopchin-judicial-transparency-explainability-phase45e",
];

export function runJudicialTransparencyExplainabilityRcBlock(
  execSync,
  root,
  label = "verify:aibeopchin-judicial-transparency-explainability-rc",
) {
  const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
  const exists = (p) => {
    if (!fs.existsSync(path.join(root, p))) throw new Error(`Missing ${p}`);
  };
  const inc = (p, terms) => {
    const c = read(p);
    for (const t of terms) if (!c.includes(t)) throw new Error(`Missing "${t}" in ${p}`);
  };

  exists("src/features/judicial-transparency-explainability/judicial-transparency-explainability-rc-lock.ts");
  exists("docs/platform/AIBEOPCHIN_JUDICIAL_TRANSPARENCY_EXPLAINABILITY_RC_LOCK_SUMMARY.md");
  exists(
    "src/features/judicial-transparency-explainability/shared/judicial-transparency-explainability-types.schema.ts",
  );

  inc("src/features/judicial-transparency-explainability/judicial-transparency-explainability-rc-lock.ts", [
    "phase45f-judicial-transparency-explainability-rc-gate",
    "NO_UNEXPLAINED_AI_OUTPUT",
    "NO_HIDDEN_SOURCE_OMISSION",
    "NO_CLIENT_VISIBLE_EXPLAINABILITY_WITHOUT_LAWYER_REVIEW",
    "LAWYER_REVIEW_REQUIRED",
  ]);

  inc("docs/platform/AIBEOPCHIN_JUDICIAL_TRANSPARENCY_EXPLAINABILITY_RC_LOCK_SUMMARY.md", [
    "45-A",
    "44-F",
    "no unexplained AI output",
    "lawyer review",
  ]);

  inc("docs/OPERATIONS_INDEX.md", [
    "Product 45-F",
    "JUDICIAL_TRANSPARENCY_EXPLAINABILITY_RC_LOCK_SUMMARY",
  ]);

  inc(
    "src/features/judicial-transparency-explainability/source-provenance-trace/source-provenance-trace-registry.service.ts",
    ["buildSourceProvenanceTraceRegistry"],
  );
  inc(
    "src/features/judicial-transparency-explainability/judgment-claim-explainability/judgment-claim-link-explainability-engine.service.ts",
    ["buildJudgmentClaimLinkExplainabilityEngine"],
  );
  inc(
    "src/features/judicial-transparency-explainability/similarity-uncertainty-signal/similarity-difference-uncertainty-signal-engine.service.ts",
    ["buildSimilarityDifferenceUncertaintySignalEngine"],
  );
  inc(
    "src/features/judicial-transparency-explainability/lawyer-correction-reviewer-trace/lawyer-correction-final-reviewer-trace.service.ts",
    ["buildLawyerCorrectionFinalReviewerTrace"],
  );
  inc(
    "src/features/judicial-transparency-explainability/court-ready-pack-explainability/court-ready-pack-item-explainability-workspace.service.ts",
    ["buildCourtReadyPackItemExplainabilityWorkspace"],
  );

  inc(
    "src/features/judicial-transparency-explainability/shared/judicial-transparency-explainability-types.schema.ts",
    ["aiExplainabilityTraceSchema", "evidenceUsed", "finalReviewer", "unexplainedOutputAllowed"],
  );

  inc("docs/platform/AIBEOPCHIN_COURT_READY_CASE_RECORD_PACK_RC_LOCK_SUMMARY.md", [
    "Judicial Transparency",
  ]);

  inc("docs/platform/AIBEOPCHIN_JUDICIAL_TRANSPARENCY_EXPLAINABILITY_RC_LOCK_SUMMARY.md", [
    "Neutral Litigation Review Pack",
  ]);

  const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  for (const tag of [...EVIDENCE_TAGS, ...PREREQ]) {
    if (!impl.includes(tag)) throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
  }

  const pkg = read("package.json");
  if (!pkg.includes("verify:aibeopchin-judicial-transparency-explainability-rc")) {
    throw new Error("missing master verify script");
  }
  for (const s of SUB) if (!pkg.includes(s)) throw new Error(`missing ${s}`);

  inc("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", [
    "45-F",
    "Judicial Transparency",
  ]);

  for (const script of SUB) {
    console.log(`[${label}] ${script} …`);
    execSync(`npm run ${script}`, { stdio: "inherit", cwd: root });
  }

  execSync(
    "npm run test -- src/features/judicial-transparency-explainability/judicial-transparency-explainability-rc-lock.test.ts",
    { stdio: "inherit", cwd: root },
  );
}
