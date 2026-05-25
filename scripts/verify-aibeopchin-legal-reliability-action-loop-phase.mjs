import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const phaseId = process.argv[2];

const phases = {
  "49a": {
    tag: "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE49A-RISK-RADAR-SUPPLEMENT-ACTION",
    prereqEvidence: "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-LAWYER-WORKBENCH-PHASE48F-RC",
    verifyScript: "verify:aibeopchin-legal-reliability-action-loop-phase49a",
    test: "src/features/legal-reliability-action-loop/phase49a-risk-radar-supplement-action.test.ts",
    service: "src/features/legal-reliability-action-loop/phase49a-risk-radar-supplement-action.service.ts",
    lock: "src/features/legal-reliability-action-loop/phase49a-risk-radar-supplement-action.lock.ts",
    schema: "src/features/legal-reliability-action-loop/phase49a-risk-radar-supplement-action.schema.ts",
    validator: "src/features/legal-reliability-action-loop/phase49a-risk-radar-supplement-action.validator.ts",
    spec: "docs/legal-reliability/AIBEOPCHIN_LEGAL_RELIABILITY_ACTION_LOOP_PHASE49A_RISK_RADAR_SUPPLEMENT_ACTION_SPEC.md",
    operations: ["Product 49-A", "RISK_RADAR_SUPPLEMENT_ACTION"],
    crossLink: "49-A",
    checks: [
      ["src/features/legal-reliability-action-loop/phase49a-risk-radar-supplement-action.lock.ts", [
        "NO_AI_AUTO_ACTION",
        "phase49a-legal-reliability-risk-radar-supplement-action-lock",
      ]],
      ["src/features/legal-reliability-action-loop/phase49a-risk-radar-supplement-action.schema.ts", [
        "LEGAL_RELIABILITY_RISK_RADAR",
      ]],
      ["src/features/legal-reliability-action-loop/phase49a-risk-radar-supplement-action.service.ts", [
        "createSupplementCandidateFromRiskRadarService",
        "phase49a-risk-radar-supplement-action-service",
      ]],
      ["src/components/cases/legal-reliability-lawyer-workbench/risk-radar-supplement-action-button.tsx", [
        "risk-radar-create-supplement-candidate",
      ]],
    ],
  },
  "49b": {
    tag: "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE49B-GRAPH-GAP-EVIDENCE-REQUEST-ACTION",
    prereqEvidence: "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE49A-RISK-RADAR-SUPPLEMENT-ACTION",
    verifyScript: "verify:aibeopchin-legal-reliability-action-loop-phase49b",
    test: "src/features/legal-reliability-action-loop/phase49b-graph-gap-evidence-request-action.test.ts",
    service: "src/features/legal-reliability-action-loop/phase49b-graph-gap-evidence-request-action.service.ts",
    lock: "src/features/legal-reliability-action-loop/phase49b-graph-gap-evidence-request-action.lock.ts",
    schema: "src/features/legal-reliability-action-loop/phase49b-graph-gap-evidence-request-action.schema.ts",
    validator: "src/features/legal-reliability-action-loop/phase49b-graph-gap-evidence-request-action.validator.ts",
    spec: "docs/legal-reliability/AIBEOPCHIN_LEGAL_RELIABILITY_ACTION_LOOP_PHASE49B_GRAPH_GAP_EVIDENCE_REQUEST_ACTION_SPEC.md",
    operations: ["Product 49-B", "GRAPH_GAP_EVIDENCE_REQUEST"],
    crossLink: "49-B",
    checks: [
      ["src/features/legal-reliability-action-loop/phase49b-graph-gap-evidence-request-action.lock.ts", [
        "NO_UNVERIFIED_EVIDENCE_LABELING",
        "phase49b-legal-reliability-graph-gap-evidence-request-action-lock",
      ]],
      ["src/features/legal-reliability-action-loop/phase49b-graph-gap-evidence-request-action.schema.ts", [
        "LEGAL_RELIABILITY_CLAIM_GRAPH_GAP",
        "EVIDENCE_REQUEST",
      ]],
      ["src/features/legal-reliability-action-loop/phase49b-graph-gap-evidence-request-action.service.ts", [
        "createEvidenceRequestCandidateFromGraphGapService",
        "phase49b-graph-gap-evidence-request-action-service",
      ]],
      ["src/components/cases/legal-reliability-lawyer-workbench/graph-gap-evidence-request-action-button.tsx", [
        "graph-gap-create-evidence-request-candidate",
      ]],
    ],
  },
};

const phase = phases[phaseId];
if (!phase) throw new Error(`Unknown phase ${phaseId}`);

function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}
function exists(p) {
  if (!fs.existsSync(path.join(root, p))) throw new Error(`Missing ${p}`);
}
function inc(p, terms) {
  const c = read(p);
  for (const t of terms) if (!c.includes(t)) throw new Error(`Missing "${t}" in ${p}`);
}

exists(phase.service);
exists(phase.lock);
exists(phase.spec);

for (const [file, terms] of phase.checks) {
  inc(file, terms);
}

inc("prisma/schema.prisma", ["LegalReliabilityActionCandidate", "LegalReliabilityActionDecisionLedger"]);

if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(phase.tag)) {
  throw new Error(`Missing ${phase.tag}`);
}
if (!read("package.json").includes(phase.verifyScript)) {
  throw new Error(`missing ${phase.verifyScript}`);
}
if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(phase.prereqEvidence)) {
  throw new Error(`missing prereq ${phase.prereqEvidence}`);
}

inc("docs/OPERATIONS_INDEX.md", phase.operations);
inc("docs/platform/AIBEOPCHIN_LEGAL_RELIABILITY_LAWYER_WORKBENCH_RC_LOCK_SUMMARY.md", [phase.crossLink]);

execSync(`npm run test -- ${phase.test}`, { stdio: "inherit", cwd: root });

console.log(`${phase.verifyScript} PASS`);
