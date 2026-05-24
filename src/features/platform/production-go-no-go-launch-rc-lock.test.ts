import { describe, expect, it } from "vitest";
import {
  PRODUCTION_GO_NO_GO_LAUNCH_RC_CUTOVER_AXES,
  PRODUCTION_GO_NO_GO_LAUNCH_RC_DOCS,
  PRODUCTION_GO_NO_GO_LAUNCH_RC_EVIDENCE_TAG,
  PRODUCTION_GO_NO_GO_LAUNCH_RC_LOCK_MARKER_PHASE16D,
  PRODUCTION_GO_NO_GO_LAUNCH_RC_MASTER_VERIFY_SCRIPT,
  PRODUCTION_GO_NO_GO_LAUNCH_RC_PREREQUISITE_EVIDENCE_TAGS,
  PRODUCTION_GO_NO_GO_LAUNCH_RC_PREREQUISITE_VERIFY_SCRIPTS,
  PRODUCTION_GO_NO_GO_LAUNCH_RC_VERSION,
  PRODUCTION_GO_NO_GO_LAUNCH_RECORD_REQUIRED_FIELDS,
} from "./production-go-no-go-launch-rc-lock";

describe("production-go-no-go-launch-rc-lock (Phase 16-D)", () => {
  it("defines go/no-go marker, version, and evidence tag", () => {
    expect(PRODUCTION_GO_NO_GO_LAUNCH_RC_LOCK_MARKER_PHASE16D).toBe(
      "phase16d-production-go-no-go-launch-record",
    );
    expect(PRODUCTION_GO_NO_GO_LAUNCH_RC_VERSION).toBe("16-D.1");
    expect(PRODUCTION_GO_NO_GO_LAUNCH_RC_EVIDENCE_TAG).toContain("PHASE16D");
  });

  it("lists master verify script and prerequisite phase gates", () => {
    expect(PRODUCTION_GO_NO_GO_LAUNCH_RC_MASTER_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-production-go-no-go-launch-rc",
    );
    expect(PRODUCTION_GO_NO_GO_LAUNCH_RC_PREREQUISITE_VERIFY_SCRIPTS).toHaveLength(3);
    expect(PRODUCTION_GO_NO_GO_LAUNCH_RC_PREREQUISITE_VERIFY_SCRIPTS).toContain(
      "verify:aibeopchin-production-release-readiness-rc",
    );
  });

  it("requires 16-A/16-B/16-C evidence and documents launch record", () => {
    expect(PRODUCTION_GO_NO_GO_LAUNCH_RC_PREREQUISITE_EVIDENCE_TAGS).toHaveLength(3);
    expect(PRODUCTION_GO_NO_GO_LAUNCH_RC_DOCS.some((d) => d.includes("LAUNCH_RECORD"))).toBe(true);
    expect(PRODUCTION_GO_NO_GO_LAUNCH_RC_DOCS.some((d) => d.includes("GO_NO_GO"))).toBe(true);
  });

  it("covers nine cutover axes and launch record approval fields", () => {
    expect(PRODUCTION_GO_NO_GO_LAUNCH_RC_CUTOVER_AXES).toHaveLength(9);
    expect(PRODUCTION_GO_NO_GO_LAUNCH_RECORD_REQUIRED_FIELDS).toContain("deployApprover");
    expect(PRODUCTION_GO_NO_GO_LAUNCH_RECORD_REQUIRED_FIELDS).toContain("goNoGoDecision");
  });
});
