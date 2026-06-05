/**
 * Product Phase 62-E — Client-visible Send Gate & Litigation Ops Draft Link lock SSOT.
 */
import {
  PHASE62E_BOUNDARY_MARKERS,
  PHASE62E_CLIENT_SEND_GATE_VERIFY_SCRIPT,
  PHASE62E_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT,
  PHASE62E_ONE_LINE_STANDARD,
} from "./phase62e-client-send-gate.policy";
import { PHASE62E_CLIENT_SEND_GATE_VERSION } from "./phase62e-client-send-gate.schema";
import { PHASE62D_LAWYER_APPROVAL_PORTAL_SYNC_EVIDENCE_TAG } from "./phase62d-lawyer-approval-portal-sync.lock";

export const PHASE62E_CLIENT_SEND_GATE_LOCK_MARKER =
  "phase62e-client-send-gate-lock" as const;

export const PHASE62E_CLIENT_SEND_GATE_EVIDENCE_TAG =
  "EVIDENCE-20260526-AIBEOPCHIN-LEGAL-STRATEGY-PHASE62E-CLIENT-VISIBLE-SEND-GATE" as const;

export const PHASE62E_CLIENT_SEND_GATE_FINAL_JUDGMENT =
  "Phase 62-E는 62-D에서 포털 draft로 동기화된 보완요청에 대해 최종 변호사 승인과 send gate를 통과한 항목만 의뢰인에게 노출 가능하도록 고정했다." as const;

export const PHASE62E_CLIENT_SEND_GATE_LOCK = {
  phase: "62-E",
  name: "Client-visible Send Gate & Litigation Ops Draft Link",
  version: PHASE62E_CLIENT_SEND_GATE_VERSION,
  status: "COMPLETE_LOCKED",
  marker: PHASE62E_CLIENT_SEND_GATE_LOCK_MARKER,
  oneLineStandard: PHASE62E_ONE_LINE_STANDARD,
  lockedBoundaries: PHASE62E_BOUNDARY_MARKERS,
  verify: PHASE62E_CLIENT_SEND_GATE_VERIFY_SCRIPT,
  controlTowerBrainVerify: PHASE62E_CONTROL_TOWER_BRAIN_VERIFY_SCRIPT,
  prereqEvidenceTags: [PHASE62D_LAWYER_APPROVAL_PORTAL_SYNC_EVIDENCE_TAG],
  litigationOpsLinkStatus: "DRAFT_LINKED" as const,
  messagingPolicyMarker: "phase20-client-messaging-policy" as const,
  finalJudgment: PHASE62E_CLIENT_SEND_GATE_FINAL_JUDGMENT,
  evidenceTag: PHASE62E_CLIENT_SEND_GATE_EVIDENCE_TAG,
  evidenceRefs: [
    "docs/legal-strategy/AIBEOPCHIN_CLIENT_VISIBLE_SEND_GATE_PHASE62E.md",
    "src/features/legal-strategy/evidence-gap-planner/phase62e-client-send-gate.schema.ts",
    "src/features/legal-strategy/evidence-gap-planner/phase62e-client-send-gate.policy.ts",
    "src/features/legal-strategy/evidence-gap-planner/phase62e-client-send-gate.service.ts",
  ],
} as const;
