/**
 * Phase 6-H — CMB Operations Studio SSOT.
 * Spec: [`AIBEOPCHIN_CMB_OPERATIONS_STUDIO_SPEC.md`](../../../docs/cmb/AIBEOPCHIN_CMB_OPERATIONS_STUDIO_SPEC.md)
 */

export const CMB_PHASE6H_OPERATIONS_STUDIO_POLICY_MARKER =
  "PHASE6H_CMB_OPERATIONS_STUDIO" as const;

/** Studio API/UI에 revision configJson 본문을 노출하지 않음. */
export const CMB_OPERATIONS_STUDIO_CONFIG_BODY_EXPOSURE_ALLOWED = false as const;

export const CMB_OPERATIONS_STUDIO_RECENT_EVENTS_LIMIT = 25 as const;

export const CMB_OPERATIONS_STUDIO_COVERAGE_GAP_CODES = [
  "NONE",
  "NO_REVISION",
  "NO_PUBLISHED",
  "VALIDATION_FAIL",
] as const;

export type CmbOperationsStudioCoverageGap =
  (typeof CMB_OPERATIONS_STUDIO_COVERAGE_GAP_CODES)[number];

export const CMB_OPERATIONS_STUDIO_BOTTLENECK_STAGES = [
  "DRAFT_REVIEW_QUEUE",
  "VERIFY_PASS_AWAITING_LOCK",
  "LOCKED_AWAITING_PUBLISH",
  "CASE_TYPE_NO_PUBLISHED",
] as const;

export type CmbOperationsStudioBottleneckStage =
  (typeof CMB_OPERATIONS_STUDIO_BOTTLENECK_STAGES)[number];

export function pickCmbOperationsBottleneckStage(counts: Record<
  CmbOperationsStudioBottleneckStage,
  number
>): CmbOperationsStudioBottleneckStage {
  let stage: CmbOperationsStudioBottleneckStage = "DRAFT_REVIEW_QUEUE";
  let max = -1;
  for (const key of CMB_OPERATIONS_STUDIO_BOTTLENECK_STAGES) {
    if (counts[key] > max) {
      max = counts[key];
      stage = key;
    }
  }
  return stage;
}
