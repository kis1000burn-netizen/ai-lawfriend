import { describe, expect, it } from "vitest";
import {
  NEUTRAL_LITIGATION_REVIEW_PACK_RC_BOUNDARY,
  NEUTRAL_LITIGATION_REVIEW_PACK_RC_EVIDENCE_TAG,
  NEUTRAL_LITIGATION_REVIEW_PACK_RC_LOCK_MARKER_PHASE46F,
  NEUTRAL_LITIGATION_REVIEW_PACK_RC_MASTER_VERIFY_SCRIPT,
  NEUTRAL_LITIGATION_REVIEW_PACK_RC_NEUTRAL_SUMMARY_GATE_MARKER,
  NEUTRAL_LITIGATION_REVIEW_PACK_RC_OFFICIAL_CLARIFICATION,
  NEUTRAL_LITIGATION_REVIEW_PACK_RC_ONE_LINE_CRITERION,
  NEUTRAL_LITIGATION_REVIEW_PACK_RC_PREREQUISITE_EVIDENCE_TAGS,
  NEUTRAL_LITIGATION_REVIEW_PACK_RC_SUB_PHASES,
  NEUTRAL_LITIGATION_REVIEW_PACK_RC_VERSION,
} from "./neutral-litigation-review-pack-rc-lock";

describe("neutral-litigation-review-pack-rc-lock (Phase 46-F)", () => {
  it("defines Phase 46-F marker", () => {
    expect(NEUTRAL_LITIGATION_REVIEW_PACK_RC_LOCK_MARKER_PHASE46F).toBe(
      "phase46f-neutral-litigation-review-pack-rc-gate",
    );
    expect(NEUTRAL_LITIGATION_REVIEW_PACK_RC_VERSION).toBe("46-F.2");
    expect(NEUTRAL_LITIGATION_REVIEW_PACK_RC_EVIDENCE_TAG).toContain("PHASE46F");
  });

  it("lists 46-A through 46-F", () => {
    expect(Object.keys(NEUTRAL_LITIGATION_REVIEW_PACK_RC_SUB_PHASES)).toHaveLength(6);
  });

  it("requires 45-F prerequisite", () => {
    expect(NEUTRAL_LITIGATION_REVIEW_PACK_RC_PREREQUISITE_EVIDENCE_TAGS).toContain(
      "EVIDENCE-20260525-AIBEOPCHIN-JUDICIAL-TRANSPARENCY-EXPLAINABILITY-PHASE45F-RC",
    );
  });

  it("declares neutral pack boundaries", () => {
    expect(NEUTRAL_LITIGATION_REVIEW_PACK_RC_BOUNDARY.noDirectCourtAccess).toBe(
      "NO_DIRECT_COURT_ACCESS",
    );
    expect(NEUTRAL_LITIGATION_REVIEW_PACK_RC_BOUNDARY.lawyerControlledExportOnly).toBe(
      "LAWYER_CONTROLLED_EXPORT_ONLY",
    );
  });

  it("wires official clarification and master verify", () => {
    expect(NEUTRAL_LITIGATION_REVIEW_PACK_RC_OFFICIAL_CLARIFICATION).toContain("법원 포털");
    expect(NEUTRAL_LITIGATION_REVIEW_PACK_RC_MASTER_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-neutral-litigation-review-pack-rc",
    );
    expect(NEUTRAL_LITIGATION_REVIEW_PACK_RC_NEUTRAL_SUMMARY_GATE_MARKER).toBe(
      "phase46a-neutral-case-summary-view-gate",
    );
    expect(NEUTRAL_LITIGATION_REVIEW_PACK_RC_ONE_LINE_CRITERION).toContain("변호사 통제");
  });
});
