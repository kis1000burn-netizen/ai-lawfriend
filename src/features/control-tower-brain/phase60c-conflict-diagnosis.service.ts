import { randomUUID } from "node:crypto";
import type { BrainDetectedIssue } from "./phase60b-error-detection.schema";
import type { BrainDiagnosis, BrainDiagnoseResult } from "./phase60c-conflict-diagnosis.schema";
import {
  PHASE60C_CONFLICT_DIAGNOSIS_MARKER,
  PHASE60C_CONFLICT_DIAGNOSIS_VERSION,
} from "./phase60c-conflict-diagnosis.schema";

function diagnoseIssue(issue: BrainDetectedIssue): BrainDiagnosis {
  let code: BrainDiagnosis["code"] = "UNKNOWN";
  const boundaryViolations: string[] = [];
  const hints: string[] = [];

  if (issue.source === "TEST") {
    code = "TEST_FAILURE";
    hints.push("npm run test -- <failing-test-file>");
  } else if (issue.source === "TYPECHECK") {
    code = "TYPE_MISMATCH";
    hints.push("npx tsc --noEmit -p tsconfig.build.json");
  } else if (issue.source === "LINT") {
    code = "LINT_VIOLATION";
    hints.push("npm run lint");
  } else if (issue.source === "VERIFY") {
    code = "VERIFY_SCRIPT_OUT_OF_SYNC";
    hints.push("Register verify script in package.json and IMPLEMENTATION_EVIDENCE.md");
  } else if (issue.source === "NAVIGATOR") {
    code = "PHASE_STATUS_INCONSISTENCY";
    hints.push("Sync tools/aibeopchin_navigator.py with IMPLEMENTATION_EVIDENCE.md");
  } else if (issue.source === "EVIDENCE") {
    code = "EVIDENCE_TAG_MISSING";
    hints.push("Add evidence block to docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  } else if (issue.source === "MIGRATION") {
    code = "MIGRATION_REQUIRED";
    boundaryViolations.push("NO_DESTRUCTIVE_DB_CHANGE_BY_AI");
    hints.push("Generate migration diff only — human must review and apply");
  } else if (issue.source === "RUNTIME") {
    code = "GENERIC_RUNTIME_ERROR";
    hints.push("Check operations monitoring snapshot and incident runbook");
  }

  if (/boundary|NO_/i.test(issue.summary)) {
    code = "MISSING_BOUNDARY_MARKER";
    boundaryViolations.push("Review phase policy boundary markers");
  }

  if (/tenant|cross-tenant/i.test(issue.summary)) {
    code = "TENANT_SCOPE_BYPASS_RISK";
    boundaryViolations.push("NO_CROSS_TENANT_REASONING_CONTEXT");
  }

  if (/client-visible|client visible/i.test(issue.summary)) {
    code = "CLIENT_VISIBILITY_RISK";
    boundaryViolations.push("NO_CLIENT_VISIBLE_REASONING_WITHOUT_LAWYER_REVIEW");
  }

  return {
    diagnosisId: randomUUID(),
    issueId: issue.issueId,
    code,
    summary: `${code} for ${issue.source}`,
    likelyRootCause: issue.summary,
    affectedPhase: issue.phase,
    boundaryViolations,
    safeMitigationHints: hints,
    diagnosedAt: new Date().toISOString(),
  };
}

export function runControlTowerBrainDiagnosis(issues: BrainDetectedIssue[]): BrainDiagnoseResult {
  const diagnoses = issues.map(diagnoseIssue);
  return {
    marker: PHASE60C_CONFLICT_DIAGNOSIS_MARKER,
    version: PHASE60C_CONFLICT_DIAGNOSIS_VERSION,
    diagnosedAt: new Date().toISOString(),
    diagnoses,
    issues,
  };
}
