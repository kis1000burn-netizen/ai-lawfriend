# AI법친 Legal Reliability Customer-safe Degraded Mode Runbook

## Phase

54-D Customer-safe Rollout Window / Degraded Mode

## Purpose

Phase 54-D defines how AI법친 Legal Reliability can safely continue operating during incidents without shutting down the entire service.

The goal is not full shutdown.  
The goal is customer-safe partial operation.

## Preconditions

- Phase 54-B Incident Severity COMPLETE · LOCKED
- Phase 54-C Hotfix Governance COMPLETE · LOCKED
- Incident severity assigned
- Operator available
- Feature flag controls available

## Degraded Mode Types

### READ_ONLY

Use when write operations are unsafe but customer or lawyer viewing can continue.

### ACTION_LOOP_DISABLED

Use when Risk Radar or Graph Gap action creation may be unsafe.

### OPERATIONS_WRITE_DISABLED

Use when Action Operations queue updates may be unsafe.

### COMPLETION_DISABLED

Use when completion review, downstream transition, or evidence usage may be unsafe.

### DASHBOARD_READ_ONLY

Use when dashboard display is safe but mutation is unsafe.

### TENANT_ISOLATED

Use when the issue affects a specific tenant.

### FEATURE_PARTIAL_DISABLED

Use when a specific feature is unsafe but the rest of the service remains safe.

### FULL_SAFE_MODE

Use for SEV-0 or high-risk incidents where customer-safe operation requires broad restrictions.

## Client-safe Message Rule

Client-facing messages must not include:

- internal strategy
- Risk Radar detail
- Graph Gap detail
- internal incident details
- privileged review notes
- unreviewed evidence judgment

## Recovery Rule

Do not exit degraded mode until:

- error rate returns to baseline
- latency returns to baseline
- role boundary is clean
- AuditLog coverage is restored
- hotfix or rollback is completed
- operator recovery approval is recorded
- exit review is completed

## Required Verification

```bash
npm run verify:aibeopchin-legal-reliability-degraded-mode
```

## Final Rule

Degraded mode is not a panic shutdown.  
It is a controlled customer-safe operating state with scope, approval, audit, recovery criteria, and exit review.

If degraded mode governance is missing, Phase 54-E support escalation cannot be evaluated consistently.
