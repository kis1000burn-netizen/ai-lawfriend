# Legal Reliability Action Loop — Phase 49-B Graph Gap → Evidence Request Action

## 1. Purpose

Phase 49-B converts claim-evidence-judgment graph gaps into evidence request action candidates. Client-visible evidence submission requests require explicit lawyer approval.

## 2. Scope

- Claim graph gap signal → `EvidenceRequestActionCandidate` (`actionType: EVIDENCE_REQUEST`)
- Lawyer approval / reject / defer
- Client-safe evidence request sanitization
- `NO_UNVERIFIED_EVIDENCE_LABELING` guardrail
- Decision ledger + `SupplementRequest` DRAFT linkage (Phase 15)

## 3. Locked boundaries

`NO_AI_AUTO_ACTION` · `NO_CLIENT_REQUEST_WITHOUT_LAWYER_APPROVAL` · `NO_AUTO_LEGAL_FILING` · `LAWYER_DECISION_LEDGER_REQUIRED` · `NO_CLIENT_VISIBLE_STRATEGY_BY_DEFAULT` · **`NO_UNVERIFIED_EVIDENCE_LABELING`**

## 4. Verification

```bash
npm run verify:aibeopchin-legal-reliability-action-loop-phase49b
```

**선행**: Phase **49-A**

**버전** **`49-B.1`**
