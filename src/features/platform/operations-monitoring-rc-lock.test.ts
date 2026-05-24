import { describe, expect, it } from "vitest";
import {
  OPERATIONS_MONITORING_RC_ADMIN_CONSOLE_PATH,
  OPERATIONS_MONITORING_RC_DOCS,
  OPERATIONS_MONITORING_RC_EVIDENCE_TAG,
  OPERATIONS_MONITORING_RC_FIXTURE_PATHS,
  OPERATIONS_MONITORING_RC_LIVE_OPS_SCRIPT,
  OPERATIONS_MONITORING_RC_LIVE_SMOKE_EVIDENCE_TAG,
  OPERATIONS_MONITORING_RC_LIVE_SMOKE_SCRIPT,
  OPERATIONS_MONITORING_RC_LOCK_MARKER_PHASE17,
  OPERATIONS_MONITORING_RC_MASTER_VERIFY_SCRIPT,
  OPERATIONS_MONITORING_RC_PREREQUISITE_EVIDENCE_TAGS,
  OPERATIONS_MONITORING_RC_SNAPSHOT_API_PATH,
  OPERATIONS_MONITORING_RC_SUB_PHASES,
  OPERATIONS_MONITORING_RC_TRIAGE_AXES,
  OPERATIONS_MONITORING_RC_VERSION,
} from "./operations-monitoring-rc-lock";

describe("operations-monitoring-rc-lock (Phase 17-E / 17-F)", () => {
  it("defines Phase 17 marker, version, and evidence tag", () => {
    expect(OPERATIONS_MONITORING_RC_LOCK_MARKER_PHASE17).toBe(
      "phase17-operations-monitoring-incident-response",
    );
    expect(OPERATIONS_MONITORING_RC_VERSION).toBe("17-F.1");
    expect(OPERATIONS_MONITORING_RC_EVIDENCE_TAG).toContain("PHASE17");
    expect(OPERATIONS_MONITORING_RC_LIVE_SMOKE_EVIDENCE_TAG).toContain("17F");
  });

  it("lists 17-A through 17-F sub-phases", () => {
    expect(Object.keys(OPERATIONS_MONITORING_RC_SUB_PHASES)).toEqual([
      "17-A",
      "17-B",
      "17-C",
      "17-D",
      "17-E",
      "17-F",
    ]);
  });

  it("wires snapshot API, admin console, and live ops scripts", () => {
    expect(OPERATIONS_MONITORING_RC_MASTER_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-operations-monitoring-rc",
    );
    expect(OPERATIONS_MONITORING_RC_SNAPSHOT_API_PATH).toBe(
      "/api/admin/operations/monitoring-snapshot",
    );
    expect(OPERATIONS_MONITORING_RC_ADMIN_CONSOLE_PATH).toBe("/admin/operations/monitoring");
    expect(OPERATIONS_MONITORING_RC_LIVE_OPS_SCRIPT).toBe("ops:post-deploy-monitoring-live-check");
    expect(OPERATIONS_MONITORING_RC_LIVE_SMOKE_SCRIPT).toBe(
      "ops:operations-monitoring-live-smoke",
    );
  });

  it("requires 16-C/16-D prerequisites, incident docs, and 17-F fixtures", () => {
    expect(OPERATIONS_MONITORING_RC_PREREQUISITE_EVIDENCE_TAGS).toHaveLength(2);
    expect(OPERATIONS_MONITORING_RC_DOCS.some((d) => d.includes("INCIDENT"))).toBe(true);
    expect(OPERATIONS_MONITORING_RC_DOCS.some((d) => d.includes("LIVE_SMOKE"))).toBe(true);
    expect(OPERATIONS_MONITORING_RC_TRIAGE_AXES.length).toBeGreaterThanOrEqual(5);
    expect(OPERATIONS_MONITORING_RC_FIXTURE_PATHS).toHaveLength(3);
  });
});
