/**
 * Product Phase 24-B — Court filing preparation pack policy SSOT.
 */
import { findCourtFilingPackTemplate } from "./court-filing-preparation-pack.registry";
import type {
  CourtFilingPackType,
  CourtFilingPreparationPack,
} from "./court-filing-preparation-pack.schema";
import { COURT_FILING_PREPARATION_PACK_VERSION } from "./court-filing-preparation-pack.schema";

export const COURT_FILING_PREPARATION_PACK_POLICY_MARKER_PHASE24B =
  "phase24b-court-filing-preparation-pack-policy" as const;

export const COURT_FILING_PREPARATION_PACK_DISCLAIMER =
  "Court Filing Preparation Pack은 변호사 검토용 제출 준비 자료입니다. 최종 제출 서면·증거는 변호사 확인 후 법원 제출해야 합니다." as const;

const SECTION_LABELS: Record<string, string> = {
  coverSheet: "표지·사건 개요",
  parties: "당사자",
  claims: "청구·쟁점",
  evidenceIndex: "증거목록",
  deadlines: "기일·제출기한",
  tasks: "미완료 Task",
  attachments: "첨부·증거 파일",
  disclaimer: "면책 고지",
};

export function assembleCourtFilingPreparationPack(input: {
  caseId: string;
  filingType: CourtFilingPackType;
  courtName?: string | null;
  hasParties: boolean;
  hasClaims: boolean;
  hasEvidence: boolean;
  hasDeadlines: boolean;
  hasOpenTasks: boolean;
  hasAttachments: boolean;
  generatedAt?: string;
}): CourtFilingPreparationPack {
  const template = findCourtFilingPackTemplate(input.filingType);
  const present: Record<string, boolean> = {
    coverSheet: true,
    parties: input.hasParties,
    claims: input.hasClaims,
    evidenceIndex: input.hasEvidence,
    deadlines: input.hasDeadlines,
    tasks: input.hasOpenTasks,
    attachments: input.hasAttachments,
    disclaimer: true,
  };

  const sectionsIncluded = template.requiredSectionKeys.map((sectionKey) => ({
    sectionKey,
    label: SECTION_LABELS[sectionKey] ?? sectionKey,
    required: sectionKey !== "tasks",
  }));

  const missingRequiredSections = template.requiredSectionKeys.filter(
    (key) => key !== "disclaimer" && key !== "tasks" && !present[key],
  );

  const requiredCount = template.requiredSectionKeys.filter(
    (key) => key !== "disclaimer" && key !== "tasks",
  ).length;
  const satisfied = requiredCount - missingRequiredSections.length;
  const readinessScore =
    requiredCount === 0 ? 100 : Math.round((satisfied / requiredCount) * 100);

  return {
    packVersion: COURT_FILING_PREPARATION_PACK_VERSION,
    caseId: input.caseId,
    filingType: template.filingType,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    courtName: input.courtName ?? null,
    sectionsIncluded,
    readinessScore,
    missingRequiredSections: missingRequiredSections.map(
      (key) => SECTION_LABELS[key] ?? key,
    ),
    disclaimer: COURT_FILING_PREPARATION_PACK_DISCLAIMER,
  };
}
