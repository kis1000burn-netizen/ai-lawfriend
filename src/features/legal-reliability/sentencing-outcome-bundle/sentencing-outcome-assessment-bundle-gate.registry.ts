/**
 * Product Phase 47-B — SentencingOutcomeAssessmentBundleGate SSOT.
 */
import type { SentencingOutcomeAssessmentBundleGateResult } from "./sentencing-outcome-assessment-bundle-gate.schema";

export const SENTENCING_OUTCOME_ASSESSMENT_BUNDLE_GATE_REGISTRY_MARKER_47B =
  "phase47b-sentencing-outcome-assessment-bundle-gate-registry" as const;

export const LEGAL_RELIABILITY_PLATFORM_DEFAULT_SCOPE_SLUG = "legal-reliability-platform-001" as const;

type SentencingOutcomeAssessmentBundleGateItem = Omit<SentencingOutcomeAssessmentBundleGateResult["items"][number], "defined">;

export const SENTENCING_OUTCOME_ASSESSMENT_BUNDLE_GATE_ITEMS: SentencingOutcomeAssessmentBundleGateItem[] = [
  { itemId: "BUNDLED_RC_LOCK", label: "Bundled RC lock present", required: true },
  { itemId: "BUNDLED_VERIFY_SCRIPT", label: "Bundled verify script registered", required: true },
  { itemId: "LEGAL_RELIABILITY_CROSS_LINK", label: "Legal Reliability RC cross-link", required: true },
];
