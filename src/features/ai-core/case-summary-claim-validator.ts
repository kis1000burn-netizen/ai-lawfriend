/**
 * Phase 9-D — Case Intelligence claim validator.
 * AI는 판단하지 않는다 — 주장·근거·출처 구조화만 검증한다.
 */
import { checkForbiddenAssertions } from "./ai-output-schema-validator";
import {
  caseIntelligenceClaimSchema,
  type CaseIntelligenceClaim,
} from "./case-intelligence-graph.schema";

export const CASE_SUMMARY_CLAIM_VALIDATOR_MARKER =
  "PHASE9D_CASE_SUMMARY_CLAIM_VALIDATOR" as const;

/** AI가 “최종 판단”처럼 읽히는 표현 — claim text 금지 */
const FINAL_JUDGMENT_PATTERNS = [
  /반드시\s*승소/,
  /100%\s*확실/,
  /무조건\s*승소/,
  /법적으로\s*틀림없/,
  /최종\s*판결/,
  /유죄\s*확정/,
];

export type CaseClaimValidationResult = {
  passed: boolean;
  issues: string[];
  claim: CaseIntelligenceClaim;
};

export function assertClaimHasSources(claim: CaseIntelligenceClaim): string[] {
  const issues: string[] = [];
  if (!claim.sources?.length) {
    issues.push(`claim ${claim.claimId}: at least one source required`);
  }
  for (const source of claim.sources ?? []) {
    if (!source.ref?.trim()) {
      issues.push(`claim ${claim.claimId}: source ref required`);
    }
  }
  return issues;
}

export function assertClaimNoFinalJudgment(claim: CaseIntelligenceClaim): string[] {
  const issues: string[] = [];
  for (const pattern of FINAL_JUDGMENT_PATTERNS) {
    if (pattern.test(claim.text)) {
      issues.push(`claim ${claim.claimId}: final judgment pattern blocked (${pattern})`);
    }
  }
  const guardrail = checkForbiddenAssertions(claim.text);
  if (!guardrail.passed) {
    issues.push(...guardrail.issues.map((i) => `claim ${claim.claimId}: ${i}`));
  }
  return issues;
}

/** USER_CLAIM 은 “주장합니다/라고 진술” 등 비판단 framing 권장 (경고) */
export function assertUserClaimFraming(claim: CaseIntelligenceClaim): string[] {
  if (claim.claimType !== "USER_CLAIM") {
    return [];
  }
  if (/주장|진술|라고\s*(말|밝)/.test(claim.text)) {
    return [];
  }
  return [
    `claim ${claim.claimId}: USER_CLAIM should use non-judgment framing (주장/진술)`,
  ];
}

export function validateCaseIntelligenceClaim(
  input: unknown,
  options: { strictUserClaimFraming?: boolean } = {},
): CaseClaimValidationResult {
  const parsed = caseIntelligenceClaimSchema.parse(input);
  const issues = [
    ...assertClaimHasSources(parsed),
    ...assertClaimNoFinalJudgment(parsed),
    ...(options.strictUserClaimFraming ? assertUserClaimFraming(parsed) : []),
  ];

  return {
    passed: issues.length === 0,
    issues,
    claim: parsed,
  };
}

export function validateCaseIntelligenceClaims(
  claims: CaseIntelligenceClaim[],
  options?: { strictUserClaimFraming?: boolean },
): { passed: boolean; issues: string[]; claims: CaseIntelligenceClaim[] } {
  const allIssues: string[] = [];
  for (const claim of claims) {
    const result = validateCaseIntelligenceClaim(claim, options);
    allIssues.push(...result.issues);
  }
  return {
    passed: allIssues.length === 0,
    issues: allIssues,
    claims,
  };
}
