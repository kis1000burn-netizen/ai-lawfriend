import { describe, expect, it } from "vitest";
import {
  RELIABILITY_RC_DOCS,
  RELIABILITY_RC_EVIDENCE_TAG,
  RELIABILITY_RC_EVIDENCE_TAGS,
  RELIABILITY_RC_LOCK_MARKER_PHASE18E,
  RELIABILITY_RC_MASTER_VERIFY_SCRIPT,
  RELIABILITY_RC_MIGRATION_PATHS,
  RELIABILITY_RC_ONE_LINE_CRITERION,
  RELIABILITY_RC_PHASE17_CROSS_LINK,
  RELIABILITY_RC_PREREQUISITE_EVIDENCE_TAGS,
  RELIABILITY_RC_RECOVERY_DOMAINS,
  RELIABILITY_RC_RUNBOOK_PATHS,
  RELIABILITY_RC_SUB_PHASES,
  RELIABILITY_RC_SUB_VERIFY_SCRIPTS,
  RELIABILITY_RC_VERSION,
} from "./reliability-rc-lock";

describe("reliability-rc-lock (Phase 18-E)", () => {
  it("defines Phase 18-E marker, version, and evidence tag", () => {
    expect(RELIABILITY_RC_LOCK_MARKER_PHASE18E).toBe(
      "phase18e-reliability-rc-failed-job-recovery-gate",
    );
    expect(RELIABILITY_RC_VERSION).toBe("18-E.1");
    expect(RELIABILITY_RC_EVIDENCE_TAG).toContain("PHASE18E");
  });

  it("lists 18-A through 18-E sub-phases", () => {
    expect(Object.keys(RELIABILITY_RC_SUB_PHASES)).toEqual([
      "18-A",
      "18-B",
      "18-C",
      "18-D",
      "18-E",
    ]);
  });

  it("wires master verify and sub-phase verify scripts", () => {
    expect(RELIABILITY_RC_MASTER_VERIFY_SCRIPT).toBe("verify:aibeopchin-reliability-rc");
    expect(RELIABILITY_RC_SUB_VERIFY_SCRIPTS).toHaveLength(4);
    expect(RELIABILITY_RC_SUB_VERIFY_SCRIPTS[0]).toBe("verify:aibeopchin-reliability-phase18a");
    expect(RELIABILITY_RC_SUB_VERIFY_SCRIPTS[3]).toBe("verify:aibeopchin-reliability-phase18d");
  });

  it("requires Phase 17 monitoring prerequisites and recovery domains", () => {
    expect(RELIABILITY_RC_PREREQUISITE_EVIDENCE_TAGS).toHaveLength(2);
    expect(RELIABILITY_RC_RECOVERY_DOMAINS).toEqual([
      "cron",
      "external notification",
      "document pipeline",
      "AI call",
    ]);
    expect(RELIABILITY_RC_ONE_LINE_CRITERION).toContain("cron");
  });

  it("cross-links Phase 17 monitoring and retry console", () => {
    expect(RELIABILITY_RC_PHASE17_CROSS_LINK.monitoringConsolePath).toBe(
      "/admin/operations/monitoring",
    );
    expect(RELIABILITY_RC_PHASE17_CROSS_LINK.retryJobsConsolePath).toBe(
      "/admin/operations/retry-jobs",
    );
    expect(RELIABILITY_RC_PHASE17_CROSS_LINK.monitoringMasterVerify).toBe(
      "verify:aibeopchin-operations-monitoring-rc",
    );
  });

  it("lists migrations, runbooks, and evidence tags", () => {
    expect(RELIABILITY_RC_MIGRATION_PATHS).toHaveLength(3);
    expect(RELIABILITY_RC_RUNBOOK_PATHS).toHaveLength(5);
    expect(RELIABILITY_RC_EVIDENCE_TAGS).toHaveLength(5);
    expect(RELIABILITY_RC_DOCS.some((d) => d.includes("OPERATIONS_INDEX"))).toBe(true);
  });
});
