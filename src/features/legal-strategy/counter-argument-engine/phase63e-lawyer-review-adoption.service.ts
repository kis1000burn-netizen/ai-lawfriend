/**
 * Product Phase 63-E — Lawyer Review & Adoption Gate service SSOT.
 */
import type {
  CounterArgumentAdoptionReviewResult,
  CounterArgumentDocumentInsertCandidate,
} from "./phase63e-lawyer-review-adoption.schema";
import {
  adoptDraftParagraph,
  modifyDraftParagraph,
  rejectDraftParagraph,
} from "./phase63e-lawyer-review-adoption.policy";
import type {
  AdoptDraftParagraphInput,
  ModifyDraftParagraphInput,
  RejectDraftParagraphInput,
} from "./phase63e-lawyer-review-adoption.schema";

export function processLawyerAdoptionReview(
  input:
    | ({ action: "ADOPT" } & AdoptDraftParagraphInput)
    | ({ action: "MODIFY" } & ModifyDraftParagraphInput)
    | ({ action: "REJECT" } & RejectDraftParagraphInput),
): CounterArgumentAdoptionReviewResult {
  switch (input.action) {
    case "ADOPT":
      return adoptDraftParagraph(input);
    case "MODIFY":
      return modifyDraftParagraph(input);
    case "REJECT":
      return rejectDraftParagraph(input);
  }
}

export function summarizeAdoptionReviewResult(result: CounterArgumentAdoptionReviewResult) {
  return {
    decisionId: result.decision.decisionId,
    decision: result.decision.decision,
    sourceDraftParagraphId: result.decision.sourceDraftParagraphId,
    decisionLedgerRef: result.decision.decisionLedgerRef,
    hasDocumentInsertCandidate: result.documentInsertCandidate !== null,
    insertStatus: result.documentInsertCandidate?.insertStatus ?? null,
    isFinalDocumentText: result.documentInsertCandidate?.isFinalDocumentText ?? false,
    clientVisibleAllowed: result.documentInsertCandidate?.clientVisibleAllowed ?? false,
    autoFileAllowed: result.documentInsertCandidate?.autoFileAllowed ?? false,
  };
}

export function summarizeDocumentInsertCandidate(candidate: CounterArgumentDocumentInsertCandidate) {
  return {
    insertCandidateId: candidate.insertCandidateId,
    sourceDecisionId: candidate.sourceDecisionId,
    insertTarget: candidate.insertTarget,
    insertStatus: candidate.insertStatus,
    isFinalDocumentText: candidate.isFinalDocumentText,
    clientVisibleAllowed: candidate.clientVisibleAllowed,
    autoFileAllowed: candidate.autoFileAllowed,
  };
}
