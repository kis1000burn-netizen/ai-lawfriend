/**
 * Phase 13-G — review decision validator.
 */
import {
  documentIntelligenceReviewQueueResponseSchema,
  type DocumentIntelligenceReviewQueueItem,
} from "./document-intelligence-review.schema";

export const PHASE13G_DOCUMENT_INTELLIGENCE_REVIEW_VALIDATOR_MARKER =
  "PHASE13G_DOCUMENT_INTELLIGENCE_REVIEW_VALIDATOR" as const;

/** Blocks clientVisible/submissionReady without LAWYER_CONFIRMED */
export function validateReviewQueueResponse(input: unknown) {
  return documentIntelligenceReviewQueueResponseSchema.parse(input);
}

export function validateReviewDecisionDoesNotExposeClientEarly(
  item: DocumentIntelligenceReviewQueueItem,
): void {
  if (
    item.reviewStatus !== "LAWYER_CONFIRMED" &&
    item.reviewStatus !== "LAWYER_CORRECTED" &&
    item.downstreamUsable
  ) {
    throw new Error("13-G: downstreamUsable requires confirmed review status");
  }
}

export function validateNoForbiddenDownstreamPayload(payload: unknown): void {
  if (!payload || typeof payload !== "object") return;
  const forbidden = ["clientVisible", "submissionReady", "confirmedFact"];
  for (const key of forbidden) {
    if (key in (payload as Record<string, unknown>)) {
      throw new Error(`13-G forbidden downstream field on review item: ${key}`);
    }
  }
}
