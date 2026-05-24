# AI법친 Litigation Command Center RC Predeploy Closure Checklist (Phase **14‑E**)

**상태**: **RC LOCKED** — `verify:aibeopchin-litigation-command-center-rc` PASS

**증빙 태그**: **`[EVIDENCE-20260524-AIBEOPCHIN-LITIGATION-COMMAND-CENTER-PHASE14E-RC-PREDEPLOY-CLOSURE]`**

---

## ☐ A. 선행 Legal Document Intelligence RC (불변)

| # | 명령 | 기대 |
| --- | --- | --- |
| A1 | `npm run verify:aibeopchin-legal-document-intelligence-rc` | 13-A〜13-I **PASS** |
| A2 | `[EVIDENCE-20260524-AIBEOPCHIN-LEGAL-DOCUMENT-INTELLIGENCE-PHASE13I-RC-PREDEPLOY-CLOSURE]` | IMPLEMENTATION_EVIDENCE 존재 |

---

## ☐ B. Litigation Command Center RC 정적 게이트

| # | 명령 | 기대 |
| --- | --- | --- |
| B1 | `npm run verify:aibeopchin-litigation-command-center-rc` | **PASS** |
| B2 | `verify:...-phase14a`〜`14d` | **PASS** (B1에 포함) |

---

## ☐ C. Vitest Command Center 묶음

```bash
npm run test -- src/features/document-intelligence/litigation-command-center
npm run test -- src/features/document-intelligence/litigation-command-center-rc-lock.test.ts
```

| 기준 | 결과 |
| --- | --- |
| litigation-command-center* tests | **16+** tests **PASS** |
| rc-lock test | **4** tests **PASS** |

---

## ☐ D. Migration 의존 (13-H)

14-A〜14-D는 **신규 Prisma migration 없음**. Greenfield DB는 13-H ops migration 선행:

| # | migration dir |
| --- | --- |
| D1 | `20260524220000_litigation_operations_integration_phase13h` |

---

## ☐ E. RC 불변 체크 (수동)

| # | 항목 | 확인 |
| --- | --- | --- |
| E1 | 지휘실 조회 | `/cases/[id]/litigation-command-center` · narrative · 9개 섹션 |
| E2 | In-place actions | 업무·기일·보완 DRAFT→SENT·초안 생성 |
| E3 | Feedback UX | toast · 낙관적 UI · 실패 rollback · action feed |
| E4 | Dashboard widget | `/cases` 목록 · `/lawyer` preview · batch summary |
| E5 | 권한 | readOnly/actionsEnabled · CLIENT 차단 |
| E6 | AuditLog | `LITIGATION_CMD_CENTER_*` 4종 |

---

## ☐ F. predeploy

```bash
npm run predeploy:check
```

`predeploy:check` gate 순서: Voice → Gongbuho LK → CMB → AI Core RC → Legal Document Intelligence RC → **Litigation Command Center RC** → Supplement migration → …

---

## ☐ G. RC 이후 착수 (15-A)

- 의뢰인 포털 보완요청 SENT 추적 연동 — **14-E RC PASS 후**
