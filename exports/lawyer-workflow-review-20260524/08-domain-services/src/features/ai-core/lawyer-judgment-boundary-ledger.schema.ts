/**
 * Phase 9-F — Lawyer Judgment Boundary Ledger schema SSOT.
 * @see docs/ai/AIBEOPCHIN_LAWYER_JUDGMENT_BOUNDARY_LEDGER_SPEC.md
 *
 * 불변 원칙: AI는 구조화했고, 변호사가 판단했다.
 */
import { z } from "zod";

export const PHASE9F_LAWYER_JUDGMENT_BOUNDARY_LEDGER_MARKER =
  "PHASE9F_LAWYER_JUDGMENT_BOUNDARY_LEDGER" as const;

export const LAWYER_JUDGMENT_BOUNDARY_LEDGER_VERSION = "9-F.1" as const;

export const LAWYER_JUDGMENT_BOUNDARY_MOTTO =
  "AI는 구조화했고, 변호사가 판단했다" as const;

/** 6경계 lane — AI 감지 → 변호사 판단 → 공개/제출 */
export const LAWYER_JUDGMENT_BOUNDARY_LANES = [
  "AI_DETECTED",
  "LAWYER_CONFIRMED",
  "LAWYER_REJECTED",
  "LAWYER_EDITED",
  "CLIENT_VISIBLE",
  "SUBMISSION_READY",
] as const;

export type LawyerJudgmentBoundaryLane = (typeof LAWYER_JUDGMENT_BOUNDARY_LANES)[number];

export const LAWYER_JUDGMENT_STATES = [
  "PENDING",
  "CONFIRMED",
  "REJECTED",
  "EDITED",
] as const;

export type LawyerJudgmentState = (typeof LAWYER_JUDGMENT_STATES)[number];

export const LAWYER_JUDGMENT_SUBJECT_KINDS = [
  "CLAIM",
  "RADAR_SIGNAL",
  "CONTRADICTION_EDGE",
] as const;

export type LawyerJudgmentSubjectKind = (typeof LAWYER_JUDGMENT_SUBJECT_KINDS)[number];

export const lawyerJudgmentBoundaryEntrySchema = z.object({
  entryId: z.string().min(1),
  subjectKind: z.enum(LAWYER_JUDGMENT_SUBJECT_KINDS),
  /** claimId · signalId · edge key */
  subjectId: z.string().min(1),
  aiDetectedText: z.string().min(1).max(4000),
  aiDetectedAt: z.string().datetime(),
  judgmentState: z.enum(LAWYER_JUDGMENT_STATES).default("PENDING"),
  lawyerId: z.string().optional(),
  judgedAt: z.string().datetime().optional(),
  lawyerEditedText: z.string().max(4000).optional(),
  rejectionReason: z.string().max(500).optional(),
  clientVisible: z.boolean().default(false),
  submissionReady: z.boolean().default(false),
  boundaryLanes: z.array(z.enum(LAWYER_JUDGMENT_BOUNDARY_LANES)).min(1),
});

export type LawyerJudgmentBoundaryEntry = z.infer<typeof lawyerJudgmentBoundaryEntrySchema>;

export const lawyerJudgmentBoundaryLedgerSummarySchema = z.object({
  aiDetectedCount: z.number().int().nonnegative(),
  pendingCount: z.number().int().nonnegative(),
  confirmedCount: z.number().int().nonnegative(),
  rejectedCount: z.number().int().nonnegative(),
  editedCount: z.number().int().nonnegative(),
  clientVisibleCount: z.number().int().nonnegative(),
  submissionReadyCount: z.number().int().nonnegative(),
});

export type LawyerJudgmentBoundaryLedgerSummary = z.infer<
  typeof lawyerJudgmentBoundaryLedgerSummarySchema
>;

export const lawyerJudgmentBoundaryLedgerSchema = z.object({
  ledgerVersion: z.literal(LAWYER_JUDGMENT_BOUNDARY_LEDGER_VERSION),
  caseId: z.string().min(1),
  createdAt: z.string().datetime(),
  graphVersion: z.string().min(1),
  radarVersion: z.string().optional(),
  motto: z.literal(LAWYER_JUDGMENT_BOUNDARY_MOTTO),
  entries: z.array(lawyerJudgmentBoundaryEntrySchema),
  summary: lawyerJudgmentBoundaryLedgerSummarySchema,
});

export type LawyerJudgmentBoundaryLedger = z.infer<typeof lawyerJudgmentBoundaryLedgerSchema>;

export function parseLawyerJudgmentBoundaryLedger(
  input: unknown,
): LawyerJudgmentBoundaryLedger {
  return lawyerJudgmentBoundaryLedgerSchema.parse(input);
}

export function safeParseLawyerJudgmentBoundaryLedger(
  input: unknown,
): z.SafeParseReturnType<unknown, LawyerJudgmentBoundaryLedger> {
  return lawyerJudgmentBoundaryLedgerSchema.safeParse(input);
}
