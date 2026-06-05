/**
 * Product Phase 63-E — Lawyer Review & Adoption Gate schema SSOT.
 * @see docs/legal-strategy/AIBEOPCHIN_COUNTER_ARGUMENT_LAWYER_REVIEW_ADOPTION_PHASE63E.md
 */
import { z } from "zod";
import { counterArgumentDraftParagraphSchema } from "./phase63d-draft-paragraph-generator.schema";
import { draftParagraphSourceTraceSchema } from "./phase63d-draft-paragraph-generator.schema";

export const PHASE63E_LAWYER_REVIEW_ADOPTION_VERSION = "63-E.1" as const;

export const PHASE63E_LAWYER_REVIEW_ADOPTION_SCHEMA_MARKER =
  "phase63e-lawyer-review-adoption-schema" as const;

export const counterArgumentAdoptionDecisionKindSchema = z.enum([
  "ADOPT",
  "MODIFY",
  "REJECT",
]);

export type CounterArgumentAdoptionDecisionKind = z.infer<
  typeof counterArgumentAdoptionDecisionKindSchema
>;

export const counterArgumentDocumentInsertTargetSchema = z.enum([
  "ANSWER",
  "PREPARATORY_BRIEF",
  "OPINION",
  "LEGAL_MEMO",
  "OTHER",
]);

export type CounterArgumentDocumentInsertTarget = z.infer<
  typeof counterArgumentDocumentInsertTargetSchema
>;

export const counterArgumentDocumentInsertStatusSchema = z.enum([
  "DOCUMENT_INSERT_CANDIDATE",
  "LAWYER_APPROVED_FOR_INSERT",
  "INSERTED_TO_DRAFT",
  "REJECTED",
]);

export type CounterArgumentDocumentInsertStatus = z.infer<
  typeof counterArgumentDocumentInsertStatusSchema
>;

export const counterArgumentAdoptionDecisionLedgerEntrySchema = z.object({
  ledgerEntryId: z.string().min(1),
  decisionId: z.string().min(1),
  draftParagraphId: z.string().min(1),
  caseId: z.string().min(1),
  tenantId: z.string().min(1),
  action: counterArgumentAdoptionDecisionKindSchema,
  lawyerReviewerId: z.string().min(1),
  auditRef: z.string().min(1),
  recordedAt: z.string().datetime(),
});

export type CounterArgumentAdoptionDecisionLedgerEntry = z.infer<
  typeof counterArgumentAdoptionDecisionLedgerEntrySchema
>;

export const counterArgumentAdoptionDecisionBoundariesSchema = z.object({
  noAdoptionWithoutLawyerDecision: z.literal(true),
  noRejectedParagraphDocumentInsert: z.literal(true),
  noModifiedParagraphWithoutModifiedText: z.literal(true),
  noDocumentInsertWithoutAdoption: z.literal(true),
  noFinalDocumentTextByAi: z.literal(true),
  noClientVisibleAdoptedCounterArgumentByDefault: z.literal(true),
  noAutoFiledAdoptedCounterArgument: z.literal(true),
  lawyerDecisionLedgerRequired: z.literal(true),
  adoptionAuditRequired: z.literal(true),
  controlTowerBrainVerifyRequired: z.literal(true),
});

export const counterArgumentAdoptionDecisionSchema = z
  .object({
    marker: z.literal(PHASE63E_LAWYER_REVIEW_ADOPTION_SCHEMA_MARKER),
    version: z.literal(PHASE63E_LAWYER_REVIEW_ADOPTION_VERSION),
    decisionId: z.string().min(1),
    caseId: z.string().min(1),
    tenantId: z.string().min(1),
    sourceDraftParagraphId: z.string().min(1),
    sourceCounterArgumentCandidateId: z.string().min(1),
    sourceBackfireRiskReportId: z.string().min(1),
    decision: counterArgumentAdoptionDecisionKindSchema,
    modifiedText: z.string().min(1).optional(),
    rejectionReason: z.string().min(1).optional(),
    lawyerReviewerId: z.string().min(1),
    lawyerReviewedAt: z.string().datetime(),
    decisionLedgerRef: z.string().min(1),
    auditRef: z.string().min(1),
    boundaries: counterArgumentAdoptionDecisionBoundariesSchema,
    phase63DVerifyScript: z.literal("verify:aibeopchin-legal-strategy-phase63d"),
    phase63EVerifyScript: z.literal("verify:aibeopchin-legal-strategy-phase63e"),
    controlTowerBrainVerifyScript: z.literal("verify:aibeopchin-control-tower-brain-rc"),
  })
  .superRefine((value, ctx) => {
    if (value.decision === "MODIFY" && !value.modifiedText?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "NO_MODIFIED_PARAGRAPH_WITHOUT_MODIFIED_TEXT",
        path: ["modifiedText"],
      });
    }
    if (value.decision === "REJECT" && !value.rejectionReason?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "NO_ADOPTION_WITHOUT_LAWYER_DECISION",
        path: ["rejectionReason"],
      });
    }
  });

export type CounterArgumentAdoptionDecision = z.infer<
  typeof counterArgumentAdoptionDecisionSchema
>;

export const documentInsertCandidateSourceTraceSchema = draftParagraphSourceTraceSchema.extend({
  adoptionDecisionId: z.string().min(1).optional(),
  documentInsertCandidateId: z.string().min(1).optional(),
});

export type DocumentInsertCandidateSourceTrace = z.infer<
  typeof documentInsertCandidateSourceTraceSchema
>;

export const counterArgumentDocumentInsertCandidateBoundariesSchema = z.object({
  noDocumentInsertWithoutAdoption: z.literal(true),
  noRejectedParagraphDocumentInsert: z.literal(true),
  noFinalDocumentTextByAi: z.literal(true),
  noClientVisibleAdoptedCounterArgumentByDefault: z.literal(true),
  noAutoFiledAdoptedCounterArgument: z.literal(true),
  lawyerDecisionLedgerRequired: z.literal(true),
  adoptionAuditRequired: z.literal(true),
  controlTowerBrainVerifyRequired: z.literal(true),
});

export const counterArgumentDocumentInsertCandidateSchema = z.object({
  marker: z.literal(PHASE63E_LAWYER_REVIEW_ADOPTION_SCHEMA_MARKER),
  version: z.literal(PHASE63E_LAWYER_REVIEW_ADOPTION_VERSION),
  insertCandidateId: z.string().min(1),
  caseId: z.string().min(1),
  tenantId: z.string().min(1),
  sourceDecisionId: z.string().min(1),
  sourceDraftParagraphId: z.string().min(1),
  paragraphText: z.string().min(1),
  insertTarget: counterArgumentDocumentInsertTargetSchema,
  insertStatus: counterArgumentDocumentInsertStatusSchema,
  isFinalDocumentText: z.literal(false),
  clientVisibleAllowed: z.literal(false),
  autoFileAllowed: z.literal(false),
  sourceTrace: z.array(documentInsertCandidateSourceTraceSchema).min(1),
  decisionLedgerRef: z.string().min(1),
  auditRef: z.string().min(1),
  boundaries: counterArgumentDocumentInsertCandidateBoundariesSchema,
  phase63DVerifyScript: z.literal("verify:aibeopchin-legal-strategy-phase63d"),
  phase63EVerifyScript: z.literal("verify:aibeopchin-legal-strategy-phase63e"),
  controlTowerBrainVerifyScript: z.literal("verify:aibeopchin-control-tower-brain-rc"),
  promotedAt: z.string().datetime(),
});

export type CounterArgumentDocumentInsertCandidate = z.infer<
  typeof counterArgumentDocumentInsertCandidateSchema
>;

export const counterArgumentAdoptionReviewResultSchema = z.object({
  decision: counterArgumentAdoptionDecisionSchema,
  ledgerEntry: counterArgumentAdoptionDecisionLedgerEntrySchema,
  documentInsertCandidate: counterArgumentDocumentInsertCandidateSchema.nullable(),
});

export type CounterArgumentAdoptionReviewResult = z.infer<
  typeof counterArgumentAdoptionReviewResultSchema
>;

export const adoptDraftParagraphInputSchema = z.object({
  draftParagraph: counterArgumentDraftParagraphSchema,
  lawyerReviewerId: z.string().min(1),
  decisionLedgerRef: z.string().min(1),
  auditRef: z.string().min(1),
  insertTarget: counterArgumentDocumentInsertTargetSchema.default("ANSWER"),
  decisionId: z.string().min(1).optional(),
  ledgerEntryId: z.string().min(1).optional(),
});

export type AdoptDraftParagraphInput = z.infer<typeof adoptDraftParagraphInputSchema>;

export const modifyDraftParagraphInputSchema = z.object({
  draftParagraph: counterArgumentDraftParagraphSchema,
  lawyerReviewerId: z.string().min(1),
  modifiedText: z.string().min(1),
  decisionLedgerRef: z.string().min(1),
  auditRef: z.string().min(1),
  insertTarget: counterArgumentDocumentInsertTargetSchema.default("ANSWER"),
  decisionId: z.string().min(1).optional(),
  ledgerEntryId: z.string().min(1).optional(),
});

export type ModifyDraftParagraphInput = z.infer<typeof modifyDraftParagraphInputSchema>;

export const rejectDraftParagraphInputSchema = z.object({
  draftParagraph: counterArgumentDraftParagraphSchema,
  lawyerReviewerId: z.string().min(1),
  rejectionReason: z.string().min(1),
  decisionLedgerRef: z.string().min(1),
  auditRef: z.string().min(1),
  decisionId: z.string().min(1).optional(),
  ledgerEntryId: z.string().min(1).optional(),
});

export type RejectDraftParagraphInput = z.infer<typeof rejectDraftParagraphInputSchema>;
