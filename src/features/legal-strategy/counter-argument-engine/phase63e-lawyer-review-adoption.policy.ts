/**
 * Product Phase 63-E — Lawyer Review & Adoption Gate policy SSOT.
 */
import { randomUUID } from "node:crypto";
import { ValidationError } from "@/lib/errors";
import type {
  AdoptDraftParagraphInput,
  CounterArgumentAdoptionDecision,
  CounterArgumentAdoptionDecisionLedgerEntry,
  CounterArgumentAdoptionReviewResult,
  CounterArgumentDocumentInsertCandidate,
  CounterArgumentDocumentInsertTarget,
  ModifyDraftParagraphInput,
  RejectDraftParagraphInput,
} from "./phase63e-lawyer-review-adoption.schema";
import {
  PHASE63E_LAWYER_REVIEW_ADOPTION_SCHEMA_MARKER,
  PHASE63E_LAWYER_REVIEW_ADOPTION_VERSION,
  counterArgumentAdoptionDecisionBoundariesSchema,
  counterArgumentAdoptionDecisionSchema,
  counterArgumentAdoptionReviewResultSchema,
  counterArgumentDocumentInsertCandidateBoundariesSchema,
  counterArgumentDocumentInsertCandidateSchema,
} from "./phase63e-lawyer-review-adoption.schema";
import type { CounterArgumentDraftParagraph } from "./phase63d-draft-paragraph-generator.schema";

export const PHASE63E_LAWYER_REVIEW_ADOPTION_POLICY_MARKER =
  "phase63e-lawyer-review-adoption-policy" as const;

export const PHASE63E_ONE_LINE_STANDARD =
  "Phase 63-E는 63-D CounterArgumentDraftParagraph에 대해 변호사가 ADOPT / MODIFY / REJECT 결정을 기록하고, ADOPTED 또는 MODIFIED 항목만 문서 반영 후보로 승격하되, 최종 문서 삽입·의뢰인 노출·소송 제출은 별도 승인 전까지 차단한다." as const;

export const PHASE63E_BOUNDARY_MARKERS = [
  "NO_ADOPTION_WITHOUT_LAWYER_DECISION",
  "NO_REJECTED_PARAGRAPH_DOCUMENT_INSERT",
  "NO_MODIFIED_PARAGRAPH_WITHOUT_MODIFIED_TEXT",
  "NO_DOCUMENT_INSERT_WITHOUT_ADOPTION",
  "NO_FINAL_DOCUMENT_TEXT_BY_AI",
  "NO_CLIENT_VISIBLE_ADOPTED_COUNTER_ARGUMENT_BY_DEFAULT",
  "NO_AUTO_FILED_ADOPTED_COUNTER_ARGUMENT",
  "LAWYER_DECISION_LEDGER_REQUIRED",
  "ADOPTION_AUDIT_REQUIRED",
  "CONTROL_TOWER_BRAIN_VERIFY_REQUIRED",
] as const;

export type LawyerReviewAdoptionBoundaryMarker = (typeof PHASE63E_BOUNDARY_MARKERS)[number];

export const PHASE63E_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT =
  "verify:aibeopchin-control-tower-brain-rc" as const;

export const PHASE63E_LAWYER_REVIEW_ADOPTION_VERIFY_SCRIPT =
  "verify:aibeopchin-legal-strategy-phase63e" as const;

export const PHASE63E_PHASE63D_VERIFY_SCRIPT =
  "verify:aibeopchin-legal-strategy-phase63d" as const;

const DEFAULT_DECISION_BOUNDARIES = counterArgumentAdoptionDecisionBoundariesSchema.parse({
  noAdoptionWithoutLawyerDecision: true,
  noRejectedParagraphDocumentInsert: true,
  noModifiedParagraphWithoutModifiedText: true,
  noDocumentInsertWithoutAdoption: true,
  noFinalDocumentTextByAi: true,
  noClientVisibleAdoptedCounterArgumentByDefault: true,
  noAutoFiledAdoptedCounterArgument: true,
  lawyerDecisionLedgerRequired: true,
  adoptionAuditRequired: true,
  controlTowerBrainVerifyRequired: true,
});

const DEFAULT_INSERT_BOUNDARIES = counterArgumentDocumentInsertCandidateBoundariesSchema.parse({
  noDocumentInsertWithoutAdoption: true,
  noRejectedParagraphDocumentInsert: true,
  noFinalDocumentTextByAi: true,
  noClientVisibleAdoptedCounterArgumentByDefault: true,
  noAutoFiledAdoptedCounterArgument: true,
  lawyerDecisionLedgerRequired: true,
  adoptionAuditRequired: true,
  controlTowerBrainVerifyRequired: true,
});

const INSERT_PROMOTION_ALLOWED_DECISIONS = new Set(["ADOPT", "MODIFY"]);

function assertAdoptionAuditRef(auditRef: string) {
  if (!auditRef.trim()) {
    throw new ValidationError("ADOPTION_AUDIT_REQUIRED");
  }
}

function assertDecisionLedgerRef(decisionLedgerRef: string) {
  if (!decisionLedgerRef.trim()) {
    throw new ValidationError("LAWYER_DECISION_LEDGER_REQUIRED");
  }
}

function assertLawyerReviewer(lawyerReviewerId: string) {
  if (!lawyerReviewerId.trim()) {
    throw new ValidationError("NO_ADOPTION_WITHOUT_LAWYER_DECISION");
  }
}

export function evaluateDraftParagraphForLawyerReview(paragraph?: CounterArgumentDraftParagraph) {
  if (!paragraph) {
    return {
      allowed: false as const,
      blockedBy: "NO_ADOPTION_WITHOUT_LAWYER_DECISION" as const,
    };
  }
  if (paragraph.reviewStatus !== "LAWYER_REVIEW_REQUIRED") {
    return {
      allowed: false as const,
      blockedBy: "NO_ADOPTION_WITHOUT_LAWYER_DECISION" as const,
    };
  }
  return { allowed: true as const, blockedBy: null };
}

export function evaluateAdoptionDecisionForDocumentInsert(
  decision: CounterArgumentAdoptionDecision,
) {
  if (decision.decision === "REJECT") {
    return {
      allowed: false as const,
      blockedBy: "NO_REJECTED_PARAGRAPH_DOCUMENT_INSERT" as const,
    };
  }
  if (!INSERT_PROMOTION_ALLOWED_DECISIONS.has(decision.decision)) {
    return {
      allowed: false as const,
      blockedBy: "NO_DOCUMENT_INSERT_WITHOUT_ADOPTION" as const,
    };
  }
  return { allowed: true as const, blockedBy: null };
}

export function evaluateDocumentInsertCandidateForClientVisibility(
  candidate: CounterArgumentDocumentInsertCandidate,
) {
  if (candidate.clientVisibleAllowed) {
    return { allowed: true as const, blockedBy: null };
  }
  return {
    allowed: false as const,
    blockedBy: "NO_CLIENT_VISIBLE_ADOPTED_COUNTER_ARGUMENT_BY_DEFAULT" as const,
  };
}

export function evaluateDocumentInsertCandidateForAutoFile(
  candidate: CounterArgumentDocumentInsertCandidate,
) {
  if (candidate.autoFileAllowed) {
    return { allowed: true as const, blockedBy: null };
  }
  return {
    allowed: false as const,
    blockedBy: "NO_AUTO_FILED_ADOPTED_COUNTER_ARGUMENT" as const,
  };
}

function createLedgerEntry(input: {
  decision: CounterArgumentAdoptionDecision;
  ledgerEntryId?: string;
}): CounterArgumentAdoptionDecisionLedgerEntry {
  return {
    ledgerEntryId: input.ledgerEntryId ?? randomUUID(),
    decisionId: input.decision.decisionId,
    draftParagraphId: input.decision.sourceDraftParagraphId,
    caseId: input.decision.caseId,
    tenantId: input.decision.tenantId,
    action: input.decision.decision,
    lawyerReviewerId: input.decision.lawyerReviewerId,
    auditRef: input.decision.auditRef,
    recordedAt: input.decision.lawyerReviewedAt,
  };
}

function buildAdoptionDecision(input: {
  draftParagraph: CounterArgumentDraftParagraph;
  decision: CounterArgumentAdoptionDecision["decision"];
  lawyerReviewerId: string;
  decisionLedgerRef: string;
  auditRef: string;
  decisionId?: string;
  modifiedText?: string;
  rejectionReason?: string;
}): CounterArgumentAdoptionDecision {
  assertLawyerReviewer(input.lawyerReviewerId);
  assertDecisionLedgerRef(input.decisionLedgerRef);
  assertAdoptionAuditRef(input.auditRef);

  const reviewGate = evaluateDraftParagraphForLawyerReview(input.draftParagraph);
  if (!reviewGate.allowed) {
    throw new ValidationError(reviewGate.blockedBy ?? "NO_ADOPTION_WITHOUT_LAWYER_DECISION");
  }

  if (input.decision === "MODIFY" && !input.modifiedText?.trim()) {
    throw new ValidationError("NO_MODIFIED_PARAGRAPH_WITHOUT_MODIFIED_TEXT");
  }

  const decision: CounterArgumentAdoptionDecision = {
    marker: PHASE63E_LAWYER_REVIEW_ADOPTION_SCHEMA_MARKER,
    version: PHASE63E_LAWYER_REVIEW_ADOPTION_VERSION,
    decisionId: input.decisionId ?? randomUUID(),
    caseId: input.draftParagraph.caseId,
    tenantId: input.draftParagraph.tenantId,
    sourceDraftParagraphId: input.draftParagraph.paragraphId,
    sourceCounterArgumentCandidateId: input.draftParagraph.sourceCounterArgumentCandidateId,
    sourceBackfireRiskReportId: input.draftParagraph.sourceBackfireRiskReportId,
    decision: input.decision,
    modifiedText: input.modifiedText?.trim(),
    rejectionReason: input.rejectionReason?.trim(),
    lawyerReviewerId: input.lawyerReviewerId,
    lawyerReviewedAt: new Date().toISOString(),
    decisionLedgerRef: input.decisionLedgerRef,
    auditRef: input.auditRef,
    boundaries: DEFAULT_DECISION_BOUNDARIES,
    phase63DVerifyScript: PHASE63E_PHASE63D_VERIFY_SCRIPT,
    phase63EVerifyScript: PHASE63E_LAWYER_REVIEW_ADOPTION_VERIFY_SCRIPT,
    controlTowerBrainVerifyScript: PHASE63E_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT,
  };

  return counterArgumentAdoptionDecisionSchema.parse(decision);
}

function resolveParagraphText(input: {
  draftParagraph: CounterArgumentDraftParagraph;
  decision: CounterArgumentAdoptionDecision;
}): string {
  if (input.decision.decision === "ADOPT") {
    return input.draftParagraph.draftText.trim();
  }
  if (input.decision.decision === "MODIFY") {
    return input.decision.modifiedText!.trim();
  }
  throw new ValidationError("NO_REJECTED_PARAGRAPH_DOCUMENT_INSERT");
}

export function buildDocumentInsertCandidateFromDecision(input: {
  decision: CounterArgumentAdoptionDecision;
  draftParagraph: CounterArgumentDraftParagraph;
  insertTarget: CounterArgumentDocumentInsertTarget;
  insertCandidateId?: string;
}): CounterArgumentDocumentInsertCandidate | null {
  const promotionGate = evaluateAdoptionDecisionForDocumentInsert(input.decision);
  if (!promotionGate.allowed) {
    return null;
  }

  assertDecisionLedgerRef(input.decision.decisionLedgerRef);
  assertAdoptionAuditRef(input.decision.auditRef);

  const paragraphText = resolveParagraphText({
    draftParagraph: input.draftParagraph,
    decision: input.decision,
  });
  if (!paragraphText.trim()) {
    throw new ValidationError("NO_FINAL_DOCUMENT_TEXT_BY_AI");
  }

  const insertCandidateId = input.insertCandidateId ?? randomUUID();

  const candidate: CounterArgumentDocumentInsertCandidate = {
    marker: PHASE63E_LAWYER_REVIEW_ADOPTION_SCHEMA_MARKER,
    version: PHASE63E_LAWYER_REVIEW_ADOPTION_VERSION,
    insertCandidateId,
    caseId: input.decision.caseId,
    tenantId: input.decision.tenantId,
    sourceDecisionId: input.decision.decisionId,
    sourceDraftParagraphId: input.decision.sourceDraftParagraphId,
    paragraphText,
    insertTarget: input.insertTarget,
    insertStatus: "DOCUMENT_INSERT_CANDIDATE",
    isFinalDocumentText: false,
    clientVisibleAllowed: false,
    autoFileAllowed: false,
    sourceTrace: input.draftParagraph.sourceTrace.map((trace) => ({
      ...trace,
      traceId: randomUUID(),
      adoptionDecisionId: input.decision.decisionId,
      documentInsertCandidateId: insertCandidateId,
      capturedAt: new Date().toISOString(),
    })),
    decisionLedgerRef: input.decision.decisionLedgerRef,
    auditRef: input.decision.auditRef,
    boundaries: DEFAULT_INSERT_BOUNDARIES,
    phase63DVerifyScript: PHASE63E_PHASE63D_VERIFY_SCRIPT,
    phase63EVerifyScript: PHASE63E_LAWYER_REVIEW_ADOPTION_VERIFY_SCRIPT,
    controlTowerBrainVerifyScript: PHASE63E_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT,
    promotedAt: new Date().toISOString(),
  };

  return counterArgumentDocumentInsertCandidateSchema.parse(candidate);
}

function buildAdoptionReviewResult(input: {
  decision: CounterArgumentAdoptionDecision;
  draftParagraph: CounterArgumentDraftParagraph;
  insertTarget: CounterArgumentDocumentInsertTarget;
  ledgerEntryId?: string;
}): CounterArgumentAdoptionReviewResult {
  const ledgerEntry = createLedgerEntry({
    decision: input.decision,
    ledgerEntryId: input.ledgerEntryId,
  });

  const documentInsertCandidate = buildDocumentInsertCandidateFromDecision({
    decision: input.decision,
    draftParagraph: input.draftParagraph,
    insertTarget: input.insertTarget,
  });

  return counterArgumentAdoptionReviewResultSchema.parse({
    decision: input.decision,
    ledgerEntry,
    documentInsertCandidate,
  });
}

export function adoptDraftParagraph(input: AdoptDraftParagraphInput): CounterArgumentAdoptionReviewResult {
  assertDecisionLedgerRef(input.decisionLedgerRef);
  assertAdoptionAuditRef(input.auditRef);

  const decision = buildAdoptionDecision({
    draftParagraph: input.draftParagraph,
    decision: "ADOPT",
    lawyerReviewerId: input.lawyerReviewerId,
    decisionLedgerRef: input.decisionLedgerRef,
    auditRef: input.auditRef,
    decisionId: input.decisionId,
  });

  return buildAdoptionReviewResult({
    decision,
    draftParagraph: input.draftParagraph,
    insertTarget: input.insertTarget ?? "ANSWER",
    ledgerEntryId: input.ledgerEntryId,
  });
}

export function modifyDraftParagraph(
  input: ModifyDraftParagraphInput,
): CounterArgumentAdoptionReviewResult {
  assertDecisionLedgerRef(input.decisionLedgerRef);
  assertAdoptionAuditRef(input.auditRef);

  const decision = buildAdoptionDecision({
    draftParagraph: input.draftParagraph,
    decision: "MODIFY",
    lawyerReviewerId: input.lawyerReviewerId,
    decisionLedgerRef: input.decisionLedgerRef,
    auditRef: input.auditRef,
    decisionId: input.decisionId,
    modifiedText: input.modifiedText,
  });

  return buildAdoptionReviewResult({
    decision,
    draftParagraph: input.draftParagraph,
    insertTarget: input.insertTarget ?? "ANSWER",
    ledgerEntryId: input.ledgerEntryId,
  });
}

export function rejectDraftParagraph(
  input: RejectDraftParagraphInput,
): CounterArgumentAdoptionReviewResult {
  assertDecisionLedgerRef(input.decisionLedgerRef);
  assertAdoptionAuditRef(input.auditRef);

  const decision = buildAdoptionDecision({
    draftParagraph: input.draftParagraph,
    decision: "REJECT",
    lawyerReviewerId: input.lawyerReviewerId,
    decisionLedgerRef: input.decisionLedgerRef,
    auditRef: input.auditRef,
    decisionId: input.decisionId,
    rejectionReason: input.rejectionReason,
  });

  return buildAdoptionReviewResult({
    decision,
    draftParagraph: input.draftParagraph,
    insertTarget: "OTHER",
    ledgerEntryId: input.ledgerEntryId,
  });
}
