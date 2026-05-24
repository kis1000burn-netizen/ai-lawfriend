# Incident Response & Rollback Drill Runbook (Phase **17-C**)

**목적**: P0/P1 장애 시 **즉시 triage → rollback drill → minimum-rollback-playbook** 실행.

## 1. Escalation (from post-deploy checklist)

| 심각도 | 조건 | 조치 |
| --- | --- | --- |
| P0 | health FAIL · login 전면 FAIL · data loss | rollback 즉시 |
| P1 | role smoke FAIL · portal 500 | rollback 검토 · hotfix |
| P2 | 단일 feature degradation | feature flag · patch |

## 2. Triage 순서

1. `/admin/operations/monitoring` — snapshot health · recent audit issues
2. `/admin/audit-logs` — actorUserId · entityId(case) · action
3. `/admin/cron` — scheduled job FAIL
4. `GET /api/health` — DB connectivity

## 3. Rollback drill (분기 1회 권장)

| Step | 확인 |
| --- | --- |
| D1 | `rollbackTargetCommit` 문서화 (16-D launch record) |
| D2 | redeploy 절차 dry-run (staging) |
| D3 | DB backup 복원 절차 담당자 확인 |
| D4 | OAuth callback · env rollback checklist |

참조: [minimum-rollback-playbook.md](../minimum-rollback-playbook.md) · [incident-recovery-playbook.md](../incident-recovery-playbook.md)

## 4. Post-incident

- Launch record / release note 갱신
- IMPLEMENTATION_EVIDENCE incident tag (필요 시)

**버전** **`17-C.1`**
