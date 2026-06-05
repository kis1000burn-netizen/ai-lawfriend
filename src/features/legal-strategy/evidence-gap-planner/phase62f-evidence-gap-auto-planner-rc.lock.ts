/**
 * Product Phase 62-F — Evidence Gap Auto Planner RC lock SSOT.
 * @see docs/legal-strategy/AIBEOPCHIN_EVIDENCE_GAP_AUTO_PLANNER_RC_LOCK_SUMMARY.md
 */
import {
  PHASE62F_CONSOLIDATED_RC_BOUNDARY_MARKERS,
  PHASE62F_RC_GATE_BOUNDARY_MARKERS,
} from "./phase62f-evidence-gap-auto-planner-rc.policy";
import {
  PHASE62A_EVIDENCE_GAP_CANDIDATE_EVIDENCE_TAG,
  PHASE62A_EVIDENCE_GAP_CANDIDATE_LOCK_MARKER,
} from "./phase62a-evidence-gap-candidate.lock";
import {
  PHASE62B_EVIDENCE_GAP_DETECTION_EVIDENCE_TAG,
  PHASE62B_EVIDENCE_GAP_DETECTION_LOCK_MARKER,
} from "./phase62b-evidence-gap-detection-engine.lock";
import {
  PHASE62C_SUPPLEMENT_REQUEST_DRAFT_EVIDENCE_TAG,
  PHASE62C_SUPPLEMENT_REQUEST_DRAFT_LOCK_MARKER,
} from "./phase62c-supplement-request-draft.lock";
import {
  PHASE62D_LAWYER_APPROVAL_PORTAL_SYNC_EVIDENCE_TAG,
  PHASE62D_LAWYER_APPROVAL_PORTAL_SYNC_LOCK_MARKER,
} from "./phase62d-lawyer-approval-portal-sync.lock";
import {
  PHASE62E_CLIENT_SEND_GATE_EVIDENCE_TAG,
  PHASE62E_CLIENT_SEND_GATE_LOCK_MARKER,
} from "./phase62e-client-send-gate.lock";
import { PHASE60F_CONTROL_TOWER_BRAIN_RC_EVIDENCE_TAG } from "@/features/control-tower-brain/phase60f-control-tower-brain-rc-lock";

export const PHASE62F_EVIDENCE_GAP_AUTO_PLANNER_RC_LOCK_MARKER =
  "phase62f-evidence-gap-auto-planner-rc-gate" as const;

export const PHASE62F_EVIDENCE_GAP_AUTO_PLANNER_RC_EVIDENCE_TAG =
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-STRATEGY-PHASE62F-EVIDENCE-GAP-AUTO-PLANNER-RC" as const;

export const PHASE62F_EVIDENCE_GAP_AUTO_PLANNER_RC_VERSION = "62-F.1" as const;

export const PHASE62F_EVIDENCE_GAP_AUTO_PLANNER_RC_MASTER_VERIFY_SCRIPT =
  "verify:aibeopchin-evidence-gap-auto-planner-rc" as const;

export const PHASE62F_EVIDENCE_GAP_AUTO_PLANNER_RC_UNIT_VERIFY_SCRIPT =
  "verify:aibeopchin-legal-strategy-phase62f" as const;

export const PHASE62F_EVIDENCE_GAP_AUTO_PLANNER_RC_ONE_LINE_CRITERION =
  "Phase 62-F는 62-A~62-E 전체를 Evidence Gap Auto Planner로 묶어, 증거공백 탐지부터 의뢰인 보완요청 노출·발송·운영 연결까지 모든 단계가 변호사 승인·메시징 정책·audit·Control Tower Brain 검증 아래에서만 작동하도록 RC로 봉인하는 단계다." as const;

export const PHASE62F_EVIDENCE_GAP_AUTO_PLANNER_RC_FINAL_JUDGMENT =
  "Phase 62-F는 62-A EvidenceGapCandidate, 62-B DetectionReport, 62-C SupplementRequestDraft, 62-D Lawyer Approval & Portal Draft Sync, 62-E Client-visible Send Gate & Litigation Ops Draft Link를 Evidence Gap Auto Planner RC로 묶었다. 증거공백 탐지부터 의뢰인 보완요청 노출·발송·운영 연결까지 모든 단계는 변호사 승인, 메시징 정책, Decision Ledger, auditRef, Control Tower Brain 검증 아래에서만 진행되며, AI 최종 증거 판단, 자동 발송, 자동 task 실행, 내부 전략 노출은 차단된다." as const;

export const PHASE62F_EVIDENCE_GAP_AUTO_PLANNER_PLATFORM_STATUS =
  "EVIDENCE_GAP_AUTO_PLANNER_RC_LOCKED" as const;

export const PHASE62F_EVIDENCE_GAP_AUTO_PLANNER_SUB_PHASES = {
  "62-A": "Evidence Gap Candidate Schema",
  "62-B": "Evidence Gap Detection Engine",
  "62-C": "Supplement Request Draft Generator",
  "62-D": "Lawyer Approval & Portal Draft Sync",
  "62-E": "Client-visible Send Gate & Litigation Ops Draft Link",
  "62-F": "Evidence Gap Auto Planner RC",
} as const;

export const PHASE62F_EVIDENCE_GAP_AUTO_PLANNER_RC_BUNDLED_VERIFY_SCRIPTS = [
  "verify:aibeopchin-control-tower-brain-rc",
  "verify:aibeopchin-legal-strategy-phase62a",
  "verify:aibeopchin-legal-strategy-phase62b",
  "verify:aibeopchin-legal-strategy-phase62c",
  "verify:aibeopchin-legal-strategy-phase62d",
  "verify:aibeopchin-legal-strategy-phase62e",
] as const;

export const PHASE62F_SUB_PHASE_LOCK_MARKERS = [
  PHASE62A_EVIDENCE_GAP_CANDIDATE_LOCK_MARKER,
  PHASE62B_EVIDENCE_GAP_DETECTION_LOCK_MARKER,
  PHASE62C_SUPPLEMENT_REQUEST_DRAFT_LOCK_MARKER,
  PHASE62D_LAWYER_APPROVAL_PORTAL_SYNC_LOCK_MARKER,
  PHASE62E_CLIENT_SEND_GATE_LOCK_MARKER,
] as const;

export const PHASE62F_EVIDENCE_GAP_AUTO_PLANNER_RC_EVIDENCE_CHAIN = [
  PHASE60F_CONTROL_TOWER_BRAIN_RC_EVIDENCE_TAG,
  PHASE62A_EVIDENCE_GAP_CANDIDATE_EVIDENCE_TAG,
  PHASE62B_EVIDENCE_GAP_DETECTION_EVIDENCE_TAG,
  PHASE62C_SUPPLEMENT_REQUEST_DRAFT_EVIDENCE_TAG,
  PHASE62D_LAWYER_APPROVAL_PORTAL_SYNC_EVIDENCE_TAG,
  PHASE62E_CLIENT_SEND_GATE_EVIDENCE_TAG,
  PHASE62F_EVIDENCE_GAP_AUTO_PLANNER_RC_EVIDENCE_TAG,
] as const;

export const PHASE62F_EVIDENCE_GAP_AUTO_PLANNER_RC_LOCK = {
  phase: "62-F",
  name: "Evidence Gap Auto Planner RC",
  version: PHASE62F_EVIDENCE_GAP_AUTO_PLANNER_RC_VERSION,
  status: "COMPLETE_LOCKED",
  marker: PHASE62F_EVIDENCE_GAP_AUTO_PLANNER_RC_LOCK_MARKER,
  oneLineStandard: PHASE62F_EVIDENCE_GAP_AUTO_PLANNER_RC_ONE_LINE_CRITERION,
  platformStatus: PHASE62F_EVIDENCE_GAP_AUTO_PLANNER_PLATFORM_STATUS,
  masterVerify: PHASE62F_EVIDENCE_GAP_AUTO_PLANNER_RC_MASTER_VERIFY_SCRIPT,
  unitVerify: PHASE62F_EVIDENCE_GAP_AUTO_PLANNER_RC_UNIT_VERIFY_SCRIPT,
  controlTowerBrainVerify: "verify:aibeopchin-control-tower-brain-rc" as const,
  bundledVerifyScripts: PHASE62F_EVIDENCE_GAP_AUTO_PLANNER_RC_BUNDLED_VERIFY_SCRIPTS,
  subPhaseLockMarkers: PHASE62F_SUB_PHASE_LOCK_MARKERS,
  rcGateBoundaries: PHASE62F_RC_GATE_BOUNDARY_MARKERS,
  consolidatedRcBoundaries: PHASE62F_CONSOLIDATED_RC_BOUNDARY_MARKERS,
  evidenceChain: PHASE62F_EVIDENCE_GAP_AUTO_PLANNER_RC_EVIDENCE_CHAIN,
  subPhases: PHASE62F_EVIDENCE_GAP_AUTO_PLANNER_SUB_PHASES,
  finalJudgment: PHASE62F_EVIDENCE_GAP_AUTO_PLANNER_RC_FINAL_JUDGMENT,
  evidenceTag: PHASE62F_EVIDENCE_GAP_AUTO_PLANNER_RC_EVIDENCE_TAG,
  evidenceRefs: [
    "docs/legal-strategy/AIBEOPCHIN_EVIDENCE_GAP_AUTO_PLANNER_RC_LOCK_SUMMARY.md",
    "docs/legal-strategy/AIBEOPCHIN_EVIDENCE_GAP_AUTO_PLANNER_PHASE62.md",
    "docs/project-governance/IMPLEMENTATION_EVIDENCE.md",
  ],
} as const;
