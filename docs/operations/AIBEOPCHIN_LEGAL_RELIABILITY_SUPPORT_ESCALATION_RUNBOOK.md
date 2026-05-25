# AI법친 Legal Reliability Support / Ops Escalation Runbook

## Phase

54-E Support / Ops Escalation Readiness

## Purpose

This runbook defines the human response system for Legal Reliability production stabilization incidents.

A system is not production-stable until people know:

- who owns the incident
- who approves the response
- who communicates with the customer
- who performs rollback
- who records the audit
- who closes the incident

## Preconditions

- Phase 54-A Monitoring Baseline COMPLETE · LOCKED
- Phase 54-B Incident Severity COMPLETE · LOCKED
- Phase 54-C Hotfix Governance COMPLETE · LOCKED
- Phase 54-D Degraded Mode COMPLETE · LOCKED

## Required Roles

### OPERATOR

Responsible for initial triage, severity confirmation, and escalation start.

### ENGINEERING_LEAD

Responsible for technical diagnosis, hotfix feasibility, rollback feasibility, and patch verification.

### LEGAL_OPS_LEAD

Responsible for legal workflow impact review, client-safe wording approval, and privileged content boundary.

### CUSTOMER_SUPPORT_OWNER

Responsible for customer ticket handling, customer-safe message delivery, and support closeout.

### ROLLBACK_OWNER

Responsible for rollback readiness and execution coordination.

### ADMIN_APPROVER

Responsible for SEV-0/SEV-1 emergency approval.

## Response Windows

- SEV-0: acknowledge within 5m, mitigate within 15m, immediate escalation
- SEV-1: acknowledge within 10m, mitigate within 30m, escalate within 15m
- SEV-2: acknowledge within 30m, mitigate within 2h, escalate within 1h
- SEV-3: acknowledge within 2h, mitigate within 1 business day
- SEV-4: acknowledge within 1 business day, regular patch path

## Customer-safe Message Rule

Customer-facing communication must not include:

- internal legal strategy
- Risk Radar detail
- Graph Gap detail
- privileged review notes
- unreviewed evidence judgment
- internal incident mechanics
- blame language

Allowed content:

- service impact summary
- affected feature category
- temporary workaround
- expected next update
- support contact
- safe reassurance without legal conclusion

## Required Drills

Before 54-E lock:

- SEV-0 escalation drill
- Degraded mode escalation drill
- Hotfix escalation drill
- Customer message drill
- Rollback owner contact verification

## Required Verification

```bash
npm run verify:aibeopchin-legal-reliability-support-escalation
```

## Final Rule

Support readiness is not a contact list.  
It is a governed response chain with owners, response windows, customer-safe communication, audit, drills, and closeout review.

If support escalation readiness is missing, Phase 54-F Production Stabilization RC cannot be evaluated consistently.
