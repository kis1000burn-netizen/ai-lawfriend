import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const phases = [
  {
    "id": "45a",
    "tag": "EVIDENCE-20260525-AIBEOPCHIN-JUDICIAL-TRANSPARENCY-EXPLAINABILITY-PHASE45A-SOURCE-PROVENANCE-TRACE",
    "service": "src/features/judicial-transparency-explainability/source-provenance-trace/source-provenance-trace-registry.service.ts",
    "policy": "src/features/judicial-transparency-explainability/source-provenance-trace/source-provenance-trace-registry.policy.ts",
    "runbook": "docs/operations/AIBEOPCHIN_SOURCE_PROVENANCE_TRACE_REGISTRY_RUNBOOK.md",
    "buildFn": "buildSourceProvenanceTraceRegistry",
    "gate": "sourceProvenanceTraceRegistryReady",
    "policyTerms": [
      "sourceProvenanceTraceRegistryReady"
    ],
    "test": "src/features/judicial-transparency-explainability/source-provenance-trace/source-provenance-trace-registry.test.ts",
    "roadmap": "45-A"
  },
  {
    "id": "45b",
    "tag": "EVIDENCE-20260525-AIBEOPCHIN-JUDICIAL-TRANSPARENCY-EXPLAINABILITY-PHASE45B-JUDGMENT-CLAIM-EXPLAINABILITY",
    "service": "src/features/judicial-transparency-explainability/judgment-claim-explainability/judgment-claim-link-explainability-engine.service.ts",
    "policy": "src/features/judicial-transparency-explainability/judgment-claim-explainability/judgment-claim-link-explainability-engine.policy.ts",
    "runbook": "docs/operations/AIBEOPCHIN_JUDGMENT_CLAIM_LINK_EXPLAINABILITY_ENGINE_RUNBOOK.md",
    "buildFn": "buildJudgmentClaimLinkExplainabilityEngine",
    "gate": "judgmentClaimLinkExplainabilityEngineReady",
    "policyTerms": [
      "NO_HIDDEN_SOURCE_OMISSION"
    ],
    "test": "src/features/judicial-transparency-explainability/judgment-claim-explainability/judgment-claim-link-explainability-engine.test.ts",
    "roadmap": "45-B"
  },
  {
    "id": "45c",
    "tag": "EVIDENCE-20260525-AIBEOPCHIN-JUDICIAL-TRANSPARENCY-EXPLAINABILITY-PHASE45C-SIMILARITY-UNCERTAINTY-SIGNAL",
    "service": "src/features/judicial-transparency-explainability/similarity-uncertainty-signal/similarity-difference-uncertainty-signal-engine.service.ts",
    "policy": "src/features/judicial-transparency-explainability/similarity-uncertainty-signal/similarity-difference-uncertainty-signal-engine.policy.ts",
    "runbook": "docs/operations/AIBEOPCHIN_SIMILARITY_DIFFERENCE_UNCERTAINTY_SIGNAL_ENGINE_RUNBOOK.md",
    "buildFn": "buildSimilarityDifferenceUncertaintySignalEngine",
    "gate": "similarityDifferenceUncertaintySignalEngineReady",
    "policyTerms": [
      "similarityDifferenceUncertaintySignalEngineReady"
    ],
    "test": "src/features/judicial-transparency-explainability/similarity-uncertainty-signal/similarity-difference-uncertainty-signal-engine.test.ts",
    "roadmap": "45-C"
  },
  {
    "id": "45d",
    "tag": "EVIDENCE-20260525-AIBEOPCHIN-JUDICIAL-TRANSPARENCY-EXPLAINABILITY-PHASE45D-LAWYER-CORRECTION-REVIEWER-TRACE",
    "service": "src/features/judicial-transparency-explainability/lawyer-correction-reviewer-trace/lawyer-correction-final-reviewer-trace.service.ts",
    "policy": "src/features/judicial-transparency-explainability/lawyer-correction-reviewer-trace/lawyer-correction-final-reviewer-trace.policy.ts",
    "runbook": "docs/operations/AIBEOPCHIN_LAWYER_CORRECTION_FINAL_REVIEWER_TRACE_RUNBOOK.md",
    "buildFn": "buildLawyerCorrectionFinalReviewerTrace",
    "gate": "lawyerCorrectionFinalReviewerTraceReady",
    "policyTerms": [
      "lawyerCorrectionFinalReviewerTraceReady"
    ],
    "test": "src/features/judicial-transparency-explainability/lawyer-correction-reviewer-trace/lawyer-correction-final-reviewer-trace.test.ts",
    "roadmap": "45-D"
  },
  {
    "id": "45e",
    "tag": "EVIDENCE-20260525-AIBEOPCHIN-JUDICIAL-TRANSPARENCY-EXPLAINABILITY-PHASE45E-COURT-READY-PACK-EXPLAINABILITY",
    "service": "src/features/judicial-transparency-explainability/court-ready-pack-explainability/court-ready-pack-item-explainability-workspace.service.ts",
    "policy": "src/features/judicial-transparency-explainability/court-ready-pack-explainability/court-ready-pack-item-explainability-workspace.policy.ts",
    "runbook": "docs/operations/AIBEOPCHIN_COURT_READY_PACK_ITEM_EXPLAINABILITY_WORKSPACE_RUNBOOK.md",
    "buildFn": "buildCourtReadyPackItemExplainabilityWorkspace",
    "gate": "courtReadyPackItemExplainabilityWorkspaceReady",
    "policyTerms": [
      "NO_UNEXPLAINED_AI_OUTPUT",
      "NO_CLIENT_VISIBLE_EXPLAINABILITY_WITHOUT_LAWYER_REVIEW",
      "LAWYER_REVIEW_REQUIRED"
    ],
    "test": "src/features/judicial-transparency-explainability/court-ready-pack-explainability/court-ready-pack-item-explainability-workspace.test.ts",
    "roadmap": "45-E"
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
if (!read("package.json").includes(`verify:aibeopchin-judicial-transparency-explainability-phase${phaseId}`)) {
  throw new Error(`missing verify script ${phaseId}`);
}

execSync(`npm run test -- ${phase.test}`, { stdio: "inherit", cwd: root });
console.log(`verify:aibeopchin-judicial-transparency-explainability-phase${phaseId} PASS`);
