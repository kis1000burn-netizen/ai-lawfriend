/**
 * Product Phase 64-A — Judgment Reasoning Source Map lock SSOT.
 * @see docs/legal-strategy/AIBEOPCHIN_JUDGMENT_REASONING_SOURCE_MAP_PHASE64A.md
 */
import {
  PHASE64A_BOUNDARY_MARKERS,
  PHASE64A_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT,
  PHASE64A_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_VERIFY_SCRIPT,
  PHASE64A_JUDGMENT_REASONING_SOURCE_MAP_VERIFY_SCRIPT,
  PHASE64A_ONE_LINE_STANDARD,
} from "./phase64a-judgment-reasoning-source-map.policy";
import { PHASE64A_JUDGMENT_REASONING_SOURCE_MAP_VERSION } from "./phase64a-judgment-reasoning-source-map.schema";
import { PHASE63F_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_EVIDENCE_TAG } from "@/features/legal-strategy/counter-argument-engine/phase63f-counter-argument-draft-engine-rc.lock";
import { PHASE60F_CONTROL_TOWER_BRAIN_RC_EVIDENCE_TAG } from "@/features/control-tower-brain/phase60f-control-tower-brain-rc-lock";

export const PHASE64A_JUDGMENT_REASONING_SOURCE_MAP_LOCK_MARKER =
  "phase64a-judgment-reasoning-source-map-lock" as const;

export const PHASE64A_JUDGMENT_REASONING_SOURCE_MAP_EVIDENCE_TAG =
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-STRATEGY-PHASE64A-JUDGMENT-REASONING-SOURCE-MAP" as const;

export const PHASE64A_JUDGMENT_REASONING_SOURCE_MAP_FINAL_JUDGMENT =
  "Phase 64-A defines JudgmentReasoningSourceMap as a lawyer-facing trace of Gongbuho items, judgments, statutes, approved real-time signals, and sourceTrace backing StrategyCandidate, EvidenceGapCandidate, CounterArgumentCandidate, and CounterArgumentDraftParagraph, while blocking reasoning views without sourceTrace, judgment use without canonical sources, unapproved signals, outcome certainty language, and client-visible judgment reasoning by default." as const;

export const PHASE64A_JUDGMENT_REASONING_SOURCE_MAP_LOCK = {
  phase: "64-A",
  name: "Judgment Reasoning Source Map Schema",
  version: PHASE64A_JUDGMENT_REASONING_SOURCE_MAP_VERSION,
  status: "COMPLETE_LOCKED",
  marker: PHASE64A_JUDGMENT_REASONING_SOURCE_MAP_LOCK_MARKER,
  oneLineStandard: PHASE64A_ONE_LINE_STANDARD,
  lockedBoundaries: PHASE64A_BOUNDARY_MARKERS,
  verify: PHASE64A_JUDGMENT_REASONING_SOURCE_MAP_VERIFY_SCRIPT,
  counterArgumentDraftEngineRcVerify: PHASE64A_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_VERIFY_SCRIPT,
  controlTowerBrainVerify: PHASE64A_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT,
  prereqEvidenceTags: [
    PHASE63F_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_EVIDENCE_TAG,
    PHASE60F_CONTROL_TOWER_BRAIN_RC_EVIDENCE_TAG,
  ],
  judgmentReasoningPipelineStatus: "JUDGMENT_REASONING_SOURCE_MAP_SCHEMA_LOCKED" as const,
  finalJudgment: PHASE64A_JUDGMENT_REASONING_SOURCE_MAP_FINAL_JUDGMENT,
  evidenceTag: PHASE64A_JUDGMENT_REASONING_SOURCE_MAP_EVIDENCE_TAG,
  evidenceRefs: [
    "docs/legal-strategy/AIBEOPCHIN_JUDGMENT_REASONING_SOURCE_MAP_PHASE64A.md",
    "src/features/legal-strategy/judgment-backed-reasoning/phase64a-judgment-reasoning-source-map.schema.ts",
    "src/features/legal-strategy/judgment-backed-reasoning/phase64a-judgment-reasoning-source-map.policy.ts",
  ],
} as const;
