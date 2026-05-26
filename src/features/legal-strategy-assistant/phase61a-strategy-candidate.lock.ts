/**
 * Product Phase 61-A — Strategy Candidate lock SSOT.
 */
import {
  PHASE61A_BOUNDARY_MARKERS,
  PHASE61A_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT,
  PHASE61A_ONE_LINE_STANDARD,
  PHASE61A_STRATEGY_CANDIDATE_VERIFY_SCRIPT,
} from "./phase61a-strategy-candidate.policy";
import { PHASE61A_STRATEGY_CANDIDATE_VERSION } from "./phase61a-strategy-candidate.schema";
import { PHASE60F_CONTROL_TOWER_BRAIN_RC_EVIDENCE_TAG } from "@/features/control-tower-brain/phase60f-control-tower-brain-rc-lock";
import { PHASE59F_GONGBUHO_INTELLIGENCE_RC_EVIDENCE_TAG } from "@/features/gongbuho-intelligence-layer/phase59f-gongbuho-intelligence-rc-lock";

export const PHASE61A_STRATEGY_CANDIDATE_LOCK_MARKER =
  "phase61a-strategy-candidate-lock" as const;

export const PHASE61A_STRATEGY_CANDIDATE_EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-LEGAL-STRATEGY-PHASE61A-STRATEGY-CANDIDATE-SCHEMA" as const;

export const PHASE61A_STRATEGY_CANDIDATE_FINAL_JUDGMENT =
  "Phase 61-A defines StrategyCandidate as a lawyer-only, non-final, source-traced proposal grounded in GongbuhoReasoningContextBundle and optional APPROVED_FOR_REUSE patterns, with LAWYER_REVIEW_REQUIRED as the default use gate and Control Tower Brain verify as a mandatory governance prerequisite." as const;

export const PHASE61A_STRATEGY_CANDIDATE_LOCK = {
  phase: "61-A",
  name: "AI Legal Strategy Candidate Schema",
  version: PHASE61A_STRATEGY_CANDIDATE_VERSION,
  status: "COMPLETE_LOCKED",
  marker: PHASE61A_STRATEGY_CANDIDATE_LOCK_MARKER,
  oneLineStandard: PHASE61A_ONE_LINE_STANDARD,
  lockedBoundaries: PHASE61A_BOUNDARY_MARKERS,
  verify: PHASE61A_STRATEGY_CANDIDATE_VERIFY_SCRIPT,
  controlTowerBrainVerify: PHASE61A_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT,
  prereqEvidenceTags: [
    PHASE59F_GONGBUHO_INTELLIGENCE_RC_EVIDENCE_TAG,
    PHASE60F_CONTROL_TOWER_BRAIN_RC_EVIDENCE_TAG,
  ],
  finalJudgment: PHASE61A_STRATEGY_CANDIDATE_FINAL_JUDGMENT,
  evidenceTag: PHASE61A_STRATEGY_CANDIDATE_EVIDENCE_TAG,
  evidenceRefs: [
    "docs/legal-strategy/AIBEOPCHIN_AI_LEGAL_STRATEGY_ASSISTANT_PHASE61_SPEC.md",
    "docs/legal-strategy/AIBEOPCHIN_STRATEGY_CANDIDATE_PHASE61A.md",
    "src/features/legal-strategy-assistant/phase61a-strategy-candidate.schema.ts",
    "src/features/legal-strategy-assistant/phase61a-strategy-candidate.policy.ts",
  ],
} as const;
