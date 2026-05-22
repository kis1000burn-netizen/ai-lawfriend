import { describe, expect, it } from "vitest";

import {
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
