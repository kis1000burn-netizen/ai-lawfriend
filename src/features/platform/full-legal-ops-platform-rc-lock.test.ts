import { describe, expect, it } from "vitest";
import {
  FULL_LEGAL_OPS_PLATFORM_RC_DOMAIN_EVIDENCE_TAGS,
  FULL_LEGAL_OPS_PLATFORM_RC_DOMAIN_VERIFY_SCRIPTS,
  FULL_LEGAL_OPS_PLATFORM_RC_LOCK_MARKER_PHASE16A,
  FULL_LEGAL_OPS_PLATFORM_RC_MASTER_VERIFY_SCRIPT,
  FULL_LEGAL_OPS_PLATFORM_RC_PLATFORM_VERIFY_SCRIPTS,
  FULL_LEGAL_OPS_PLATFORM_RC_PREDEPLOY_EVIDENCE_TAG,
  FULL_LEGAL_OPS_PLATFORM_RC_ROLE_SMOKE_SCRIPT,
  FULL_LEGAL_OPS_PLATFORM_RC_STATIC_GATES,
  FULL_LEGAL_OPS_PLATFORM_RC_VERSION,
} from "./full-legal-ops-platform-rc-lock";

describe("full-legal-ops-platform-rc-lock (Phase 16-A)", () => {
  it("defines platform RC marker, version, and evidence tag", () => {
    expect(FULL_LEGAL_OPS_PLATFORM_RC_LOCK_MARKER_PHASE16A).toBe(
      "phase16a-full-legal-ops-platform-predeploy-rc",
    );
    expect(FULL_LEGAL_OPS_PLATFORM_RC_VERSION).toBe("16-A.1");
    expect(FULL_LEGAL_OPS_PLATFORM_RC_PREDEPLOY_EVIDENCE_TAG).toContain("PHASE16A");
  });

  it("lists all domain RC verify scripts in order", () => {
    expect(FULL_LEGAL_OPS_PLATFORM_RC_DOMAIN_VERIFY_SCRIPTS).toHaveLength(7);
    expect(FULL_LEGAL_OPS_PLATFORM_RC_DOMAIN_VERIFY_SCRIPTS[0]).toBe(
      "verify:aibeopchin-voice-rc",
    );
    expect(FULL_LEGAL_OPS_PLATFORM_RC_DOMAIN_VERIFY_SCRIPTS[6]).toBe(
      "verify:aibeopchin-client-collaboration-portal-full-rc",
    );
    expect(FULL_LEGAL_OPS_PLATFORM_RC_MASTER_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-full-legal-ops-platform-rc",
    );
  });

  it("includes platform and static gates", () => {
    expect(FULL_LEGAL_OPS_PLATFORM_RC_PLATFORM_VERIFY_SCRIPTS).toContain(
      "verify:supplement-migration-predeploy",
    );
    expect(FULL_LEGAL_OPS_PLATFORM_RC_PLATFORM_VERIFY_SCRIPTS).toContain(
      "verify:canonical-sources",
    );
    expect(FULL_LEGAL_OPS_PLATFORM_RC_STATIC_GATES).toEqual([
      "tsc-noEmit",
      "eslint",
      "vitest-unit",
    ]);
  });

  it("documents role smoke as post-predeploy ops step", () => {
    expect(FULL_LEGAL_OPS_PLATFORM_RC_ROLE_SMOKE_SCRIPT).toBe("ops:ai-core-role-smoke");
    expect(FULL_LEGAL_OPS_PLATFORM_RC_DOMAIN_EVIDENCE_TAGS.length).toBeGreaterThanOrEqual(4);
  });
});
