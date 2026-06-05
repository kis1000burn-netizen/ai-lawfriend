/**
 * Product Phase 63-F — Counter-Argument Draft Engine RC lock SSOT.
 * @see docs/legal-strategy/AIBEOPCHIN_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_LOCK_SUMMARY.md
 */
import {
  PHASE63F_CONSOLIDATED_RC_BOUNDARY_MARKERS,
  PHASE63F_RC_GATE_BOUNDARY_MARKERS,
} from "./phase63f-counter-argument-draft-engine-rc.policy";
import {
  PHASE63A_OPPONENT_ARGUMENT_EVIDENCE_TAG,
  PHASE63A_OPPONENT_ARGUMENT_LOCK_MARKER,
} from "./phase63a-opponent-argument.lock";
import {
  PHASE63B_COUNTER_ARGUMENT_CANDIDATE_EVIDENCE_TAG,
  PHASE63B_COUNTER_ARGUMENT_CANDIDATE_LOCK_MARKER,
} from "./phase63b-counter-argument-candidate.lock";
import {
  PHASE63C_RISK_BACKFIRE_CHECK_EVIDENCE_TAG,
  PHASE63C_RISK_BACKFIRE_CHECK_LOCK_MARKER,
} from "./phase63c-risk-backfire-check.lock";
import {
  PHASE63D_DRAFT_PARAGRAPH_GENERATOR_EVIDENCE_TAG,
  PHASE63D_DRAFT_PARAGRAPH_GENERATOR_LOCK_MARKER,
} from "./phase63d-draft-paragraph-generator.lock";
import {
  PHASE63E_LAWYER_REVIEW_ADOPTION_EVIDENCE_TAG,
  PHASE63E_LAWYER_REVIEW_ADOPTION_LOCK_MARKER,
} from "./phase63e-lawyer-review-adoption.lock";
import { PHASE60F_CONTROL_TOWER_BRAIN_RC_EVIDENCE_TAG } from "@/features/control-tower-brain/phase60f-control-tower-brain-rc-lock";

export const PHASE63F_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_LOCK_MARKER =
  "phase63f-counter-argument-draft-engine-rc-gate" as const;

export const PHASE63F_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_EVIDENCE_TAG =
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-STRATEGY-PHASE63F-COUNTER-ARGUMENT-DRAFT-ENGINE-RC" as const;

export const PHASE63F_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_VERSION = "63-F.1" as const;

export const PHASE63F_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_MASTER_VERIFY_SCRIPT =
  "verify:aibeopchin-counter-argument-draft-engine-rc" as const;

export const PHASE63F_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_UNIT_VERIFY_SCRIPT =
  "verify:aibeopchin-legal-strategy-phase63f" as const;

export const PHASE63F_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_ONE_LINE_CRITERION =
  "Phase 63-F는 63-A~63-E 전체를 Counter-Argument Draft Engine으로 묶어, 상대방 주장 구조화 → 반박 후보 생성 → 역효과 점검 → 문단 초안 생성 → 변호사 채택/수정/거절 → 문서 반영 후보 승격까지의 흐름이 sourceTrace, auditRef, Lawyer Decision Ledger, Control Tower Brain 검증 아래에서만 작동하도록 RC로 봉인하는 단계다." as const;

export const PHASE63F_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_FINAL_JUDGMENT =
  "Phase 63-F는 63-A OpponentArgument, 63-B CounterArgumentCandidate, 63-C BackfireRiskReport, 63-D CounterArgumentDraftParagraph, 63-E Lawyer Review & Adoption Gate를 Counter-Argument Draft Engine RC로 묶었다. 상대방 주장 구조화부터 문서 반영 후보 승격까지 모든 단계는 sourceTrace, auditRef, BackfireRiskCheck, Lawyer Decision Ledger, Control Tower Brain 검증 아래에서만 진행되며, AI 최종 법률 주장, 최종 문서 문구, 자동 제출, 의뢰인 기본 노출은 차단된다." as const;

export const PHASE63F_COUNTER_ARGUMENT_DRAFT_ENGINE_PLATFORM_STATUS =
  "COUNTER_ARGUMENT_DRAFT_ENGINE_RC_LOCKED" as const;

export const PHASE63F_COUNTER_ARGUMENT_DRAFT_ENGINE_SUB_PHASES = {
  "63-A": "Opponent Argument Schema",
  "63-B": "Counter-Argument Candidate Builder",
  "63-C": "Risk & Backfire Check",
  "63-D": "Draft Paragraph Generator",
  "63-E": "Lawyer Review & Adoption Gate",
  "63-F": "Counter-Argument Draft Engine RC",
} as const;

export const PHASE63F_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_BUNDLED_VERIFY_SCRIPTS = [
  "verify:aibeopchin-control-tower-brain-rc",
  "verify:aibeopchin-legal-strategy-phase63a",
  "verify:aibeopchin-legal-strategy-phase63b",
  "verify:aibeopchin-legal-strategy-phase63c",
  "verify:aibeopchin-legal-strategy-phase63d",
  "verify:aibeopchin-legal-strategy-phase63e",
] as const;

export const PHASE63F_SUB_PHASE_LOCK_MARKERS = [
  PHASE63A_OPPONENT_ARGUMENT_LOCK_MARKER,
  PHASE63B_COUNTER_ARGUMENT_CANDIDATE_LOCK_MARKER,
  PHASE63C_RISK_BACKFIRE_CHECK_LOCK_MARKER,
  PHASE63D_DRAFT_PARAGRAPH_GENERATOR_LOCK_MARKER,
  PHASE63E_LAWYER_REVIEW_ADOPTION_LOCK_MARKER,
] as const;

export const PHASE63F_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_EVIDENCE_CHAIN = [
  PHASE60F_CONTROL_TOWER_BRAIN_RC_EVIDENCE_TAG,
  PHASE63A_OPPONENT_ARGUMENT_EVIDENCE_TAG,
  PHASE63B_COUNTER_ARGUMENT_CANDIDATE_EVIDENCE_TAG,
  PHASE63C_RISK_BACKFIRE_CHECK_EVIDENCE_TAG,
  PHASE63D_DRAFT_PARAGRAPH_GENERATOR_EVIDENCE_TAG,
  PHASE63E_LAWYER_REVIEW_ADOPTION_EVIDENCE_TAG,
  PHASE63F_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_EVIDENCE_TAG,
] as const;

export const PHASE63F_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_LOCK = {
  phase: "63-F",
  name: "Counter-Argument Draft Engine RC",
  version: PHASE63F_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_VERSION,
  status: "COMPLETE_LOCKED",
  marker: PHASE63F_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_LOCK_MARKER,
  oneLineStandard: PHASE63F_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_ONE_LINE_CRITERION,
  platformStatus: PHASE63F_COUNTER_ARGUMENT_DRAFT_ENGINE_PLATFORM_STATUS,
  masterVerify: PHASE63F_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_MASTER_VERIFY_SCRIPT,
  unitVerify: PHASE63F_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_UNIT_VERIFY_SCRIPT,
  controlTowerBrainVerify: "verify:aibeopchin-control-tower-brain-rc" as const,
  bundledVerifyScripts: PHASE63F_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_BUNDLED_VERIFY_SCRIPTS,
  subPhaseLockMarkers: PHASE63F_SUB_PHASE_LOCK_MARKERS,
  rcGateBoundaries: PHASE63F_RC_GATE_BOUNDARY_MARKERS,
  consolidatedRcBoundaries: PHASE63F_CONSOLIDATED_RC_BOUNDARY_MARKERS,
  evidenceChain: PHASE63F_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_EVIDENCE_CHAIN,
  subPhases: PHASE63F_COUNTER_ARGUMENT_DRAFT_ENGINE_SUB_PHASES,
  finalJudgment: PHASE63F_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_FINAL_JUDGMENT,
  evidenceTag: PHASE63F_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_EVIDENCE_TAG,
  evidenceRefs: [
    "docs/legal-strategy/AIBEOPCHIN_COUNTER_ARGUMENT_DRAFT_ENGINE_RC_LOCK_SUMMARY.md",
    "docs/legal-strategy/AIBEOPCHIN_COUNTER_ARGUMENT_DRAFT_ENGINE_PHASE63.md",
    "docs/project-governance/IMPLEMENTATION_EVIDENCE.md",
  ],
} as const;
