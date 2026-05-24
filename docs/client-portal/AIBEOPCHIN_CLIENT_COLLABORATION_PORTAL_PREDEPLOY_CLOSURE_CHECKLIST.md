# AI법친 Client Collaboration Portal RC Predeploy Closure Checklist (Phase **15‑D**)

**상태**: **RC LOCKED** — `verify:aibeopchin-client-collaboration-portal-rc` PASS

**증빙 태그**: **`[EVIDENCE-20260524-AIBEOPCHIN-CLIENT-COLLABORATION-PORTAL-PHASE15D-RC-PREDEPLOY-CLOSURE]`**

---

## ☐ A. 선행 RC (불변)

| # | 명령 | 기대 |
| --- | --- | --- |
| A1 | `npm run verify:aibeopchin-litigation-command-center-rc` | 14-A〜14-E **PASS** |
| A2 | `npm run verify:aibeopchin-legal-document-intelligence-rc` | 13-G Review Gate SSOT |

---

## ☐ B. Collaboration Portal RC 정적 게이트

| # | 명령 | 기대 |
| --- | --- | --- |
| B1 | `npm run verify:aibeopchin-client-collaboration-portal-rc` | **PASS** |
| B2 | `verify:aibeopchin-client-supplement-tracking-phase15a` | **PASS** (B1에 포함) |

---

## ☐ C. Vitest Client Portal 묶음

```bash
npm run test -- src/features/client-portal
npm run test -- src/features/client-portal/client-collaboration-portal-rc-lock.test.ts
```

| 기준 | 결과 |
| --- | --- |
| client-portal* tests | **PASS** |
| rc-lock test | **4** tests **PASS** |

---

## ☐ D. Migration 적용 순서 (15-D RC)

Greenfield DB는 아래 순서로 migration 적용. **15-E migration은 RC 범위 밖.**

| # | migration dir |
| --- | --- |
| D1 | `20260525140000_client_portal_collaboration_phase15a` |
| D2 | `20260525150000_client_portal_phase15bc_intake_chat` |
| D3 | `20260525160000_client_portal_phase15c2_review_gate` |

---

## ☐ E. RC 잠금 기준 (체크리스트)

| # | 항목 | 확인 |
| --- | --- | --- |
| E1 | 의뢰인 포털 접근권한 (USER + owner) | ☐ |
| E2 | 보완요청 SENT 추적 · 제출 API | ☐ |
| E3 | 파일 업로드 · free-upload · submission status | ☐ |
| E4 | 사건 채팅 · 첨부 · post policy | ☐ |
| E5 | adopt-record → NEEDS_LAWYER_REVIEW | ☐ |
| E6 | 13-G Review Queue · client_statement | ☐ |
| E7 | LAWYER_CONFIRMED 전 downstream 차단 | ☐ |
| E8 | AuditLog · Command Center Action Feed | ☐ |

---

## ☐ F. predeploy:check 연동

| # | 확인 |
| --- | --- |
| F1 | `scripts/predeploy-check.ts`에 `verify:aibeopchin-client-collaboration-portal-rc` 포함 |
| F2 | **15-E** court schedule gate는 predeploy **미포함** (RC 이후) |
| F3 | `npm run predeploy:check` **PASS** |

---

## ☐ G. RC 이후 Phase (15-D 미포함)

| Phase | verify | 비고 |
| --- | --- | --- |
| **15-E** | `verify:aibeopchin-court-schedule-client-reminder-phase15e` | 재판기일·알림 |
| **15-F** | (착수 예정) | 카카오 보안 문서 발송 |

---

**한 줄**: 협업 포털(15-A〜C.3)을 RC로 봉인한 뒤, 알림·외부 발송은 15-E/F에서 안전하게 얹는다.
