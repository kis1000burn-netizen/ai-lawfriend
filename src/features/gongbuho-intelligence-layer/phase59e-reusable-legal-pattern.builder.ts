/**
 * Product Phase 59-E — Reusable Legal Pattern builder SSOT.
 */
import { ValidationError } from "@/lib/errors";
import type { GongbuhoLawyerFeedbackLearningTrace } from "./phase59d-lawyer-feedback-learning.schema";
import {
  assertReusableLegalPatternCreationAllowed,
  evaluateReusableLegalPatternReasoningAssist,
} from "./phase59e-reusable-legal-pattern.policy";
import {
  buildReusableLegalPatternInputSchema,
  reusableLegalPatternSchema,
  type BuildReusableLegalPatternInput,
  type ReusableLegalPattern,
} from "./phase59e-reusable-legal-pattern.schema";

export const PHASE59E_REUSABLE_LEGAL_PATTERN_BUILDER_MARKER =
  "phase59e-reusable-legal-pattern-builder" as const;

const SUGGESTION_TO_PATTERN_TYPE: Record<
  GongbuhoLawyerFeedbackLearningTrace["suggestionType"],
  ReusableLegalPattern["patternType"]
> = {
  WEAKNESS: "WEAKNESS_PATTERN",
  COUNTER_ARGUMENT: "COUNTER_ARGUMENT_PATTERN",
  EVIDENCE_GAP: "EVIDENCE_GAP_PATTERN",
  CLAIM_EVIDENCE_LINK: "CLAIM_EVIDENCE_LINK_PATTERN",
  JUDGMENT_LINK: "JUDGMENT_LINK_PATTERN",
};

export function mapLearningTraceSuggestionToPatternType(
  suggestionType: GongbuhoLawyerFeedbackLearningTrace["suggestionType"],
): ReusableLegalPattern["patternType"] {
  return SUGGESTION_TO_PATTERN_TYPE[suggestionType];
}

export function mapLearningTraceDecisionToSourceDecision(
  lawyerDecision: GongbuhoLawyerFeedbackLearningTrace["lawyerDecision"],
): BuildReusableLegalPatternInput["sourceDecision"] | null {
  if (lawyerDecision === "APPROVED") return "LAWYER_APPROVED";
  if (lawyerDecision === "MODIFIED") return "LAWYER_MODIFIED";
  return null;
}

export function buildReusableLegalPatternFromLearningTrace(input: {
  patternId: string;
  sourceTrace: GongbuhoLawyerFeedbackLearningTrace;
  caseType: string;
  issueTags: string[];
  abstractedPattern: string;
  recommendedUse: string;
  riskNotes: string[];
  reuseScope: BuildReusableLegalPatternInput["reuseScope"];
  auditRef: string;
  status?: BuildReusableLegalPatternInput["status"];
  globalGovernanceApproved?: boolean;
}) {
  const sourceDecision = mapLearningTraceDecisionToSourceDecision(input.sourceTrace.lawyerDecision);
  if (!sourceDecision) {
    throw new ValidationError("NO_REUSABLE_PATTERN_FROM_REJECTED_TRACE");
  }

  const patternInput = buildReusableLegalPatternInputSchema.parse({
    patternId: input.patternId,
    sourceTraceIds: [input.sourceTrace.traceId],
    tenantId: input.sourceTrace.tenantId,
    patternType: mapLearningTraceSuggestionToPatternType(input.sourceTrace.suggestionType),
    caseType: input.caseType,
    issueTags: input.issueTags,
    abstractedPattern: input.abstractedPattern,
    recommendedUse: input.recommendedUse,
    riskNotes: input.riskNotes,
    reuseScope: input.reuseScope,
    sourceDecision,
    modifiedPatternRef: input.sourceTrace.modifiedSuggestionRef,
    rawClientFactIncluded: false as const,
    anonymizationVerified: true as const,
    auditRef: input.auditRef,
    status: input.status ?? "DRAFT",
    clientDirectVisible: false as const,
    globalGovernanceApproved: input.globalGovernanceApproved,
  });

  assertReusableLegalPatternCreationAllowed({
    patternInput,
    sourceTrace: input.sourceTrace,
  });

  const pattern = reusableLegalPatternSchema.parse({
    ...patternInput,
    createdAt: new Date().toISOString(),
  });

  return pattern;
}

export function canUseReusableLegalPatternForReasoningAssist(input: {
  pattern: ReusableLegalPattern;
  targetTenantId: string;
  crossTenantPolicyAllowed?: boolean;
}) {
  return evaluateReusableLegalPatternReasoningAssist(input);
}
