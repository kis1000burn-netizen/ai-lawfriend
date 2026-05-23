import { describe, expect, it } from "vitest";

import {
  VOICE_PHASE7A_OPS_SERVICE_MARKER,
  serializeVoiceTranscriptOpsRowForApi,
  type VoiceTranscriptOpsRow,
} from "./voice-ops.service";

describe("voice-ops.service (Phase 7-A)", () => {
  it("exposes service marker", () => {
    expect(VOICE_PHASE7A_OPS_SERVICE_MARKER).toBe("phase7a-voice-ops-e2e-hardening");
  });

  it("serializes ops rows without draftText", () => {
    const row: VoiceTranscriptOpsRow = {
      id: "vt1",
      caseId: "case1",
      questionKey: "case_background",
      status: "NEEDS_CONFIRMATION",
      createdByUserId: "user1",
      interviewId: null,
      storeOriginalAudio: false,
      expiresAt: new Date().toISOString(),
      confirmedAt: null,
      rejectedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      traceCount: 2,
      ttlOverdue: false,
    };

    const serialized = serializeVoiceTranscriptOpsRowForApi(row);
    expect(serialized).toEqual(row);
    expect(Object.keys(serialized)).not.toContain("draftText");
  });
});
