# AI법친 Client Collaboration Portal Full RC Predeploy Closure Checklist (Phase **15‑G**)

**상태**: **Full RC LOCKED** — `verify:aibeopchin-client-collaboration-portal-full-rc` PASS

**증빙 태그**: **`[EVIDENCE-20260524-AIBEOPCHIN-CLIENT-COLLABORATION-PORTAL-PHASE15G-FULL-RC-PREDEPLOY-CLOSURE]`**

---

## ☐ A. 선행 RC (불변)

| # | 명령 | 기대 |
| --- | --- | --- |
| A1 | `npm run verify:aibeopchin-litigation-command-center-rc` | 14-A〜14-E **PASS** |
| A2 | `npm run verify:aibeopchin-client-collaboration-portal-rc` | 15-D Partial RC **PASS** (선행) |

---

## ☐ B. Full RC 정적 게이트 (단일)

| # | 명령 | 기대 |
| --- | --- | --- |
| B1 | `npm run verify:aibeopchin-client-collaboration-portal-full-rc` | **PASS** |
| B2 | `verify:...-phase15a` | **PASS** (B1에 포함) |
| B3 | `verify:...-phase15e` | **PASS** (B1에 포함) |
| B4 | `verify:...-phase15f` | **PASS** (B1에 포함) |

---

## ☐ C. Vitest Full RC 묶음

```bash
npm run test -- src/features/client-portal
npm run test -- src/features/litigation-deadline-reminder
npm run test -- src/features/secure-document-delivery
npm run test -- src/features/client-portal/client-collaboration-portal-full-rc-lock.test.ts
```

---

## ☐ D. Migration 적용 순서 (Full RC)

| # | migration dir |
| --- | --- |
| D1 | `20260525140000_client_portal_collaboration_phase15a` |
| D2 | `20260525150000_client_portal_phase15bc_intake_chat` |
| D3 | `20260525160000_client_portal_phase15c2_review_gate` |
| D4 | `20260525170000_litigation_deadline_client_reminder_phase15d` |
| D5 | `20260525180000_secure_document_delivery_phase15f` |

---

## ☐ E. Full RC 잠금 체크리스트

| # | 항목 | 확인 |
| --- | --- | --- |
| E1 | 자료 제출 · 보완요청 추적 | ☐ |
| E2 | 채팅 · 첨부 · adopt-record | ☐ |
| E3 | 13-G Review Queue · downstream 차단 | ☐ |
| E4 | 재판기일 · ClientNotificationPreference | ☐ |
| E5 | 보안 문서 · CaseDocumentDelivery | ☐ |
| E6 | ExternalMessageLog · 원본 미첨부 | ☐ |
| E7 | 동의/수신거부 · SKIPPED_NO_CONSENT | ☐ |
| E8 | AuditLog · Action Feed | ☐ |

---

## ☐ F. predeploy:check 연동

| # | 확인 |
| --- | --- |
| F1 | `scripts/predeploy-check.ts`에 `verify:aibeopchin-client-collaboration-portal-full-rc` 포함 |
| F2 | `CLIENT_PORTAL_VERSION` · `LITIGATION_COMMAND_CENTER_VERSION` = **`15-G.1`** |
| F3 | `npm run predeploy:check` **PASS** |

---

**한 줄**: 15-A〜F 협업·알림·보안 문서 축을 Full RC로 봉인하고, predeploy 단일 게이트로 배포 준비를 완료한다.
