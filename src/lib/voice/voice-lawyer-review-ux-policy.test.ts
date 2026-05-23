import { describe, expect, it } from "vitest";

import {
  canFinalizeDocumentAfterVoiceReview,
  detectVoiceInterviewAnswerMismatch,
  H_BLOCK_LAWYER_VOICE_REVIEW_REQUIRED,
  H_BLOCK_MISMATCH_NOT_REVIEWED,
  H_BLOCK_TRANSCRIPT_NOT_CONFIRMED,
  resolveVoiceReviewBlockReason,
  VOICE_LAWYER_REVIEW_UX_SPEC_MARKER_PHASE5H,
  VOICE_PHASE5H_IMPLEMENTATION_EVIDENCE_ID,
} from "@/lib/voice/voice-lawyer-review-ux-policy";

describe("voice-lawyer-review-ux-policy (Phase 5-H static gate)", () => {
  it("exports Phase 5-H spec marker for verify bundles", () => {
    expect(VOICE_LAWYER_REVIEW_UX_SPEC_MARKER_PHASE5H).toContain("phase5h-lawyer-voice-review-ux-spec");
  });

  it("exports evidence id substring for IMPLEMENTATION_EVIDENCE alignment", () => {
    expect(VOICE_PHASE5H_IMPLEMENTATION_EVIDENCE_ID).toContain("PHASE5H");
    expect(VOICE_PHASE5H_IMPLEMENTATION_EVIDENCE_ID).toContain("LAWYER-VOICE-REVIEW-UX-SPEC");
  });
});

describe("voice-lawyer-review-ux-policy (Phase 5-H-UI document finalize gate)", () => {
  it("does not block document finalize when no voice transcript exists", () => {
    expect(
      resolveVoiceReviewBlockReason({
        hasVoiceTranscript: false,
        transcriptConfirmed: false,
        lawyerReviewed: false,
        hasMismatch: false,
      }),
    ).toBeNull();
    expect(
      canFinalizeDocumentAfterVoiceReview({
        hasVoiceTranscript: false,
        transcriptConfirmed: false,
        lawyerReviewed: false,
        hasMismatch: true,
      }),
    ).toBe(true);
  });

  it("blocks document finalize when transcript is not confirmed", () => {
    expect(
      resolveVoiceReviewBlockReason({
        hasVoiceTranscript: true,
        transcriptConfirmed: false,
        lawyerReviewed: false,
        hasMismatch: false,
      }),
    ).toBe(H_BLOCK_TRANSCRIPT_NOT_CONFIRMED);
  });

  it("blocks document finalize when mismatch exists and lawyer has not reviewed", () => {
    expect(
      resolveVoiceReviewBlockReason({
        hasVoiceTranscript: true,
        transcriptConfirmed: true,
        lawyerReviewed: false,
        hasMismatch: true,
      }),
    ).toBe(H_BLOCK_MISMATCH_NOT_REVIEWED);
  });

  it("allows document finalize when mismatch exists but lawyer review is complete", () => {
    expect(
      resolveVoiceReviewBlockReason({
        hasVoiceTranscript: true,
        transcriptConfirmed: true,
        lawyerReviewed: true,
        hasMismatch: true,
      }),
    ).toBeNull();
    expect(
      canFinalizeDocumentAfterVoiceReview({
        hasVoiceTranscript: true,
        transcriptConfirmed: true,
        lawyerReviewed: true,
        hasMismatch: true,
      }),
    ).toBe(true);
  });

  it("blocks document finalize when confirmed transcript exists but lawyer review is incomplete", () => {
    expect(
      resolveVoiceReviewBlockReason({
        hasVoiceTranscript: true,
        transcriptConfirmed: true,
        lawyerReviewed: false,
        hasMismatch: false,
      }),
    ).toBe(H_BLOCK_LAWYER_VOICE_REVIEW_REQUIRED);
  });

  it("passes document finalize when confirmed and lawyer review is complete", () => {
    expect(
      resolveVoiceReviewBlockReason({
        hasVoiceTranscript: true,
        transcriptConfirmed: true,
        lawyerReviewed: true,
        hasMismatch: false,
      }),
    ).toBeNull();
  });

  it("detects mismatch between confirmed transcript and interview answer", () => {
    expect(detectVoiceInterviewAnswerMismatch("hello", "hello")).toBe(false);
    expect(detectVoiceInterviewAnswerMismatch("hello", "world")).toBe(true);
  });
});
