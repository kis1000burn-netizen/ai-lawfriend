# AI법친 Legal Reliability Incident Severity Runbook

## Phase

54-B Customer Impact / Incident Severity Tracking

## Purpose

Phase 54-B classifies customer-impacting incidents using the Phase 54-A stabilization baseline as the reference for what constitutes abnormal operation.

## Preconditions

- Phase 54-A Production Stabilization Monitoring Baseline COMPLETE · LOCKED
- Stabilization baseline evidence ref recorded
- Operator assigned

## Required Verification

```bash
npm run verify:aibeopchin-legal-reliability-stabilization-baseline
npm run verify:aibeopchin-legal-reliability-incident-severity
```

## Severity Philosophy

Severity is based on:

- customer impact
- privilege exposure
- automation risk
- operational blockage
- legal submission risk
- audit integrity risk

—not engineering inconvenience alone.

## SEV-0

Legal or security critical incidents such as CLIENT internal strategy exposure, privilege leak, unreviewed evidence downstream exposure, or audit integrity damage.

Immediate escalation required.

Required actions:

- rollback evaluation
- degraded mode evaluation
- customer communication
- incident audit

## SEV-1

Automation mutation risk such as auto filing, auto submission, auto completion, or incorrect operational mutation.

Core rule: actions the AI must never perform autonomously.

## SEV-2

Operational blockage risk such as Action Queue stop, approval chain failure, or supplement request flow interruption.

## SEV-3

Performance degradation risk such as queue backlog spike, latency increase, or partial dashboard failure.

## SEV-4

Minor customer-visible issue such as cosmetic UI defects or non-blocking warning copy problems.

## Operator Closeout

The severity policy is complete only when:

- SEV-0 through SEV-4 are defined
- role boundary, automation, Action Loop, queue, and latency categories are classified
- escalation matrix and operator response windows are recorded
- incident audit, rollback evaluation, degraded mode, and support escalation readiness are verified

## Final Rule

Production stabilization does not judge incidents by intuition. Severity must be locked by customer impact, privilege exposure, automation risk, operational blockage, and audit integrity.

If severity is missing, Phase 54-C hotfix governance and Phase 54-D degraded mode cannot be evaluated consistently.
