# AI법친 Legal Reliability Production Stabilization Baseline Runbook

## Phase

54-A Production Stabilization Monitoring Baseline

## Purpose

Phase 54-A defines the operating baseline for Legal Reliability after Phase 53 production go-live closeout.

The baseline must answer:

> What is normal, warning, and critical during customer operation?

## Preconditions

- Phase 53-F Production Go-Live Control RC COMPLETE · LOCKED
- Production tenant confirmed
- Monitoring dashboard available
- AuditLog query access available
- Operations Queue snapshot available
- Feature flag state visible
- Operator assigned

## Required Verification

```bash
npm run verify:aibeopchin-legal-reliability-production-go-live-control-rc
npm run verify:aibeopchin-legal-reliability-stabilization-baseline
```

## Baseline Axes

### 1. Error Rate

Capture thresholds for:

- Action Loop API
- Action Operations API
- Dashboard
- Client Portal

### 2. Latency

Capture P95 thresholds for:

- Lawyer Workbench
- Action Operations Queue
- Client Portal
- Action Candidate Create

### 3. Action Loop Success

Capture thresholds for:

- Candidate creation
- Lawyer approval to draft
- Decision ledger write
- SupplementRequest DRAFT-only rate

### 4. Operations Queue

Capture thresholds for:

- Open queue backlog
- Overdue action count
- Assignment missing count
- SLA warning count

### 5. AuditLog Coverage

Capture coverage thresholds for:

- Action candidate audit
- Lawyer decision audit
- Operation queue audit
- Denied access audit
- Feature flag audit

### 6. Role Denial Pattern

Confirm:

- CLIENT internal access denied
- CLIENT internal access allowed not observed
- STAFF admin escalation denied
- LAWYER review bypass denied
- Denied access audit refs recorded

### 7. Degrade Readiness

Confirm:

- Action Loop can disable
- Action Operations can disable
- Dashboard can disable
- Write can disable
- Completion can disable
- Read-only degrade can activate
- Rollback runbook ref exists

## Operator Closeout

The baseline is complete only when the operator signs off with:

- Baseline window
- Metric thresholds
- Evidence refs
- Role denial pattern
- Degrade readiness
- Sign-off note

## Final Rule

Production stabilization cannot proceed without a locked baseline.

If the baseline is missing, Phase 54-B incident severity and 54-C hotfix governance cannot be evaluated consistently.
