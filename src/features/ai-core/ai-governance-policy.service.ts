/**
 * Phase 10-A — AI Governance policy evaluation.
 * @see docs/ai/AIBEOPCHIN_AI_GOVERNANCE_CONTROL_MATRIX.md
 */
import type { CaseStatus } from "@/lib/definitions/case-status";
import type { UserRole as UiUserRole } from "@/lib/definitions/common";
import { prismaRoleToDefinitionRole } from "@/lib/role-map";
import type { SessionUser } from "@/lib/auth/session";

import type { CaseIntelligenceGraphRuntimeResult } from "./case-intelligence-graph-runtime.service";
import type { LawyerJudgmentBoundaryEntry } from "./lawyer-judgment-boundary-ledger.schema";
import {
  AI_GOVERNANCE_CONTROL_MATRIX_VERSION,
  type AiGovernanceControlAction,
  type AiGovernanceControlMatrix,
  type AiGovernanceFeature,
  type AiGovernanceGateResult,
  type AiGovernanceTenantPolicy,
  type AiGovernanceUiRole,
  aiGovernanceControlMatrixSchema,
} from "./ai-governance-control.schema";

export const PHASE10A_AI_GOVERNANCE_POLICY_SERVICE_MARKER =
  "PHASE10A_AI_GOVERNANCE_POLICY_SERVICE" as const;

const BLOCKED_CASE_STATUSES: CaseStatus[] = ["DELETED", "REJECTED", "HOLD"];

const CASE_STATUS_ORDER: CaseStatus[] = [
  "CREATED",
  "INTAKE_PENDING",
  "IN_INTERVIEW",
  "INTERVIEW_DONE",
  "DRAFTING",
  "REVIEW_PENDING",
  "APPROVED",
  "DELIVERED",
  "CLOSED",
  "HOLD",
  "REJECTED",
  "DELETED",
];

function caseStatusRank(status: CaseStatus): number {
  const index = CASE_STATUS_ORDER.indexOf(status);
  return index >= 0 ? index : 0;
}

function resolveTenantPolicyFromEnv(tenantId = "default"): AiGovernanceTenantPolicy {
  const rawEnabled = process.env.AI_GOVERNANCE_AI_ENABLED?.trim().toLowerCase();
  const aiEnabled = rawEnabled === undefined ? true : rawEnabled === "true" || rawEnabled === "1";

  return {
    tenantId: process.env.AI_GOVERNANCE_TENANT_ID?.trim() || tenantId,
    aiEnabled,
    allowedFeatures: [
      "CASE_SUMMARY",
      "CASE_INTELLIGENCE_GRAPH",
      "CONTRADICTION_RADAR",
      "LAWYER_JUDGMENT_LEDGER",
      "DOCUMENT_PARAGRAPH",
    ],
    monthlyTokenBudget: process.env.AI_GOVERNANCE_MONTHLY_TOKEN_BUDGET
      ? Number(process.env.AI_GOVERNANCE_MONTHLY_TOKEN_BUDGET)
      : undefined,
    maxLlmCallsPerCase: process.env.AI_GOVERNANCE_MAX_LLM_CALLS_PER_CASE
      ? Number(process.env.AI_GOVERNANCE_MAX_LLM_CALLS_PER_CASE)
      : undefined,
  };
}

export function resolveDefaultAiGovernanceControlMatrix(
  tenantId = "default",
): AiGovernanceControlMatrix {
  return aiGovernanceControlMatrixSchema.parse({
    matrixVersion: AI_GOVERNANCE_CONTROL_MATRIX_VERSION,
    masterEnableRoles: ["ADMIN"],
    allowedCaseStatuses: [
      "CREATED",
      "INTAKE_PENDING",
      "IN_INTERVIEW",
      "INTERVIEW_DONE",
      "DRAFTING",
      "REVIEW_PENDING",
      "APPROVED",
      "DELIVERED",
      "CLOSED",
    ],
    clientVisibleMinCaseStatus: "REVIEW_PENDING",
    roleInvoke: {
      CASE_SUMMARY: ["CLIENT", "LAWYER", "STAFF", "ADMIN"],
      CASE_INTELLIGENCE_GRAPH: ["LAWYER", "STAFF", "ADMIN"],
      CONTRADICTION_RADAR: ["LAWYER", "STAFF", "ADMIN"],
      LAWYER_JUDGMENT_LEDGER: ["LAWYER", "STAFF", "ADMIN"],
      DOCUMENT_PARAGRAPH: ["LAWYER", "STAFF", "ADMIN"],
    },
    roleView: {
      CASE_SUMMARY: ["CLIENT", "LAWYER", "STAFF", "ADMIN"],
      CASE_INTELLIGENCE_GRAPH: ["LAWYER", "STAFF", "ADMIN"],
      CONTRADICTION_RADAR: ["LAWYER", "STAFF", "ADMIN"],
      LAWYER_JUDGMENT_LEDGER: ["LAWYER", "STAFF", "ADMIN"],
      DOCUMENT_PARAGRAPH: ["LAWYER", "STAFF", "ADMIN"],
    },
    tenantPolicy: resolveTenantPolicyFromEnv(tenantId),
  });
}

export type EvaluateAiGovernanceGateInput = {
  action: AiGovernanceControlAction;
  feature?: AiGovernanceFeature;
  actorRole: AiGovernanceUiRole;
  caseStatus?: CaseStatus;
  tenantId?: string;
  matrix?: AiGovernanceControlMatrix;
};

function deny(
  input: EvaluateAiGovernanceGateInput,
  dimension: AiGovernanceGateResult["dimension"],
  controlCode: string,
  deniedReason: string,
): AiGovernanceGateResult {
  return {
    allowed: false,
    action: input.action,
    feature: input.feature,
    dimension,
    deniedReason,
    controlCode,
  };
}

function allow(input: EvaluateAiGovernanceGateInput): AiGovernanceGateResult {
  return {
    allowed: true,
    action: input.action,
    feature: input.feature,
  };
}

export function evaluateAiGovernanceGate(
  input: EvaluateAiGovernanceGateInput,
): AiGovernanceGateResult {
  const matrix = input.matrix ?? resolveDefaultAiGovernanceControlMatrix(input.tenantId);

  if (!matrix.tenantPolicy.aiEnabled) {
    return deny(
      input,
      "AI_MASTER_ENABLE",
      "TENANT_AI_DISABLED",
      "Tenant AI master switch is off",
    );
  }

  if (input.feature && !matrix.tenantPolicy.allowedFeatures.includes(input.feature)) {
    return deny(
      input,
      "TENANT_COST_LOCK",
      "TENANT_FEATURE_LOCKED",
      `Feature ${input.feature} is locked for tenant ${matrix.tenantPolicy.tenantId}`,
    );
  }

  if (input.action === "AI_MASTER_TOGGLE") {
    if (!matrix.masterEnableRoles.includes(input.actorRole)) {
      return deny(
        input,
        "AI_MASTER_ENABLE",
        "ROLE_CANNOT_TOGGLE_AI",
        `Role ${input.actorRole} cannot toggle tenant AI`,
      );
    }
    return allow(input);
  }

  if (input.caseStatus) {
    if (BLOCKED_CASE_STATUSES.includes(input.caseStatus)) {
      return deny(
        input,
        "CASE_ELIGIBILITY",
        "CASE_STATUS_BLOCKED",
        `Case status ${input.caseStatus} blocks AI`,
      );
    }
    if (!matrix.allowedCaseStatuses.includes(input.caseStatus)) {
      return deny(
        input,
        "CASE_ELIGIBILITY",
        "CASE_STATUS_NOT_ALLOWED",
        `Case status ${input.caseStatus} is not eligible for AI`,
      );
    }
  }

  if (!input.feature) {
    return allow(input);
  }

  if (input.action === "AI_INVOKE") {
    const invokeRoles = matrix.roleInvoke[input.feature];
    if (!invokeRoles.includes(input.actorRole)) {
      return deny(
        input,
        "ROLE_INVOKE",
        "ROLE_CANNOT_INVOKE",
        `Role ${input.actorRole} cannot invoke ${input.feature}`,
      );
    }
    return allow(input);
  }

  if (input.action === "AI_VIEW_RESULT") {
    const viewRoles = matrix.roleView[input.feature];
    if (!viewRoles.includes(input.actorRole)) {
      return deny(
        input,
        "ROLE_VIEW",
        "ROLE_CANNOT_VIEW",
        `Role ${input.actorRole} cannot view ${input.feature}`,
      );
    }
    return allow(input);
  }

  if (input.action === "AI_CLIENT_VISIBLE_RELEASE") {
    if (!input.caseStatus) {
      return deny(
        input,
        "CLIENT_RELEASE",
        "CASE_STATUS_REQUIRED",
        "Case status required for client release gate",
      );
    }
    if (
      caseStatusRank(input.caseStatus) <
      caseStatusRank(matrix.clientVisibleMinCaseStatus)
    ) {
      return deny(
        input,
        "CLIENT_RELEASE",
        "CASE_STATUS_TOO_EARLY",
        `Client release requires case status >= ${matrix.clientVisibleMinCaseStatus}`,
      );
    }
    return allow(input);
  }

  return allow(input);
}

export function sessionUserToGovernanceRole(user: SessionUser): AiGovernanceUiRole {
  return prismaRoleToDefinitionRole(user.role);
}

export function assertCaseSummaryAiGovernanceAllowsInvoke(input: {
  currentUser: SessionUser;
  caseStatus: CaseStatus;
  tenantId?: string;
  matrix?: AiGovernanceControlMatrix;
}): AiGovernanceGateResult {
  return evaluateAiGovernanceGate({
    action: "AI_INVOKE",
    feature: "CASE_SUMMARY",
    actorRole: sessionUserToGovernanceRole(input.currentUser),
    caseStatus: input.caseStatus,
    tenantId: input.tenantId,
    matrix: input.matrix,
  });
}

export function filterIntelligenceGraphForRole(input: {
  intelligenceGraph?: CaseIntelligenceGraphRuntimeResult;
  actorRole: AiGovernanceUiRole;
  matrix?: AiGovernanceControlMatrix;
}): CaseIntelligenceGraphRuntimeResult | undefined {
  if (!input.intelligenceGraph) {
    return undefined;
  }

  const matrix = input.matrix ?? resolveDefaultAiGovernanceControlMatrix();
  const canViewGraph = evaluateAiGovernanceGate({
    action: "AI_VIEW_RESULT",
    feature: "CASE_INTELLIGENCE_GRAPH",
    actorRole: input.actorRole,
    matrix,
  }).allowed;
  const canViewRadar = evaluateAiGovernanceGate({
    action: "AI_VIEW_RESULT",
    feature: "CONTRADICTION_RADAR",
    actorRole: input.actorRole,
    matrix,
  }).allowed;
  const canViewLedger = evaluateAiGovernanceGate({
    action: "AI_VIEW_RESULT",
    feature: "LAWYER_JUDGMENT_LEDGER",
    actorRole: input.actorRole,
    matrix,
  }).allowed;

  if (!canViewGraph && !canViewRadar && !canViewLedger) {
    return undefined;
  }

  return {
    ...input.intelligenceGraph,
    graph: canViewGraph ? input.intelligenceGraph.graph : { ...input.intelligenceGraph.graph, claims: [] },
    radar: canViewRadar
      ? input.intelligenceGraph.radar
      : {
          ...input.intelligenceGraph.radar,
          signals: [],
          signalCount: 0,
          contradictions: [],
        },
    ledger: canViewLedger
      ? input.intelligenceGraph.ledger
      : {
          ...input.intelligenceGraph.ledger,
          entries: [],
          summary: {
            aiDetectedCount: 0,
            pendingCount: 0,
            confirmedCount: 0,
            rejectedCount: 0,
            editedCount: 0,
            clientVisibleCount: 0,
            submissionReadyCount: 0,
          },
        },
  };
}

export function canReleaseLedgerEntryToClient(input: {
  entry: LawyerJudgmentBoundaryEntry;
  caseStatus: CaseStatus;
  actorRole: AiGovernanceUiRole;
  matrix?: AiGovernanceControlMatrix;
}): AiGovernanceGateResult {
  const matrix = input.matrix ?? resolveDefaultAiGovernanceControlMatrix();

  if (!input.entry.clientVisible) {
    return {
      allowed: false,
      action: "AI_CLIENT_VISIBLE_RELEASE",
      feature: "LAWYER_JUDGMENT_LEDGER",
      dimension: "CLIENT_RELEASE",
      controlCode: "LEDGER_NOT_MARKED_VISIBLE",
      deniedReason: "Ledger entry is not marked clientVisible",
    };
  }

  const statusGate = evaluateAiGovernanceGate({
    action: "AI_CLIENT_VISIBLE_RELEASE",
    feature: "LAWYER_JUDGMENT_LEDGER",
    actorRole: input.actorRole,
    caseStatus: input.caseStatus,
    matrix,
  });
  if (!statusGate.allowed) {
    return statusGate;
  }

  const viewGate = evaluateAiGovernanceGate({
    action: "AI_VIEW_RESULT",
    feature: "CASE_SUMMARY",
    actorRole: "CLIENT",
    matrix,
  });
  if (!viewGate.allowed) {
    return {
      allowed: false,
      action: "AI_CLIENT_VISIBLE_RELEASE",
      feature: "LAWYER_JUDGMENT_LEDGER",
      dimension: "ROLE_VIEW",
      controlCode: "CLIENT_VIEW_BLOCKED",
      deniedReason: "Client role cannot view released content",
    };
  }

  return {
    allowed: true,
    action: "AI_CLIENT_VISIBLE_RELEASE",
    feature: "LAWYER_JUDGMENT_LEDGER",
  };
}
