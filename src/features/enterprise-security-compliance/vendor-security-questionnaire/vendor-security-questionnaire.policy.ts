/**
 * Product Phase 32-D — Vendor security questionnaire pack policy SSOT.
 */
import { VENDOR_QUESTIONNAIRE_SECTIONS } from "./vendor-security-questionnaire.registry";
import type { VendorSecurityQuestionnaireResult } from "./vendor-security-questionnaire.schema";
import { VENDOR_SECURITY_QUESTIONNAIRE_VERSION } from "./vendor-security-questionnaire.schema";

export const VENDOR_SECURITY_QUESTIONNAIRE_POLICY_MARKER_PHASE32D =
  "phase32d-vendor-security-questionnaire-policy" as const;

export function assembleVendorSecurityQuestionnairePack(input: {
  reviewScopeSlug: string;
  preparedSectionIds: Set<string>;
  generatedAt?: string;
}): VendorSecurityQuestionnaireResult {
  const sections = VENDOR_QUESTIONNAIRE_SECTIONS.map((section) => ({
    ...section,
    prepared: input.preparedSectionIds.has(section.sectionId),
  }));

  const required = sections.filter((section) => section.required);
  const preparedRequired = required.filter((section) => section.prepared).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((preparedRequired / required.length) * 100);

  return {
    version: VENDOR_SECURITY_QUESTIONNAIRE_VERSION,
    reviewScopeSlug: input.reviewScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    sections,
    completionRate,
    vendorQuestionnairePackReady: preparedRequired === required.length,
  };
}
