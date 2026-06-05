/**
 * Product Phase 62-C — Supplement Request Draft Generator service SSOT.
 */
import { randomUUID } from "node:crypto";
import type { EvidenceGapDetectionReport } from "./phase62b-evidence-gap-detection-engine.schema";
import { buildSupplementRequestDraft } from "./phase62c-supplement-request-draft.policy";
import type {
  GenerateSupplementRequestDraftsInput,
  SupplementRequestDraft,
} from "./phase62c-supplement-request-draft.schema";
import { supplementRequestDraftSchema } from "./phase62c-supplement-request-draft.schema";

export function generateSupplementRequestDraftFromDetectionReport(input: {
  detectionReport: EvidenceGapDetectionReport;
  auditRef: string;
  draftId?: string;
  title?: string;
}): SupplementRequestDraft {
  return buildSupplementRequestDraft({
    draftId: input.draftId ?? randomUUID(),
    detectionReport: input.detectionReport,
    auditRef: input.auditRef,
    title: input.title,
  });
}

export function generateSupplementRequestDraftsFromDetectionReport(
  input: GenerateSupplementRequestDraftsInput,
): SupplementRequestDraft[] {
  const draft = generateSupplementRequestDraftFromDetectionReport({
    detectionReport: input.detectionReport,
    auditRef: input.auditRef,
    draftId: `${input.draftIdPrefix}-${input.detectionReport.reportId}`,
  });

  return [supplementRequestDraftSchema.parse(draft)];
}

export function summarizeSupplementRequestDraft(draft: SupplementRequestDraft) {
  return {
    draftId: draft.draftId,
    itemCount: draft.clientSafeDraftItems.length,
    reviewStatus: draft.reviewStatus,
    portalDraftStatus: draft.portalDraftStatus,
    clientVisible: draft.clientVisible,
    sendAllowed: draft.sendAllowed,
  };
}
