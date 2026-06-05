/**
 * Product Phase 63-D — Draft Paragraph Generator lock SSOT.
 */
import {
  PHASE63D_BOUNDARY_MARKERS,
  PHASE63D_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT,
  PHASE63D_DRAFT_PARAGRAPH_GENERATOR_VERIFY_SCRIPT,
  PHASE63D_ONE_LINE_STANDARD,
  PHASE63D_PHASE63C_VERIFY_SCRIPT,
} from "./phase63d-draft-paragraph-generator.policy";
import { PHASE63D_DRAFT_PARAGRAPH_GENERATOR_VERSION } from "./phase63d-draft-paragraph-generator.schema";
import { PHASE63C_RISK_BACKFIRE_CHECK_EVIDENCE_TAG } from "./phase63c-risk-backfire-check.lock";

export const PHASE63D_DRAFT_PARAGRAPH_GENERATOR_LOCK_MARKER =
  "phase63d-draft-paragraph-generator-lock" as const;

export const PHASE63D_DRAFT_PARAGRAPH_GENERATOR_EVIDENCE_TAG =
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-STRATEGY-PHASE63D-DRAFT-PARAGRAPH-GENERATOR" as const;

export const PHASE63D_DRAFT_PARAGRAPH_GENERATOR_FINAL_JUDGMENT =
  "Phase 63-D는 63-C BackfireRiskReport를 통과한 CounterArgumentCandidate에 대해서만 CounterArgumentDraftParagraph를 생성하도록 고정했다." as const;

export const PHASE63D_DRAFT_PARAGRAPH_GENERATOR_LOCK = {
  phase: "63-D",
  name: "Draft Paragraph Generator",
  version: PHASE63D_DRAFT_PARAGRAPH_GENERATOR_VERSION,
  status: "COMPLETE_LOCKED",
  marker: PHASE63D_DRAFT_PARAGRAPH_GENERATOR_LOCK_MARKER,
  oneLineStandard: PHASE63D_ONE_LINE_STANDARD,
  lockedBoundaries: PHASE63D_BOUNDARY_MARKERS,
  verify: PHASE63D_DRAFT_PARAGRAPH_GENERATOR_VERIFY_SCRIPT,
  phase63CVerify: PHASE63D_PHASE63C_VERIFY_SCRIPT,
  controlTowerBrainVerify: PHASE63D_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT,
  prereqEvidenceTags: [PHASE63C_RISK_BACKFIRE_CHECK_EVIDENCE_TAG],
  counterArgumentPipelineStatus: "DRAFT_PARAGRAPH_GENERATOR_LOCKED" as const,
  finalJudgment: PHASE63D_DRAFT_PARAGRAPH_GENERATOR_FINAL_JUDGMENT,
  evidenceTag: PHASE63D_DRAFT_PARAGRAPH_GENERATOR_EVIDENCE_TAG,
  evidenceRefs: [
    "docs/legal-strategy/AIBEOPCHIN_COUNTER_ARGUMENT_DRAFT_ENGINE_PHASE63.md",
    "docs/legal-strategy/AIBEOPCHIN_COUNTER_ARGUMENT_DRAFT_PARAGRAPH_GENERATOR_PHASE63D.md",
    "src/features/legal-strategy/counter-argument-engine/phase63d-draft-paragraph-generator.schema.ts",
    "src/features/legal-strategy/counter-argument-engine/phase63d-draft-paragraph-generator.policy.ts",
    "src/features/legal-strategy/counter-argument-engine/phase63d-draft-paragraph-generator.service.ts",
  ],
} as const;
