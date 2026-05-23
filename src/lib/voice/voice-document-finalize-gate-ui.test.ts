import { describe, expect, it } from "vitest";

import {
  H_BLOCK_LAWYER_VOICE_REVIEW_REQUIRED,
  H_BLOCK_OPEN_SUPPLEMENT_UNRESOLVED,
} from "@/lib/voice/voice-lawyer-review-ux-policy";
import {
  resolveVoiceDocumentFinalizeGateUiSnapshot,
  shouldShowVoiceDocumentFinalizeGatePanel,
  VOICE_DOCUMENT_FINALIZE_BLOCK_MESSAGES,
  VOICE_DOCUMENT_FINALIZE_GATE_UI_MARKER_PHASE5H_UI_6,
} from "@/lib/voice/voice-document-finalize-gate-ui";

describe("voice-document-finalize-gate-ui (Phase 5-H-UI-6)", () => {
  it("exports UI marker", () => {
    expect(VOICE_DOCUMENT_FINALIZE_GATE_UI_MARKER_PHASE5H_UI_6).toContain(
      "phase5h-ui-6-voice-document-finalize-gate-ui",
    );
  });

  it("aligns blocked server messages with VoiceDocumentFinalizeBlockedError copy", () => {
    expect(VOICE_DOCUMENT_FINALIZE_BLOCK_MESSAGES[H_BLOCK_LAWYER_VOICE_REVIEW_REQUIRED]).toContain(
      "변호사 음성 transcript 검토",
    );
    expect(VOICE_DOCUMENT_FINALIZE_BLOCK_MESSAGES[H_BLOCK_OPEN_SUPPLEMENT_UNRESOLVED]).toContain(
      "Supplement",
    );
  });

  it("builds blocked snapshot with action links and gate details", () => {
    const snapshot = resolveVoiceDocumentFinalizeGateUiSnapshot({
      caseId: "case1",
      allowed: false,
      hasVoiceTranscripts: true,
      blockReason: H_BLOCK_OPEN_SUPPLEMENT_UNRESOLVED,
      questionKey: "q1",
      supplementRequestId: "req1",
    });

    expect(snapshot.allowed).toBe(false);
    expect(snapshot.blockReason).toBe(H_BLOCK_OPEN_SUPPLEMENT_UNRESOLVED);
    expect(snapshot.questionKey).toBe("q1");
    expect(snapshot.supplementRequestId).toBe("req1");
    expect(snapshot.serverMessage).toBe(
      VOICE_DOCUMENT_FINALIZE_BLOCK_MESSAGES[H_BLOCK_OPEN_SUPPLEMENT_UNRESOLVED],
    );
    expect(snapshot.actionHref).toBe("/cases/case1/supplement");
    expect(snapshot.detail).toContain("questionKey: q1");
    expect(snapshot.detail).toContain("supplementRequestId: req1");
  });

  it("hides pass panel when no voice transcripts exist", () => {
    const snapshot = resolveVoiceDocumentFinalizeGateUiSnapshot({
      caseId: "case1",
      allowed: true,
      hasVoiceTranscripts: false,
      blockReason: null,
      questionKey: null,
    });

    expect(shouldShowVoiceDocumentFinalizeGatePanel(snapshot)).toBe(false);
  });

  it("shows pass panel when voice transcripts exist and gate passes", () => {
    const snapshot = resolveVoiceDocumentFinalizeGateUiSnapshot({
      caseId: "case1",
      allowed: true,
      hasVoiceTranscripts: true,
      blockReason: null,
      questionKey: null,
    });

    expect(shouldShowVoiceDocumentFinalizeGatePanel(snapshot)).toBe(true);
    expect(snapshot.actionHref).toBe("/cases/case1/interview");
  });
});
