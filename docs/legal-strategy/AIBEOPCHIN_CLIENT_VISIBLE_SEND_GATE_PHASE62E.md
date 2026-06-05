# AI법친 Client-visible Send Gate & Litigation Ops Draft Link — Product Phase 62-E

## Status

COMPLETE · LOCKED · 62-E.1

## One-line Standard

Phase 62-E는 62-D에서 포털 draft로 동기화된 보완요청을 변호사가 최종 발송 승인할 때만 clientVisible·sendAllowed·notificationAllowed를 열고, Litigation Ops task는 DRAFT_LINKED 상태로만 연결하여 실제 실행은 별도 action gate를 거치게 하는 단계다.

## Flow

```
62-D ClientPortalSupplementDraftSync
  ↓
Final Lawyer Approval (FINAL_APPROVE_FOR_CLIENT)
  ↓
ClientVisibleSupplementRequestPayload (clientVisible: true, sendAllowed: false)
  ↓
Send Gate (ENABLE_SEND_GATE)
  ↓
Message Policy Gate (Phase 20)
  ↓
Litigation Ops DRAFT_LINKED (no auto execution)
```

## Core Types

- `FinalLawyerApprovalLedgerEntry`
- `ClientVisibleSupplementRequestPayload`
- `LitigationOpsDraftLink`

## Core APIs

- `approvePortalDraftForClientVisibility()`
- `enableSupplementRequestSendGate()`
- `enableNotificationWithMessagePolicy()`
- `linkSupplementRequestToLitigationOpsDraft()`
- `assertClientVisibleSendGateAllowed()`
- `buildClientVisibleSupplementRequestPayload()`

## Gates

| Stage | clientVisible | sendAllowed | notificationAllowed | autoTaskExecutionAllowed |
|-------|---------------|-------------|---------------------|--------------------------|
| After final approval | true | false | false | false |
| After send gate | true | true | false | false |
| After message policy | true | true | true | false |
| Litigation Ops link | — | — | — | false (DRAFT_LINKED only) |

## Boundaries

- NO_CLIENT_VISIBLE_WITHOUT_FINAL_LAWYER_APPROVAL
- NO_SEND_WITHOUT_SEND_GATE
- NO_NOTIFICATION_WITHOUT_MESSAGE_POLICY
- NO_AUTO_LITIGATION_TASK_EXECUTION
- NO_INTERNAL_STRATEGY_LEAK_TO_CLIENT
- NO_UNAPPROVED_DRAFT_TO_CLIENT_PORTAL
- LAWYER_DECISION_LEDGER_REQUIRED
- CLIENT_VISIBLE_PAYLOAD_AUDIT_REQUIRED
- CONTROL_TOWER_BRAIN_VERIFY_REQUIRED

## Code SSOT

- `src/features/legal-strategy/evidence-gap-planner/phase62e-client-send-gate.schema.ts`
- `src/features/legal-strategy/evidence-gap-planner/phase62e-client-send-gate.policy.ts`
- `src/features/legal-strategy/evidence-gap-planner/phase62e-client-send-gate.service.ts`
- `src/features/legal-strategy/evidence-gap-planner/phase62e-client-send-gate.lock.ts`

## Verification

```bash
npm run verify:aibeopchin-legal-strategy-phase62e
```

Gates:

- `verify:aibeopchin-legal-strategy-phase62d` (prerequisite chain)
- `verify:aibeopchin-control-tower-brain-rc`

## Next

**Phase 62-F — Evidence Gap Auto Planner RC**
