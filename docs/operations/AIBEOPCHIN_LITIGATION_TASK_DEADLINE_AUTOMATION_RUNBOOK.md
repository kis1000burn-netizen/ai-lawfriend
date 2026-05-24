# Litigation Task / Deadline Automation Runbook (Product Phase **24-A**)

**한 줄**: OPEN Deadline 기준 자동 준비 Task 생성·기한 경과 에스컬레이션 플래그를 실행하고 audit에 기록한다.

---

## 1. 범위 (24-A)

| 항목 | 산출물 |
| --- | --- |
| Rules | `LITIGATION_AUTOMATION_DEFAULT_RULES` |
| Service | `runLitigationTaskDeadlineAutomationForCase` · `previewLitigationTaskDeadlineAutomation` |
| Audit | `LITIGATION_TASK_DEADLINE_AUTOMATION_RUN` |

---

## 2. 검증

```bash
npm run verify:aibeopchin-litigation-ops-phase24a
```

**버전** **`24-A.1`**
