# Data Governance RC Runbook (Phase **19-F**)

**원칙**: 19-A~E를 RC로 묶고, **purge/delete/blob reclaim unlock 조건**을 정의한다. **기본은 dry-run**이며 실제 실행은 게이트 + limited flag 통과 후에만.

---

## 1. 한 줄 기준

정책 → 가시성 → RC → 실행 unlock. 삭제 실행을 너무 빨리 열지 않는다.

## 2. Bundled verify

```bash
npm run verify:aibeopchin-data-governance-rc
```

내부: `verify:aibeopchin-data-governance-phase19a` ~ `19e` + RC lock Vitest.

## 3. Operator flow (Admin)

1. **Visibility** — `/admin/operations/data-governance` (19-E)
2. **Preview** — purge would-run candidates (`PURGE_EXECUTION_LOCKED` underlying eligible)
3. **Legal hold recheck** — preview에 `LEGAL_HOLD_ACTIVE` 후보 있으면 dry-run 차단
4. **Rollback warning** — UI checkbox 확인
5. **Confirmation phrase** — `I ACKNOWLEDGE IRREVERSIBLE DATA PURGE` (operator confirmation phrase)
6. **Dry-run export** — JSON + `DATA_GOVERNANCE_PURGE_DRY_RUN_EXPORTED` AuditLog
7. **Limited execution** — `DATA_GOVERNANCE_PURGE_LIMITED_EXECUTION_ENABLED=true` (ops env only)
8. **Execute buttons** — UI에 보이지만 **disabled** (job wiring은 RC 이후 별도)

## 4. APIs

| Method | Path |
| --- | --- |
| GET | `/api/admin/operations/data-governance-snapshot` |
| GET | `/api/admin/operations/data-governance-purge-preview` |
| POST | `/api/admin/operations/data-governance-purge-dry-run` |

## 5. Phase 18 cross-link

- Recovery 먼저: `verify:aibeopchin-reliability-rc` · `/admin/operations/retry-jobs`
- Retention purge preview는 **recovery 완료 후** triage

## 6. SSOT

- `src/features/data-governance/data-governance-rc-lock.ts`
- `src/features/data-governance/data-governance-purge-execution.policy.ts`
- `src/features/data-governance/data-governance-purge-preview.service.ts`
- `src/features/data-governance/data-governance-purge-dry-run.service.ts`

## 7. 검증

```bash
npm run verify:aibeopchin-data-governance-rc
```

**버전** **`19-F.1`**
