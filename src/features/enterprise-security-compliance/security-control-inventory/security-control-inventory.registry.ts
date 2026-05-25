/**
 * Product Phase 32-A — Security control inventory SSOT.
 */
import type { SecurityControlInventoryResult } from "./security-control-inventory.schema";

export const SECURITY_CONTROL_INVENTORY_REGISTRY_MARKER_PHASE32A =
  "phase32a-security-control-inventory-registry" as const;

export const ENTERPRISE_SECURITY_COMPLIANCE_DEFAULT_SCOPE_SLUG =
  "enterprise-security-compliance-001" as const;

type SecurityControlItem = Omit<
  SecurityControlInventoryResult["controls"][number],
  "documented"
>;

export const SECURITY_CONTROL_ITEMS: SecurityControlItem[] = [
  { controlId: "ACCESS_CONTROL", label: "Access control baseline", required: true },
  { controlId: "ROLE_PERMISSION", label: "Role and permission matrix", required: true },
  { controlId: "TENANT_ISOLATION", label: "Tenant data isolation", required: true },
  { controlId: "ADMIN_ACTION_AUDIT", label: "Admin action audit trail", required: true },
  {
    controlId: "EXTERNAL_PROVIDER_SECURITY",
    label: "External provider security (email/kakao)",
    required: true,
  },
  { controlId: "AI_DATA_HANDLING", label: "AI call and sensitive data handling", required: true },
  { controlId: "INCIDENT_RESPONSE", label: "Incident response and recovery", required: true },
  { controlId: "RETENTION_DELETION", label: "Retention and deletion policy", required: true },
];
