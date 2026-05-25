/**
 * Product Phase 32-D — Vendor security questionnaire pack service.
 */
import { ENTERPRISE_SECURITY_COMPLIANCE_DEFAULT_SCOPE_SLUG } from "../security-control-inventory/security-control-inventory.registry";
import { VENDOR_QUESTIONNAIRE_SECTIONS } from "./vendor-security-questionnaire.registry";
import { assembleVendorSecurityQuestionnairePack } from "./vendor-security-questionnaire.policy";
import type { VendorSecurityQuestionnaireResult } from "./vendor-security-questionnaire.schema";

export const VENDOR_SECURITY_QUESTIONNAIRE_SERVICE_MARKER_PHASE32D =
  "phase32d-vendor-security-questionnaire-service" as const;

export function buildVendorSecurityQuestionnairePack(input?: {
  reviewScopeSlug?: string;
  preparedSectionIds?: string[];
}): VendorSecurityQuestionnaireResult {
  const preparedSectionIds = new Set(
    input?.preparedSectionIds ??
      VENDOR_QUESTIONNAIRE_SECTIONS.filter((section) => section.required).map(
        (section) => section.sectionId,
      ),
  );

  return assembleVendorSecurityQuestionnairePack({
    reviewScopeSlug: input?.reviewScopeSlug ?? ENTERPRISE_SECURITY_COMPLIANCE_DEFAULT_SCOPE_SLUG,
    preparedSectionIds,
  });
}
