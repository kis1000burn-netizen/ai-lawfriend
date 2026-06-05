/**
 * Product Phase 63-A — Opponent Argument lock SSOT.
 */
import {
  PHASE63A_BOUNDARY_MARKERS,
  PHASE63A_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT,
  PHASE63A_OPPONENT_ARGUMENT_VERIFY_SCRIPT,
  PHASE63A_ONE_LINE_STANDARD,
  PHASE63A_PHASE62_VERIFY_SCRIPT,
} from "./phase63a-opponent-argument.policy";
import { PHASE63A_OPPONENT_ARGUMENT_VERSION } from "./phase63a-opponent-argument.schema";
import { PHASE62F_EVIDENCE_GAP_AUTO_PLANNER_RC_EVIDENCE_TAG } from "@/features/legal-strategy/evidence-gap-planner/phase62f-evidence-gap-auto-planner-rc.lock";
import { PHASE60F_CONTROL_TOWER_BRAIN_RC_EVIDENCE_TAG } from "@/features/control-tower-brain/phase60f-control-tower-brain-rc-lock";

export const PHASE63A_OPPONENT_ARGUMENT_LOCK_MARKER =
  "phase63a-opponent-argument-lock" as const;

export const PHASE63A_OPPONENT_ARGUMENT_EVIDENCE_TAG =
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-STRATEGY-PHASE63A-OPPONENT-ARGUMENT-SCHEMA" as const;

export const PHASE63A_OPPONENT_ARGUMENT_FINAL_JUDGMENT =
  "Phase 63-A defines OpponentArgument as a structured input for CounterArgumentCandidate, grounding opponent claims, defenses, submitted evidence, premise facts, and legal points in GongbuhoReasoningContextBundle and sourceTrace while blocking auto-confirmed opponent claims, auto filing, and client-visible counter strategy by default." as const;

export const PHASE63A_OPPONENT_ARGUMENT_LOCK = {
  phase: "63-A",
  name: "Opponent Argument Schema",
  version: PHASE63A_OPPONENT_ARGUMENT_VERSION,
  status: "COMPLETE_LOCKED",
  marker: PHASE63A_OPPONENT_ARGUMENT_LOCK_MARKER,
  oneLineStandard: PHASE63A_ONE_LINE_STANDARD,
  lockedBoundaries: PHASE63A_BOUNDARY_MARKERS,
  verify: PHASE63A_OPPONENT_ARGUMENT_VERIFY_SCRIPT,
  phase62Verify: PHASE63A_PHASE62_VERIFY_SCRIPT,
  controlTowerBrainVerify: PHASE63A_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT,
  prereqEvidenceTags: [
    PHASE62F_EVIDENCE_GAP_AUTO_PLANNER_RC_EVIDENCE_TAG,
    PHASE60F_CONTROL_TOWER_BRAIN_RC_EVIDENCE_TAG,
  ],
  counterArgumentPipelineStatus: "OPPONENT_ARGUMENT_SCHEMA_LOCKED" as const,
  finalJudgment: PHASE63A_OPPONENT_ARGUMENT_FINAL_JUDGMENT,
  evidenceTag: PHASE63A_OPPONENT_ARGUMENT_EVIDENCE_TAG,
  evidenceRefs: [
    "docs/legal-strategy/AIBEOPCHIN_COUNTER_ARGUMENT_DRAFT_ENGINE_PHASE63.md",
    "docs/legal-strategy/AIBEOPCHIN_OPPONENT_ARGUMENT_SCHEMA_PHASE63A.md",
    "src/features/legal-strategy/counter-argument-engine/phase63a-opponent-argument.schema.ts",
    "src/features/legal-strategy/counter-argument-engine/phase63a-opponent-argument.policy.ts",
  ],
} as const;
