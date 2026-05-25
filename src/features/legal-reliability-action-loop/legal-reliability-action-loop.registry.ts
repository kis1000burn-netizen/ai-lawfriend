/**
 * Product Phase 49-C — Legal Reliability Action Loop registry SSOT.
 */
export const LEGAL_RELIABILITY_ACTION_LOOP_REGISTRY = {
  version: "49-C.1",

  rcStatus: "LOCKED",

  actionTypes: {
    RISK_RADAR_SUPPLEMENT_REQUEST: {
      sourcePhase: "49-A",
      sourceWorkbenchPanel: "RISK_RADAR",
      candidateType: "SUPPLEMENT_REQUEST_ACTION_CANDIDATE",
      outputType: "SUPPLEMENT_REQUEST_DRAFT",
      requiresLawyerApproval: true,
      clientVisibleByDefault: false,
      directMessagingAllowed: false,
      autoLegalFilingAllowed: false,
      decisionLedgerRequired: true,
      sanitizerRequired: true,
      sourceMarkerPrefix: "phase49a-",
    },

    GRAPH_GAP_EVIDENCE_REQUEST: {
      sourcePhase: "49-B",
      sourceWorkbenchPanel: "GRAPH_WORKSPACE",
      candidateType: "EVIDENCE_REQUEST_ACTION_CANDIDATE",
      outputType: "SUPPLEMENT_REQUEST_DRAFT",
      requiresLawyerApproval: true,
      clientVisibleByDefault: false,
      directMessagingAllowed: false,
      autoLegalFilingAllowed: false,
      decisionLedgerRequired: true,
      sanitizerRequired: true,
      sourceMarkerPrefix: "phase49b-",
    },
  },

  lockedBoundaries: [
    "NO_AI_AUTO_ACTION",
    "NO_CLIENT_REQUEST_WITHOUT_LAWYER_APPROVAL",
    "NO_AUTO_LEGAL_FILING",
    "NO_UNREVIEWED_DRAFT_CONTEXT",
    "LAWYER_DECISION_LEDGER_REQUIRED",
    "NO_CLIENT_VISIBLE_STRATEGY_BY_DEFAULT",
    "NO_UNVERIFIED_EVIDENCE_LABELING",
  ],

  commandCenterSyncStates: [
    "ACTION_CANDIDATE_CREATED",
    "LAWYER_APPROVED",
    "SUPPLEMENT_DRAFT_CREATED",
    "WAITING_TO_SEND",
    "SENT_BY_EXISTING_SUPPLEMENT_FLOW",
    "CLIENT_RESPONDED",
    "RESOLVED",
    "REJECTED",
    "DEFERRED",
  ],

  workbenchRegistryLinks: {
    riskRadarSupplementActionItemId: "SUPPLEMENT_REQUEST_ACTION",
    graphGapEvidenceRequestActionItemId: "EVIDENCE_REQUEST_ACTION",
  },
} as const;

export type LegalReliabilityActionLoopActionType =
  keyof typeof LEGAL_RELIABILITY_ACTION_LOOP_REGISTRY.actionTypes;

export function buildActionLoopSupplementItemSourceMarker(
  sourceMarkerPrefix: string,
  candidateId: string,
) {
  return `${sourceMarkerPrefix}${candidateId}`;
}

export function isAllowedActionLoopSourceMarker(sourceMarker: string) {
  return (
    sourceMarker.startsWith("phase49a-") || sourceMarker.startsWith("phase49b-")
  );
}
