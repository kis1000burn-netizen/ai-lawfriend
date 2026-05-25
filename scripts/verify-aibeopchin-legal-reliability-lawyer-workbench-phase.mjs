import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const phases = [
  {
    id: "48a",
    tag: "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-LAWYER-WORKBENCH-PHASE48A-NAVIGATION-SHELL",
    service: "src/features/legal-reliability-lawyer-workbench/navigation-shell/navigation-shell.service.ts",
    policy: "src/features/legal-reliability-lawyer-workbench/navigation-shell/navigation-shell.policy.ts",
    runbook: "docs/operations/AIBEOPCHIN_LAWYER_WORKBENCH_NAVIGATION_SHELL_RUNBOOK.md",
    buildFn: "buildLawyerWorkbenchNavigationShell",
    gate: "lawyerWorkbenchNavigationShellReady",
    policyTerms: ["LAWYER_REVIEW_REQUIRED","NO_UNEXPLAINED_WORKBENCH_ITEM"],
    test: "src/features/legal-reliability-lawyer-workbench/navigation-shell/navigation-shell.test.ts",
    roadmap: "48-A",
  },
  {
    id: "48b",
    tag: "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-LAWYER-WORKBENCH-PHASE48B-LITIGATION-RISK-RADAR",
    service: "src/features/legal-reliability-lawyer-workbench/litigation-risk-radar/litigation-risk-radar.service.ts",
    policy: "src/features/legal-reliability-lawyer-workbench/litigation-risk-radar/litigation-risk-radar.policy.ts",
    runbook: "docs/operations/AIBEOPCHIN_LITIGATION_RISK_RADAR_PANEL_RUNBOOK.md",
    buildFn: "buildLitigationRiskRadarPanel",
    gate: "litigationRiskRadarPanelReady",
    policyTerms: ["NO_AI_FINAL_STRATEGY","LAWYER_REVIEW_REQUIRED","JUDGMENT_CLICKTHROUGH_REQUIRED"],
    test: "src/features/legal-reliability-lawyer-workbench/litigation-risk-radar/litigation-risk-radar.test.ts",
    roadmap: "48-B",
  },
  {
    id: "48c",
    tag: "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-LAWYER-WORKBENCH-PHASE48C-CLAIM-GRAPH-WORKSPACE",
    service: "src/features/legal-reliability-lawyer-workbench/claim-graph-workspace/claim-graph-workspace.service.ts",
    policy: "src/features/legal-reliability-lawyer-workbench/claim-graph-workspace/claim-graph-workspace.policy.ts",
    runbook: "docs/operations/AIBEOPCHIN_CLAIM_EVIDENCE_JUDGMENT_GRAPH_WORKSPACE_RUNBOOK.md",
    buildFn: "buildClaimEvidenceJudgmentGraphWorkspace",
    gate: "claimEvidenceJudgmentGraphWorkspaceReady",
    policyTerms: ["NO_CLIENT_VISIBLE_STRATEGY_GRAPH","LAWYER_REVIEW_REQUIRED","JUDGMENT_CLICKTHROUGH_REQUIRED"],
    test: "src/features/legal-reliability-lawyer-workbench/claim-graph-workspace/claim-graph-workspace.test.ts",
    roadmap: "48-C",
  },
  {
    id: "48d",
    tag: "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-LAWYER-WORKBENCH-PHASE48D-JUDGMENT-DRAWER",
    service: "src/features/legal-reliability-lawyer-workbench/judgment-drawer/judgment-drawer.service.ts",
    policy: "src/features/legal-reliability-lawyer-workbench/judgment-drawer/judgment-drawer.policy.ts",
    runbook: "docs/operations/AIBEOPCHIN_JUDGMENT_DRAWER_PRECEDENT_VIEWER_RUNBOOK.md",
    buildFn: "buildJudgmentDrawerPrecedentViewer",
    gate: "judgmentDrawerPrecedentViewerReady",
    policyTerms: ["JUDGMENT_CLICKTHROUGH_REQUIRED","LAWYER_REVIEW_REQUIRED","NO_UNEXPLAINED_WORKBENCH_ITEM"],
    test: "src/features/legal-reliability-lawyer-workbench/judgment-drawer/judgment-drawer.test.ts",
    roadmap: "48-D",
  },
  {
    id: "48e",
    tag: "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-LAWYER-WORKBENCH-PHASE48E-COURT-READY-PACK-BUILDER",
    service: "src/features/legal-reliability-lawyer-workbench/court-ready-pack-builder/court-ready-pack-builder.service.ts",
    policy: "src/features/legal-reliability-lawyer-workbench/court-ready-pack-builder/court-ready-pack-builder.policy.ts",
    runbook: "docs/operations/AIBEOPCHIN_COURT_READY_PACK_BUILDER_UX_RUNBOOK.md",
    buildFn: "buildCourtReadyPackBuilderUx",
    gate: "courtReadyPackBuilderUxReady",
    policyTerms: ["NO_COURT_AUTO_SUBMISSION","LAWYER_REVIEW_REQUIRED","NO_CLIENT_VISIBLE_STRATEGY_GRAPH"],
    test: "src/features/legal-reliability-lawyer-workbench/court-ready-pack-builder/court-ready-pack-builder.test.ts",
    roadmap: "48-E",
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
assertIncludes(phase.policy, [phase.gate, ...phase.policyTerms, "lawyer-workbench"]);
assertIncludes(phase.runbook, [phase.roadmap, "lawyer-workbench"]);
assertIncludes("src/features/legal-reliability-lawyer-workbench/legal-reliability-lawyer-workbench-rc-lock.ts", [
  phase.roadmap,
  "lawyer-workbench",
]);
if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(phase.tag)) {
  throw new Error(`Missing ${phase.tag}`);
}
if (!read("package.json").includes(`verify:aibeopchin-legal-reliability-lawyer-workbench-phase${phaseId}`)) {
  throw new Error(`missing verify script ${phaseId}`);
}

execSync(`npm run test -- ${phase.test}`, { stdio: "inherit", cwd: root });
console.log(`verify:aibeopchin-legal-reliability-lawyer-workbench-phase${phaseId} PASS`);
