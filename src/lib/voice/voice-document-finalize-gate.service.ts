import { VoiceTranscriptStatus } from "@prisma/client";

import { CASE_INTERVIEW_ANSWERS_MAP_NOTE_TYPE } from "@/features/case-interview/case-interview.repository";
import { mergedInterviewAnswersRecordForPreview } from "@/features/case-interview/interview-answers-for-ui";
import { VoiceDocumentFinalizeBlockedError } from "@/lib/voice/voice-document-finalize-blocked-error";
import { loadLawyerVoiceReviewFlagsByCaseId } from "@/lib/voice/voice-lawyer-review-flags.repository";
import type { VoiceTranscriptRowSnapshot } from "@/lib/voice/voice-lawyer-review-snapshot";
import {
  detectVoiceInterviewAnswerMismatch,
  H_BLOCK_OPEN_SUPPLEMENT_UNRESOLVED,
  resolveVoiceReviewBlockReason,
  type VoiceReviewBlockReason,
  type VoiceReviewGateInput,
} from "@/lib/voice/voice-lawyer-review-ux-policy";
import {
  loadOpenVoiceOriginSupplementsByCaseId,
  type OpenVoiceSupplementGateRow,
} from "@/lib/voice/voice-open-supplement-gate.repository";
import {
  resolveVoiceDocumentFinalizeGateUiSnapshot,
  type VoiceDocumentFinalizeGateUiSnapshot,
} from "@/lib/voice/voice-document-finalize-gate-ui";
import { prisma } from "@/lib/prisma";

/** Phase 5-H-UI-2 — document finalize gate 서버 마커 */
export const VOICE_DOCUMENT_FINALIZE_GATE_MARKER_PHASE5H_UI_2 =
  "phase5h-ui-2-voice-document-finalize-gate" as const;

/** Phase 5-H-UI-3 — H-BLOCK-LAWYER-VOICE-REVIEW-REQUIRED 서버 적용 */
export const VOICE_DOCUMENT_FINALIZE_GATE_LAWYER_REVIEW_REQUIRED_PHASE5H_UI_3 =
  "phase5h-ui-3-voice-document-finalize-lawyer-review-required" as const;

/** Phase 5-H-UI-5 — H-BLOCK-02 open Supplement ↔ document finalize gate */
export const VOICE_DOCUMENT_FINALIZE_GATE_OPEN_SUPPLEMENT_PHASE5H_UI_5 =
  "phase5h-ui-5-voice-open-supplement-finalize-gate" as const;

/** Phase 5-H-UI-6 — case UI snapshot (Document Finalize Gate Panel) */
export const VOICE_DOCUMENT_FINALIZE_GATE_UI_SNAPSHOT_PHASE5H_UI_6 =
  "phase5h-ui-6-voice-document-finalize-gate-ui-snapshot" as const;

export type VoiceDocumentFinalizeGateFailure = {
  allowed: false;
  blockReason: VoiceReviewBlockReason;
  questionKey: string;
  supplementRequestId?: string;
};

export type VoiceDocumentFinalizeGateSuccess = {
  allowed: true;
  blockReason: null;
  questionKey: null;
};

export type VoiceDocumentFinalizeGateResult =
  | VoiceDocumentFinalizeGateFailure
  | VoiceDocumentFinalizeGateSuccess;

function latestVoiceTranscriptByQuestionKey(
  transcripts: VoiceTranscriptRowSnapshot[],
): Map<string, VoiceTranscriptRowSnapshot> {
  const map = new Map<string, VoiceTranscriptRowSnapshot>();
  for (const row of transcripts) {
    if (!map.has(row.questionKey)) {
      map.set(row.questionKey, row);
    }
  }
  return map;
}

function buildGateInputForTranscript(
  row: VoiceTranscriptRowSnapshot,
  interviewAnswer: unknown,
  lawyerReviewed: boolean,
): VoiceReviewGateInput {
  const transcriptConfirmed = row.status === VoiceTranscriptStatus.CONFIRMED;
  const confirmedText = transcriptConfirmed ? row.draftText : null;

  return {
    hasVoiceTranscript: true,
    transcriptConfirmed,
    lawyerReviewed,
    hasMismatch: transcriptConfirmed
      ? detectVoiceInterviewAnswerMismatch(confirmedText, interviewAnswer)
      : false,
  };
}

/**
 * Phase 5-H-UI-2: 서버 document finalize gate.
 * - H-BLOCK-TRANSCRIPT-NOT-CONFIRMED · H-BLOCK-MISMATCH-NOT-REVIEWED 즉시 적용
 * - H-BLOCK-LAWYER-VOICE-REVIEW-REQUIRED 는 `includeLawyerReviewRequired` 또는 영속 플래그(5-H-UI-3) 시 적용
 */
export function resolveVoiceDocumentFinalizeBlockReason(
  input: VoiceReviewGateInput,
  options?: { includeLawyerReviewRequired?: boolean },
): VoiceReviewBlockReason | null {
  const reason = resolveVoiceReviewBlockReason(input);
  if (
    reason === "H-BLOCK-LAWYER-VOICE-REVIEW-REQUIRED" &&
    !options?.includeLawyerReviewRequired
  ) {
    return null;
  }
  return reason;
}

export function evaluateVoiceDocumentFinalizeGate(input: {
  transcripts: VoiceTranscriptRowSnapshot[];
  answers: Record<string, unknown>;
  lawyerReviewedByQuestionKey?: Record<string, boolean>;
  includeLawyerReviewRequired?: boolean;
}): VoiceDocumentFinalizeGateResult {
  const latestByKey = latestVoiceTranscriptByQuestionKey(input.transcripts);
  const reviewFlags = input.lawyerReviewedByQuestionKey ?? {};

  for (const [questionKey, row] of latestByKey) {
    const gateInput = buildGateInputForTranscript(
      row,
      input.answers[questionKey],
      Boolean(reviewFlags[questionKey]),
    );

    const blockReason = resolveVoiceDocumentFinalizeBlockReason(gateInput, {
      includeLawyerReviewRequired: input.includeLawyerReviewRequired,
    });

    if (blockReason) {
      return { allowed: false, blockReason, questionKey };
    }
  }

  return { allowed: true, blockReason: null, questionKey: null };
}

/**
 * Phase 5-H-UI-5: Voice-origin Supplement 미처리 시 document finalize 차단 (명세 H-BLOCK-02 · H-BLOCK-OPEN-SUPPLEMENT-UNRESOLVED).
 */
export function evaluateOpenVoiceSupplementDocumentFinalizeGate(input: {
  openSupplements: OpenVoiceSupplementGateRow[];
}): VoiceDocumentFinalizeGateResult {
  const first = input.openSupplements[0];
  if (!first) {
    return { allowed: true, blockReason: null, questionKey: null };
  }

  return {
    allowed: false,
    blockReason: H_BLOCK_OPEN_SUPPLEMENT_UNRESOLVED,
    questionKey: first.questionKey,
    supplementRequestId: first.supplementRequestId,
  };
}

async function loadVoiceDocumentFinalizeContext(caseId: string): Promise<{
  transcripts: VoiceTranscriptRowSnapshot[];
  answers: Record<string, unknown>;
  lawyerReviewedByQuestionKey: Record<string, boolean>;
}> {
  const [transcriptRows, memo, interview, lawyerReviewedByQuestionKey] = await Promise.all([
    prisma.voiceTranscript.findMany({
      where: { caseId },
      orderBy: { createdAt: "desc" },
      select: {
        questionKey: true,
        status: true,
        draftText: true,
        confirmedAt: true,
      },
    }),
    prisma.caseTimelineMemo.findFirst({
      where: {
        caseId,
        noteType: CASE_INTERVIEW_ANSWERS_MAP_NOTE_TYPE,
        deletedAt: null,
      },
      orderBy: { updatedAt: "desc" },
      select: { content: true },
    }),
    prisma.interview.findFirst({
      where: { caseId },
      orderBy: { updatedAt: "desc" },
      select: { answersJson: true },
    }),
    loadLawyerVoiceReviewFlagsByCaseId(caseId),
  ]);

  const answers =
    mergedInterviewAnswersRecordForPreview(memo?.content, interview?.answersJson) ?? {};

  return {
    transcripts: transcriptRows.map((row) => ({
      questionKey: row.questionKey,
      status: row.status,
      draftText: row.draftText,
      confirmedAt: row.confirmedAt,
    })),
    answers,
    lawyerReviewedByQuestionKey,
  };
}

export async function evaluateVoiceDocumentFinalizeGateForCase(
  caseId: string,
): Promise<VoiceDocumentFinalizeGateResult> {
  const ctx = await loadVoiceDocumentFinalizeContext(caseId);

  const voiceResult = evaluateVoiceDocumentFinalizeGate({
    transcripts: ctx.transcripts,
    answers: ctx.answers,
    lawyerReviewedByQuestionKey: ctx.lawyerReviewedByQuestionKey,
    includeLawyerReviewRequired: true,
  });
  if (!voiceResult.allowed) {
    return voiceResult;
  }

  const openSupplements = await loadOpenVoiceOriginSupplementsByCaseId(caseId);
  return evaluateOpenVoiceSupplementDocumentFinalizeGate({ openSupplements });
}

/** Phase 5-H-UI-6 — 사건 상세·문서 확정 UI용 gate snapshot */
export async function buildVoiceDocumentFinalizeGateUiSnapshotForCase(
  caseId: string,
): Promise<VoiceDocumentFinalizeGateUiSnapshot> {
  const ctx = await loadVoiceDocumentFinalizeContext(caseId);
  const hasVoiceTranscripts = ctx.transcripts.length > 0;

  const voiceResult = evaluateVoiceDocumentFinalizeGate({
    transcripts: ctx.transcripts,
    answers: ctx.answers,
    lawyerReviewedByQuestionKey: ctx.lawyerReviewedByQuestionKey,
    includeLawyerReviewRequired: true,
  });

  let gateResult: VoiceDocumentFinalizeGateResult = voiceResult;
  if (voiceResult.allowed) {
    const openSupplements = await loadOpenVoiceOriginSupplementsByCaseId(caseId);
    gateResult = evaluateOpenVoiceSupplementDocumentFinalizeGate({ openSupplements });
  }

  if (gateResult.allowed) {
    return resolveVoiceDocumentFinalizeGateUiSnapshot({
      caseId,
      allowed: true,
      hasVoiceTranscripts,
      blockReason: null,
      questionKey: null,
    });
  }

  return resolveVoiceDocumentFinalizeGateUiSnapshot({
    caseId,
    allowed: false,
    hasVoiceTranscripts,
    blockReason: gateResult.blockReason,
    questionKey: gateResult.questionKey,
    supplementRequestId: gateResult.supplementRequestId,
  });
}

/** document finalize(승인·APPROVE·초안 finalize) 직전 Voice gate — 차단 시 throw */
export async function assertVoiceDocumentFinalizeAllowed(caseId: string): Promise<void> {
  const result = await evaluateVoiceDocumentFinalizeGateForCase(caseId);
  if (!result.allowed) {
    throw new VoiceDocumentFinalizeBlockedError(result.blockReason, result.questionKey, {
      supplementRequestId: result.supplementRequestId,
    });
  }
}
