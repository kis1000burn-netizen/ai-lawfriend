import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const phases = [
  {
    id: "43a",
    tag: "EVIDENCE-20260525-AIBEOPCHIN-CLAIM-EVIDENCE-JUDGMENT-GRAPH-PHASE43A-CLAIM-ISSUE-REGISTRY",
    service:
      "src/features/claim-evidence-judgment-graph/claim-issue-registry/claim-issue-graph-registry.service.ts",
    policy: "src/features/claim-evidence-judgment-graph/claim-issue-registry/claim-issue-graph-registry.policy.ts",
    runbook: "docs/operations/AIBEOPCHIN_CLAIM_ISSUE_GRAPH_REGISTRY_RUNBOOK.md",
    buildFn: "buildClaimIssueGraphRegistry",
    gate: "claimIssueGraphRegistryReady",
    policyTerms: ["claimIssueGraphRegistryReady"],
    test: "src/features/claim-evidence-judgment-graph/claim-issue-registry/claim-issue-graph-registry.test.ts",
    roadmap: "43-A",
  },
  {
    id: "43b",
    tag: "EVIDENCE-20260525-AIBEOPCHIN-CLAIM-EVIDENCE-JUDGMENT-GRAPH-PHASE43B-CLAIM-EVIDENCE-EDGE",
    service:
      "src/features/claim-evidence-judgment-graph/claim-evidence-edge/claim-evidence-edge-engine.service.ts",
    policy: "src/features/claim-evidence-judgment-graph/claim-evidence-edge/claim-evidence-edge-engine.policy.ts",
    runbook: "docs/operations/AIBEOPCHIN_CLAIM_EVIDENCE_EDGE_ENGINE_RUNBOOK.md",
    buildFn: "buildClaimEvidenceEdgeEngine",
    gate: "claimEvidenceEdgeEngineReady",
    policyTerms: ["NO_UNLINKED_CLAIM_GRAPH"],
    test: "src/features/claim-evidence-judgment-graph/claim-evidence-edge/claim-evidence-edge-engine.test.ts",
    roadmap: "43-B",
  },
  {
    id: "43c",
    tag: "EVIDENCE-20260525-AIBEOPCHIN-CLAIM-EVIDENCE-JUDGMENT-GRAPH-PHASE43C-ISSUE-JUDGMENT-EDGE",
    service:
      "src/features/claim-evidence-judgment-graph/issue-judgment-edge/issue-judgment-edge-engine.service.ts",
    policy: "src/features/claim-evidence-judgment-graph/issue-judgment-edge/issue-judgment-edge-engine.policy.ts",
    runbook: "docs/operations/AIBEOPCHIN_ISSUE_JUDGMENT_EDGE_ENGINE_RUNBOOK.md",
    buildFn: "buildIssueJudgmentEdgeEngine",
    gate: "issueJudgmentEdgeEngineReady",
    policyTerms: ["NO_JUDGMENTLESS_ISSUE_LINK"],
    test: "src/features/claim-evidence-judgment-graph/issue-judgment-edge/issue-judgment-edge-engine.test.ts",
    roadmap: "43-C",
  },
  {
    id: "43d",
    tag: "EVIDENCE-20260525-AIBEOPCHIN-CLAIM-EVIDENCE-JUDGMENT-GRAPH-PHASE43D-OPPONENT-RISK-GRAPH",
    service:
      "src/features/claim-evidence-judgment-graph/opponent-risk/opponent-argument-risk-signal-graph.service.ts",
    policy:
      "src/features/claim-evidence-judgment-graph/opponent-risk/opponent-argument-risk-signal-graph.policy.ts",
    runbook: "docs/operations/AIBEOPCHIN_OPPONENT_ARGUMENT_RISK_SIGNAL_GRAPH_RUNBOOK.md",
    buildFn: "buildOpponentArgumentRiskSignalGraph",
    gate: "opponentArgumentRiskSignalGraphReady",
    policyTerms: ["opponentArgumentRiskSignalGraphReady"],
    test: "src/features/claim-evidence-judgment-graph/opponent-risk/opponent-argument-risk-signal-graph.test.ts",
    roadmap: "43-D",
  },
  {
    id: "43e",
    tag: "EVIDENCE-20260525-AIBEOPCHIN-CLAIM-EVIDENCE-JUDGMENT-GRAPH-PHASE43E-LAWYER-GRAPH-REVIEW",
    service:
      "src/features/claim-evidence-judgment-graph/lawyer-graph-review/lawyer-claim-graph-review-workspace.service.ts",
    policy:
      "src/features/claim-evidence-judgment-graph/lawyer-graph-review/lawyer-claim-graph-review-workspace.policy.ts",
    runbook: "docs/operations/AIBEOPCHIN_LAWYER_CLAIM_GRAPH_REVIEW_WORKSPACE_RUNBOOK.md",
    buildFn: "buildLawyerClaimGraphReviewWorkspace",
    gate: "lawyerClaimGraphReviewWorkspaceReady",
    policyTerms: ["AI_CANDIDATE_LINK_NOT_FINAL", "NO_CLIENT_VISIBLE_STRATEGY_GRAPH"],
    test: "src/features/claim-evidence-judgment-graph/lawyer-graph-review/lawyer-claim-graph-review-workspace.test.ts",
    roadmap: "43-E",
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
if (!read("package.json").includes(`verify:aibeopchin-claim-evidence-judgment-graph-phase${phaseId}`)) {
  throw new Error(`missing verify script ${phaseId}`);
}

execSync(`npm run test -- ${phase.test}`, { stdio: "inherit", cwd: root });
console.log(`verify:aibeopchin-claim-evidence-judgment-graph-phase${phaseId} PASS`);
