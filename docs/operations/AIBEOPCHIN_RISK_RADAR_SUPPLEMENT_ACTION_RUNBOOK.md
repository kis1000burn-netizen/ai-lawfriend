# Risk Radar → Supplement Request Action Runbook (Product Phase **49-A**)

## Operator checklist

1. Phase 48 Lawyer Workbench UX RC PASS (`verify:aibeopchin-legal-reliability-lawyer-workbench-rc`)
2. Risk Radar panel → **보완요청 후보 만들기** → candidate drawer review
3. Lawyer decision → approve creates `SupplementRequest` DRAFT only (not SENT)
4. `npm run verify:aibeopchin-legal-reliability-action-loop-phase49a`

## Locked boundaries

**NO_AI_AUTO_ACTION / NO_CLIENT_REQUEST_WITHOUT_LAWYER_APPROVAL / NO_AUTO_LEGAL_FILING / NO_UNREVIEWED_DRAFT_CONTEXT / LAWYER_DECISION_LEDGER_REQUIRED / NO_CLIENT_VISIBLE_STRATEGY_BY_DEFAULT**

## API

- `POST /api/cases/:caseId/legal-reliability/action-loop/risk-radar/:signalId/supplement-candidates`
- `GET /api/cases/:caseId/legal-reliability/action-loop/supplement-candidates`
- `POST /api/cases/:caseId/legal-reliability/action-loop/supplement-candidates/:candidateId/decision`

**버전** **`49-A.1`**
