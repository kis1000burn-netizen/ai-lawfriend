# Legal Reliability Action Loop — Phase 49-A Risk Radar → Supplement Request Action

## 1. Purpose

Phase 49-A converts lawyer-facing Risk Radar signals from the Legal Reliability Lawyer Workbench into supplement request action candidates. Client-visible supplement requests require explicit lawyer approval.

## 2. Scope

- Risk Radar signal → `SupplementActionCandidate`
- Lawyer approval / edit / reject / defer decision flow
- Client-safe supplement request body sanitization
- Decision ledger (`LegalReliabilityActionDecisionLedger`)
- `SupplementRequest` DRAFT linkage (Phase 15)
- AuditLog events

## 3. Non-goals

- No AI auto-send of supplement requests
- No court filing / e-filing integration
- No direct Phase 20 messaging invocation from 49-A

## 4. Source: Phase 48 Risk Radar

Input: `RiskRadarSignal` from Phase 48-B panel (`sourcePhase: "48-B"`).

## 5. Supplement Action Candidate

Status flow: `CANDIDATE` → lawyer decision → `SUPPLEMENT_DRAFT_CREATED` (on approve).

Forbidden: `CANDIDATE` → `SUPPLEMENT_SENT` without lawyer approval.

## 6. Lawyer Approval Gate

`NO_CLIENT_REQUEST_WITHOUT_LAWYER_APPROVAL` — only `APPROVE_SUPPLEMENT_REQUEST` / `EDIT_SUPPLEMENT_REQUEST` creates `SupplementRequest` DRAFT.

## 7. Client-safe Request Sanitization

`sanitizeRiskRadarSignalForClientRequest()` removes internal strategy text before client body candidate is stored.

## 8. Decision Ledger

Every approve / edit / reject / defer writes `LegalReliabilityActionDecisionLedger`.

## 9. Supplement Flow Linkage

Approved candidates create `SupplementRequest` DRAFT with:

- `sourceType`: `LEGAL_RELIABILITY_RISK_RADAR`
- item `sourceMarker`: `phase49a-legal-reliability-risk-radar-supplement-action`

## 10. AuditLog

- `LEGAL_RELIABILITY_ACTION_CANDIDATE_CREATED`
- `LEGAL_RELIABILITY_ACTION_CANDIDATE_APPROVED` / `_EDITED` / `_REJECTED`
- `LEGAL_RELIABILITY_SUPPLEMENT_DRAFT_CREATED`
- `LEGAL_RELIABILITY_ACTION_CLIENT_VISIBILITY_BLOCKED`

## 11. Guardrails

`NO_AI_AUTO_ACTION` · `NO_CLIENT_REQUEST_WITHOUT_LAWYER_APPROVAL` · `NO_AUTO_LEGAL_FILING` · `NO_UNREVIEWED_DRAFT_CONTEXT` · `LAWYER_DECISION_LEDGER_REQUIRED` · `NO_CLIENT_VISIBLE_STRATEGY_BY_DEFAULT`

## 12. Test Matrix

See `phase49a-risk-radar-supplement-action.test.ts` — sanitization, forbidden transitions, strategy text blocking.

## 13. RC Readiness

Prerequisite: Product Phase **48-F** (`verify:aibeopchin-legal-reliability-lawyer-workbench-rc`).

**Verification**:

```bash
npm run verify:aibeopchin-legal-reliability-action-loop-phase49a
```

**버전** **`49-A.1`**
