# AI법친 Legal Reliability Production Role Smoke Checklist

## Phase

**53-C** Production Role Smoke & Client Boundary Live Check

**Marker**: `phase53c-production-role-smoke-checklist`

## Dependency

- [ ] Phase 53-A approval gate locked
- [ ] Phase 53-B production migration evidence locked
- [ ] Production app target confirmed
- [ ] Production tenant/test case confirmed

## Test Accounts

- [ ] CLIENT account prepared
- [ ] LAWYER account prepared
- [ ] STAFF account prepared
- [ ] ADMIN account prepared
- [ ] No shared account used
- [ ] Role identity confirmed

## Role matrix

| Area | CLIENT | LAWYER | STAFF | ADMIN |
| --- | --- | --- | --- | --- |
| Client Portal | ALLOW | READ_ONLY | READ_ONLY | ALLOW |
| Legal Reliability Workbench | DENY | ALLOW | ALLOW | ALLOW |
| Risk Radar / Graph Gap Internal View | DENY | ALLOW | ALLOW | ALLOW |
| Action Loop Review | DENY | ALLOW | READ_ONLY | ALLOW |
| Action Operations Queue | DENY | ALLOW | ALLOW | ALLOW |
| Action Operations Dashboard | DENY | ALLOW | ALLOW | ALLOW |
| Completion Review | DENY | ALLOW | DENY | ALLOW |
| Go-Live Approval | DENY | DENY | DENY | ALLOW |
| Production Migration Evidence | DENY | DENY | READ_ONLY | ALLOW |
| Feature Flag Kill Switch | DENY | DENY | DENY | ALLOW |

## CLIENT Boundary

- [ ] CLIENT can access client portal
- [ ] CLIENT cannot access Lawyer Workbench
- [ ] CLIENT cannot access Legal Reliability internal APIs
- [ ] CLIENT cannot access Action Loop APIs
- [ ] CLIENT cannot access Action Operations Queue/Dashboard
- [ ] CLIENT cannot access Go-Live Control
- [ ] CLIENT cannot access internal strategy graph

## LAWYER Boundary

- [ ] LAWYER can access Lawyer Workbench
- [ ] LAWYER can access Action Operations Queue
- [ ] LAWYER cannot access production go-live approval admin API
- [ ] LAWYER cannot bypass review-completion boundary

## STAFF Boundary

- [ ] STAFF access matches policy
- [ ] STAFF cannot access ADMIN-only go-live approval
- [ ] STAFF cannot operate feature flag kill switch
- [ ] STAFF cannot escalate privilege

## ADMIN Boundary

- [ ] ADMIN can access go-live control
- [ ] ADMIN can access production migration evidence
- [ ] ADMIN can operate approved admin-only checks

## Audit Evidence

- [ ] Denied access events recorded
- [ ] Allowed access events recorded
- [ ] AuthZ audit log reference recorded
- [ ] Smoke output reference recorded

## Final Gate

Production role smoke locked:

- [ ] YES
- [ ] NO

Blocked reasons:
