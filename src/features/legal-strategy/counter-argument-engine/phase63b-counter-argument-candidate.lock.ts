/**
 * Product Phase 63-B — Counter-Argument Candidate Builder lock SSOT.
 */
import {
  PHASE63B_BOUNDARY_MARKERS,
  PHASE63B_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT,
  PHASE63B_COUNTER_ARGUMENT_CANDIDATE_VERIFY_SCRIPT,
  PHASE63B_ONE_LINE_STANDARD,
  PHASE63B_PHASE63A_VERIFY_SCRIPT,
} from "./phase63b-counter-argument-candidate.policy";
import { PHASE63B_COUNTER_ARGUMENT_CANDIDATE_VERSION } from "./phase63b-counter-argument-candidate.schema";
import { PHASE63A_OPPONENT_ARGUMENT_EVIDENCE_TAG } from "./phase63a-opponent-argument.lock";

export const PHASE63B_COUNTER_ARGUMENT_CANDIDATE_LOCK_MARKER =
  "phase63b-counter-argument-candidate-lock" as const;

export const PHASE63B_COUNTER_ARGUMENT_CANDIDATE_EVIDENCE_TAG =
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-STRATEGY-PHASE63B-COUNTER-ARGUMENT-CANDIDATE-BUILDER" as const;

export const PHASE63B_COUNTER_ARGUMENT_CANDIDATE_FINAL_JUDGMENT =
  "Phase 63-B는 63-A OpponentArgument와 59-C Gongbuho Reasoning Context를 기반으로 반박 후보를 CounterArgumentCandidate로 생성하되, 최종 법률 주장, 자동 제출, 의뢰인 기본 노출을 모두 차단하고 LAWYER_REVIEW_REQUIRED 상태의 변호사 검토용 후보로만 고정했다." as const;

export const PHASE63B_COUNTER_ARGUMENT_CANDIDATE_LOCK = {
  phase: "63-B",
  name: "Counter-Argument Candidate Builder",
  version: PHASE63B_COUNTER_ARGUMENT_CANDIDATE_VERSION,
  status: "COMPLETE_LOCKED",
  marker: PHASE63B_COUNTER_ARGUMENT_CANDIDATE_LOCK_MARKER,
  oneLineStandard: PHASE63B_ONE_LINE_STANDARD,
  lockedBoundaries: PHASE63B_BOUNDARY_MARKERS,
  verify: PHASE63B_COUNTER_ARGUMENT_CANDIDATE_VERIFY_SCRIPT,
  phase63AVerify: PHASE63B_PHASE63A_VERIFY_SCRIPT,
  controlTowerBrainVerify: PHASE63B_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT,
  prereqEvidenceTags: [PHASE63A_OPPONENT_ARGUMENT_EVIDENCE_TAG],
  counterArgumentPipelineStatus: "COUNTER_ARGUMENT_CANDIDATE_BUILDER_LOCKED" as const,
  finalJudgment: PHASE63B_COUNTER_ARGUMENT_CANDIDATE_FINAL_JUDGMENT,
  evidenceTag: PHASE63B_COUNTER_ARGUMENT_CANDIDATE_EVIDENCE_TAG,
  evidenceRefs: [
    "docs/legal-strategy/AIBEOPCHIN_COUNTER_ARGUMENT_DRAFT_ENGINE_PHASE63.md",
    "docs/legal-strategy/AIBEOPCHIN_COUNTER_ARGUMENT_CANDIDATE_BUILDER_PHASE63B.md",
    "src/features/legal-strategy/counter-argument-engine/phase63b-counter-argument-candidate.schema.ts",
    "src/features/legal-strategy/counter-argument-engine/phase63b-counter-argument-candidate.policy.ts",
    "src/features/legal-strategy/counter-argument-engine/phase63b-counter-argument-candidate.service.ts",
  ],
} as const;
