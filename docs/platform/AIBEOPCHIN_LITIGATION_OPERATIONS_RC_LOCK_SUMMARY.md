# Litigation Operations RC Lock Summary — Product Phase **24-F**

**상태**: Product Phase **24-F** — **Litigation Operations RC LOCKED**

**증빙 태그**: **`[EVIDENCE-20260524-AIBEOPCHIN-LITIGATION-PHASE24F-RC]`**

**선행**: Product **23-F** AI Quality RC · Code **14-E** Litigation Command Center RC · Phase **24-A~E**

## 1. 한 줄 기준

**소송 Task/Deadline 자동화·법원 제출 준비 pack·변호사 workbench·기일/제출 checklist·의뢰인 소송 진행 sync를 하나의 Product Phase 24 RC로 묶어 배포 전 검증·운영 runbook·Phase 14/15-E litigation cross-link를 잠근다.**

## 2. Sub-phases

| Phase | 이름 | 산출물 |
| --- | --- | --- |
| **24-A** | Litigation Task / Deadline Automation | automation rules · auto prep tasks |
| **24-B** | Court Filing Preparation Pack | filing templates · readiness score |
| **24-C** | Lawyer Workbench Integration | workbench snapshot · command center link |
| **24-D** | Hearing / Submission Checklist | HEARING/SUBMISSION checklists |
| **24-E** | Client-facing Litigation Progress Sync | clientVisible deadlines · milestones |
| **24-F** | Litigation Operations RC | `verify:aibeopchin-litigation-ops-rc` |

## 3. Bundled verify

```bash
npm run verify:aibeopchin-litigation-ops-rc
```

## 4. Product cross-link (23-F · 14-E)

| Phase | 역할 |
| --- | --- |
| **23-F** | AI Quality / Case Pack 선행 Product RC |
| **14-E** | Litigation Command Center · 13-H ops sync |
| **15-E** | clientVisible deadline · reminder |

```bash
npm run verify:aibeopchin-ai-quality-rc              # 선행·회귀
npm run verify:aibeopchin-litigation-command-center-rc # 선행·회귀
```

## 5. 다음

Product Phase **25** Production Launch — **COMPLETE · LOCKED**

**버전** **`24-F.1`**
