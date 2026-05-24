/**
 * Phase 9-F — Lawyer Judgment Boundary Ledger validator.
 * AI-only 경계는 CLIENT_VISIBLE / SUBMISSION_READY 로 승격될 수 없다.
 */
import { assertClaimNoFinalJudgment } from "./case-summary-claim-validator";
import {
  type LawyerJudgmentBoundaryEntry,
  type LawyerJudgmentBoundaryLedger,
  lawyerJudgmentBoundaryLedgerSchema,
} from "./lawyer-judgment-boundary-ledger.schema";

export const LAWYER_JUDGMENT_BOUNDARY_VALIDATOR_MARKER =
  "PHASE9F_LAWYER_JUDGMENT_BOUNDARY_VALIDATOR" as const;

export type LawyerJudgmentBoundaryValidationResult = {
  passed: boolean;
  issues: string[];
};

export function assertEntryBoundaryRules(entry: LawyerJudgmentBoundaryEntry): string[] {
  const issues: string[] = [];

  if (!entry.boundaryLanes.includes("AI_DETECTED")) {
    issues.push(`entry ${entry.entryId}: AI_DETECTED lane required`);
  }

  if (entry.judgmentState === "PENDING") {
    if (entry.clientVisible) {
      issues.push(`entry ${entry.entryId}: PENDING cannot be CLIENT_VISIBLE`);
    }
    if (entry.submissionReady) {
      issues.push(`entry ${entry.entryId}: PENDING cannot be SUBMISSION_READY`);
    }
  }

  if (entry.judgmentState === "REJECTED") {
    if (entry.clientVisible) {
      issues.push(`entry ${entry.entryId}: REJECTED cannot be CLIENT_VISIBLE`);
    }
    if (entry.submissionReady) {
      issues.push(`entry ${entry.entryId}: REJECTED cannot be SUBMISSION_READY`);
    }
    if (!entry.rejectionReason?.trim()) {
      issues.push(`entry ${entry.entryId}: REJECTED should include rejectionReason`);
    }
  }

  if (entry.judgmentState === "EDITED" && !entry.lawyerEditedText?.trim()) {
    issues.push(`entry ${entry.entryId}: EDITED requires lawyerEditedText`);
  }

  if (entry.clientVisible && !["CONFIRMED", "EDITED"].includes(entry.judgmentState)) {
    issues.push(
      `entry ${entry.entryId}: CLIENT_VISIBLE requires CONFIRMED or EDITED judgment`,
    );
  }

  if (
    entry.submissionReady &&
    !["CONFIRMED", "EDITED"].includes(entry.judgmentState)
  ) {
    issues.push(
      `entry ${entry.entryId}: SUBMISSION_READY requires CONFIRMED or EDITED judgment`,
    );
  }

  if (entry.lawyerEditedText) {
    const guardrail = assertClaimNoFinalJudgment({
      claimId: entry.entryId,
      text: entry.lawyerEditedText,
      claimType: "USER_STATEMENT",
      sources: [{ kind: "SYSTEM_DERIVED", ref: "LawyerJudgment.edited" }],
      confidence: "MEDIUM",
      lawyerReviewState: "EDITED",
      clientVisible: entry.clientVisible,
      audience: "INTERNAL",
    });
    issues.push(...guardrail);
  }

  if (entry.clientVisible && !entry.boundaryLanes.includes("CLIENT_VISIBLE")) {
    issues.push(`entry ${entry.entryId}: clientVisible flag/lane mismatch`);
  }

  if (entry.submissionReady && !entry.boundaryLanes.includes("SUBMISSION_READY")) {
    issues.push(`entry ${entry.entryId}: submissionReady flag/lane mismatch`);
  }

  return issues;
}

export function validateLawyerJudgmentBoundaryLedger(
  input: unknown,
  options: { strictRejectionReason?: boolean } = {},
): LawyerJudgmentBoundaryValidationResult & { ledger: LawyerJudgmentBoundaryLedger } {
  const ledger = lawyerJudgmentBoundaryLedgerSchema.parse(input);
  const issues: string[] = [];

  if (ledger.summary.aiDetectedCount !== ledger.entries.length) {
    issues.push("summary.aiDetectedCount must match entries.length");
  }

  const recomputedPending = ledger.entries.filter((e) => e.judgmentState === "PENDING").length;
  if (ledger.summary.pendingCount !== recomputedPending) {
    issues.push("summary.pendingCount drift");
  }

  for (const entry of ledger.entries) {
    const entryIssues = assertEntryBoundaryRules(entry);
    if (options.strictRejectionReason === false && entry.judgmentState === "REJECTED") {
      const filtered = entryIssues.filter((i) => !i.includes("rejectionReason"));
      issues.push(...filtered);
    } else {
      issues.push(...entryIssues);
    }
  }

  return {
    passed: issues.length === 0,
    issues,
    ledger,
  };
}
