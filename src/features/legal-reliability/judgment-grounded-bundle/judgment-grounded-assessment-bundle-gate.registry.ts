/**
 * Product Phase 47-A — JudgmentGroundedAssessmentBundleGate SSOT.
 */
import type { JudgmentGroundedAssessmentBundleGateResult } from "./judgment-grounded-assessment-bundle-gate.schema";

export const JUDGMENT_GROUNDED_ASSESSMENT_BUNDLE_GATE_REGISTRY_MARKER_47A =
  "phase47a-judgment-grounded-assessment-bundle-gate-registry" as const;

export const LEGAL_RELIABILITY_PLATFORM_DEFAULT_SCOPE_SLUG = "legal-reliability-platform-001" as const;

type JudgmentGroundedAssessmentBundleGateItem = Omit<JudgmentGroundedAssessmentBundleGateResult["items"][number], "defined">;

export const JUDGMENT_GROUNDED_ASSESSMENT_BUNDLE_GATE_ITEMS: JudgmentGroundedAssessmentBundleGateItem[] = [
  { itemId: "BUNDLED_RC_LOCK", label: "Bundled RC lock present", required: true },
  { itemId: "BUNDLED_VERIFY_SCRIPT", label: "Bundled verify script registered", required: true },
  { itemId: "LEGAL_RELIABILITY_CROSS_LINK", label: "Legal Reliability RC cross-link", required: true },
];
