/**
 * Product Phase 50-F — Legal Reliability Action Operations RC policy SSOT.
 */
import { ValidationError } from "@/lib/errors";

export const LEGAL_RELIABILITY_ACTION_OPERATIONS_RC_POLICY_MARKER =
  "phase50f-legal-reliability-action-operations-rc-policy" as const;

export function assertLegalReliabilityActionOperationsRcBoundary(input: {
  autoOperationCompletionRequested?: boolean;
  autoMessagingRequested?: boolean;
  autoLegalFilingRequested?: boolean;
  dashboardAutoActionRequested?: boolean;
  unreviewedEvidenceDownstreamRequested?: boolean;
  aiPriorityOverrideRequested?: boolean;
  clientVisibleOperationStrategyRequested?: boolean;
}) {
  if (input.autoOperationCompletionRequested) {
    throw new ValidationError("NO_AUTO_OPERATION_COMPLETION");
  }
  if (input.autoMessagingRequested) {
    throw new ValidationError("NO_DASHBOARD_AUTO_MESSAGING");
  }
  if (input.autoLegalFilingRequested) {
    throw new ValidationError("NO_AUTO_LEGAL_FILING");
  }
  if (input.dashboardAutoActionRequested) {
    throw new ValidationError("NO_DASHBOARD_AUTO_COMPLETION");
  }
  if (input.unreviewedEvidenceDownstreamRequested) {
    throw new ValidationError("NO_UNREVIEWED_EVIDENCE_DOWNSTREAM");
  }
  if (input.aiPriorityOverrideRequested) {
    throw new ValidationError("NO_AI_OPERATION_PRIORITY_OVERRIDE");
  }
  if (input.clientVisibleOperationStrategyRequested) {
    throw new ValidationError("NO_CLIENT_VISIBLE_OPERATION_STRATEGY");
  }
}
