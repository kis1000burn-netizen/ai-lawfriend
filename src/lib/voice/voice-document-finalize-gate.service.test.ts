import { VoiceTranscriptStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";

import {
  evaluateOpenVoiceSupplementDocumentFinalizeGate,
  evaluateVoiceDocumentFinalizeGate,
  resolveVoiceDocumentFinalizeBlockReason,
  VOICE_DOCUMENT_FINALIZE_GATE_MARKER_PHASE5H_UI_2,
  VOICE_DOCUMENT_FINALIZE_GATE_OPEN_SUPPLEMENT_PHASE5H_UI_5,
} from "@/lib/voice/voice-document-finalize-gate.service";
import {
  H_BLOCK_LAWYER_VOICE_REVIEW_REQUIRED,
  H_BLOCK_MISMATCH_NOT_REVIEWED,
  H_BLOCK_OPEN_SUPPLEMENT_UNRESOLVED,
  H_BLOCK_TRANSCRIPT_NOT_CONFIRMED,
} from "@/lib/voice/voice-lawyer-review-ux-policy";
import { SupplementRequestStatus } from "@prisma/client";

describe("voice-document-finalize-gate.service (Phase 5-H-UI-2)", () => {
  it("exports server gate marker", () => {
    expect(VOICE_DOCUMENT_FINALIZE_GATE_MARKER_PHASE5H_UI_2).toContain(
      "phase5h-ui-2-voice-document-finalize-gate",
    );
  });

  it("passes when no voice transcripts exist", () => {
    expect(
      evaluateVoiceDocumentFinalizeGate({
        transcripts: [],
        answers: { q1: "hello" },
      }),
    ).toEqual({ allowed: true, blockReason: null, questionKey: null });
  });

  it("blocks document finalize when draft transcript is not confirmed", () => {
    const result = evaluateVoiceDocumentFinalizeGate({
      transcripts: [
        {
          questionKey: "q1",
          status: VoiceTranscriptStatus.NEEDS_CONFIRMATION,
          draftText: "draft only",
          confirmedAt: null,
        },
      ],
      answers: { q1: "draft only" },
    });

    expect(result).toEqual({
      allowed: false,
      blockReason: H_BLOCK_TRANSCRIPT_NOT_CONFIRMED,
      questionKey: "q1",
    });
  });

  it("blocks document finalize when confirmed transcript mismatches interview answer", () => {
    const result = evaluateVoiceDocumentFinalizeGate({
      transcripts: [
        {
          questionKey: "q1",
          status: VoiceTranscriptStatus.CONFIRMED,
          draftText: "confirmed text",
          confirmedAt: new Date("2026-05-23T00:00:00.000Z"),
        },
      ],
      answers: { q1: "different answer" },
    });

    expect(result).toEqual({
      allowed: false,
      blockReason: H_BLOCK_MISMATCH_NOT_REVIEWED,
      questionKey: "q1",
    });
  });

  it("allows confirmed transcript when interview answer matches", () => {
    expect(
      evaluateVoiceDocumentFinalizeGate({
        transcripts: [
          {
            questionKey: "q1",
            status: VoiceTranscriptStatus.CONFIRMED,
            draftText: "same text",
            confirmedAt: new Date("2026-05-23T00:00:00.000Z"),
          },
        ],
        answers: { q1: "same text" },
      }),
    ).toEqual({ allowed: true, blockReason: null, questionKey: null });
  });

  it("defers H-BLOCK-LAWYER-VOICE-REVIEW-REQUIRED until includeLawyerReviewRequired is enabled", () => {
    expect(
      resolveVoiceDocumentFinalizeBlockReason(
        {
          hasVoiceTranscript: true,
          transcriptConfirmed: true,
          lawyerReviewed: false,
          hasMismatch: false,
        },
        { includeLawyerReviewRequired: false },
      ),
    ).toBeNull();

    expect(
      resolveVoiceDocumentFinalizeBlockReason(
        {
          hasVoiceTranscript: true,
          transcriptConfirmed: true,
          lawyerReviewed: false,
          hasMismatch: false,
        },
        { includeLawyerReviewRequired: true },
      ),
    ).toBe(H_BLOCK_LAWYER_VOICE_REVIEW_REQUIRED);
  });

  it("blocks confirmed transcript without lawyer review when Phase 5-H-UI-3 gate is enabled", () => {
    const result = evaluateVoiceDocumentFinalizeGate({
      transcripts: [
        {
          questionKey: "q1",
          status: VoiceTranscriptStatus.CONFIRMED,
          draftText: "same text",
          confirmedAt: new Date("2026-05-23T00:00:00.000Z"),
        },
      ],
      answers: { q1: "same text" },
      lawyerReviewedByQuestionKey: { q1: false },
      includeLawyerReviewRequired: true,
    });

    expect(result).toEqual({
      allowed: false,
      blockReason: H_BLOCK_LAWYER_VOICE_REVIEW_REQUIRED,
      questionKey: "q1",
    });
  });

  it("uses latest transcript per question key", () => {
    const result = evaluateVoiceDocumentFinalizeGate({
      transcripts: [
        {
          questionKey: "q1",
          status: VoiceTranscriptStatus.CONFIRMED,
          draftText: "new confirmed",
          confirmedAt: new Date("2026-05-23T12:00:00.000Z"),
        },
        {
          questionKey: "q1",
          status: VoiceTranscriptStatus.NEEDS_CONFIRMATION,
          draftText: "older draft",
          confirmedAt: null,
        },
      ],
      answers: { q1: "other" },
    });

    expect(result.allowed).toBe(false);
    expect(result.blockReason).toBe(H_BLOCK_MISMATCH_NOT_REVIEWED);
  });

  it("passes when lawyer review flag is persisted with Phase 5-H-UI-3 gate enabled", () => {
    expect(
      evaluateVoiceDocumentFinalizeGate({
        transcripts: [
          {
            questionKey: "q1",
            status: VoiceTranscriptStatus.CONFIRMED,
            draftText: "same text",
            confirmedAt: new Date("2026-05-23T00:00:00.000Z"),
          },
        ],
        answers: { q1: "same text" },
        lawyerReviewedByQuestionKey: { q1: true },
        includeLawyerReviewRequired: true,
      }),
    ).toEqual({ allowed: true, blockReason: null, questionKey: null });
  });
});

describe("voice-document-finalize-gate.service (Phase 5-H-UI-5 open supplement)", () => {
  it("exports open supplement gate marker", () => {
    expect(VOICE_DOCUMENT_FINALIZE_GATE_OPEN_SUPPLEMENT_PHASE5H_UI_5).toContain(
      "phase5h-ui-5-voice-open-supplement-finalize-gate",
    );
  });

  it("passes when no open voice-origin supplements exist", () => {
    expect(
      evaluateOpenVoiceSupplementDocumentFinalizeGate({ openSupplements: [] }),
    ).toEqual({ allowed: true, blockReason: null, questionKey: null });
  });

  it("blocks document finalize when open voice-origin supplement exists", () => {
    expect(
      evaluateOpenVoiceSupplementDocumentFinalizeGate({
        openSupplements: [
          {
            supplementRequestId: "req1",
            questionKey: "q1",
            status: SupplementRequestStatus.SENT,
          },
        ],
      }),
    ).toEqual({
      allowed: false,
      blockReason: H_BLOCK_OPEN_SUPPLEMENT_UNRESOLVED,
      questionKey: "q1",
      supplementRequestId: "req1",
    });
  });

  it("allows document finalize when voice supplement is terminal (ACCEPTED)", () => {
    expect(
      evaluateOpenVoiceSupplementDocumentFinalizeGate({ openSupplements: [] }),
    ).toEqual({ allowed: true, blockReason: null, questionKey: null });
  });
});
