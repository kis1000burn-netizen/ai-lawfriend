import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const phases = [
  {
    "id": "46a",
    "tag": "EVIDENCE-20260525-AIBEOPCHIN-COURT-MEDIATOR-REVIEW-MODE-PHASE46A-NEUTRAL-PRESENTATION-VIEW",
    "service": "src/features/neutral-litigation-review-pack/neutral-case-summary-view/neutral-case-summary-view.service.ts",
    "policy": "src/features/neutral-litigation-review-pack/neutral-case-summary-view/neutral-case-summary-view.policy.ts",
    "runbook": "docs/operations/AIBEOPCHIN_NEUTRAL_CASE_SUMMARY_VIEW_RUNBOOK.md",
    "buildFn": "buildNeutralCaseSummaryView",
    "gate": "neutralCaseSummaryViewReady",
    "policyTerms": [
      "neutralCaseSummaryViewReady"
    ],
    "test": "src/features/neutral-litigation-review-pack/neutral-case-summary-view/neutral-case-summary-view.test.ts",
    "roadmap": "46-A"
  },
  {
    "id": "46b",
    "tag": "EVIDENCE-20260525-AIBEOPCHIN-COURT-MEDIATOR-REVIEW-MODE-PHASE46C-STRATEGY-CONFIDENTIAL-SEPARATION",
    "service": "src/features/neutral-litigation-review-pack/strategy-confidential-exclusion/strategy-confidential-material-exclusion-policy.service.ts",
    "policy": "src/features/neutral-litigation-review-pack/strategy-confidential-exclusion/strategy-confidential-material-exclusion-policy.policy.ts",
    "runbook": "docs/operations/AIBEOPCHIN_STRATEGY_CONFIDENTIAL_MATERIAL_EXCLUSION_POLICY_RUNBOOK.md",
    "buildFn": "buildStrategyConfidentialMaterialExclusionPolicy",
    "gate": "strategyConfidentialMaterialExclusionPolicyReady",
    "policyTerms": [
      "NO_INTERNAL_STRATEGY_IN_NEUTRAL_PACK",
      "NO_UNREVIEWED_AI_OUTPUT",
      "NO_CLIENT_CONFIDENTIAL_MEMO"
    ],
    "test": "src/features/neutral-litigation-review-pack/strategy-confidential-exclusion/strategy-confidential-material-exclusion-policy.test.ts",
    "roadmap": "46-B"
  },
  {
    "id": "46c",
    "tag": "EVIDENCE-20260525-AIBEOPCHIN-COURT-MEDIATOR-REVIEW-MODE-PHASE46B-LAWYER-SELECTED-SCOPE",
    "service": "src/features/neutral-litigation-review-pack/lawyer-controlled-export/lawyer-controlled-export-scope.service.ts",
    "policy": "src/features/neutral-litigation-review-pack/lawyer-controlled-export/lawyer-controlled-export-scope.policy.ts",
    "runbook": "docs/operations/AIBEOPCHIN_LAWYER_CONTROLLED_EXPORT_SCOPE_RUNBOOK.md",
    "buildFn": "buildLawyerControlledExportScope",
    "gate": "lawyerControlledExportScopeReady",
    "policyTerms": [
      "LAWYER_CONTROLLED_EXPORT_ONLY",
      "NO_OPPOSING_PARTY_AUTO_SHARE"
    ],
    "test": "src/features/neutral-litigation-review-pack/lawyer-controlled-export/lawyer-controlled-export-scope.test.ts",
    "roadmap": "46-C"
  },
  {
    "id": "46d",
    "tag": "EVIDENCE-20260525-AIBEOPCHIN-COURT-MEDIATOR-REVIEW-MODE-PHASE46D-UNREVIEWED-AI-FILTER",
    "service": "src/features/neutral-litigation-review-pack/mediation-hearing-pack/mediation-hearing-preparation-pack.service.ts",
    "policy": "src/features/neutral-litigation-review-pack/mediation-hearing-pack/mediation-hearing-preparation-pack.policy.ts",
    "runbook": "docs/operations/AIBEOPCHIN_MEDIATION_HEARING_PREPARATION_PACK_RUNBOOK.md",
    "buildFn": "buildMediationHearingPreparationPack",
    "gate": "mediationHearingPreparationPackReady",
    "policyTerms": [
      "NO_DIRECT_COURT_ACCESS",
      "NO_MEDIATOR_PORTAL_BY_DEFAULT"
    ],
    "test": "src/features/neutral-litigation-review-pack/mediation-hearing-pack/mediation-hearing-preparation-pack.test.ts",
    "roadmap": "46-D"
  },
  {
    "id": "46e",
    "tag": "EVIDENCE-20260525-AIBEOPCHIN-COURT-MEDIATOR-REVIEW-MODE-PHASE46E-COURT-REVIEW-READ-ONLY",
    "service": "src/features/neutral-litigation-review-pack/neutral-pack-review/neutral-pack-review-workspace.service.ts",
    "policy": "src/features/neutral-litigation-review-pack/neutral-pack-review/neutral-pack-review-workspace.policy.ts",
    "runbook": "docs/operations/AIBEOPCHIN_NEUTRAL_PACK_REVIEW_WORKSPACE_RUNBOOK.md",
    "buildFn": "buildNeutralPackReviewWorkspace",
    "gate": "neutralPackReviewWorkspaceReady",
    "policyTerms": [
      "NO_DIRECT_COURT_ACCESS",
      "NO_MEDIATOR_PORTAL_BY_DEFAULT",
      "NO_OPPOSING_PARTY_AUTO_SHARE",
      "LAWYER_CONTROLLED_EXPORT_ONLY",
      "NO_INTERNAL_STRATEGY_IN_NEUTRAL_PACK",
      "NO_UNREVIEWED_AI_OUTPUT",
      "NO_CLIENT_CONFIDENTIAL_MEMO"
    ],
    "test": "src/features/neutral-litigation-review-pack/neutral-pack-review/neutral-pack-review-workspace.test.ts",
    "roadmap": "46-E"
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
if (!read("package.json").includes(`verify:aibeopchin-neutral-litigation-review-pack-phase${phaseId}`)) {
  throw new Error(`missing verify script ${phaseId}`);
}

execSync(`npm run test -- ${phase.test}`, { stdio: "inherit", cwd: root });
console.log(`verify:aibeopchin-neutral-litigation-review-pack-phase${phaseId} PASS`);
