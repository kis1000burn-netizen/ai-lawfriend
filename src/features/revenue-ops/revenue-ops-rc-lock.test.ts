import { describe, expect, it } from "vitest";
import {
  REVENUE_OPS_NO_INVOICE_PAYMENT_MUTATION_MARKER,
  REVENUE_OPS_RC_ACCOUNT_HEALTH_MARKER,
  REVENUE_OPS_RC_DOCS,
  REVENUE_OPS_RC_EVIDENCE_TAG,
  REVENUE_OPS_RC_EVIDENCE_TAGS,
  REVENUE_OPS_RC_LOCK_MARKER_PHASE29F,
  REVENUE_OPS_RC_MASTER_VERIFY_SCRIPT,
  REVENUE_OPS_RC_ONE_LINE_CRITERION,
  REVENUE_OPS_RC_PREREQUISITE_EVIDENCE_TAGS,
  REVENUE_OPS_RC_PRODUCT_CROSS_LINK,
  REVENUE_OPS_RC_RUNBOOK_PATHS,
  REVENUE_OPS_RC_SUB_PHASES,
  REVENUE_OPS_RC_SUB_VERIFY_SCRIPTS,
  REVENUE_OPS_RC_VERSION,
} from "./revenue-ops-rc-lock";

describe("revenue-ops-rc-lock (Phase 29-F)", () => {
  it("defines Phase 29-F marker and evidence tag", () => {
    expect(REVENUE_OPS_RC_LOCK_MARKER_PHASE29F).toBe("phase29f-revenue-ops-rc-gate");
    expect(REVENUE_OPS_RC_VERSION).toBe("29-F.1");
    expect(REVENUE_OPS_RC_EVIDENCE_TAG).toContain("PHASE29F");
  });

  it("lists 29-A through 29-F sub-phases", () => {
    expect(Object.keys(REVENUE_OPS_RC_SUB_PHASES)).toHaveLength(6);
  });

  it("wires master verify and sub-phase scripts", () => {
    expect(REVENUE_OPS_RC_MASTER_VERIFY_SCRIPT).toBe("verify:aibeopchin-revenue-ops-rc");
    expect(REVENUE_OPS_RC_SUB_VERIFY_SCRIPTS).toHaveLength(5);
  });

  it("requires 28-F and 22-F prerequisite evidence", () => {
    expect(REVENUE_OPS_RC_PREREQUISITE_EVIDENCE_TAGS).toContain(
      "EVIDENCE-20260524-AIBEOPCHIN-PAID-SCALE-PHASE28F-RC",
    );
    expect(REVENUE_OPS_RC_PREREQUISITE_EVIDENCE_TAGS).toContain(
      "EVIDENCE-20260524-AIBEOPCHIN-TENANT-PHASE22F-RC",
    );
  });

  it("declares no invoice/payment mutation boundary", () => {
    expect(REVENUE_OPS_NO_INVOICE_PAYMENT_MUTATION_MARKER).toBe(
      "phase29f-no-invoice-payment-mutation",
    );
    expect(REVENUE_OPS_RC_PRODUCT_CROSS_LINK.billingNoAutomaticInvoiceMarker).toBe(
      "BILLING_LEDGER_NO_AUTOMATIC_INVOICE_MARKER",
    );
  });

  it("cross-links tenant RC and data redaction", () => {
    expect(REVENUE_OPS_RC_PRODUCT_CROSS_LINK.tenantRcVerify).toBe(
      "verify:aibeopchin-tenant-rc",
    );
    expect(REVENUE_OPS_RC_ACCOUNT_HEALTH_MARKER).toBe("phase29a-account-health-gate");
  });

  it("lists runbooks and evidence tags", () => {
    expect(REVENUE_OPS_RC_RUNBOOK_PATHS).toHaveLength(6);
    expect(REVENUE_OPS_RC_EVIDENCE_TAGS).toHaveLength(6);
    expect(REVENUE_OPS_RC_DOCS.some((d) => d.includes("OPERATIONS_INDEX"))).toBe(true);
    expect(REVENUE_OPS_RC_ONE_LINE_CRITERION).toContain("Product Phase 29");
  });
});
