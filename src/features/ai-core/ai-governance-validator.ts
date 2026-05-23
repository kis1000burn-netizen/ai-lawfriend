/**
 * Phase 10-A — AI Governance Control Matrix validator.
 */
import { CaseStatusEnum } from "@/lib/definitions/case-status";
import {
  AI_GOVERNANCE_CONTROL_MATRIX_VERSION,
  AI_GOVERNANCE_FEATURES,
  type AiGovernanceControlMatrix,
  aiGovernanceControlMatrixSchema,
} from "./ai-governance-control.schema";

export const AI_GOVERNANCE_VALIDATOR_MARKER = "PHASE10A_AI_GOVERNANCE_VALIDATOR" as const;

export type AiGovernanceValidationResult = {
  passed: boolean;
  issues: string[];
};

const CASE_STATUS_ORDER = CaseStatusEnum.options;

function caseStatusIndex(status: string): number {
  return CASE_STATUS_ORDER.indexOf(status as (typeof CASE_STATUS_ORDER)[number]);
}

export function assertMatrixRoleCoverage(matrix: AiGovernanceControlMatrix): string[] {
  const issues: string[] = [];

  for (const feature of AI_GOVERNANCE_FEATURES) {
    if (!matrix.tenantPolicy.allowedFeatures.includes(feature)) {
      continue;
    }
    const invoke = matrix.roleInvoke[feature];
    const view = matrix.roleView[feature];
    if (!invoke.length) {
      issues.push(`feature ${feature}: invoke roles must not be empty`);
    }
    if (!view.length) {
      issues.push(`feature ${feature}: view roles must not be empty`);
    }
    for (const role of invoke) {
      if (!view.includes(role)) {
        issues.push(
          `feature ${feature}: invoke role ${role} should also appear in view roles`,
        );
      }
    }
  }

  return issues;
}

export function assertClientReleaseOrdering(matrix: AiGovernanceControlMatrix): string[] {
  const issues: string[] = [];
  const minIndex = caseStatusIndex(matrix.clientVisibleMinCaseStatus);
  if (minIndex < caseStatusIndex("INTERVIEW_DONE")) {
    issues.push(
      "clientVisibleMinCaseStatus should be at least INTERVIEW_DONE for responsible release",
    );
  }
  if (!matrix.allowedCaseStatuses.includes(matrix.clientVisibleMinCaseStatus)) {
    issues.push("clientVisibleMinCaseStatus must be included in allowedCaseStatuses");
  }
  return issues;
}

export function assertTenantPolicyConsistency(matrix: AiGovernanceControlMatrix): string[] {
  const issues: string[] = [];
  if (matrix.tenantPolicy.maxLlmCallsPerCase === 0) {
    issues.push("maxLlmCallsPerCase=0 effectively blocks all LLM calls");
  }
  return issues;
}

export function validateAiGovernanceControlMatrix(
  input: unknown,
): AiGovernanceValidationResult & { matrix: AiGovernanceControlMatrix } {
  const matrix = aiGovernanceControlMatrixSchema.parse(input);
  const issues = [
    ...assertMatrixRoleCoverage(matrix),
    ...assertClientReleaseOrdering(matrix),
    ...assertTenantPolicyConsistency(matrix),
  ];

  if (matrix.matrixVersion !== AI_GOVERNANCE_CONTROL_MATRIX_VERSION) {
    issues.push(`matrixVersion must be ${AI_GOVERNANCE_CONTROL_MATRIX_VERSION}`);
  }

  if (!matrix.masterEnableRoles.includes("ADMIN")) {
    issues.push("masterEnableRoles must include ADMIN");
  }

  return {
    passed: issues.length === 0,
    issues,
    matrix,
  };
}
