/**
 * Product Phase 33-D — Customer proof / case study template service.
 */
import { PUBLIC_TRUST_MARKETING_DEFAULT_LAUNCH_SLUG } from "../trust-center/trust-center-content.registry";
import { CASE_STUDY_TEMPLATE_SECTIONS } from "./case-study-template.registry";
import { assembleCustomerProofCaseStudyTemplate } from "./case-study-template.policy";
import type { CustomerProofCaseStudyTemplateResult } from "./case-study-template.schema";

export const CASE_STUDY_TEMPLATE_SERVICE_MARKER_PHASE33D =
  "phase33d-case-study-template-service" as const;

export function buildCustomerProofCaseStudyTemplate(input?: {
  launchScopeSlug?: string;
  templatedSectionIds?: string[];
}): CustomerProofCaseStudyTemplateResult {
  const templatedSectionIds = new Set(
    input?.templatedSectionIds ??
      CASE_STUDY_TEMPLATE_SECTIONS.filter((section) => section.required).map(
        (section) => section.sectionId,
      ),
  );

  return assembleCustomerProofCaseStudyTemplate({
    launchScopeSlug: input?.launchScopeSlug ?? PUBLIC_TRUST_MARKETING_DEFAULT_LAUNCH_SLUG,
    templatedSectionIds,
  });
}
