import fs from "node:fs";
import path from "node:path";

const EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE47A-JUDGMENT-GROUNDED-BUNDLE",
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE47B-SENTENCING-OUTCOME-BUNDLE",
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE47C-EVIDENCE-INTEGRITY-BUNDLE",
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE47D-CLAIM-GRAPH-BUNDLE",
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE47E-COURT-READY-PACK-BUNDLE",
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE47F-EXPLAINABILITY-TRACE-BUNDLE",
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE47G-NEUTRAL-LITIGATION-PACK-BUNDLE",
  "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE47-RC",
];

const BUNDLED_EVIDENCE = [
  "EVIDENCE-20260525-AIBEOPCHIN-JUDGMENT-GROUNDED-OUTCOME-ASSESSMENT-PHASE40F-RC",
  "EVIDENCE-20260525-AIBEOPCHIN-SENTENCING-OUTCOME-ASSESSMENT-PHASE41F-RC",
  "EVIDENCE-20260525-AIBEOPCHIN-EVIDENCE-INTEGRITY-PHASE42F-RC",
  "EVIDENCE-20260525-AIBEOPCHIN-CLAIM-EVIDENCE-JUDGMENT-GRAPH-PHASE43F-RC",
  "EVIDENCE-20260525-AIBEOPCHIN-COURT-READY-CASE-RECORD-PACK-PHASE44F-RC",
  "EVIDENCE-20260525-AIBEOPCHIN-JUDICIAL-TRANSPARENCY-EXPLAINABILITY-PHASE45F-RC",
  "EVIDENCE-20260525-AIBEOPCHIN-COURT-MEDIATOR-REVIEW-MODE-PHASE46F-RC",
];

const SUB = [
  "verify:aibeopchin-legal-reliability-phase47a",
  "verify:aibeopchin-legal-reliability-phase47b",
  "verify:aibeopchin-legal-reliability-phase47c",
  "verify:aibeopchin-legal-reliability-phase47d",
  "verify:aibeopchin-legal-reliability-phase47e",
  "verify:aibeopchin-legal-reliability-phase47f",
  "verify:aibeopchin-legal-reliability-phase47g",
];

const BUNDLED_RC = [
  "verify:aibeopchin-legal-outcome-assessment-rc",
  "verify:aibeopchin-sentencing-outcome-assessment-rc",
  "verify:aibeopchin-evidence-integrity-rc",
  "verify:aibeopchin-claim-evidence-judgment-graph-rc",
  "verify:aibeopchin-court-ready-case-record-pack-rc",
  "verify:aibeopchin-judicial-transparency-explainability-rc",
  "verify:aibeopchin-neutral-litigation-review-pack-rc",
];

export function runLegalReliabilityRcBlock(
  execSync,
  root,
  label = "verify:aibeopchin-legal-reliability-rc",
) {
  const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
  const exists = (p) => {
    if (!fs.existsSync(path.join(root, p))) throw new Error(`Missing ${p}`);
  };
  const inc = (p, terms) => {
    const c = read(p);
    for (const t of terms) if (!c.includes(t)) throw new Error(`Missing "${t}" in ${p}`);
  };

  exists("src/features/legal-reliability/legal-reliability-rc-lock.ts");
  exists("docs/platform/AIBEOPCHIN_LEGAL_RELIABILITY_RC_LOCK_SUMMARY.md");
  exists("src/features/legal-reliability/shared/legal-reliability-types.schema.ts");

  inc("src/features/legal-reliability/legal-reliability-rc-lock.ts", [
    "phase47-legal-reliability-rc-gate",
    "NO_PREDICTION",
    "NO_GUARANTEE",
    "LAWYER_REVIEW_REQUIRED",
    "NO_COURT_DIRECT_ACCESS",
    "NO_UNREVEALED_SOURCE_OMISSION",
    "NO_AI_OUTPUT_WITHOUT_EVIDENCE_JUDGMENT_TRACE",
  ]);

  inc("docs/platform/AIBEOPCHIN_LEGAL_RELIABILITY_RC_LOCK_SUMMARY.md", [
    "47-A",
    "46-F",
    "7대 원칙",
    "40-F",
  ]);

  inc("docs/OPERATIONS_INDEX.md", ["Product 47", "LEGAL_RELIABILITY_RC_LOCK_SUMMARY"]);

  inc("docs/platform/AIBEOPCHIN_NEUTRAL_LITIGATION_REVIEW_PACK_RC_LOCK_SUMMARY.md", [
    "Legal Reliability RC",
  ]);

  const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  for (const tag of [...EVIDENCE_TAGS, ...BUNDLED_EVIDENCE]) {
    if (!impl.includes(tag)) throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
  }

  const pkg = read("package.json");
  if (!pkg.includes("verify:aibeopchin-legal-reliability-rc")) {
    throw new Error("missing master verify script");
  }
  for (const s of SUB) if (!pkg.includes(s)) throw new Error(`missing ${s}`);
  for (const s of BUNDLED_RC) if (!pkg.includes(s)) throw new Error(`missing bundled ${s}`);

  inc("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", [
    "47-RC",
    "Legal Reliability RC",
    "LOCKED",
  ]);

  for (const script of SUB) {
    console.log(`[${label}] ${script} …`);
    execSync(`npm run ${script}`, { stdio: "inherit", cwd: root });
  }

  for (const script of BUNDLED_RC) {
    console.log(`[${label}] bundled ${script} …`);
    execSync(`npm run ${script}`, { stdio: "inherit", cwd: root });
  }

  execSync("npm run test -- src/features/legal-reliability/legal-reliability-rc-lock.test.ts", {
    stdio: "inherit",
    cwd: root,
  });
}
