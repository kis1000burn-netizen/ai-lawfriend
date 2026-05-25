# AI법친 Legal Reliability Hotfix / Emergency Patch Governance Runbook

## Phase

54-C Hotfix / Emergency Patch Governance

## Purpose

This runbook defines when hotfixes and emergency patches are allowed during production stabilization.

Hotfixes are fast but never uncontrolled.

## Preconditions

- Phase 54-A Monitoring Baseline COMPLETE · LOCKED
- Phase 54-B Incident Severity COMPLETE · LOCKED
- Incident severity assigned
- Rollback owner available

## Severity-based Patch Rules

### SEV-0

Allowed:

- EMERGENCY_PATCH
- HOTFIX
- ROLLBACK_ONLY

Required:

- Immediate approval chain
- Rollback owner acknowledgement
- AuditLog
- Customer impact record
- Customer communication evaluation
- Post-patch verify

### SEV-1

Allowed:

- EMERGENCY_PATCH
- HOTFIX
- ROLLBACK_ONLY

Required:

- Approval chain
- Rollback plan
- Production smoke if boundary or automation risk is involved

### SEV-2

Allowed:

- HOTFIX
- CONFIG_ONLY
- ROLLBACK_ONLY

Required:

- Scope-limited patch
- Queue/Action Loop verification
- Post-patch verify

### SEV-3

Allowed:

- HOTFIX
- STANDARD_PATCH
- CONFIG_ONLY

Required:

- Hotfix justification
- Performance baseline comparison
- Operator approval

### SEV-4

Allowed:

- STANDARD_PATCH
- CONFIG_ONLY

Emergency patch is not allowed for SEV-4.

## Migration Hotfix Rule

Any hotfix including database migration requires extra approval.

Required:

- Migration impact review
- Rollback feasibility review
- Extra migration approval
- Pre/post migration status evidence

## Required Verification

```bash
npm run verify:aibeopchin-legal-reliability-hotfix-governance
```

## Closeout

A hotfix is not complete until:

- post-patch verify passes
- rollback verify passes
- customer impact is recorded
- AuditLog is written
- closeout review is completed

## Final Rule

Emergency patch speed does not remove governance.

Severity, approval, scope, rollback, verify, audit, customer impact, and closeout must all be connected.

If hotfix governance is missing, Phase 54-D degraded mode and Phase 54-E support escalation cannot be evaluated consistently.
