# AI법친 Legal Reliability Production Role Smoke Runbook

## Phase

53-C Production Role Smoke & Client Boundary Live Check

## Preconditions

- Phase 53-A Production Go-Live Approval Gate LOCKED
- Phase 53-B Production Migration Apply & Live Status Evidence LOCKED
- Production app URL confirmed
- Dedicated CLIENT / LAWYER / STAFF / ADMIN test accounts prepared
- No shared test account
- Role identity confirmed before smoke

## Required Role Accounts

- CLIENT:
- LAWYER:
- STAFF:
- ADMIN:

## Required Smoke

### CLIENT

- [ ] Client portal access allowed
- [ ] Lawyer Workbench denied (`CLIENT cannot access Lawyer Workbench`)
- [ ] Legal Reliability internal APIs denied
- [ ] Action Operations APIs denied
- [ ] Go-Live Control APIs denied
- [ ] Internal strategy graph denied

### LAWYER

- [ ] Lawyer Workbench allowed
- [ ] Action Operations Queue allowed
- [ ] Completion without review denied
- [ ] Go-Live Approval denied
- [ ] Production Migration Evidence admin API denied

### STAFF

- [ ] Staff allowed areas verified
- [ ] Admin-only go-live control denied
- [ ] Feature flag kill switch denied
- [ ] Privilege escalation blocked

### ADMIN

- [ ] Go-Live Control allowed
- [ ] Role smoke evidence allowed
- [ ] Production migration evidence allowed
- [ ] Feature flag kill switch allowed

## Evidence

- Timestamp:
- Operator:
- Production URL masked:
- Tenant ref:
- Case ref:
- Denied access evidence refs:
- Allowed access evidence refs:
- AuthZ audit log refs:

## Final Rule

Production go-live cannot proceed if CLIENT can access internal Legal Reliability, Action Operations, Dashboard, or Go-Live Control surfaces.

Boundary markers: `NO_CLIENT_ACCESS_TO_INTERNAL_LEGAL_RELIABILITY` · `NO_CLIENT_ACCESS_TO_ACTION_OPERATIONS` · `NO_CLIENT_ACCESS_TO_GO_LIVE_CONTROL`
