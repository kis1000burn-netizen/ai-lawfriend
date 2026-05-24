import { describe, expect, it } from "vitest";
import {
  isTenantBillingAutomaticInvoiceEnabled,
  TENANT_PLAN_METERING_RC_ADMIN_CONSOLE_PATHS,
  TENANT_PLAN_METERING_RC_AUDIT_ACTIONS,
  TENANT_PLAN_METERING_RC_DOCS,
  TENANT_PLAN_METERING_RC_EVIDENCE_TAG,
  TENANT_PLAN_METERING_RC_EVIDENCE_TAGS,
  TENANT_PLAN_METERING_RC_LOCK_MARKER_PHASE22F,
  TENANT_PLAN_METERING_RC_MASTER_VERIFY_SCRIPT,
  TENANT_PLAN_METERING_RC_NO_AUTOMATIC_INVOICE_MARKER,
  TENANT_PLAN_METERING_RC_ONE_LINE_CRITERION,
  TENANT_PLAN_METERING_RC_PREREQUISITE_EVIDENCE_TAGS,
  TENANT_PLAN_METERING_RC_PRODUCT_CROSS_LINK,
  TENANT_PLAN_METERING_RC_RUNBOOK_PATHS,
  TENANT_PLAN_METERING_RC_SUB_PHASES,
  TENANT_PLAN_METERING_RC_SUB_VERIFY_SCRIPTS,
  TENANT_PLAN_METERING_RC_VERSION,
} from "./tenant-plan-metering-rc-lock";

describe("tenant-plan-metering-rc-lock (Phase 22-F)", () => {
  it("defines Phase 22-F marker, version, and evidence tag", () => {
    expect(TENANT_PLAN_METERING_RC_LOCK_MARKER_PHASE22F).toBe(
      "phase22f-tenant-plan-metering-rc-gate",
    );
    expect(TENANT_PLAN_METERING_RC_VERSION).toBe("22-F.1");
    expect(TENANT_PLAN_METERING_RC_EVIDENCE_TAG).toContain("PHASE22F");
  });

  it("lists 22-A through 22-F sub-phases", () => {
    expect(Object.keys(TENANT_PLAN_METERING_RC_SUB_PHASES)).toEqual([
      "22-A",
      "22-B",
      "22-C",
      "22-D",
      "22-E",
      "22-F",
    ]);
  });

  it("wires master verify and five sub-phase verify scripts", () => {
    expect(TENANT_PLAN_METERING_RC_MASTER_VERIFY_SCRIPT).toBe(
      "verify:aibeopchin-tenant-rc",
    );
    expect(TENANT_PLAN_METERING_RC_SUB_VERIFY_SCRIPTS).toHaveLength(5);
    expect(TENANT_PLAN_METERING_RC_SUB_VERIFY_SCRIPTS[0]).toBe(
      "verify:aibeopchin-tenant-phase22a",
    );
    expect(TENANT_PLAN_METERING_RC_SUB_VERIFY_SCRIPTS[4]).toBe(
      "verify:aibeopchin-tenant-phase22e",
    );
  });

  it("requires Phase 20-F and 21-F prerequisite evidence", () => {
    expect(TENANT_PLAN_METERING_RC_PREREQUISITE_EVIDENCE_TAGS).toContain(
      "EVIDENCE-20260524-AIBEOPCHIN-REAL-MESSAGING-PHASE20F-RC",
    );
    expect(TENANT_PLAN_METERING_RC_PREREQUISITE_EVIDENCE_TAGS).toContain(
      "EVIDENCE-20260524-AIBEOPCHIN-CLIENT-MOBILE-PHASE21F-RC",
    );
  });

  it("cross-links product messaging, entitlement, billing, admin console", () => {
    expect(TENANT_PLAN_METERING_RC_PRODUCT_CROSS_LINK.realMessagingMasterVerify).toBe(
      "verify:aibeopchin-real-messaging-rc",
    );
    expect(TENANT_PLAN_METERING_RC_PRODUCT_CROSS_LINK.clientMobileMasterVerify).toBe(
      "verify:aibeopchin-client-mobile-rc",
    );
    expect(TENANT_PLAN_METERING_RC_ADMIN_CONSOLE_PATHS.tenantList).toBe("/admin/tenants");
  });

  it("declares no automatic invoice issuance", () => {
    expect(TENANT_PLAN_METERING_RC_NO_AUTOMATIC_INVOICE_MARKER).toBe(
      "phase22d-no-automatic-invoice-issuance",
    );
    expect(isTenantBillingAutomaticInvoiceEnabled()).toBe(false);
  });

  it("lists admin audit actions and runbooks", () => {
    expect(TENANT_PLAN_METERING_RC_AUDIT_ACTIONS).toContain("TENANT_PLAN_UPDATED");
    expect(TENANT_PLAN_METERING_RC_AUDIT_ACTIONS).toContain("BILLING_LEDGER_ADJUSTED");
    expect(TENANT_PLAN_METERING_RC_RUNBOOK_PATHS).toHaveLength(6);
    expect(TENANT_PLAN_METERING_RC_EVIDENCE_TAGS).toHaveLength(6);
    expect(TENANT_PLAN_METERING_RC_DOCS.some((d) => d.includes("OPERATIONS_INDEX"))).toBe(
      true,
    );
    expect(TENANT_PLAN_METERING_RC_ONE_LINE_CRITERION).toContain("사업화 RC");
  });
});
