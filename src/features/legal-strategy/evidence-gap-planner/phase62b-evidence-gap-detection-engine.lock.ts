/**
 * Product Phase 62-B — Evidence Gap Detection Engine lock SSOT.
 */
import {
  PHASE62B_BOUNDARY_MARKERS,
  PHASE62B_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT,
  PHASE62B_EVIDENCE_GAP_DETECTION_VERIFY_SCRIPT,
  PHASE62B_ONE_LINE_STANDARD,
} from "./phase62b-evidence-gap-detection-engine.policy";
import { PHASE62B_EVIDENCE_GAP_DETECTION_VERSION } from "./phase62b-evidence-gap-detection-engine.schema";
import { PHASE62A_EVIDENCE_GAP_CANDIDATE_EVIDENCE_TAG } from "./phase62a-evidence-gap-candidate.lock";

export const PHASE62B_EVIDENCE_GAP_DETECTION_LOCK_MARKER =
  "phase62b-evidence-gap-detection-engine-lock" as const;

export const PHASE62B_EVIDENCE_GAP_DETECTION_EVIDENCE_TAG =
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-STRATEGY-PHASE62B-EVIDENCE-GAP-DETECTION-ENGINE" as const;

export const PHASE62B_EVIDENCE_GAP_DETECTION_FINAL_JUDGMENT =
  "Phase 62-B는 59-C Gongbuho Reasoning Context와 61-A StrategyCandidate sourceTrace를 비교하여 증거공백 후보를 자동 탐지하되, 탐지 결과를 EvidenceGapCandidate 및 EvidenceGapDetectionReport로만 생성하도록 고정했다." as const;

export const PHASE62B_EVIDENCE_GAP_DETECTION_LOCK = {
  phase: "62-B",
  name: "Evidence Gap Detection Engine",
  version: PHASE62B_EVIDENCE_GAP_DETECTION_VERSION,
  status: "COMPLETE_LOCKED",
  marker: PHASE62B_EVIDENCE_GAP_DETECTION_LOCK_MARKER,
  oneLineStandard: PHASE62B_ONE_LINE_STANDARD,
  lockedBoundaries: PHASE62B_BOUNDARY_MARKERS,
  verify: PHASE62B_EVIDENCE_GAP_DETECTION_VERIFY_SCRIPT,
  controlTowerBrainVerify: PHASE62B_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT,
  prereqEvidenceTags: [PHASE62A_EVIDENCE_GAP_CANDIDATE_EVIDENCE_TAG],
  detectionAxes: [
    "CLAIM_EVIDENCE",
    "FACT_EVIDENCE",
    "STRATEGY_EVIDENCE",
    "JUDGMENT_CASE_MATERIAL",
  ] as const,
  finalJudgment: PHASE62B_EVIDENCE_GAP_DETECTION_FINAL_JUDGMENT,
  evidenceTag: PHASE62B_EVIDENCE_GAP_DETECTION_EVIDENCE_TAG,
  evidenceRefs: [
    "docs/legal-strategy/AIBEOPCHIN_EVIDENCE_GAP_DETECTION_ENGINE_PHASE62B.md",
    "src/features/legal-strategy/evidence-gap-planner/phase62b-evidence-gap-detection-engine.schema.ts",
    "src/features/legal-strategy/evidence-gap-planner/phase62b-evidence-gap-detection-engine.policy.ts",
    "src/features/legal-strategy/evidence-gap-planner/phase62b-evidence-gap-detection-engine.service.ts",
  ],
} as const;
