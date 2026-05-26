/**
 * Product Phase 60-A — Control Tower Brain safety boundary lock SSOT.
 */
import {
  PHASE60A_BOUNDARY_MARKERS,
  PHASE60A_ONE_LINE_STANDARD,
  buildControlTowerBrainSafetyPolicy,
} from "./phase60a-control-tower-brain-safety.policy";
import {
  PHASE60A_CONTROL_TOWER_BRAIN_SAFETY_MARKER,
  PHASE60A_CONTROL_TOWER_BRAIN_SAFETY_VERSION,
} from "./phase60a-control-tower-brain-safety.schema";

export const PHASE60A_CONTROL_TOWER_BRAIN_SAFETY_EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-CONTROL-TOWER-BRAIN-PHASE60A-SAFETY-BOUNDARY" as const;

export const PHASE60A_CONTROL_TOWER_BRAIN_SAFETY_VERIFY_SCRIPT =
  "verify:aibeopchin-control-tower-brain-phase60a" as const;

export const PHASE60A_CONTROL_TOWER_BRAIN_SAFETY_LOCK = {
  phase: "60-A",
  name: "Control Tower Brain Safety Boundary",
  version: PHASE60A_CONTROL_TOWER_BRAIN_SAFETY_VERSION,
  status: "COMPLETE_LOCKED",
  marker: PHASE60A_CONTROL_TOWER_BRAIN_SAFETY_MARKER,
  oneLineStandard: PHASE60A_ONE_LINE_STANDARD,
  lockedBoundaries: PHASE60A_BOUNDARY_MARKERS,
  verifyScript: PHASE60A_CONTROL_TOWER_BRAIN_SAFETY_VERIFY_SCRIPT,
  evidenceTag: PHASE60A_CONTROL_TOWER_BRAIN_SAFETY_EVIDENCE_TAG,
  policy: buildControlTowerBrainSafetyPolicy(),
} as const;
