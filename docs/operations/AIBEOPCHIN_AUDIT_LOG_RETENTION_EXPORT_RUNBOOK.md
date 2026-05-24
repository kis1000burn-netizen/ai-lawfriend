# AuditLog Retention & Export Runbook (Phase **19-C**)

**원칙**: AuditLog는 운영 감사의 핵심 증거이므로 **보존 기간·export 권한·마스킹·다운로드 감사 기록**을 정책으로 통제한다.

---

## 1. 한 줄 기준

19-A retention tier + 19-B redaction 위에 **AuditLog 전용** retention · export scope · download audit SSOT.

## 2. 잠금 항목

| 항목 | SSOT | 동작 |
| --- | --- | --- |
| 보존 기간 | `audit-log-retention-policy.ts` | 730일 (19-A `AuditLog` registry) |
| 조회 권한 | `audit-log-export-policy.ts` | ADMIN · SUPER_ADMIN only |
| export 범위 | `audit-log-export-policy.ts` | max 5000 rows · max 365일 span |
| export redaction | `audit-log-export-redaction.service.ts` | 19-B metadata + message truncate + actor email mask |
| retention eligibility | `audit-log-retention-policy.ts` | purge eligible 판정 (실행은 19-F까지 잠금) |
| 다운로드 감사 | `audit-log.service.ts` | XLSX export → `AUDIT_LOG_XLSX_EXPORTED` AuditLog |

## 3. Query floor

모든 AuditLog 조회·집계·export는 **retention floor** (`now - 730d`) 이전 레코드를 반환하지 않는다.

- Repository: `buildAuditLogWhere` → `applyRetentionFloor`
- List/summary: `clampAuditLogQueryDateFrom` (사용자 dateFrom 하한)

## 4. XLSX export 감사 (필수)

관리자가 XLSX를 다운로드하면 **반드시** 새 AuditLog가 기록된다.

- **action**: `AUDIT_LOG_XLSX_EXPORTED`
- **entityType**: `AuditLogExport`
- **metadata**: rowCount · filters · `redactionApplied: true` · `metadataOnly: true`

운영자는 AuditLog 목록에서 `AUDIT_LOG_XLSX_EXPORTED` 액션으로 **누가·언제·몇 건** export했는지 추적한다.

## 5. Purge

`AUDIT_LOG_RETENTION_PURGE_EXECUTION_LOCKED_PHASE19C = true` — 실제 purge job은 **Phase 19-F RC** 이후.

`isAuditLogEligibleForRetentionPurge()`는 eligibility 판정만 제공.

## 6. SSOT 파일

- `src/lib/data-governance/audit-log-retention-policy.ts`
- `src/lib/data-governance/audit-log-export-policy.ts`
- `src/lib/data-governance/audit-log-export-redaction.service.ts`
- `src/lib/data-governance/audit-log-retention.validator.ts`
- Integration: `src/features/audit-logs/audit-log.service.ts` · `audit-log.repository.ts`

## 7. 선행

- Phase **19-A** Data Retention Policy
- Phase **19-B** PII / Legal Sensitive Redaction

## 8. 검증

```bash
npm run verify:aibeopchin-data-governance-phase19c
```

**버전** **`19-C.1`**
