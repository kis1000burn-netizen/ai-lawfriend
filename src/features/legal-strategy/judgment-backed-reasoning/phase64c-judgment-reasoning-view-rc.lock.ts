/**
 * Product Phase 64-C — Judgment Reasoning View RC lock SSOT.
 * @see docs/legal-strategy/AIBEOPCHIN_JUDGMENT_REASONING_VIEW_RC_LOCK_SUMMARY_PHASE64C.md
 */
import {
  PHASE64C_CONSOLIDATED_RC_BOUNDARY_MARKERS,
  PHASE64C_RC_GATE_BOUNDARY_MARKERS,
} from "./phase64c-judgment-reasoning-view-rc.policy";
import {
  PHASE64A_JUDGMENT_REASONING_SOURCE_MAP_EVIDENCE_TAG,
  PHASE64A_JUDGMENT_REASONING_SOURCE_MAP_LOCK_MARKER,
} from "./phase64a-judgment-reasoning-source-map.lock";
import {
  PHASE64B_JUDGMENT_REASONING_VIEW_EVIDENCE_TAG,
  PHASE64B_JUDGMENT_REASONING_VIEW_LOCK_MARKER,
} from "./phase64b-judgment-reasoning-view.lock";
import { PHASE60F_CONTROL_TOWER_BRAIN_RC_EVIDENCE_TAG } from "@/features/control-tower-brain/phase60f-control-tower-brain-rc-lock";

export const PHASE64C_JUDGMENT_REASONING_VIEW_RC_LOCK_MARKER =
  "phase64c-judgment-reasoning-view-rc-gate" as const;

export const PHASE64C_JUDGMENT_REASONING_VIEW_RC_EVIDENCE_TAG =
  "EVIDENCE-20260605-AIBEOPCHIN-LEGAL-STRATEGY-PHASE64C-JUDGMENT-REASONING-VIEW-RC" as const;

export const PHASE64C_JUDGMENT_REASONING_VIEW_RC_VERSION = "64-C.1" as const;

export const PHASE64C_JUDGMENT_REASONING_VIEW_RC_MASTER_VERIFY_SCRIPT =
  "verify:aibeopchin-judgment-backed-reasoning-rc" as const;

export const PHASE64C_JUDGMENT_REASONING_VIEW_RC_UNIT_VERIFY_SCRIPT =
  "verify:aibeopchin-legal-strategy-phase64c" as const;

export const PHASE64C_JUDGMENT_REASONING_VIEW_RC_ONE_LINE_CRITERION =
  "Phase 64-C는 64-A~64-B 전체를 Judgment-backed Reasoning View로 묶어, 공부호 항목·판례·법령·sourceTrace 근거 추적부터 변호사 검토용 View 생성까지의 흐름이 canonical source, sourceTrace, uncertainty panel, 변호사 검토 필수, Control Tower Brain 검증 아래에서만 작동하도록 RC로 봉인하는 단계다." as const;

export const PHASE64C_JUDGMENT_REASONING_VIEW_RC_FINAL_JUDGMENT =
  "Phase 64-C는 64-A JudgmentReasoningSourceMap, 64-B JudgmentReasoningView를 Judgment-backed Reasoning View RC로 묶었다. 공부호 항목·판례·법령·실시간 승인 신호·sourceTrace 추적부터 변호사 검토용 View 변환까지 모든 단계는 canonical source, sourceTrace, uncertainty signal, Lawyer Review, Control Tower Brain 검증 아래에서만 진행되며, sourceTrace 없는 View, canonical source 없는 판례 카드, 승패 확정 표현, 미승인 signal 권위화, 의뢰인 기본 노출은 차단된다." as const;

export const PHASE64C_JUDGMENT_BACKED_REASONING_PLATFORM_STATUS =
  "JUDGMENT_BACKED_REASONING_RC_LOCKED" as const;

export const PHASE64C_JUDGMENT_BACKED_REASONING_SUB_PHASES = {
  "64-A": "Judgment Reasoning Source Map Schema",
  "64-B": "Judgment Reasoning View Builder",
  "64-C": "Judgment-backed Reasoning View RC",
} as const;

export const PHASE64C_JUDGMENT_REASONING_VIEW_RC_BUNDLED_VERIFY_SCRIPTS = [
  "verify:aibeopchin-control-tower-brain-rc",
  "verify:aibeopchin-legal-strategy-phase64a",
  "verify:aibeopchin-legal-strategy-phase64b",
] as const;

export const PHASE64C_SUB_PHASE_LOCK_MARKERS = [
  PHASE64A_JUDGMENT_REASONING_SOURCE_MAP_LOCK_MARKER,
  PHASE64B_JUDGMENT_REASONING_VIEW_LOCK_MARKER,
] as const;

export const PHASE64C_JUDGMENT_REASONING_VIEW_RC_EVIDENCE_CHAIN = [
  PHASE60F_CONTROL_TOWER_BRAIN_RC_EVIDENCE_TAG,
  PHASE64A_JUDGMENT_REASONING_SOURCE_MAP_EVIDENCE_TAG,
  PHASE64B_JUDGMENT_REASONING_VIEW_EVIDENCE_TAG,
  PHASE64C_JUDGMENT_REASONING_VIEW_RC_EVIDENCE_TAG,
] as const;

export const PHASE64C_JUDGMENT_REASONING_VIEW_RC_LOCK = {
  phase: "64-C",
  name: "Judgment-backed Reasoning View RC",
  version: PHASE64C_JUDGMENT_REASONING_VIEW_RC_VERSION,
  status: "COMPLETE_LOCKED",
  marker: PHASE64C_JUDGMENT_REASONING_VIEW_RC_LOCK_MARKER,
  oneLineStandard: PHASE64C_JUDGMENT_REASONING_VIEW_RC_ONE_LINE_CRITERION,
  platformStatus: PHASE64C_JUDGMENT_BACKED_REASONING_PLATFORM_STATUS,
  masterVerify: PHASE64C_JUDGMENT_REASONING_VIEW_RC_MASTER_VERIFY_SCRIPT,
  unitVerify: PHASE64C_JUDGMENT_REASONING_VIEW_RC_UNIT_VERIFY_SCRIPT,
  controlTowerBrainVerify: "verify:aibeopchin-control-tower-brain-rc" as const,
  bundledVerifyScripts: PHASE64C_JUDGMENT_REASONING_VIEW_RC_BUNDLED_VERIFY_SCRIPTS,
  subPhaseLockMarkers: PHASE64C_SUB_PHASE_LOCK_MARKERS,
  rcGateBoundaries: PHASE64C_RC_GATE_BOUNDARY_MARKERS,
  consolidatedRcBoundaries: PHASE64C_CONSOLIDATED_RC_BOUNDARY_MARKERS,
  evidenceChain: PHASE64C_JUDGMENT_REASONING_VIEW_RC_EVIDENCE_CHAIN,
  subPhases: PHASE64C_JUDGMENT_BACKED_REASONING_SUB_PHASES,
  finalJudgment: PHASE64C_JUDGMENT_REASONING_VIEW_RC_FINAL_JUDGMENT,
  evidenceTag: PHASE64C_JUDGMENT_REASONING_VIEW_RC_EVIDENCE_TAG,
  evidenceRefs: [
    "docs/legal-strategy/AIBEOPCHIN_JUDGMENT_REASONING_VIEW_RC_LOCK_SUMMARY_PHASE64C.md",
    "docs/legal-strategy/AIBEOPCHIN_JUDGMENT_REASONING_SOURCE_MAP_PHASE64A.md",
    "docs/legal-strategy/AIBEOPCHIN_JUDGMENT_REASONING_VIEW_BUILDER_PHASE64B.md",
    "docs/project-governance/IMPLEMENTATION_EVIDENCE.md",
  ],
} as const;
