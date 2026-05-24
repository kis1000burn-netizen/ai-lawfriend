# Client-facing Litigation Progress Sync Runbook (Product Phase **24-E**)

**한 줄**: clientVisible Deadline과 milestone만 포함하는 의뢰인 소송 진행 sync pack (Phase 15-E 연계).

---

## 1. 범위 (24-E)

| 항목 | 산출물 |
| --- | --- |
| Service | `syncClientLitigationProgressForCase` |
| Source | `listClientVisibleDeadlines` · `formatClientDeadlineDisplayLine` |
| Redaction | 내부 전략·STAFF 메모 미포함 |

---

## 2. 검증

```bash
npm run verify:aibeopchin-litigation-ops-phase24e
```

**버전** **`24-E.1`**
