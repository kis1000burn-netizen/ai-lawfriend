/**
 * Product Phase 30-D — Enterprise security review items SSOT.
 */
import type { EnterpriseSecurityReviewPackResult } from "./enterprise-security-review-pack.schema";

export const ENTERPRISE_SECURITY_REVIEW_REGISTRY_MARKER_PHASE30D =
  "phase30d-enterprise-security-review-registry" as const;

type ReviewItem = Omit<EnterpriseSecurityReviewPackResult["items"][number], "approved">;

export const ENTERPRISE_SECURITY_REVIEW_ITEMS: ReviewItem[] = [
  { itemId: "AUTH_SSO_MFA", label: "SSO · MFA baseline", required: true },
  { itemId: "RBAC_TENANT_ISOLATION", label: "RBAC · tenant isolation", required: true },
  { itemId: "DATA_ENCRYPTION", label: "Data encryption at rest/transit", required: true },
  {
    itemId: "AUDIT_LOG_RETENTION",
    label: "Audit log retention (19-C)",
    required: true,
  },
  { itemId: "PII_REDACTION", label: "PII redaction policy (19-B)", required: true },
  { itemId: "INCIDENT_RESPONSE", label: "Incident response runbook (17-C)", required: true },
  { itemId: "VULNERABILITY_SCAN", label: "Vulnerability scan cadence", required: true },
];
