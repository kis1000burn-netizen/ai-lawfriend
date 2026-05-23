import { describe, expect, it } from "vitest";

import {
  VOICE_RC_LOCK_MARKER_PHASE5J,
  VOICE_RC_REQUIRED_MIGRATION_DIRS,
} from "@/lib/voice/voice-rc-lock";

describe("voice-rc-lock (Phase 5-J)", () => {
  it("exports RC lock marker", () => {
    expect(VOICE_RC_LOCK_MARKER_PHASE5J).toContain("phase5j-voice-rc-predeploy-closure");
  });

  it("lists required Phase 5-H UI-3/4 migration directories", () => {
    expect(VOICE_RC_REQUIRED_MIGRATION_DIRS).toEqual([
      "20260524120000_voice_lawyer_review_completion_phase5h_ui3",
      "20260524143000_voice_lawyer_supplement_phase5h_ui4",
    ]);
  });
});
