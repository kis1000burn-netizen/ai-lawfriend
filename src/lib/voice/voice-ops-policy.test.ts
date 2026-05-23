import { describe, expect, it } from "vitest";

import {
  VOICE_OPS_TRANSCRIPT_BODY_EXPOSURE_ALLOWED,
  VOICE_PHASE7A_OPS_POLICY_MARKER,
  canVoiceOpsDraftPurgeForTranscriptStatus,
  isVoicePrivacyOpsTerminalStatus,
} from "./voice-ops-policy";

describe("voice-ops-policy (Phase 7-A)", () => {
  it("exposes Phase 7-A marker", () => {
    expect(VOICE_PHASE7A_OPS_POLICY_MARKER).toBe("PHASE7A_VOICE_OPS_E2E_HARDENING");
  });

  it("never exposes transcript body in ops layer", () => {
    expect(VOICE_OPS_TRANSCRIPT_BODY_EXPOSURE_ALLOWED).toBe(false);
  });

  it("allows draft purge only for non-CONFIRMED statuses", () => {
    expect(canVoiceOpsDraftPurgeForTranscriptStatus("NEEDS_CONFIRMATION")).toBe(true);
    expect(canVoiceOpsDraftPurgeForTranscriptStatus("CONFIRMED")).toBe(false);
  });

  it("marks terminal privacy ops statuses", () => {
    expect(isVoicePrivacyOpsTerminalStatus("RESOLVED")).toBe(true);
    expect(isVoicePrivacyOpsTerminalStatus("OPEN")).toBe(false);
  });
});
