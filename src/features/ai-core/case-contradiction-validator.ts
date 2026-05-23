/**
 * Phase 9-E — Contradiction signal validator (non-judgment guardrail).
 */
import {
  caseContradictionRadarResultSchema,
  caseContradictionSignalSchema,
  CONTRADICTION_RADAR_AXES,
  CONTRADICTION_SIGNAL_TYPES,
  type CaseContradictionRadarResult,
  type CaseContradictionSignal,
} from "./case-contradiction-radar";

export const CASE_CONTRADICTION_VALIDATOR_MARKER =
  "PHASE9E_CASE_CONTRADICTION_VALIDATOR" as const;

const FINAL_JUDGMENT_IN_SIGNAL = [
  /반드시\s*승소/,
  /100%\s*확실/,
  /유죄\s*확정/,
  /틀림없이\s*승소/,
];

export type CaseContradictionValidationResult = {
  passed: boolean;
  issues: string[];
};

export function assertSignalNoFinalJudgment(signal: CaseContradictionSignal): string[] {
  const issues: string[] = [];
  for (const pattern of FINAL_JUDGMENT_IN_SIGNAL) {
    if (pattern.test(signal.message)) {
      issues.push(`signal ${signal.signalId}: final judgment language blocked`);
    }
  }
  return issues;
}

export function assertSignalAxesValid(signal: CaseContradictionSignal): string[] {
  const issues: string[] = [];
  if (!signal.axes.length) {
    issues.push(`signal ${signal.signalId}: at least one axis required`);
  }
  for (const axis of signal.axes) {
    if (!CONTRADICTION_RADAR_AXES.includes(axis)) {
      issues.push(`signal ${signal.signalId}: invalid axis ${axis}`);
    }
  }
  return issues;
}

export function validateCaseContradictionSignal(
  input: unknown,
): CaseContradictionValidationResult & { signal: CaseContradictionSignal } {
  const signal = caseContradictionSignalSchema.parse(input);
  const issues = [
    ...assertSignalNoFinalJudgment(signal),
    ...assertSignalAxesValid(signal),
  ];
  if (!CONTRADICTION_SIGNAL_TYPES.includes(signal.signalType)) {
    issues.push(`signal ${signal.signalId}: unknown signalType`);
  }
  return { passed: issues.length === 0, issues, signal };
}

export function validateCaseContradictionRadarResult(
  input: unknown,
): CaseContradictionValidationResult & { radar: CaseContradictionRadarResult } {
  const radar = caseContradictionRadarResultSchema.parse(input);
  const issues: string[] = [];

  if (radar.signalCount !== radar.signals.length) {
    issues.push("radar signalCount must match signals.length");
  }

  for (const signal of radar.signals) {
    const result = validateCaseContradictionSignal(signal);
    issues.push(...result.issues);
  }

  for (const edge of radar.contradictions) {
    if (!edge.claimIdA || !edge.claimIdB) {
      issues.push("contradiction edge requires claimIdA and claimIdB");
    }
  }

  return { passed: issues.length === 0, issues, radar };
}
