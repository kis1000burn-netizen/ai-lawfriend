import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const phases = [
  {
    "id": "47a",
    "tag": "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE47A-JUDGMENT-GROUNDED-BUNDLE",
    "service": "src/features/legal-reliability/judgment-grounded-bundle/judgment-grounded-assessment-bundle-gate.service.ts",
    "policy": "src/features/legal-reliability/judgment-grounded-bundle/judgment-grounded-assessment-bundle-gate.policy.ts",
    "runbook": "docs/operations/AIBEOPCHIN_JUDGMENT_GROUNDED_ASSESSMENT_BUNDLE_GATE_RUNBOOK.md",
    "buildFn": "buildJudgmentGroundedAssessmentBundleGate",
    "gate": "judgmentGroundedAssessmentBundleGateReady",
    "test": "src/features/legal-reliability/judgment-grounded-bundle/judgment-grounded-assessment-bundle-gate.test.ts",
    "roadmap": "47-A",
    "bundledLock": "src/features/legal-outcome-assessment/legal-outcome-assessment-rc-lock.ts",
    "bundledLockTest": "src/features/legal-outcome-assessment/legal-outcome-assessment-rc-lock.test.ts",
    "bundledVerify": "verify:aibeopchin-legal-outcome-assessment-rc",
    "bundledEvidence": "EVIDENCE-20260525-AIBEOPCHIN-JUDGMENT-GROUNDED-OUTCOME-ASSESSMENT-PHASE40F-RC",
    "bundledSummary": "AIBEOPCHIN_JUDGMENT_GROUNDED_OUTCOME_ASSESSMENT_RC_LOCK_SUMMARY",
    "bundledPhase": "40-F"
  },
  {
    "id": "47b",
    "tag": "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE47B-SENTENCING-OUTCOME-BUNDLE",
    "service": "src/features/legal-reliability/sentencing-outcome-bundle/sentencing-outcome-assessment-bundle-gate.service.ts",
    "policy": "src/features/legal-reliability/sentencing-outcome-bundle/sentencing-outcome-assessment-bundle-gate.policy.ts",
    "runbook": "docs/operations/AIBEOPCHIN_SENTENCING_OUTCOME_ASSESSMENT_BUNDLE_GATE_RUNBOOK.md",
    "buildFn": "buildSentencingOutcomeAssessmentBundleGate",
    "gate": "sentencingOutcomeAssessmentBundleGateReady",
    "test": "src/features/legal-reliability/sentencing-outcome-bundle/sentencing-outcome-assessment-bundle-gate.test.ts",
    "roadmap": "47-B",
    "bundledLock": "src/features/sentencing-outcome-assessment/sentencing-outcome-assessment-rc-lock.ts",
    "bundledLockTest": "src/features/sentencing-outcome-assessment/sentencing-outcome-assessment-rc-lock.test.ts",
    "bundledVerify": "verify:aibeopchin-sentencing-outcome-assessment-rc",
    "bundledEvidence": "EVIDENCE-20260525-AIBEOPCHIN-SENTENCING-OUTCOME-ASSESSMENT-PHASE41F-RC",
    "bundledSummary": "AIBEOPCHIN_SENTENCING_OUTCOME_ASSESSMENT_RC_LOCK_SUMMARY",
    "bundledPhase": "41-F"
  },
  {
    "id": "47c",
    "tag": "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE47C-EVIDENCE-INTEGRITY-BUNDLE",
    "service": "src/features/legal-reliability/evidence-integrity-bundle/evidence-integrity-bundle-gate.service.ts",
    "policy": "src/features/legal-reliability/evidence-integrity-bundle/evidence-integrity-bundle-gate.policy.ts",
    "runbook": "docs/operations/AIBEOPCHIN_EVIDENCE_INTEGRITY_BUNDLE_GATE_RUNBOOK.md",
    "buildFn": "buildEvidenceIntegrityBundleGate",
    "gate": "evidenceIntegrityBundleGateReady",
    "test": "src/features/legal-reliability/evidence-integrity-bundle/evidence-integrity-bundle-gate.test.ts",
    "roadmap": "47-C",
    "bundledLock": "src/features/evidence-integrity/evidence-integrity-rc-lock.ts",
    "bundledLockTest": "src/features/evidence-integrity/evidence-integrity-rc-lock.test.ts",
    "bundledVerify": "verify:aibeopchin-evidence-integrity-rc",
    "bundledEvidence": "EVIDENCE-20260525-AIBEOPCHIN-EVIDENCE-INTEGRITY-PHASE42F-RC",
    "bundledSummary": "AIBEOPCHIN_EVIDENCE_INTEGRITY_RC_LOCK_SUMMARY",
    "bundledPhase": "42-F"
  },
  {
    "id": "47d",
    "tag": "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE47D-CLAIM-GRAPH-BUNDLE",
    "service": "src/features/legal-reliability/claim-graph-bundle/claim-evidence-judgment-graph-bundle-gate.service.ts",
    "policy": "src/features/legal-reliability/claim-graph-bundle/claim-evidence-judgment-graph-bundle-gate.policy.ts",
    "runbook": "docs/operations/AIBEOPCHIN_CLAIM_EVIDENCE_JUDGMENT_GRAPH_BUNDLE_GATE_RUNBOOK.md",
    "buildFn": "buildClaimEvidenceJudgmentGraphBundleGate",
    "gate": "claimEvidenceJudgmentGraphBundleGateReady",
    "test": "src/features/legal-reliability/claim-graph-bundle/claim-evidence-judgment-graph-bundle-gate.test.ts",
    "roadmap": "47-D",
    "bundledLock": "src/features/claim-evidence-judgment-graph/claim-evidence-judgment-graph-rc-lock.ts",
    "bundledLockTest": "src/features/claim-evidence-judgment-graph/claim-evidence-judgment-graph-rc-lock.test.ts",
    "bundledVerify": "verify:aibeopchin-claim-evidence-judgment-graph-rc",
    "bundledEvidence": "EVIDENCE-20260525-AIBEOPCHIN-CLAIM-EVIDENCE-JUDGMENT-GRAPH-PHASE43F-RC",
    "bundledSummary": "AIBEOPCHIN_CLAIM_EVIDENCE_JUDGMENT_GRAPH_RC_LOCK_SUMMARY",
    "bundledPhase": "43-F"
  },
  {
    "id": "47e",
    "tag": "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE47E-COURT-READY-PACK-BUNDLE",
    "service": "src/features/legal-reliability/court-ready-pack-bundle/court-ready-case-record-pack-bundle-gate.service.ts",
    "policy": "src/features/legal-reliability/court-ready-pack-bundle/court-ready-case-record-pack-bundle-gate.policy.ts",
    "runbook": "docs/operations/AIBEOPCHIN_COURT_READY_CASE_RECORD_PACK_BUNDLE_GATE_RUNBOOK.md",
    "buildFn": "buildCourtReadyCaseRecordPackBundleGate",
    "gate": "courtReadyCaseRecordPackBundleGateReady",
    "test": "src/features/legal-reliability/court-ready-pack-bundle/court-ready-case-record-pack-bundle-gate.test.ts",
    "roadmap": "47-E",
    "bundledLock": "src/features/court-ready-case-record-pack/court-ready-case-record-pack-rc-lock.ts",
    "bundledLockTest": "src/features/court-ready-case-record-pack/court-ready-case-record-pack-rc-lock.test.ts",
    "bundledVerify": "verify:aibeopchin-court-ready-case-record-pack-rc",
    "bundledEvidence": "EVIDENCE-20260525-AIBEOPCHIN-COURT-READY-CASE-RECORD-PACK-PHASE44F-RC",
    "bundledSummary": "AIBEOPCHIN_COURT_READY_CASE_RECORD_PACK_RC_LOCK_SUMMARY",
    "bundledPhase": "44-F"
  },
  {
    "id": "47f",
    "tag": "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE47F-EXPLAINABILITY-TRACE-BUNDLE",
    "service": "src/features/legal-reliability/explainability-trace-bundle/explainability-trace-bundle-gate.service.ts",
    "policy": "src/features/legal-reliability/explainability-trace-bundle/explainability-trace-bundle-gate.policy.ts",
    "runbook": "docs/operations/AIBEOPCHIN_EXPLAINABILITY_TRACE_BUNDLE_GATE_RUNBOOK.md",
    "buildFn": "buildExplainabilityTraceBundleGate",
    "gate": "explainabilityTraceBundleGateReady",
    "test": "src/features/legal-reliability/explainability-trace-bundle/explainability-trace-bundle-gate.test.ts",
    "roadmap": "47-F",
    "bundledLock": "src/features/judicial-transparency-explainability/judicial-transparency-explainability-rc-lock.ts",
    "bundledLockTest": "src/features/judicial-transparency-explainability/judicial-transparency-explainability-rc-lock.test.ts",
    "bundledVerify": "verify:aibeopchin-judicial-transparency-explainability-rc",
    "bundledEvidence": "EVIDENCE-20260525-AIBEOPCHIN-JUDICIAL-TRANSPARENCY-EXPLAINABILITY-PHASE45F-RC",
    "bundledSummary": "AIBEOPCHIN_JUDICIAL_TRANSPARENCY_EXPLAINABILITY_RC_LOCK_SUMMARY",
    "bundledPhase": "45-F"
  },
  {
    "id": "47g",
    "tag": "EVIDENCE-20260525-AIBEOPCHIN-LEGAL-RELIABILITY-PHASE47G-NEUTRAL-LITIGATION-PACK-BUNDLE",
    "service": "src/features/legal-reliability/neutral-litigation-pack-bundle/neutral-litigation-review-pack-bundle-gate.service.ts",
    "policy": "src/features/legal-reliability/neutral-litigation-pack-bundle/neutral-litigation-review-pack-bundle-gate.policy.ts",
    "runbook": "docs/operations/AIBEOPCHIN_NEUTRAL_LITIGATION_REVIEW_PACK_BUNDLE_GATE_RUNBOOK.md",
    "buildFn": "buildNeutralLitigationReviewPackBundleGate",
    "gate": "neutralLitigationReviewPackBundleGateReady",
    "test": "src/features/legal-reliability/neutral-litigation-pack-bundle/neutral-litigation-review-pack-bundle-gate.test.ts",
    "roadmap": "47-G",
    "bundledLock": "src/features/neutral-litigation-review-pack/neutral-litigation-review-pack-rc-lock.ts",
    "bundledLockTest": "src/features/neutral-litigation-review-pack/neutral-litigation-review-pack-rc-lock.test.ts",
    "bundledVerify": "verify:aibeopchin-neutral-litigation-review-pack-rc",
    "bundledEvidence": "EVIDENCE-20260525-AIBEOPCHIN-COURT-MEDIATOR-REVIEW-MODE-PHASE46F-RC",
    "bundledSummary": "AIBEOPCHIN_NEUTRAL_LITIGATION_REVIEW_PACK_RC_LOCK_SUMMARY",
    "bundledPhase": "46-F"
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

for (const f of [phase.service, phase.runbook, phase.bundledLock]) {
  if (!fs.existsSync(path.join(root, f))) throw new Error(`Missing ${f}`);
}

assertIncludes(phase.service, [phase.buildFn]);
assertIncludes(phase.policy, [phase.gate, phase.bundledPhase]);
assertIncludes(phase.runbook, [phase.roadmap, phase.bundledPhase]);
assertIncludes("src/features/legal-reliability/legal-reliability-rc-lock.ts", [
  phase.bundledPhase,
  phase.bundledVerify,
]);
assertIncludes(`docs/platform/${phase.bundledSummary}.md`, ["Legal Reliability"]);
if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(phase.tag)) {
  throw new Error(`Missing ${phase.tag}`);
}
if (!read("package.json").includes(`verify:aibeopchin-legal-reliability-phase${phaseId}`)) {
  throw new Error(`missing verify script ${phaseId}`);
}
if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(phase.bundledEvidence)) {
  throw new Error(`Missing bundled evidence ${phase.bundledEvidence}`);
}

execSync(`npm run test -- ${phase.test}`, { stdio: "inherit", cwd: root });
execSync(`npm run test -- ${phase.bundledLockTest}`, { stdio: "inherit", cwd: root });
console.log(`verify:aibeopchin-legal-reliability-phase${phaseId} PASS`);
