/**
 * Product Phase 33-D — Customer proof / case study template policy SSOT.
 */
import { CASE_STUDY_TEMPLATE_SECTIONS } from "./case-study-template.registry";
import type { CustomerProofCaseStudyTemplateResult } from "./case-study-template.schema";
import { CASE_STUDY_TEMPLATE_VERSION } from "./case-study-template.schema";

export const CASE_STUDY_TEMPLATE_POLICY_MARKER_PHASE33D =
  "phase33d-case-study-template-policy" as const;

export function assembleCustomerProofCaseStudyTemplate(input: {
  launchScopeSlug: string;
  templatedSectionIds: Set<string>;
  generatedAt?: string;
}): CustomerProofCaseStudyTemplateResult {
  const sections = CASE_STUDY_TEMPLATE_SECTIONS.map((section) => ({
    ...section,
    templated: input.templatedSectionIds.has(section.sectionId),
  }));

  const required = sections.filter((section) => section.required);
  const templatedRequired = required.filter((section) => section.templated).length;
  const completionRate =
    required.length === 0 ? 100 : Math.round((templatedRequired / required.length) * 100);

  return {
    version: CASE_STUDY_TEMPLATE_VERSION,
    launchScopeSlug: input.launchScopeSlug,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    sections,
    completionRate,
    caseStudyTemplateReady: templatedRequired === required.length,
  };
}
