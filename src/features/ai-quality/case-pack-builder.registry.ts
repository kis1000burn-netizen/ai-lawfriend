/**
 * Product Phase 23-C — Case pack builder templates SSOT.
 */
import type { CasePackBuilderTemplate } from "./case-pack-builder.schema";

export const CASE_PACK_BUILDER_REGISTRY_MARKER_PHASE23C =
  "phase23c-case-pack-builder-registry" as const;

export const CASE_PACK_BUILDER_TEMPLATES: CasePackBuilderTemplate[] = [
  {
    packType: "LOAN",
    titleSuffix: "대여금 사건 패키지",
    requiredSections: [
      "caseOverview",
      "parties",
      "summary",
      "interview",
      "attachments",
      "documents",
      "disclaimer",
    ],
    issueFocusLabels: ["변제기", "잔액", "차용증"],
  },
  {
    packType: "LEASE",
    titleSuffix: "임대차 사건 패키지",
    requiredSections: [
      "caseOverview",
      "parties",
      "summary",
      "interview",
      "attachments",
      "disclaimer",
    ],
    issueFocusLabels: ["보증금", "명도", "계약 만료"],
  },
  {
    packType: "DIVORCE",
    titleSuffix: "이혼 사건 패키지",
    requiredSections: [
      "caseOverview",
      "parties",
      "summary",
      "interview",
      "documents",
      "followUps",
      "disclaimer",
    ],
    issueFocusLabels: ["재산분할", "양육권", "양육비"],
  },
  {
    packType: "DAMAGES",
    titleSuffix: "손해배상 사건 패키지",
    requiredSections: [
      "caseOverview",
      "parties",
      "summary",
      "attachments",
      "documents",
      "disclaimer",
    ],
    issueFocusLabels: ["과실", "손해", "치료비"],
  },
  {
    packType: "LABOR",
    titleSuffix: "노동 사건 패키지",
    requiredSections: [
      "caseOverview",
      "parties",
      "summary",
      "interview",
      "attachments",
      "documents",
      "disclaimer",
    ],
    issueFocusLabels: ["임금", "해고", "근로계약"],
  },
  {
    packType: "CRIMINAL",
    titleSuffix: "형사 사건 패키지",
    requiredSections: [
      "caseOverview",
      "parties",
      "summary",
      "interview",
      "attachments",
      "followUps",
      "disclaimer",
    ],
    issueFocusLabels: ["진술", "증거", "쟁점"],
  },
  {
    packType: "GENERIC",
    titleSuffix: "일반 사건 패키지",
    requiredSections: ["caseOverview", "parties", "summary", "disclaimer"],
    issueFocusLabels: [],
  },
];

export function findCasePackBuilderTemplate(
  packType: CasePackBuilderTemplate["packType"],
): CasePackBuilderTemplate {
  return (
    CASE_PACK_BUILDER_TEMPLATES.find((template) => template.packType === packType) ??
    CASE_PACK_BUILDER_TEMPLATES.find((template) => template.packType === "GENERIC")!
  );
}
