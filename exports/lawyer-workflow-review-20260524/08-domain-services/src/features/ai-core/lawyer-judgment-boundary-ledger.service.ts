/**
 * Phase 9-F — Lawyer Judgment Boundary Ledger service.
 * @see docs/ai/AIBEOPCHIN_LAWYER_JUDGMENT_BOUNDARY_LEDGER_SPEC.md
 */
import type { CaseContradictionRadarResult } from "./case-contradiction-radar";
import type { CaseIntelligenceGraph } from "./case-intelligence-graph.schema";
import {
  LAWYER_JUDGMENT_BOUNDARY_LEDGER_VERSION,
  LAWYER_JUDGMENT_BOUNDARY_MOTTO,
  type LawyerJudgmentBoundaryEntry,
  type LawyerJudgmentBoundaryLane,
  type LawyerJudgmentBoundaryLedger,
  type LawyerJudgmentBoundaryLedgerSummary,
  type LawyerJudgmentState,
  lawyerJudgmentBoundaryLedgerSchema,
} from "./lawyer-judgment-boundary-ledger.schema";

export const PHASE9F_LAWYER_JUDGMENT_BOUNDARY_LEDGER_SERVICE_MARKER =
  "PHASE9F_LAWYER_JUDGMENT_BOUNDARY_LEDGER_SERVICE" as const;

export type LawyerJudgmentDecisionInput = {
  entryId: string;
  judgmentState: Exclude<LawyerJudgmentState, "PENDING">;
  lawyerId: string;
  judgedAt: string;
  lawyerEditedText?: string;
  rejectionReason?: string;
  clientVisible?: boolean;
  submissionReady?: boolean;
};

function computeBoundaryLanes(entry: Pick<
  LawyerJudgmentBoundaryEntry,
  "judgmentState" | "clientVisible" | "submissionReady"
>): LawyerJudgmentBoundaryLane[] {
  const lanes: LawyerJudgmentBoundaryLane[] = ["AI_DETECTED"];

  if (entry.judgmentState === "CONFIRMED") {
    lanes.push("LAWYER_CONFIRMED");
  }
  if (entry.judgmentState === "REJECTED") {
    lanes.push("LAWYER_REJECTED");
  }
  if (entry.judgmentState === "EDITED") {
    lanes.push("LAWYER_EDITED");
  }
  if (entry.clientVisible) {
    lanes.push("CLIENT_VISIBLE");
  }
  if (entry.submissionReady) {
    lanes.push("SUBMISSION_READY");
  }

  return lanes;
}

function summarizeEntries(entries: LawyerJudgmentBoundaryEntry[]): LawyerJudgmentBoundaryLedgerSummary {
  return {
    aiDetectedCount: entries.length,
    pendingCount: entries.filter((e) => e.judgmentState === "PENDING").length,
    confirmedCount: entries.filter((e) => e.judgmentState === "CONFIRMED").length,
    rejectedCount: entries.filter((e) => e.judgmentState === "REJECTED").length,
    editedCount: entries.filter((e) => e.judgmentState === "EDITED").length,
    clientVisibleCount: entries.filter((e) => e.clientVisible).length,
    submissionReadyCount: entries.filter((e) => e.submissionReady).length,
  };
}

function withComputedLanes(entry: LawyerJudgmentBoundaryEntry): LawyerJudgmentBoundaryEntry {
  return {
    ...entry,
    boundaryLanes: computeBoundaryLanes(entry),
  };
}

function claimEntry(
  claim: CaseIntelligenceGraph["claims"][number],
  createdAt: string,
  index: number,
): LawyerJudgmentBoundaryEntry {
  return withComputedLanes({
    entryId: `ledger-claim-${claim.claimId}-${index}`,
    subjectKind: "CLAIM",
    subjectId: claim.claimId,
    aiDetectedText: claim.text,
    aiDetectedAt: createdAt,
    judgmentState: "PENDING",
    clientVisible: false,
    submissionReady: false,
    boundaryLanes: ["AI_DETECTED"],
  });
}

function signalEntry(
  signal: CaseContradictionRadarResult["signals"][number],
  createdAt: string,
  index: number,
): LawyerJudgmentBoundaryEntry {
  return withComputedLanes({
    entryId: `ledger-signal-${signal.signalId}-${index}`,
    subjectKind: "RADAR_SIGNAL",
    subjectId: signal.signalId,
    aiDetectedText: signal.message,
    aiDetectedAt: createdAt,
    judgmentState: "PENDING",
    clientVisible: false,
    submissionReady: false,
    boundaryLanes: ["AI_DETECTED"],
  });
}

function contradictionEntry(
  edge: CaseContradictionRadarResult["contradictions"][number],
  createdAt: string,
  index: number,
): LawyerJudgmentBoundaryEntry {
  const subjectId = `${edge.claimIdA}::${edge.claimIdB}`;
  return withComputedLanes({
    entryId: `ledger-contradiction-${index}`,
    subjectKind: "CONTRADICTION_EDGE",
    subjectId,
    aiDetectedText: edge.reason,
    aiDetectedAt: createdAt,
    judgmentState: "PENDING",
    clientVisible: false,
    submissionReady: false,
    boundaryLanes: ["AI_DETECTED"],
  });
}

export function buildLawyerJudgmentBoundaryLedgerDraft(input: {
  caseId: string;
  createdAt: string;
  graph: CaseIntelligenceGraph;
  radar: CaseContradictionRadarResult;
}): LawyerJudgmentBoundaryLedger {
  const claimEntries = input.graph.claims.map((claim, index) =>
    claimEntry(claim, input.createdAt, index),
  );
  const signalEntries = input.radar.signals.map((signal, index) =>
    signalEntry(signal, input.createdAt, index),
  );
  const contradictionEntries = input.radar.contradictions.map((edge, index) =>
    contradictionEntry(edge, input.createdAt, index),
  );

  const entries = [...claimEntries, ...signalEntries, ...contradictionEntries];

  return lawyerJudgmentBoundaryLedgerSchema.parse({
    ledgerVersion: LAWYER_JUDGMENT_BOUNDARY_LEDGER_VERSION,
    caseId: input.caseId,
    createdAt: input.createdAt,
    graphVersion: input.graph.graphVersion,
    radarVersion: input.radar.radarVersion,
    motto: LAWYER_JUDGMENT_BOUNDARY_MOTTO,
    entries,
    summary: summarizeEntries(entries),
  });
}

export function applyLawyerJudgmentDecision(
  ledger: LawyerJudgmentBoundaryLedger,
  decision: LawyerJudgmentDecisionInput,
): LawyerJudgmentBoundaryLedger {
  const entries = ledger.entries.map((entry) => {
    if (entry.entryId !== decision.entryId) {
      return entry;
    }

    const clientVisible = decision.clientVisible ?? false;
    const submissionReady = decision.submissionReady ?? false;

    return withComputedLanes({
      ...entry,
      judgmentState: decision.judgmentState,
      lawyerId: decision.lawyerId,
      judgedAt: decision.judgedAt,
      lawyerEditedText:
        decision.judgmentState === "EDITED" ? decision.lawyerEditedText : entry.lawyerEditedText,
      rejectionReason:
        decision.judgmentState === "REJECTED"
          ? decision.rejectionReason
          : entry.rejectionReason,
      clientVisible,
      submissionReady,
    });
  });

  return lawyerJudgmentBoundaryLedgerSchema.parse({
    ...ledger,
    entries,
    summary: summarizeEntries(entries),
  });
}

export function applyLawyerJudgmentDecisions(
  ledger: LawyerJudgmentBoundaryLedger,
  decisions: LawyerJudgmentDecisionInput[],
): LawyerJudgmentBoundaryLedger {
  return decisions.reduce(
    (current, decision) => applyLawyerJudgmentDecision(current, decision),
    ledger,
  );
}

export function projectClientVisibleEntries(
  ledger: LawyerJudgmentBoundaryLedger,
): LawyerJudgmentBoundaryEntry[] {
  return ledger.entries.filter((entry) => entry.clientVisible);
}

export function projectSubmissionReadyEntries(
  ledger: LawyerJudgmentBoundaryLedger,
): LawyerJudgmentBoundaryEntry[] {
  return ledger.entries.filter((entry) => entry.submissionReady);
}

/** Phase 9-F 예시 — 임금 Claim 변호사 확인 + 의뢰인 비공개 */
export function buildWageClaimConfirmedLedgerExample(
  draft: LawyerJudgmentBoundaryLedger,
): LawyerJudgmentBoundaryLedger {
  const target = draft.entries.find(
    (e) => e.subjectKind === "CLAIM" && e.aiDetectedText.includes("임금"),
  );
  if (!target) {
    return draft;
  }

  return applyLawyerJudgmentDecision(draft, {
    entryId: target.entryId,
    judgmentState: "CONFIRMED",
    lawyerId: "lawyer-example-1",
    judgedAt: new Date().toISOString(),
    clientVisible: false,
    submissionReady: false,
  });
}
