/**
 * Product Phase 32-D — Vendor security questionnaire pack SSOT.
 */
import type { VendorSecurityQuestionnaireResult } from "./vendor-security-questionnaire.schema";

export const VENDOR_SECURITY_QUESTIONNAIRE_REGISTRY_MARKER_PHASE32D =
  "phase32d-vendor-security-questionnaire-registry" as const;

type VendorQuestionnaireSection = Omit<
  VendorSecurityQuestionnaireResult["sections"][number],
  "prepared"
>;

export const VENDOR_QUESTIONNAIRE_SECTIONS: VendorQuestionnaireSection[] = [
  {
    sectionId: "CUSTOMER_QUESTIONNAIRE",
    label: "Customer security questionnaire answer set",
    required: true,
  },
  { sectionId: "DATA_FLOW_DIAGRAM", label: "Data flow diagram", required: true },
  { sectionId: "SUBPROCESSOR_LIST", label: "Subprocessor list", required: true },
  {
    sectionId: "WEBHOOK_SECURITY",
    label: "Provider webhook security (Phase 20)",
    required: true,
  },
  {
    sectionId: "BACKUP_DR",
    label: "Backup and disaster recovery (Phase 18)",
    required: true,
  },
  { sectionId: "LOG_RETENTION", label: "Log retention policy", required: true },
];
