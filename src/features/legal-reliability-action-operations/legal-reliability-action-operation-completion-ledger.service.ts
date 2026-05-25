/**
 * Product Phase 50-D — Completion decision ledger (reuses Phase 49 decision ledger).
 */
import { prisma } from "@/lib/prisma";
import type { CompleteLegalReliabilityActionOperationInput } from "./legal-reliability-action-operation-completion.schema";

export const PHASE50D_COMPLETION_LEDGER_SERVICE_MARKER =
  "phase50d-legal-reliability-action-operation-completion-ledger-service" as const;

export async function createLegalReliabilityActionOperationCompletionLedger(input: {
  caseId: string;
  tenantId?: string | null;
  operationId: string;
  sourceActionCandidateId: string;
  decisionInput: CompleteLegalReliabilityActionOperationInput;
  nextStatus: string;
  completionResult?: string;
}) {
  const { decisionInput } = input;

  return prisma.legalReliabilityActionDecisionLedger.create({
    data: {
      caseId: input.caseId,
      tenantId: input.tenantId ?? null,
      actionCandidateId: input.sourceActionCandidateId,
      decisionType: `PHASE50D_${decisionInput.decision}`,
      decidedByUserId: decisionInput.actorUserId,
      decidedByRole: decisionInput.actorRole,
      afterClientRequestBody: JSON.stringify({
        operationId: input.operationId,
        nextStatus: input.nextStatus,
        completionResult: input.completionResult ?? null,
        lawyerReviewNote: decisionInput.lawyerReviewNote ?? null,
        requestMoreInfoReason: decisionInput.requestMoreInfoReason ?? null,
        reopenReason: decisionInput.reopenReason ?? null,
        deferReason: decisionInput.deferReason ?? null,
        cancelReason: decisionInput.cancelReason ?? null,
        evidenceIntakeDecision: decisionInput.evidenceIntakeDecision ?? null,
        confirmedEvidenceItemIds: decisionInput.confirmedEvidenceItemIds ?? [],
        rejectedUploadedFileIds: decisionInput.rejectedUploadedFileIds ?? [],
        phase: "50-D",
      }),
      linkedClaimIds: [],
      linkedEvidenceIds: decisionInput.confirmedEvidenceItemIds ?? [],
      linkedJudgmentIds: [],
    },
  });
}
