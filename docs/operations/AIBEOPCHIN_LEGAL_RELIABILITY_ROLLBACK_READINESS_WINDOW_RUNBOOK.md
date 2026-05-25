# AI법친 Legal Reliability Rollback Readiness Window Runbook

## Phase

53-E Rollback Readiness Window (Post-Go-Live)

## Purpose

Maintain verified rollback and read-only degrade capability during the post-go-live observation window (T+0 ~ T+24h).

## Rollback Owner

- Rollback owner must remain available during the monitoring window.
- rollback owner available during window
- Escalation path must be documented before window start.

## Feature Flags (Disable / Read-only)

Verify each flag can be toggled without redeploy:

- `LEGAL_RELIABILITY_ACTION_LOOP_ENABLED`
- `LEGAL_RELIABILITY_ACTION_OPERATIONS_ENABLED`
- `LEGAL_RELIABILITY_ACTION_OPERATIONS_DASHBOARD_ENABLED`
- `LEGAL_RELIABILITY_ACTION_OPERATIONS_WRITE_ENABLED`
- `LEGAL_RELIABILITY_ACTION_OPERATIONS_COMPLETION_ENABLED`

## Read-only Degrade

- [ ] Write paths can be disabled while read paths remain available where required
- [ ] read-only degrade verified during window
- [ ] No auto completion after degrade
- [ ] No auto filing or submission after degrade

## Rollback Triggers

Immediate rollback or degraded mode if any of the following occurs:

- CLIENT internal access violation
- Action Loop or Operations error spike
- AuditLog gap
- Auto completion, auto filing, or auto submission signal
- Unreviewed evidence downstream signal
- Rollback flag failure

## Rollback Procedure

1. Notify rollback owner and operator on-call.
2. Disable write/completion flags first.
3. Disable Action Loop and Action Operations flags if boundary violation persists.
4. Record incident refs and begin RCA if required.
5. Do not close 53-E until RCA is complete and operator sign-off is recorded.

## Evidence

- Rollback runbook ref:
- Flag toggle evidence refs:
- Rollback owner availability log:
- Degraded mode activation timestamp (if any):
- Rollback execution timestamp (if any):
