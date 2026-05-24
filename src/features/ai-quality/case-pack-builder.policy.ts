/**
 * Product Phase 23-C — Case pack builder policy SSOT.
 */
import type { AiEvaluationCasePackType } from "./ai-evaluation-dataset.schema";
import { findCasePackBuilderTemplate } from "./case-pack-builder.registry";
import type { CasePackBuilderResult } from "./case-pack-builder.schema";
import { CASE_PACK_BUILDER_VERSION } from "./case-pack-builder.schema";

export const CASE_PACK_BUILDER_POLICY_MARKER_PHASE23C =
  "phase23c-case-pack-builder-policy" as const;

export const CASE_PACK_BUILDER_DEFAULT_DISCLAIMER =
  "본 Case Pack은 변호사 검토용 사건 정리 자료입니다. AI가 정리한 요약과 문서 초안은 법률 자문이나 최종 문서가 아니며, 최종 판단은 변호사 검토를 거쳐야 합니다." as const;

export function resolveCasePackTypeFromCaseCategory(
  category: string | null | undefined,
): AiEvaluationCasePackType {
  const normalized = (category ?? "").trim().toUpperCase();
  const map: Record<string, AiEvaluationCasePackType> = {
    LOAN: "LOAN",
    LEASE: "LEASE",
    DIVORCE: "DIVORCE",
    DAMAGES: "DAMAGES",
    LABOR: "LABOR",
    CRIMINAL: "CRIMINAL",
  };
  return map[normalized] ?? "GENERIC";
}

export function buildCasePackBuilderResult(input: {
  caseId: string;
  packType: AiEvaluationCasePackType;
  caseTitle?: string | null;
  generatedAt?: string;
}): CasePackBuilderResult {
  const template = findCasePackBuilderTemplate(input.packType);
  const titleBase = input.caseTitle?.trim() || "AI법친 사건";

  return {
    packVersion: CASE_PACK_BUILDER_VERSION,
    packType: template.packType,
    caseId: input.caseId,
    packageTitle: `${titleBase} — ${template.titleSuffix}`,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    sectionsIncluded: template.requiredSections,
    issueFocusLabels: template.issueFocusLabels,
    disclaimer: CASE_PACK_BUILDER_DEFAULT_DISCLAIMER,
  };
}
