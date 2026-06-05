/**
 * Product Phase 63-E — Lawyer Review & Adoption Gate lock SSOT.
 */
import {
  PHASE63E_BOUNDARY_MARKERS,
  PHASE63E_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT,
  PHASE63E_LAWYER_REVIEW_ADOPTION_VERIFY_SCRIPT,
  PHASE63E_ONE_LINE_STANDARD,
  PHASE63E_PHASE63D_VERIFY_SCRIPT,
} from "./phase63e-lawyer-review-adoption.policy";
import { PHASE63E_LAWYER_REVIEW_ADOPTION_VERSION } from "./phase63e-lawyer-review-adoption.schema";
import { PHASE63D_DRAFT_PARAGRAPH_GENERATOR_EVIDENCE_TAG } from "./phase63d-draft-paragraph-generator.lock";

export const PHASE63E_LAWYER_REVIEW_ADOPTION_LOCK_MARKER =
  "phase63e-lawyer-review-adoption-lock" as const;

export const PHASE63E_LAWYER_REVIEW_ADOPTION_EVIDENCE_TAG =
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-STRATEGY-PHASE63E-LAWYER-REVIEW-ADOPTION-GATE" as const;

export const PHASE63E_LAWYER_REVIEW_ADOPTION_FINAL_JUDGMENT =
  "Phase 63-E는 63-D CounterArgumentDraftParagraph에 대해 변호사의 ADOPT / MODIFY / REJECT 결정을 기록하고, ADOPT 또는 MODIFY 항목만 DocumentInsertCandidate로 승격하도록 고정했다." as const;

export const PHASE63E_LAWYER_REVIEW_ADOPTION_LOCK = {
  phase: "63-E",
  name: "Lawyer Review & Adoption Gate",
  version: PHASE63E_LAWYER_REVIEW_ADOPTION_VERSION,
  status: "COMPLETE_LOCKED",
  marker: PHASE63E_LAWYER_REVIEW_ADOPTION_LOCK_MARKER,
  oneLineStandard: PHASE63E_ONE_LINE_STANDARD,
  lockedBoundaries: PHASE63E_BOUNDARY_MARKERS,
  verify: PHASE63E_LAWYER_REVIEW_ADOPTION_VERIFY_SCRIPT,
  phase63DVerify: PHASE63E_PHASE63D_VERIFY_SCRIPT,
  controlTowerBrainVerify: PHASE63E_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT,
  prereqEvidenceTags: [PHASE63D_DRAFT_PARAGRAPH_GENERATOR_EVIDENCE_TAG],
  counterArgumentPipelineStatus: "LAWYER_REVIEW_ADOPTION_LOCKED" as const,
  finalJudgment: PHASE63E_LAWYER_REVIEW_ADOPTION_FINAL_JUDGMENT,
  evidenceTag: PHASE63E_LAWYER_REVIEW_ADOPTION_EVIDENCE_TAG,
  evidenceRefs: [
    "docs/legal-strategy/AIBEOPCHIN_COUNTER_ARGUMENT_DRAFT_ENGINE_PHASE63.md",
    "docs/legal-strategy/AIBEOPCHIN_COUNTER_ARGUMENT_LAWYER_REVIEW_ADOPTION_PHASE63E.md",
    "src/features/legal-strategy/counter-argument-engine/phase63e-lawyer-review-adoption.schema.ts",
    "src/features/legal-strategy/counter-argument-engine/phase63e-lawyer-review-adoption.policy.ts",
    "src/features/legal-strategy/counter-argument-engine/phase63e-lawyer-review-adoption.service.ts",
  ],
} as const;
