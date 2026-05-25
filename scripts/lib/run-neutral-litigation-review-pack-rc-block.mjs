import fs from "node:fs";
import path from "node:path";

const EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-COURT-MEDIATOR-REVIEW-MODE-PHASE46A-NEUTRAL-PRESENTATION-VIEW",
  "EVIDENCE-20260525-AIBEOPCHIN-COURT-MEDIATOR-REVIEW-MODE-PHASE46B-LAWYER-SELECTED-SCOPE",
  "EVIDENCE-20260525-AIBEOPCHIN-COURT-MEDIATOR-REVIEW-MODE-PHASE46C-STRATEGY-CONFIDENTIAL-SEPARATION",
  "EVIDENCE-20260525-AIBEOPCHIN-COURT-MEDIATOR-REVIEW-MODE-PHASE46D-UNREVIEWED-AI-FILTER",
  "EVIDENCE-20260525-AIBEOPCHIN-COURT-MEDIATOR-REVIEW-MODE-PHASE46E-COURT-REVIEW-READ-ONLY",
  "EVIDENCE-20260525-AIBEOPCHIN-COURT-MEDIATOR-REVIEW-MODE-PHASE46F-RC",
];

const PREREQ = [
  "EVIDENCE-20260525-AIBEOPCHIN-JUDICIAL-TRANSPARENCY-EXPLAINABILITY-PHASE45F-RC",
  "EVIDENCE-20260525-AIBEOPCHIN-COURT-READY-CASE-RECORD-PACK-PHASE44F-RC",
];

const SUB = [
  "verify:aibeopchin-neutral-litigation-review-pack-phase46a",
  "verify:aibeopchin-neutral-litigation-review-pack-phase46b",
  "verify:aibeopchin-neutral-litigation-review-pack-phase46c",
  "verify:aibeopchin-neutral-litigation-review-pack-phase46d",
  "verify:aibeopchin-neutral-litigation-review-pack-phase46e",
];

export function runNeutralLitigationReviewPackRcBlock(
  execSync,
  root,
  label = "verify:aibeopchin-neutral-litigation-review-pack-rc",
) {
  const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
  const exists = (p) => {
    if (!fs.existsSync(path.join(root, p))) throw new Error(`Missing ${p}`);
  };
  const inc = (p, terms) => {
    const c = read(p);
    for (const t of terms) if (!c.includes(t)) throw new Error(`Missing "${t}" in ${p}`);
  };

  exists("src/features/neutral-litigation-review-pack/neutral-litigation-review-pack-rc-lock.ts");
  exists("docs/platform/AIBEOPCHIN_NEUTRAL_LITIGATION_REVIEW_PACK_RC_LOCK_SUMMARY.md");
  exists("src/features/neutral-litigation-review-pack/shared/neutral-litigation-review-pack-types.schema.ts");

  inc("src/features/neutral-litigation-review-pack/neutral-litigation-review-pack-rc-lock.ts", [
    "phase46f-neutral-litigation-review-pack-rc-gate",
    "NO_DIRECT_COURT_ACCESS",
    "NO_MEDIATOR_PORTAL_BY_DEFAULT",
    "NO_OPPOSING_PARTY_AUTO_SHARE",
    "LAWYER_CONTROLLED_EXPORT_ONLY",
    "NO_INTERNAL_STRATEGY_IN_NEUTRAL_PACK",
    "NO_UNREVIEWED_AI_OUTPUT",
    "NO_CLIENT_CONFIDENTIAL_MEMO",
  ]);

  inc("docs/platform/AIBEOPCHIN_NEUTRAL_LITIGATION_REVIEW_PACK_RC_LOCK_SUMMARY.md", [
    "46-A",
    "45-F",
    "NO_DIRECT_COURT_ACCESS",
    "공식 정정",
    "Legal Reliability RC",
  ]);

  inc("docs/OPERATIONS_INDEX.md", ["Product 46-F", "NEUTRAL_LITIGATION_REVIEW_PACK_RC_LOCK_SUMMARY"]);

  inc(
    "src/features/neutral-litigation-review-pack/neutral-case-summary-view/neutral-case-summary-view.service.ts",
    ["buildNeutralCaseSummaryView"],
  );
  inc(
    "src/features/neutral-litigation-review-pack/strategy-confidential-exclusion/strategy-confidential-material-exclusion-policy.service.ts",
    ["buildStrategyConfidentialMaterialExclusionPolicy"],
  );
  inc(
    "src/features/neutral-litigation-review-pack/lawyer-controlled-export/lawyer-controlled-export-scope.service.ts",
    ["buildLawyerControlledExportScope"],
  );
  inc(
    "src/features/neutral-litigation-review-pack/mediation-hearing-pack/mediation-hearing-preparation-pack.service.ts",
    ["buildMediationHearingPreparationPack"],
  );
  inc(
    "src/features/neutral-litigation-review-pack/neutral-pack-review/neutral-pack-review-workspace.service.ts",
    ["buildNeutralPackReviewWorkspace"],
  );

  inc("src/features/neutral-litigation-review-pack/shared/neutral-litigation-review-pack-types.schema.ts", [
    "neutralLitigationReviewPackSchema",
    "directCourtAccess",
    "lawyerControlledExportOnly",
  ]);

  inc("docs/platform/AIBEOPCHIN_JUDICIAL_TRANSPARENCY_EXPLAINABILITY_RC_LOCK_SUMMARY.md", [
    "Neutral Litigation Review Pack",
  ]);

  const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  for (const tag of [...EVIDENCE_TAGS, ...PREREQ]) {
    if (!impl.includes(tag)) throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
  }

  const pkg = read("package.json");
  if (!pkg.includes("verify:aibeopchin-neutral-litigation-review-pack-rc")) {
    throw new Error("missing master verify script");
  }
  for (const s of SUB) if (!pkg.includes(s)) throw new Error(`missing ${s}`);

  inc("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", [
    "46-F",
    "Neutral Litigation Review Pack",
  ]);

  for (const script of SUB) {
    console.log(`[${label}] ${script} …`);
    execSync(`npm run ${script}`, { stdio: "inherit", cwd: root });
  }

  execSync(
    "npm run test -- src/features/neutral-litigation-review-pack/neutral-litigation-review-pack-rc-lock.test.ts",
    { stdio: "inherit", cwd: root },
  );
}
