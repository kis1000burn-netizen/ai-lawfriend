/**
 * Product Phase 23-A — AI output quality evaluation policy SSOT.
 */
import type { AiEvaluationExpectedCriteria } from "./ai-evaluation-dataset.schema";
import type {
  AiOutputQualityDimensionScore,
  AiOutputQualityEvaluationResult,
} from "./ai-output-quality-evaluation.schema";
import { AI_OUTPUT_QUALITY_SCORE_BANDS } from "./ai-output-quality-evaluation.schema";

export const AI_OUTPUT_QUALITY_EVALUATION_POLICY_MARKER_PHASE23A =
  "phase23a-ai-output-quality-evaluation-policy" as const;

export const AI_OUTPUT_QUALITY_PASS_THRESHOLD = 80 as const;
export const AI_OUTPUT_QUALITY_REVIEW_THRESHOLD = 60 as const;

function normalizeText(text: string): string {
  return text.trim().toLowerCase();
}

function scoreMustMention(
  outputText: string,
  mustMention: string[],
): AiOutputQualityDimensionScore {
  if (mustMention.length === 0) {
    return {
      dimension: "MUST_MENTION",
      score: 100,
      passed: true,
      notes: [],
    };
  }

  const normalized = normalizeText(outputText);
  const hits = mustMention.filter((term) => normalized.includes(normalizeText(term)));
  const score = Math.round((hits.length / mustMention.length) * 100);

  return {
    dimension: "MUST_MENTION",
    score,
    passed: score === 100,
    notes:
      hits.length < mustMention.length
        ? [`missing: ${mustMention.filter((term) => !hits.includes(term)).join(", ")}`]
        : [],
  };
}

function scoreMustNotInvent(
  outputText: string,
  mustNotInvent: string[],
): AiOutputQualityDimensionScore {
  if (mustNotInvent.length === 0) {
    return {
      dimension: "MUST_NOT_INVENT",
      score: 100,
      passed: true,
      notes: [],
    };
  }

  const normalized = normalizeText(outputText);
  const violations = mustNotInvent.filter((term) => normalized.includes(normalizeText(term)));
  const score =
    violations.length === 0 ? 100 : Math.max(0, 100 - violations.length * 35);

  return {
    dimension: "MUST_NOT_INVENT",
    score,
    passed: violations.length === 0,
    notes: violations.length > 0 ? [`invented: ${violations.join(", ")}`] : [],
  };
}

function scoreCitation(
  outputText: string,
  citationRequired: boolean,
): AiOutputQualityDimensionScore {
  if (!citationRequired) {
    return {
      dimension: "CITATION",
      score: 100,
      passed: true,
      notes: [],
    };
  }

  const hasCitation =
    /\[[^\]]+\]/.test(outputText) ||
    /출처|근거|조문|판례|법령/.test(outputText);

  return {
    dimension: "CITATION",
    score: hasCitation ? 100 : 0,
    passed: hasCitation,
    notes: hasCitation ? [] : ["citation markers not found"],
  };
}

function scoreHallucinationRisk(
  maxHallucinationRisk: AiEvaluationExpectedCriteria["maxHallucinationRisk"],
  mustNotInventScore: number,
): AiOutputQualityDimensionScore {
  const riskPenalty =
    maxHallucinationRisk === "HIGH" ? 10 : maxHallucinationRisk === "MEDIUM" ? 20 : 30;
  const score = Math.max(0, Math.min(100, mustNotInventScore + riskPenalty - 30));

  return {
    dimension: "HALLUCINATION_RISK",
    score,
    passed: mustNotInventScore >= 100 && maxHallucinationRisk !== "HIGH",
    notes: [`maxHallucinationRisk=${maxHallucinationRisk}`],
  };
}

export function resolveAiOutputQualityBand(
  overallScore: number,
): (typeof AI_OUTPUT_QUALITY_SCORE_BANDS)[number] {
  if (overallScore >= AI_OUTPUT_QUALITY_PASS_THRESHOLD) {
    return "PASS";
  }
  if (overallScore >= AI_OUTPUT_QUALITY_REVIEW_THRESHOLD) {
    return "REVIEW";
  }
  return "FAIL";
}

export function evaluateAiOutputQuality(input: {
  evaluationCode: string;
  aiOutputText: string;
  expectedCriteria: AiEvaluationExpectedCriteria;
  evaluatedAt?: string;
}): AiOutputQualityEvaluationResult {
  const mustMention = scoreMustMention(
    input.aiOutputText,
    input.expectedCriteria.mustMention,
  );
  const mustNotInvent = scoreMustNotInvent(
    input.aiOutputText,
    input.expectedCriteria.mustNotInvent,
  );
  const citation = scoreCitation(
    input.aiOutputText,
    input.expectedCriteria.citationRequired,
  );
  const hallucination = scoreHallucinationRisk(
    input.expectedCriteria.maxHallucinationRisk,
    mustNotInvent.score,
  );

  const dimensions = [mustMention, mustNotInvent, citation, hallucination];
  const overallScore = Math.round(
    dimensions.reduce((sum, dimension) => sum + dimension.score, 0) / dimensions.length,
  );
  const band = resolveAiOutputQualityBand(overallScore);

  return {
    evaluationCode: input.evaluationCode,
    overallScore,
    band,
    passed: band === "PASS" && mustNotInvent.passed,
    dimensions,
    evaluatedAt: input.evaluatedAt ?? new Date().toISOString(),
  };
}
