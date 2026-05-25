import fs from "node:fs";
import path from "node:path";

const EVIDENCE_TAGS = [
  "EVIDENCE-20260525-AIBEOPCHIN-CLAIM-EVIDENCE-JUDGMENT-GRAPH-PHASE43A-CLAIM-ISSUE-REGISTRY",
  "EVIDENCE-20260525-AIBEOPCHIN-CLAIM-EVIDENCE-JUDGMENT-GRAPH-PHASE43B-CLAIM-EVIDENCE-EDGE",
  "EVIDENCE-20260525-AIBEOPCHIN-CLAIM-EVIDENCE-JUDGMENT-GRAPH-PHASE43C-ISSUE-JUDGMENT-EDGE",
  "EVIDENCE-20260525-AIBEOPCHIN-CLAIM-EVIDENCE-JUDGMENT-GRAPH-PHASE43D-OPPONENT-RISK-GRAPH",
  "EVIDENCE-20260525-AIBEOPCHIN-CLAIM-EVIDENCE-JUDGMENT-GRAPH-PHASE43E-LAWYER-GRAPH-REVIEW",
  "EVIDENCE-20260525-AIBEOPCHIN-CLAIM-EVIDENCE-JUDGMENT-GRAPH-PHASE43F-RC",
];

const PREREQ = [
  "EVIDENCE-20260525-AIBEOPCHIN-EVIDENCE-INTEGRITY-PHASE42F-RC",
  "EVIDENCE-20260525-AIBEOPCHIN-JUDGMENT-GROUNDED-OUTCOME-ASSESSMENT-PHASE40F-RC",
];

const SUB = [
  "verify:aibeopchin-claim-evidence-judgment-graph-phase43a",
  "verify:aibeopchin-claim-evidence-judgment-graph-phase43b",
  "verify:aibeopchin-claim-evidence-judgment-graph-phase43c",
  "verify:aibeopchin-claim-evidence-judgment-graph-phase43d",
  "verify:aibeopchin-claim-evidence-judgment-graph-phase43e",
];

export function runClaimEvidenceJudgmentGraphRcBlock(execSync, root, label = "verify:aibeopchin-claim-evidence-judgment-graph-rc") {
  const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
  const exists = (p) => {
    if (!fs.existsSync(path.join(root, p))) throw new Error(`Missing ${p}`);
  };
  const inc = (p, terms) => {
    const c = read(p);
    for (const t of terms) if (!c.includes(t)) throw new Error(`Missing "${t}" in ${p}`);
  };

  exists("src/features/claim-evidence-judgment-graph/claim-evidence-judgment-graph-rc-lock.ts");
  exists("docs/platform/AIBEOPCHIN_CLAIM_EVIDENCE_JUDGMENT_GRAPH_RC_LOCK_SUMMARY.md");
  exists("src/features/claim-evidence-judgment-graph/shared/claim-evidence-judgment-graph-types.schema.ts");

  inc("src/features/claim-evidence-judgment-graph/claim-evidence-judgment-graph-rc-lock.ts", [
    "phase43f-claim-evidence-judgment-graph-rc-gate",
    "NO_UNLINKED_CLAIM_GRAPH",
    "NO_JUDGMENTLESS_ISSUE_LINK",
    "AI_CANDIDATE_LINK_NOT_FINAL",
    "NO_CLIENT_VISIBLE_STRATEGY_GRAPH",
    "LAWYER_REVIEW_REQUIRED",
  ]);

  inc("docs/platform/AIBEOPCHIN_CLAIM_EVIDENCE_JUDGMENT_GRAPH_RC_LOCK_SUMMARY.md", [
    "43-A",
    "42-F",
    "no unlinked claim graph",
    "lawyer review required",
  ]);

  inc("docs/OPERATIONS_INDEX.md", ["Product 43-F", "CLAIM_EVIDENCE_JUDGMENT_GRAPH_RC_LOCK_SUMMARY"]);

  inc("src/features/claim-evidence-judgment-graph/claim-issue-registry/claim-issue-graph-registry.service.ts", [
    "buildClaimIssueGraphRegistry",
  ]);
  inc("src/features/claim-evidence-judgment-graph/claim-evidence-edge/claim-evidence-edge-engine.service.ts", [
    "buildClaimEvidenceEdgeEngine",
  ]);
  inc("src/features/claim-evidence-judgment-graph/issue-judgment-edge/issue-judgment-edge-engine.service.ts", [
    "buildIssueJudgmentEdgeEngine",
  ]);
  inc("src/features/claim-evidence-judgment-graph/opponent-risk/opponent-argument-risk-signal-graph.service.ts", [
    "buildOpponentArgumentRiskSignalGraph",
  ]);
  inc("src/features/claim-evidence-judgment-graph/lawyer-graph-review/lawyer-claim-graph-review-workspace.service.ts", [
    "buildLawyerClaimGraphReviewWorkspace",
  ]);

  inc("src/features/claim-evidence-judgment-graph/shared/claim-evidence-judgment-graph-types.schema.ts", [
    "claimEvidenceJudgmentGraphSchema",
    "claimEvidenceJudgmentEdgeSchema",
    "aiCandidateLink",
  ]);

  inc("docs/platform/AIBEOPCHIN_EVIDENCE_INTEGRITY_RC_LOCK_SUMMARY.md", ["Claim-Evidence-Judgment"]);

  inc("docs/platform/AIBEOPCHIN_CLAIM_EVIDENCE_JUDGMENT_GRAPH_RC_LOCK_SUMMARY.md", [
    "Court-Ready Case Record Pack",
  ]);

  const impl = read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  for (const tag of [...EVIDENCE_TAGS, ...PREREQ]) {
    if (!impl.includes(tag)) throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${tag}`);
  }

  const pkg = read("package.json");
  if (!pkg.includes("verify:aibeopchin-claim-evidence-judgment-graph-rc")) {
    throw new Error("missing master verify script");
  }
  for (const s of SUB) if (!pkg.includes(s)) throw new Error(`missing ${s}`);

  inc("docs/platform/AIBEOPCHIN_PRODUCT_ROADMAP_PHASE20_23.md", ["43-F", "Claim-Evidence-Judgment"]);

  for (const script of SUB) {
    console.log(`[${label}] ${script} …`);
    execSync(`npm run ${script}`, { stdio: "inherit", cwd: root });
  }

  execSync(
    "npm run test -- src/features/claim-evidence-judgment-graph/claim-evidence-judgment-graph-rc-lock.test.ts",
    { stdio: "inherit", cwd: root },
  );
}
