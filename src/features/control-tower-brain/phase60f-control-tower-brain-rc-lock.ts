/**
 * Product Phase 60-F — Control Tower Brain RC lock SSOT.
 */
import {
  PHASE60F_CONSOLIDATED_RC_BOUNDARY_MARKERS,
  PHASE60F_RC_GATE_BOUNDARY_MARKERS,
} from "./phase60f-control-tower-brain-rc.policy";
import { PHASE60A_CONTROL_TOWER_BRAIN_SAFETY_EVIDENCE_TAG } from "./phase60a-control-tower-brain-safety.lock";

export const PHASE60B_ERROR_DETECTION_EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-CONTROL-TOWER-BRAIN-PHASE60B-ERROR-DETECTION" as const;

export const PHASE60C_CONFLICT_DIAGNOSIS_EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-CONTROL-TOWER-BRAIN-PHASE60C-CONFLICT-DIAGNOSIS" as const;

export const PHASE60D_PATCH_PLAN_EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-CONTROL-TOWER-BRAIN-PHASE60D-PATCH-PLAN" as const;

export const PHASE60E_SAFE_AUTO_FIX_EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-CONTROL-TOWER-BRAIN-PHASE60E-SAFE-AUTO-FIX" as const;

export const PHASE60F_CONTROL_TOWER_BRAIN_RC_EVIDENCE_TAG =
  "EVIDENCE-20260524-AIBEOPCHIN-CONTROL-TOWER-BRAIN-PHASE60F-RC-LOCK" as const;

export const PHASE60F_CONTROL_TOWER_BRAIN_RC_LOCK_MARKER =
  "phase60f-control-tower-brain-rc-gate" as const;

export const PHASE60F_CONTROL_TOWER_BRAIN_RC_VERSION = "60-F.1" as const;

export const PHASE60F_CONTROL_TOWER_BRAIN_RC_MASTER_VERIFY_SCRIPT =
  "verify:aibeopchin-control-tower-brain-rc" as const;

export const PHASE60F_CONTROL_TOWER_BRAIN_RC_ONE_LINE_CRITERION =
  "Control Tower Brain은 오류·충돌·증빙 불일치를 탐지·진단·수정안·검증·rollback 계획까지 생성하되, production code·DB·법률 판단·client-visible output·deployment는 승인 게이트와 audit 없이 변경하지 않는다." as const;

export const PHASE60F_CONTROL_TOWER_BRAIN_PLATFORM_STATUS =
  "SELF_HEALING_ENGINEERING_OPS_PLATFORM" as const;

export const PHASE60F_CONTROL_TOWER_BRAIN_SUB_PHASES = {
  "60-A": "Control Tower Brain Safety Boundary",
  "60-B": "Error Detection & Log Ingestion",
  "60-C": "Conflict Diagnosis Engine",
  "60-D": "Patch Plan Generator",
  "60-E": "Safe Auto-Fix Executor",
  "60-F": "Control Tower Brain RC",
} as const;

export const PHASE60F_CONTROL_TOWER_BRAIN_RC_BUNDLED_VERIFY_SCRIPTS = [
  "verify:aibeopchin-control-tower-brain-phase60a",
  "verify:aibeopchin-control-tower-brain-phase60b",
  "verify:aibeopchin-control-tower-brain-phase60c",
  "verify:aibeopchin-control-tower-brain-phase60d",
  "verify:aibeopchin-control-tower-brain-phase60e",
] as const;

export const PHASE60F_CONTROL_TOWER_BRAIN_RC_EVIDENCE_CHAIN = [
  PHASE60A_CONTROL_TOWER_BRAIN_SAFETY_EVIDENCE_TAG,
  PHASE60B_ERROR_DETECTION_EVIDENCE_TAG,
  PHASE60C_CONFLICT_DIAGNOSIS_EVIDENCE_TAG,
  PHASE60D_PATCH_PLAN_EVIDENCE_TAG,
  PHASE60E_SAFE_AUTO_FIX_EVIDENCE_TAG,
  PHASE60F_CONTROL_TOWER_BRAIN_RC_EVIDENCE_TAG,
] as const;

export const PHASE60F_CONTROL_TOWER_BRAIN_RC_LOCK = {
  phase: "60-F",
  name: "Control Tower Brain RC",
  version: PHASE60F_CONTROL_TOWER_BRAIN_RC_VERSION,
  status: "COMPLETE_LOCKED",
  marker: PHASE60F_CONTROL_TOWER_BRAIN_RC_LOCK_MARKER,
  oneLineStandard: PHASE60F_CONTROL_TOWER_BRAIN_RC_ONE_LINE_CRITERION,
  platformStatus: PHASE60F_CONTROL_TOWER_BRAIN_PLATFORM_STATUS,
  adminConsolePath: "/admin/control-tower/brain",
  adminApiBase: "/api/admin/control-tower/brain",
  masterVerify: PHASE60F_CONTROL_TOWER_BRAIN_RC_MASTER_VERIFY_SCRIPT,
  bundledVerifyScripts: PHASE60F_CONTROL_TOWER_BRAIN_RC_BUNDLED_VERIFY_SCRIPTS,
  rcGateBoundaries: PHASE60F_RC_GATE_BOUNDARY_MARKERS,
  consolidatedRcBoundaries: PHASE60F_CONSOLIDATED_RC_BOUNDARY_MARKERS,
  evidenceChain: PHASE60F_CONTROL_TOWER_BRAIN_RC_EVIDENCE_CHAIN,
  finalJudgment:
    "Phase 60-F는 60-A Safety Boundary, 60-B Error Detection, 60-C Conflict Diagnosis, 60-D Patch Plan Generator, 60-E Safe Auto-Fix Executor를 하나의 Control Tower Brain으로 묶고, 위험 변경은 human approval gate와 audit 없이 적용하지 않도록 RC로 봉인했다.",
  evidenceRefs: [
    "docs/platform/AIBEOPCHIN_CONTROL_TOWER_BRAIN_PHASE60_SPEC.md",
    "docs/platform/AIBEOPCHIN_CONTROL_TOWER_BRAIN_RC_LOCK_SUMMARY.md",
    "docs/project-governance/IMPLEMENTATION_EVIDENCE.md",
  ],
} as const;
