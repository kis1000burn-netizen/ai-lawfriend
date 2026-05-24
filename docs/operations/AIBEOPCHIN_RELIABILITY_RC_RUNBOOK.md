# Reliability RC Runbook (Phase **18-E**)

**원칙**: Phase 18-E는 **새 기능 추가가 아니라** 18-A~D를 **하나의 배포 전 신뢰성 게이트**로 묶는 RC 단계입니다.

---

## 1. 한 줄 기준

**운영 중 실패한 cron·외부알림·문서 파이프라인·AI 호출을 각각 안전 정책에 따라 복구·차단·재시도·수동검토**

## 2. Static RC (배포 전 필수)

```bash
npm run verify:aibeopchin-reliability-rc
```

### 포함 검증

| Gate | 내용 |
| --- | --- |
| **18-A** | RetryJob persist · operator retry · `RETRY_JOB_OPERATOR_QUEUED` |
| **18-B** | External message safe re-delivery · duplicate guard · metadata only |
| **18-C** | Document pipeline stage-preserving recovery · no re-upload |
| **18-D** | AI fallback · circuit breaker · `AI_FALLBACK_INVOKED` |
| **18-E** | migration · runbook · evidence · OPERATIONS_INDEX |
| **Phase 17** | monitoring RC cross-link · retry-jobs ↔ monitoring console |

## 3. Operator flow (배포 후)

```
Phase 17 triage (/admin/operations/monitoring)
  → 원인·도메인 확인 (cron / notification / document / AI)
  → Phase 18 recovery (/admin/operations/retry-jobs)
  → domain-specific action (retry · redeliver · recover · manual review)
  → AuditLog 확인
```

## 4. Sub-phase runbooks

- [AIBEOPCHIN_RETRY_JOB_RECOVERY_RUNBOOK.md](./AIBEOPCHIN_RETRY_JOB_RECOVERY_RUNBOOK.md) — **18-A**
- [AIBEOPCHIN_EXTERNAL_MESSAGE_REDELIVERY_RUNBOOK.md](./AIBEOPCHIN_EXTERNAL_MESSAGE_REDELIVERY_RUNBOOK.md) — **18-B**
- [AIBEOPCHIN_DOCUMENT_PIPELINE_RECOVERY_RUNBOOK.md](./AIBEOPCHIN_DOCUMENT_PIPELINE_RECOVERY_RUNBOOK.md) — **18-C**
- [AIBEOPCHIN_AI_FALLBACK_CIRCUIT_BREAKER_RUNBOOK.md](./AIBEOPCHIN_AI_FALLBACK_CIRCUIT_BREAKER_RUNBOOK.md) — **18-D**

## 5. Phase 17 monitoring (cross-link)

- RC lock: [AIBEOPCHIN_OPERATIONS_MONITORING_RC_LOCK_SUMMARY.md](../platform/AIBEOPCHIN_OPERATIONS_MONITORING_RC_LOCK_SUMMARY.md)
- Live check: `npm run ops:post-deploy-monitoring-live-check`
- Live smoke: `npm run ops:operations-monitoring-live-smoke`

## 6. Evidence

- `EVIDENCE-20260524-AIBEOPCHIN-RELIABILITY-PHASE18E-RC`
- Sub-phase: 18-A · 18-B · 18-C · 18-D evidence blocks in `IMPLEMENTATION_EVIDENCE.md`

**버전** **`18-E.1`**
