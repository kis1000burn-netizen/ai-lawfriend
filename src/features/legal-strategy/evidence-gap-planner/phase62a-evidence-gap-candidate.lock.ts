/**
 * Product Phase 62-A — Evidence Gap Candidate lock SSOT.
 */
import {
  PHASE62A_BOUNDARY_MARKERS,
  PHASE62A_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT,
  PHASE62A_EVIDENCE_GAP_CANDIDATE_VERIFY_SCRIPT,
  PHASE62A_ONE_LINE_STANDARD,
  PHASE62A_PHASE61_VERIFY_SCRIPT,
} from "./phase62a-evidence-gap-candidate.policy";
import { PHASE62A_EVIDENCE_GAP_CANDIDATE_VERSION } from "./phase62a-evidence-gap-candidate.schema";
import { PHASE61A_STRATEGY_CANDIDATE_EVIDENCE_TAG } from "@/features/legal-strategy-assistant/phase61a-strategy-candidate.lock";
import { PHASE60F_CONTROL_TOWER_BRAIN_RC_EVIDENCE_TAG } from "@/features/control-tower-brain/phase60f-control-tower-brain-rc-lock";

export const PHASE62A_EVIDENCE_GAP_CANDIDATE_LOCK_MARKER =
  "phase62a-evidence-gap-candidate-lock" as const;

export const PHASE62A_EVIDENCE_GAP_CANDIDATE_EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-LEGAL-STRATEGY-PHASE62A-EVIDENCE-GAP-CANDIDATE-SCHEMA" as const;

export const PHASE62A_EVIDENCE_GAP_CANDIDATE_FINAL_JUDGMENT =
  "Phase 62-A defines EvidenceGapCandidate as a lawyer-review-only supplement request proposal grounded in GongbuhoReasoningContextBundle and optional EVIDENCE_GAP StrategyCandidate, with client-visible drafts blocked until lawyer approval and Litigation Ops linkage remaining draft-only." as const;

export const PHASE62A_EVIDENCE_GAP_CANDIDATE_LOCK = {
  phase: "62-A",
  name: "Evidence Gap Candidate Schema",
  version: PHASE62A_EVIDENCE_GAP_CANDIDATE_VERSION,
  status: "COMPLETE_LOCKED",
  marker: PHASE62A_EVIDENCE_GAP_CANDIDATE_LOCK_MARKER,
  oneLineStandard: PHASE62A_ONE_LINE_STANDARD,
  lockedBoundaries: PHASE62A_BOUNDARY_MARKERS,
  verify: PHASE62A_EVIDENCE_GAP_CANDIDATE_VERIFY_SCRIPT,
  phase61Verify: PHASE62A_PHASE61_VERIFY_SCRIPT,
  controlTowerBrainVerify: PHASE62A_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT,
  prereqEvidenceTags: [
    PHASE61A_STRATEGY_CANDIDATE_EVIDENCE_TAG,
    PHASE60F_CONTROL_TOWER_BRAIN_RC_EVIDENCE_TAG,
  ],
  litigationOpsTargets: [
    "SUPPLEMENT_REQUEST_DRAFT",
    "CLIENT_COLLABORATION_PORTAL_DRAFT",
    "LITIGATION_OPS_TASK_DRAFT",
  ] as const,
  finalJudgment: PHASE62A_EVIDENCE_GAP_CANDIDATE_FINAL_JUDGMENT,
  evidenceTag: PHASE62A_EVIDENCE_GAP_CANDIDATE_EVIDENCE_TAG,
  evidenceRefs: [
    "docs/legal-strategy/AIBEOPCHIN_EVIDENCE_GAP_AUTO_PLANNER_PHASE62.md",
    "docs/legal-strategy/AIBEOPCHIN_EVIDENCE_GAP_CANDIDATE_PHASE62A.md",
    "src/features/legal-strategy/evidence-gap-planner/phase62a-evidence-gap-candidate.schema.ts",
    "src/features/legal-strategy/evidence-gap-planner/phase62a-evidence-gap-candidate.policy.ts",
  ],
} as const;
