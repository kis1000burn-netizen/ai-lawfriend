import { describe, expect, it } from "vitest";
import {
  PRODUCTION_RELEASE_READINESS_RC_DOCS,
  PRODUCTION_RELEASE_READINESS_RC_ENV_VERIFY_SCRIPT,
  PRODUCTION_RELEASE_READINESS_RC_EVIDENCE_TAG,
  PRODUCTION_RELEASE_READINESS_RC_LIVE_OPS_SCRIPT,
  PRODUCTION_RELEASE_READINESS_RC_LIVE_SMOKE_SCRIPTS,
  PRODUCTION_RELEASE_READINESS_RC_LOCK_MARKER_PHASE16C,
  PRODUCTION_RELEASE_READINESS_RC_MASTER_VERIFY_SCRIPT,
  PRODUCTION_RELEASE_READINESS_RC_PREREQUISITE_EVIDENCE_TAGS,
  PRODUCTION_RELEASE_READINESS_RC_VERSION,
} from "./production-release-readiness-rc-lock";

describe("production-release-readiness-rc-lock (Phase 16-C)", () => {
  it("defines production cutover marker, version, and evidence tag", () => {
    expect(PRODUCTION_RELEASE_READINESS_RC_LOCK_MARKER_PHASE16C).toBe(
      "phase16c-production-release-readiness-cutover",
    );
    expect(PRODUCTION_RELEASE_READINESS_RC_VERSION).toBe("16-C.1");
    expect(PRODUCTION_RELEASE_READINESS_RC_EVIDENCE_TAG).toContain("PHASE16C");
  });

  it("lists env verify and live cutover ops scripts", () => {
    expect(PRODUCTION_RELEASE_READINESS_RC_MASTER_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-production-release-readiness-rc",
    );
    expect(PRODUCTION_RELEASE_READINESS_RC_ENV_VERIFY_SCRIPT).toBe(
      "verify:production-env-readiness",
    );
    expect(PRODUCTION_RELEASE_READINESS_RC_LIVE_OPS_SCRIPT).toBe(
      "ops:production-release-cutover-live-check",
    );
  });

  it("reuses platform live smoke stack for production cutover", () => {
    expect(PRODUCTION_RELEASE_READINESS_RC_LIVE_SMOKE_SCRIPTS).toContain(
      "ops:ai-core-role-smoke",
    );
    expect(PRODUCTION_RELEASE_READINESS_RC_LIVE_SMOKE_SCRIPTS).toContain(
      "ops:staging-client-portal-smoke",
    );
  });

  it("requires 16-A/16-B prerequisites and documents rollback/monitoring", () => {
    expect(PRODUCTION_RELEASE_READINESS_RC_PREREQUISITE_EVIDENCE_TAGS).toHaveLength(2);
    expect(
      PRODUCTION_RELEASE_READINESS_RC_DOCS.some((d) => d.includes("POST_DEPLOY_MONITORING")),
    ).toBe(true);
    expect(PRODUCTION_RELEASE_READINESS_RC_DOCS.some((d) => d.includes("rollback"))).toBe(true);
  });
});
