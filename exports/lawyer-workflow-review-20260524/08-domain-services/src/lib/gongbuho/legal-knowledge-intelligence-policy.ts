/**
 * Phase 4-I — Legal Knowledge Intelligence Dashboard SSOT.
 * Spec: [`GONGBUHO_LEGAL_KNOWLEDGE_INTELLIGENCE_DASHBOARD_SPEC.md`](../../../docs/gongbuho/GONGBUHO_LEGAL_KNOWLEDGE_INTELLIGENCE_DASHBOARD_SPEC.md)
 */

export const LEGAL_KNOWLEDGE_PHASE4I_INTELLIGENCE_POLICY_MARKER =
  "PHASE4I_GONGBUHO_LEGAL_KNOWLEDGE_INTELLIGENCE_DASHBOARD" as const;

/** Dashboard API·UI에 Outline·ReviewNotes·operatorNote 등 본문 필드를 노출하지 않음. */
export const LEGAL_KNOWLEDGE_INTELLIGENCE_BODY_EXPOSURE_ALLOWED = false as const;

/** Lawyer Review SLA 기본(시간) — Brief 대기·Review PENDING 초과 판정. */
export const LEGAL_KNOWLEDGE_LAWYER_REVIEW_SLA_HOURS_DEFAULT = 72 as const;

export const LEGAL_KNOWLEDGE_INTELLIGENCE_BOTTLENECK_STAGES = [
  "INTAKE_PRE_BRIEF",
  "BRIEF_AWAITING_REVIEW",
  "REVIEW_APPROVED_NO_PACKET",
  "PACKET_DRAFT_NOT_APPROVED",
] as const;

export type LegalKnowledgeIntelligenceBottleneckStage =
  (typeof LEGAL_KNOWLEDGE_INTELLIGENCE_BOTTLENECK_STAGES)[number];

export const LEGAL_KNOWLEDGE_INTELLIGENCE_TERMINAL_INTAKE_STATUSES = [
  "ARCHIVED",
  "REJECTED",
  "PIPELINE_REJECTED",
  "PACKET_APPROVED",
] as const;

export function isLegalKnowledgeIntelligenceTerminalIntake(status: string): boolean {
  return (LEGAL_KNOWLEDGE_INTELLIGENCE_TERMINAL_INTAKE_STATUSES as readonly string[]).includes(
    status,
  );
}

export function readIntakeComplianceNoRawUgc(intakeCompliance: unknown): boolean {
  if (typeof intakeCompliance !== "object" || intakeCompliance === null) return false;
  return (intakeCompliance as Record<string, unknown>).noRawUgcStored === true;
}

export function readBriefComplianceNoRawUgc(researchCompliance: unknown): boolean {
  if (typeof researchCompliance !== "object" || researchCompliance === null) return false;
  return (researchCompliance as Record<string, unknown>).noRawUgcStored === true;
}

export function readReviewAttestationNoUgcOrPii(reviewerAttestation: unknown): boolean {
  if (typeof reviewerAttestation !== "object" || reviewerAttestation === null) return false;
  return (reviewerAttestation as Record<string, unknown>).noUgcOrPiiInReviewNotes === true;
}

export function pickLegalKnowledgeBottleneckStage(counts: Record<
  LegalKnowledgeIntelligenceBottleneckStage,
  number
>): LegalKnowledgeIntelligenceBottleneckStage {
  let maxStage: LegalKnowledgeIntelligenceBottleneckStage = "INTAKE_PRE_BRIEF";
  let maxCount = -1;
  for (const stage of LEGAL_KNOWLEDGE_INTELLIGENCE_BOTTLENECK_STAGES) {
    if (counts[stage] > maxCount) {
      maxCount = counts[stage];
      maxStage = stage;
    }
  }
  return maxStage;
}
