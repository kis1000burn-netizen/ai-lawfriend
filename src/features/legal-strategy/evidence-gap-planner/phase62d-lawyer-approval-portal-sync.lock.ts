/**
 * Product Phase 62-D — Lawyer Approval & Portal Draft Sync lock SSOT.
 */
import {
  PHASE62D_BOUNDARY_MARKERS,
  PHASE62D_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT,
  PHASE62D_LAWYER_APPROVAL_PORTAL_SYNC_VERIFY_SCRIPT,
  PHASE62D_ONE_LINE_STANDARD,
} from "./phase62d-lawyer-approval-portal-sync.policy";
import { PHASE62D_LAWYER_APPROVAL_PORTAL_SYNC_VERSION } from "./phase62d-lawyer-approval-portal-sync.schema";
import { PHASE62C_SUPPLEMENT_REQUEST_DRAFT_EVIDENCE_TAG } from "./phase62c-supplement-request-draft.lock";

export const PHASE62D_LAWYER_APPROVAL_PORTAL_SYNC_LOCK_MARKER =
  "phase62d-lawyer-approval-portal-sync-lock" as const;

export const PHASE62D_LAWYER_APPROVAL_PORTAL_SYNC_EVIDENCE_TAG =
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-STRATEGY-PHASE62D-LAWYER-APPROVAL-PORTAL-DRAFT-SYNC" as const;

export const PHASE62D_LAWYER_APPROVAL_PORTAL_SYNC_FINAL_JUDGMENT =
  "Phase 62-D는 62-C SupplementRequestDraft에 대해 변호사의 APPROVE / MODIFY / REJECT 결정을 기록하고, LAWYER_APPROVED 또는 LAWYER_MODIFIED 항목만 의뢰인 포털 보완요청 draft로 동기화하도록 고정했다." as const;

export const PHASE62D_LAWYER_APPROVAL_PORTAL_SYNC_LOCK = {
  phase: "62-D",
  name: "Lawyer Approval & Portal Draft Sync",
  version: PHASE62D_LAWYER_APPROVAL_PORTAL_SYNC_VERSION,
  status: "COMPLETE_LOCKED",
  marker: PHASE62D_LAWYER_APPROVAL_PORTAL_SYNC_LOCK_MARKER,
  oneLineStandard: PHASE62D_ONE_LINE_STANDARD,
  lockedBoundaries: PHASE62D_BOUNDARY_MARKERS,
  verify: PHASE62D_LAWYER_APPROVAL_PORTAL_SYNC_VERIFY_SCRIPT,
  controlTowerBrainVerify: PHASE62D_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT,
  prereqEvidenceTags: [PHASE62C_SUPPLEMENT_REQUEST_DRAFT_EVIDENCE_TAG],
  lawyerDecisionActions: ["APPROVE", "MODIFY", "REJECT"] as const,
  portalSyncAllowedStatuses: ["LAWYER_APPROVED", "LAWYER_MODIFIED"] as const,
  finalJudgment: PHASE62D_LAWYER_APPROVAL_PORTAL_SYNC_FINAL_JUDGMENT,
  evidenceTag: PHASE62D_LAWYER_APPROVAL_PORTAL_SYNC_EVIDENCE_TAG,
  evidenceRefs: [
    "docs/legal-strategy/AIBEOPCHIN_LAWYER_APPROVAL_PORTAL_DRAFT_SYNC_PHASE62D.md",
    "src/features/legal-strategy/evidence-gap-planner/phase62d-lawyer-approval-portal-sync.schema.ts",
    "src/features/legal-strategy/evidence-gap-planner/phase62d-lawyer-approval-portal-sync.policy.ts",
    "src/features/legal-strategy/evidence-gap-planner/phase62d-lawyer-approval-portal-sync.service.ts",
  ],
} as const;
