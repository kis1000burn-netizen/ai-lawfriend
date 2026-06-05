/**
 * Product Phase 62-C — Supplement Request Draft Generator lock SSOT.
 */
import {
  PHASE62C_BOUNDARY_MARKERS,
  PHASE62C_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT,
  PHASE62C_ONE_LINE_STANDARD,
  PHASE62C_SUPPLEMENT_REQUEST_DRAFT_VERIFY_SCRIPT,
} from "./phase62c-supplement-request-draft.policy";
import { PHASE62C_SUPPLEMENT_REQUEST_DRAFT_VERSION } from "./phase62c-supplement-request-draft.schema";
import { PHASE62B_EVIDENCE_GAP_DETECTION_EVIDENCE_TAG } from "./phase62b-evidence-gap-detection-engine.lock";

export const PHASE62C_SUPPLEMENT_REQUEST_DRAFT_LOCK_MARKER =
  "phase62c-supplement-request-draft-lock" as const;

export const PHASE62C_SUPPLEMENT_REQUEST_DRAFT_EVIDENCE_TAG =
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-STRATEGY-PHASE62C-SUPPLEMENT-REQUEST-DRAFT-GENERATOR" as const;

export const PHASE62C_SUPPLEMENT_REQUEST_DRAFT_FINAL_JUDGMENT =
  "Phase 62-C는 62-B EvidenceGapDetectionReport의 EvidenceGapCandidate를 기반으로 변호사 검토용 SupplementRequestDraft를 생성하되, clientVisible, sendAllowed, autoMessageAllowed, autoTaskCreationAllowed를 모두 false로 고정했다." as const;

export const PHASE62C_SUPPLEMENT_REQUEST_DRAFT_LOCK = {
  phase: "62-C",
  name: "Supplement Request Draft Generator",
  version: PHASE62C_SUPPLEMENT_REQUEST_DRAFT_VERSION,
  status: "COMPLETE_LOCKED",
  marker: PHASE62C_SUPPLEMENT_REQUEST_DRAFT_LOCK_MARKER,
  oneLineStandard: PHASE62C_ONE_LINE_STANDARD,
  lockedBoundaries: PHASE62C_BOUNDARY_MARKERS,
  verify: PHASE62C_SUPPLEMENT_REQUEST_DRAFT_VERIFY_SCRIPT,
  controlTowerBrainVerify: PHASE62C_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT,
  prereqEvidenceTags: [PHASE62B_EVIDENCE_GAP_DETECTION_EVIDENCE_TAG],
  portalDraftStatus: "CLIENT_COLLABORATION_PORTAL_DRAFT" as const,
  finalJudgment: PHASE62C_SUPPLEMENT_REQUEST_DRAFT_FINAL_JUDGMENT,
  evidenceTag: PHASE62C_SUPPLEMENT_REQUEST_DRAFT_EVIDENCE_TAG,
  evidenceRefs: [
    "docs/legal-strategy/AIBEOPCHIN_SUPPLEMENT_REQUEST_DRAFT_GENERATOR_PHASE62C.md",
    "src/features/legal-strategy/evidence-gap-planner/phase62c-supplement-request-draft.schema.ts",
    "src/features/legal-strategy/evidence-gap-planner/phase62c-supplement-request-draft.policy.ts",
    "src/features/legal-strategy/evidence-gap-planner/phase62c-supplement-request-draft.service.ts",
  ],
} as const;
