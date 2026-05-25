/**
 * Product Phase 33-D — Customer proof / case study template sections SSOT.
 */
import type { CustomerProofCaseStudyTemplateResult } from "./case-study-template.schema";

export const CASE_STUDY_TEMPLATE_REGISTRY_MARKER_PHASE33D =
  "phase33d-case-study-template-registry" as const;

type CaseStudyTemplateSection = Omit<
  CustomerProofCaseStudyTemplateResult["sections"][number],
  "templated"
>;

export const CASE_STUDY_TEMPLATE_SECTIONS: CaseStudyTemplateSection[] = [
  { sectionId: "ANONYMIZED_OUTCOME", label: "Anonymized client outcome template", required: true },
  { sectionId: "METRICS_TEMPLATE", label: "Metrics template with verified sources only", required: true },
  { sectionId: "QUOTE_PLACEHOLDER", label: "Approved quote placeholder workflow", required: true },
  { sectionId: "APPROVAL_WORKFLOW", label: "Customer approval workflow documented", required: true },
  {
    sectionId: "NO_FABRICATED_CLAIM",
    label: "No fabricated logos or unverified claims boundary",
    required: true,
  },
];
