/**
 * Product Phase 63-C — Risk & Backfire Check lock SSOT.
 */
import {
  PHASE63C_BOUNDARY_MARKERS,
  PHASE63C_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT,
  PHASE63C_ONE_LINE_STANDARD,
  PHASE63C_PHASE63B_VERIFY_SCRIPT,
  PHASE63C_RISK_BACKFIRE_CHECK_VERIFY_SCRIPT,
} from "./phase63c-risk-backfire-check.policy";
import { PHASE63C_RISK_BACKFIRE_CHECK_VERSION } from "./phase63c-risk-backfire-check.schema";
import { PHASE63B_COUNTER_ARGUMENT_CANDIDATE_EVIDENCE_TAG } from "./phase63b-counter-argument-candidate.lock";

export const PHASE63C_RISK_BACKFIRE_CHECK_LOCK_MARKER =
  "phase63c-risk-backfire-check-lock" as const;

export const PHASE63C_RISK_BACKFIRE_CHECK_EVIDENCE_TAG =
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-STRATEGY-PHASE63C-RISK-BACKFIRE-CHECK" as const;

export const PHASE63C_RISK_BACKFIRE_CHECK_FINAL_JUDGMENT =
  "Phase 63-C는 63-B CounterArgumentCandidate에 대해 반박 시 역효과, 우리 측 약점 노출, 증거 부족, 기존 진술 충돌, 불리한 판례 연결, 과도한 사실 단정 가능성을 BackfireRiskReport로 점검하도록 고정했다." as const;

export const PHASE63C_RISK_BACKFIRE_CHECK_LOCK = {
  phase: "63-C",
  name: "Risk & Backfire Check",
  version: PHASE63C_RISK_BACKFIRE_CHECK_VERSION,
  status: "COMPLETE_LOCKED",
  marker: PHASE63C_RISK_BACKFIRE_CHECK_LOCK_MARKER,
  oneLineStandard: PHASE63C_ONE_LINE_STANDARD,
  lockedBoundaries: PHASE63C_BOUNDARY_MARKERS,
  verify: PHASE63C_RISK_BACKFIRE_CHECK_VERIFY_SCRIPT,
  phase63BVerify: PHASE63C_PHASE63B_VERIFY_SCRIPT,
  controlTowerBrainVerify: PHASE63C_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT,
  prereqEvidenceTags: [PHASE63B_COUNTER_ARGUMENT_CANDIDATE_EVIDENCE_TAG],
  counterArgumentPipelineStatus: "BACKFIRE_RISK_CHECK_LOCKED" as const,
  finalJudgment: PHASE63C_RISK_BACKFIRE_CHECK_FINAL_JUDGMENT,
  evidenceTag: PHASE63C_RISK_BACKFIRE_CHECK_EVIDENCE_TAG,
  evidenceRefs: [
    "docs/legal-strategy/AIBEOPCHIN_COUNTER_ARGUMENT_DRAFT_ENGINE_PHASE63.md",
    "docs/legal-strategy/AIBEOPCHIN_COUNTER_ARGUMENT_RISK_BACKFIRE_CHECK_PHASE63C.md",
    "src/features/legal-strategy/counter-argument-engine/phase63c-risk-backfire-check.schema.ts",
    "src/features/legal-strategy/counter-argument-engine/phase63c-risk-backfire-check.policy.ts",
    "src/features/legal-strategy/counter-argument-engine/phase63c-risk-backfire-check.service.ts",
  ],
} as const;
