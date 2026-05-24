import { describe, expect, it } from "vitest";
import {
  AI_QUALITY_CASE_PACK_RC_AUDIT_ACTIONS,
  AI_QUALITY_CASE_PACK_RC_CLIENT_SAFE_MARKER,
  AI_QUALITY_CASE_PACK_RC_DOCS,
  AI_QUALITY_CASE_PACK_RC_EVIDENCE_TAG,
  AI_QUALITY_CASE_PACK_RC_EVIDENCE_TAGS,
  AI_QUALITY_CASE_PACK_RC_LOCK_MARKER_PHASE23F,
  AI_QUALITY_CASE_PACK_RC_MASTER_VERIFY_SCRIPT,
  AI_QUALITY_CASE_PACK_RC_ONE_LINE_CRITERION,
  AI_QUALITY_CASE_PACK_RC_PREREQUISITE_EVIDENCE_TAGS,
  AI_QUALITY_CASE_PACK_RC_PRODUCT_CROSS_LINK,
  AI_QUALITY_CASE_PACK_RC_RUNBOOK_PATHS,
  AI_QUALITY_CASE_PACK_RC_SUB_PHASES,
  AI_QUALITY_CASE_PACK_RC_SUB_VERIFY_SCRIPTS,
  AI_QUALITY_CASE_PACK_RC_VERSION,
} from "./ai-quality-case-pack-rc-lock";

describe("ai-quality-case-pack-rc-lock (Phase 23-F)", () => {
  it("defines Phase 23-F marker, version, and evidence tag", () => {
    expect(AI_QUALITY_CASE_PACK_RC_LOCK_MARKER_PHASE23F).toBe(
      "phase23f-ai-quality-case-pack-rc-gate",
    );
    expect(AI_QUALITY_CASE_PACK_RC_VERSION).toBe("23-F.1");
    expect(AI_QUALITY_CASE_PACK_RC_EVIDENCE_TAG).toContain("PHASE23F");
  });

  it("lists 23-A through 23-F sub-phases", () => {
    expect(Object.keys(AI_QUALITY_CASE_PACK_RC_SUB_PHASES)).toEqual([
      "23-A",
      "23-B",
      "23-C",
      "23-D",
      "23-E",
      "23-F",
    ]);
  });

  it("wires master verify and five sub-phase verify scripts", () => {
    expect(AI_QUALITY_CASE_PACK_RC_MASTER_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-ai-quality-rc",
    );
    expect(AI_QUALITY_CASE_PACK_RC_SUB_VERIFY_SCRIPTS).toHaveLength(5);
  });

  it("requires Phase 22-F and 10-D prerequisite evidence", () => {
    expect(AI_QUALITY_CASE_PACK_RC_PREREQUISITE_EVIDENCE_TAGS).toContain(
      "EVIDENCE-20260524-AIBEOPCHIN-TENANT-PHASE22F-RC",
    );
  });

  it("cross-links tenant RC, governance, client-safe schema", () => {
    expect(AI_QUALITY_CASE_PACK_RC_PRODUCT_CROSS_LINK.tenantMasterVerify).toBe(
      "verify:aibeopchin-tenant-rc",
    );
    expect(AI_QUALITY_CASE_PACK_RC_CLIENT_SAFE_MARKER).toBe(
      "phase23e-client-safe-redaction-gate",
    );
  });

  it("lists audit actions and runbooks", () => {
    expect(AI_QUALITY_CASE_PACK_RC_AUDIT_ACTIONS).toContain(
      "AI_LAWYER_REVIEW_FEEDBACK_RECORDED",
    );
    expect(AI_QUALITY_CASE_PACK_RC_RUNBOOK_PATHS).toHaveLength(6);
    expect(AI_QUALITY_CASE_PACK_RC_EVIDENCE_TAGS).toHaveLength(6);
    expect(AI_QUALITY_CASE_PACK_RC_DOCS.some((d) => d.includes("OPERATIONS_INDEX"))).toBe(
      true,
    );
    expect(AI_QUALITY_CASE_PACK_RC_ONE_LINE_CRITERION).toContain("Product Phase 23 RC");
  });
});
