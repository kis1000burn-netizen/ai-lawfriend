# Case Pack Builder Runbook (Product Phase **23-C**)

**한 줄**: 사건 pack type(LOAN·LEASE·DIVORCE·…)별 template과 기존 `buildCasePackageDto`를 조합해 변호사 검토용 Case Pack을 조립한다.

---

## 1. 범위 (23-C)

| 항목 | 산출물 |
| --- | --- |
| Templates | `CASE_PACK_BUILDER_TEMPLATES` (7 pack types) |
| Service | `buildCasePackForCase` |
| Output | `CasePackBuilderResult` + `CasePackageDto` |

---

## 2. Pack types

LOAN · LEASE · DIVORCE · DAMAGES · LABOR · CRIMINAL · GENERIC

`case.category` → pack type mapping; override 가능.

---

## 3. 검증

```bash
npm run verify:aibeopchin-ai-quality-phase23c
```

**버전** **`23-C.1`**
