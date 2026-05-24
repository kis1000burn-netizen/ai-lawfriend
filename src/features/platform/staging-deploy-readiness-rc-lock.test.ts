import { describe, expect, it } from "vitest";
import {
  STAGING_DEPLOY_READINESS_RC_DOCS,
  STAGING_DEPLOY_READINESS_RC_ENV_VERIFY_SCRIPT,
  STAGING_DEPLOY_READINESS_RC_LIVE_OPS_SCRIPT,
  STAGING_DEPLOY_READINESS_RC_LIVE_SMOKE_SCRIPTS,
  STAGING_DEPLOY_READINESS_RC_LOCK_MARKER_PHASE16B,
  STAGING_DEPLOY_READINESS_RC_MASTER_VERIFY_SCRIPT,
  STAGING_DEPLOY_READINESS_RC_MIGRATION_VERIFY_SCRIPT,
  STAGING_DEPLOY_READINESS_RC_PREDEPLOY_EVIDENCE_TAG,
  STAGING_DEPLOY_READINESS_RC_PREREQUISITE_EVIDENCE_TAG,
  STAGING_DEPLOY_READINESS_RC_VERSION,
} from "./staging-deploy-readiness-rc-lock";

describe("staging-deploy-readiness-rc-lock (Phase 16-B)", () => {
  it("defines staging readiness marker, version, and evidence tag", () => {
    expect(STAGING_DEPLOY_READINESS_RC_LOCK_MARKER_PHASE16B).toBe(
      "phase16b-staging-deploy-readiness-live-smoke",
    );
    expect(STAGING_DEPLOY_READINESS_RC_VERSION).toBe("16-B.1");
    expect(STAGING_DEPLOY_READINESS_RC_PREDEPLOY_EVIDENCE_TAG).toContain("PHASE16B");
  });

  it("lists env, migration, and live ops scripts", () => {
    expect(STAGING_DEPLOY_READINESS_RC_MASTER_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-staging-deploy-readiness-rc",
    );
    expect(STAGING_DEPLOY_READINESS_RC_ENV_VERIFY_SCRIPT).toBe("verify:staging-secrets");
    expect(STAGING_DEPLOY_READINESS_RC_MIGRATION_VERIFY_SCRIPT).toBe(
      "verify:staging-migration-deploy-readiness",
    );
    expect(STAGING_DEPLOY_READINESS_RC_LIVE_OPS_SCRIPT).toBe(
      "ops:staging-deploy-readiness-live-check",
    );
  });

  it("includes live smoke stack for role, portal, and document upload", () => {
    expect(STAGING_DEPLOY_READINESS_RC_LIVE_SMOKE_SCRIPTS).toEqual([
      "ops:ai-core-role-smoke",
      "ops:staging-client-portal-smoke",
      "ops:staging-document-upload-smoke",
    ]);
  });

  it("requires Phase 16-A as prerequisite and documents rollback", () => {
    expect(STAGING_DEPLOY_READINESS_RC_PREREQUISITE_EVIDENCE_TAG).toContain("PHASE16A");
    expect(STAGING_DEPLOY_READINESS_RC_DOCS.some((d) => d.includes("rollback"))).toBe(true);
  });
});
