/**
 * Product Phase 24-B — Court filing pack templates SSOT.
 */
import type { CourtFilingPackType } from "./court-filing-preparation-pack.schema";

export const COURT_FILING_PREPARATION_PACK_REGISTRY_MARKER_PHASE24B =
  "phase24b-court-filing-preparation-pack-registry" as const;

type FilingTemplate = {
  filingType: CourtFilingPackType;
  titleSuffix: string;
  requiredSectionKeys: Array<
    "coverSheet" | "parties" | "claims" | "evidenceIndex" | "deadlines" | "tasks" | "attachments" | "disclaimer"
  >;
};

export const COURT_FILING_PACK_TEMPLATES: FilingTemplate[] = [
  {
    filingType: "COMPLAINT",
    titleSuffix: "소장 제출 준비",
    requiredSectionKeys: ["coverSheet", "parties", "claims", "evidenceIndex", "deadlines", "disclaimer"],
  },
  {
    filingType: "ANSWER",
    titleSuffix: "답변서 제출 준비",
    requiredSectionKeys: ["coverSheet", "parties", "claims", "attachments", "deadlines", "disclaimer"],
  },
  {
    filingType: "BRIEF",
    titleSuffix: "준비서면 제출 준비",
    requiredSectionKeys: ["coverSheet", "claims", "evidenceIndex", "tasks", "disclaimer"],
  },
  {
    filingType: "EVIDENCE_LIST",
    titleSuffix: "증거목록 제출 준비",
    requiredSectionKeys: ["coverSheet", "evidenceIndex", "attachments", "disclaimer"],
  },
  {
    filingType: "GENERIC",
    titleSuffix: "법원 제출 준비",
    requiredSectionKeys: ["coverSheet", "parties", "deadlines", "disclaimer"],
  },
];

export function findCourtFilingPackTemplate(filingType: CourtFilingPackType) {
  return (
    COURT_FILING_PACK_TEMPLATES.find((template) => template.filingType === filingType) ??
    COURT_FILING_PACK_TEMPLATES.find((template) => template.filingType === "GENERIC")!
  );
}
