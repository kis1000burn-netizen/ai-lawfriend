/**
 * Product Phase 64-B — Judgment Reasoning View lock SSOT.
 * @see docs/legal-strategy/AIBEOPCHIN_JUDGMENT_REASONING_VIEW_BUILDER_PHASE64B.md
 */
import {
  PHASE64B_BOUNDARY_MARKERS,
  PHASE64B_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT,
  PHASE64B_JUDGMENT_REASONING_VIEW_VERIFY_SCRIPT,
  PHASE64B_ONE_LINE_STANDARD,
  PHASE64B_PHASE64A_VERIFY_SCRIPT,
} from "./phase64b-judgment-reasoning-view.policy";
import { PHASE64B_JUDGMENT_REASONING_VIEW_VERSION } from "./phase64b-judgment-reasoning-view.schema";
import { PHASE64A_JUDGMENT_REASONING_SOURCE_MAP_EVIDENCE_TAG } from "./phase64a-judgment-reasoning-source-map.lock";
import { PHASE60F_CONTROL_TOWER_BRAIN_RC_EVIDENCE_TAG } from "@/features/control-tower-brain/phase60f-control-tower-brain-rc-lock";

export const PHASE64B_JUDGMENT_REASONING_VIEW_LOCK_MARKER =
  "phase64b-judgment-reasoning-view-lock" as const;

export const PHASE64B_JUDGMENT_REASONING_VIEW_EVIDENCE_TAG =
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-STRATEGY-PHASE64B-JUDGMENT-REASONING-VIEW-BUILDER" as const;

export const PHASE64B_JUDGMENT_REASONING_VIEW_FINAL_JUDGMENT =
  "Phase 64-B converts 64-A JudgmentReasoningSourceMap into a lawyer-review JudgmentReasoningView with reasoning cards, favorability badges, sourceTrace refs, and uncertainty panel, while blocking views without source maps, judgment cards without canonical sources, outcome certainty language, unapproved signal authority badges, and client-visible reasoning views by default." as const;

export const PHASE64B_JUDGMENT_REASONING_VIEW_LOCK = {
  phase: "64-B",
  name: "Judgment Reasoning View Builder",
  version: PHASE64B_JUDGMENT_REASONING_VIEW_VERSION,
  status: "COMPLETE_LOCKED",
  marker: PHASE64B_JUDGMENT_REASONING_VIEW_LOCK_MARKER,
  oneLineStandard: PHASE64B_ONE_LINE_STANDARD,
  lockedBoundaries: PHASE64B_BOUNDARY_MARKERS,
  verify: PHASE64B_JUDGMENT_REASONING_VIEW_VERIFY_SCRIPT,
  phase64AVerify: PHASE64B_PHASE64A_VERIFY_SCRIPT,
  controlTowerBrainVerify: PHASE64B_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT,
  prereqEvidenceTags: [
    PHASE64A_JUDGMENT_REASONING_SOURCE_MAP_EVIDENCE_TAG,
    PHASE60F_CONTROL_TOWER_BRAIN_RC_EVIDENCE_TAG,
  ],
  judgmentReasoningPipelineStatus: "JUDGMENT_REASONING_VIEW_BUILDER_LOCKED" as const,
  finalJudgment: PHASE64B_JUDGMENT_REASONING_VIEW_FINAL_JUDGMENT,
  evidenceTag: PHASE64B_JUDGMENT_REASONING_VIEW_EVIDENCE_TAG,
  evidenceRefs: [
    "docs/legal-strategy/AIBEOPCHIN_JUDGMENT_REASONING_VIEW_BUILDER_PHASE64B.md",
    "src/features/legal-strategy/judgment-backed-reasoning/phase64b-judgment-reasoning-view.schema.ts",
    "src/features/legal-strategy/judgment-backed-reasoning/phase64b-judgment-reasoning-view.policy.ts",
    "src/features/legal-strategy/judgment-backed-reasoning/phase64b-judgment-reasoning-view.service.ts",
  ],
} as const;
