/**
 * Product Phase 63-D — Draft Paragraph Generator policy SSOT.
 */
import { ValidationError } from "@/lib/errors";
import type { GongbuhoReasoningContextBundle } from "@/features/gongbuho-intelligence-layer/phase59c-gongbuho-reasoning-context.schema";
import type { CounterArgumentCandidate } from "./phase63b-counter-argument-candidate.schema";
import type {
  BackfireRiskLevel,
  BackfireRiskRecommendation,
  BackfireRiskReport,
} from "./phase63c-risk-backfire-check.schema";
import type {
  BuildCounterArgumentDraftParagraphInput,
  CounterArgumentDraftParagraph,
  DraftParagraphRiskLevelAtGeneration,
} from "./phase63d-draft-paragraph-generator.schema";
import {
  PHASE63D_DRAFT_PARAGRAPH_GENERATOR_SCHEMA_MARKER,
  PHASE63D_DRAFT_PARAGRAPH_GENERATOR_VERSION,
  counterArgumentDraftParagraphSchema,
  counterArgumentDraftParagraphBoundariesSchema,
} from "./phase63d-draft-paragraph-generator.schema";

export const PHASE63D_DRAFT_PARAGRAPH_GENERATOR_POLICY_MARKER =
  "phase63d-draft-paragraph-generator-policy" as const;

export const PHASE63D_ONE_LINE_STANDARD =
  "Phase 63-D는 63-C BackfireRiskReport를 통과한 CounterArgumentCandidate에 대해서만 준비서면·답변서·의견서에 사용할 수 있는 반박 문단 초안 후보를 생성하되, 변호사 승인 전에는 문서 반영·의뢰인 노출·자동 제출을 모두 차단한다." as const;

export const PHASE63D_BOUNDARY_MARKERS = [
  "NO_DRAFT_PARAGRAPH_WITHOUT_COUNTER_ARGUMENT",
  "NO_DRAFT_PARAGRAPH_WITHOUT_BACKFIRE_CHECK",
  "NO_DRAFT_PARAGRAPH_FROM_CRITICAL_RISK",
  "NO_FINAL_DOCUMENT_TEXT_BY_AI",
  "NO_DOCUMENT_INSERT_WITHOUT_LAWYER_APPROVAL",
  "NO_CLIENT_VISIBLE_DRAFT_PARAGRAPH",
  "NO_AUTO_FILED_DRAFT_PARAGRAPH",
  "NO_PARAGRAPH_WITHOUT_SOURCE_TRACE",
  "NO_PARAGRAPH_WITHOUT_AUDIT_REF",
  "CONTROL_TOWER_BRAIN_VERIFY_REQUIRED",
] as const;

export type DraftParagraphBoundaryMarker = (typeof PHASE63D_BOUNDARY_MARKERS)[number];

export const PHASE63D_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT =
  "verify:aibeopchin-control-tower-brain-rc" as const;

export const PHASE63D_DRAFT_PARAGRAPH_GENERATOR_VERIFY_SCRIPT =
  "verify:aibeopchin-legal-strategy-phase63d" as const;

export const PHASE63D_PHASE63C_VERIFY_SCRIPT =
  "verify:aibeopchin-legal-strategy-phase63c" as const;

const DEFAULT_BOUNDARIES = counterArgumentDraftParagraphBoundariesSchema.parse({
  noDraftParagraphWithoutCounterArgument: true,
  noDraftParagraphWithoutBackfireCheck: true,
  noDraftParagraphFromCriticalRisk: true,
  noFinalDocumentTextByAi: true,
  noDocumentInsertWithoutLawyerApproval: true,
  noClientVisibleDraftParagraph: true,
  noAutoFiledDraftParagraph: true,
  noParagraphWithoutSourceTrace: true,
  noParagraphWithoutAuditRef: true,
  controlTowerBrainVerifyRequired: true,
});

const ALLOWED_RECOMMENDATIONS_FOR_DRAFT: BackfireRiskRecommendation[] = [
  "SAFE_TO_REVIEW",
  "REVIEW_WITH_CAUTION",
];

const ALLOWED_RISK_LEVELS_FOR_DRAFT: BackfireRiskLevel[] = ["LOW", "MEDIUM", "HIGH"];

export function evaluateBackfireRiskReportForDraftParagraphGeneration(
  report?: BackfireRiskReport,
) {
  if (!report) {
    return {
      allowed: false as const,
      blockedBy: "NO_DRAFT_PARAGRAPH_WITHOUT_BACKFIRE_CHECK" as const,
    };
  }

  if (report.riskLevel === "CRITICAL" || report.recommendation === "DO_NOT_USE") {
    return {
      allowed: false as const,
      blockedBy: "NO_DRAFT_PARAGRAPH_FROM_CRITICAL_RISK" as const,
    };
  }

  if (!ALLOWED_RISK_LEVELS_FOR_DRAFT.includes(report.riskLevel)) {
    return {
      allowed: false as const,
      blockedBy: "NO_DRAFT_PARAGRAPH_FROM_CRITICAL_RISK" as const,
    };
  }

  if (!ALLOWED_RECOMMENDATIONS_FOR_DRAFT.includes(report.recommendation)) {
    return {
      allowed: false as const,
      blockedBy: "NO_DRAFT_PARAGRAPH_FROM_CRITICAL_RISK" as const,
    };
  }

  return { allowed: true as const, blockedBy: null };
}

export function evaluateDraftParagraphGenerationGate(input: {
  counterArgumentCandidate?: CounterArgumentCandidate;
  backfireRiskReport?: BackfireRiskReport;
  reasoningContext: GongbuhoReasoningContextBundle;
}) {
  if (!input.counterArgumentCandidate) {
    return {
      allowed: false as const,
      blockedBy: "NO_DRAFT_PARAGRAPH_WITHOUT_COUNTER_ARGUMENT" as const,
    };
  }

  const backfireGate = evaluateBackfireRiskReportForDraftParagraphGeneration(
    input.backfireRiskReport,
  );
  if (!backfireGate.allowed) {
    return backfireGate;
  }

  const report = input.backfireRiskReport!;
  if (
    report.sourceCounterArgumentCandidateId !==
    input.counterArgumentCandidate.counterArgumentCandidateId
  ) {
    return {
      allowed: false as const,
      blockedBy: "NO_DRAFT_PARAGRAPH_WITHOUT_BACKFIRE_CHECK" as const,
    };
  }

  if (
    input.counterArgumentCandidate.reasoningContextAuditRef !==
    input.reasoningContext.auditRef
  ) {
    return {
      allowed: false as const,
      blockedBy: "NO_DRAFT_PARAGRAPH_WITHOUT_BACKFIRE_CHECK" as const,
    };
  }

  if (report.reasoningContextAuditRef !== input.reasoningContext.auditRef) {
    return {
      allowed: false as const,
      blockedBy: "NO_DRAFT_PARAGRAPH_WITHOUT_BACKFIRE_CHECK" as const,
    };
  }

  return { allowed: true as const, blockedBy: null };
}

export function evaluateDraftParagraphForDocumentInsert(paragraph: CounterArgumentDraftParagraph) {
  if (paragraph.documentInsertAllowed) {
    return { allowed: true as const, blockedBy: null };
  }
  return {
    allowed: false as const,
    blockedBy: "NO_DOCUMENT_INSERT_WITHOUT_LAWYER_APPROVAL" as const,
  };
}

export function evaluateDraftParagraphForClientVisibility(paragraph: CounterArgumentDraftParagraph) {
  if (paragraph.clientVisibleAllowed) {
    return { allowed: true as const, blockedBy: null };
  }
  return {
    allowed: false as const,
    blockedBy: "NO_CLIENT_VISIBLE_DRAFT_PARAGRAPH" as const,
  };
}

function toRiskLevelAtGeneration(
  riskLevel: BackfireRiskLevel,
): DraftParagraphRiskLevelAtGeneration {
  if (riskLevel === "CRITICAL") {
    throw new ValidationError("NO_DRAFT_PARAGRAPH_FROM_CRITICAL_RISK");
  }
  return riskLevel;
}

export function buildCounterArgumentDraftParagraph(
  input: BuildCounterArgumentDraftParagraphInput,
): CounterArgumentDraftParagraph {
  if (!input.auditRef.trim()) {
    throw new ValidationError("NO_PARAGRAPH_WITHOUT_AUDIT_REF");
  }

  if (!input.draftText.trim()) {
    throw new ValidationError("NO_FINAL_DOCUMENT_TEXT_BY_AI");
  }

  if (!input.sourceTrace.length) {
    throw new ValidationError("NO_PARAGRAPH_WITHOUT_SOURCE_TRACE");
  }

  const gate = evaluateDraftParagraphGenerationGate({
    counterArgumentCandidate: input.counterArgumentCandidate,
    backfireRiskReport: input.backfireRiskReport,
    reasoningContext: input.reasoningContext,
  });
  if (!gate.allowed) {
    throw new ValidationError(gate.blockedBy ?? "NO_DRAFT_PARAGRAPH_WITHOUT_BACKFIRE_CHECK");
  }

  const paragraph: CounterArgumentDraftParagraph = {
    marker: PHASE63D_DRAFT_PARAGRAPH_GENERATOR_SCHEMA_MARKER,
    version: PHASE63D_DRAFT_PARAGRAPH_GENERATOR_VERSION,
    paragraphId: input.paragraphId,
    caseId: input.counterArgumentCandidate.caseId,
    tenantId: input.counterArgumentCandidate.tenantId,
    sourceCounterArgumentCandidateId: input.counterArgumentCandidate.counterArgumentCandidateId,
    sourceBackfireRiskReportId: input.backfireRiskReport.reportId,
    reasoningContextAuditRef: input.reasoningContext.auditRef,
    paragraphPurpose: input.paragraphPurpose,
    draftText: input.draftText.trim(),
    sourceTrace: input.sourceTrace,
    riskLevelAtGeneration: toRiskLevelAtGeneration(input.backfireRiskReport.riskLevel),
    reviewStatus: "LAWYER_REVIEW_REQUIRED",
    isFinalDocumentText: false,
    documentInsertAllowed: false,
    clientVisibleAllowed: false,
    autoFileAllowed: false,
    boundaries: DEFAULT_BOUNDARIES,
    auditRef: input.auditRef,
    phase63CVerifyScript: PHASE63D_PHASE63C_VERIFY_SCRIPT,
    phase63DVerifyScript: PHASE63D_DRAFT_PARAGRAPH_GENERATOR_VERIFY_SCRIPT,
    controlTowerBrainVerifyScript: PHASE63D_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT,
    generatedAt: new Date().toISOString(),
  };

  return counterArgumentDraftParagraphSchema.parse(paragraph);
}
