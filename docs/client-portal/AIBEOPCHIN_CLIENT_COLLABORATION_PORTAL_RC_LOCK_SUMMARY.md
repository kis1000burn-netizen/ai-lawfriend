# AI법친 Client-Lawyer Collaboration Portal Release Candidate Lock Summary — Phase **15‑D**

**상태**: Phase **15‑D** — Client Collaboration Portal **Partial RC LOCKED** (15‑A〜15‑C.3 봉인)

> **predeploy gate**: Phase **15‑G Full RC**가 대체. 본 문서는 Partial RC 이력·선행 검증용.

**증빙 태그**: **`[EVIDENCE-20260524-AIBEOPCHIN-CLIENT-COLLABORATION-PORTAL-PHASE15D-RC-PREDEPLOY-CLOSURE]`**

## 1. 목적

Phase **15‑A**〜**15‑C.3**까지 완료된 **의뢰인 협업 포털** 축을 **배포 레벨 RC**로 고정한다. 재판기일 알림(15‑E)·카카오 보안 문서 발송(15‑F)은 **본 RC 이후** 별도 Phase로 붙인다.

**선행 (불변)**:

- Phase **14‑E** Litigation Command Center RC — `verify:aibeopchin-litigation-command-center-rc` PASS
- Phase **13‑G** Review Gate — `client_statement` · `CLIENT_STATEMENT` SSOT

## 2. RC 포함 Phase 매트릭스

| Phase | 요약 | RC 핵심 |
| --- | --- | --- |
| **15‑A** | 의뢰인 포털 · 보완요청 추적 | `CaseClientPortalAccess` · supplement submit |
| **15‑B** | 파일 업로드 · 제출 파이프라인 | `ClientSubmission` · intake · status gate |
| **15‑C** | 사건 채팅 · 첨부 | `CaseConversation*` · messages API |
| **15‑C.2** | adopt → 13-G Review Queue | `NEEDS_LAWYER_REVIEW` · downstream 차단 |
| **15‑C.3** | Command Center adopt UX | 채팅·첨부 채택 · Action Feed |
| **15‑D** | **본 RC 봉인** | [`AIBEOPCHIN_CLIENT_COLLABORATION_PORTAL_PREDEPLOY_CLOSURE_CHECKLIST.md`](./AIBEOPCHIN_CLIENT_COLLABORATION_PORTAL_PREDEPLOY_CLOSURE_CHECKLIST.md) |

## 3. 협업 포털 흐름 (15‑D 불변)

```
의뢰인 포털 접근 (15-A policy)
  → 보완요청·파일 제출 (15-A/B)
  → 사건 채팅·첨부 (15-C)
  → 변호사 adopt-record (15-C.3)
  → 13-G Review Queue (NEEDS_LAWYER_REVIEW)
  → LAWYER_CONFIRMED 전 downstream 차단
  → AuditLog + Command Center Action Feed
```

## 4. RC 불변 기준 (15‑D)

1. **접근권한** — `assertClientPortalUser` · `assertCanAccessClientPortalCase` · owner-only portal.
2. **보완요청 추적** — SENT supplement · client submit API · pending counts.
3. **파일 업로드/제출** — upload · free-upload · submission status machine.
4. **채팅/첨부** — thread/message/attachment · 양방향 post policy.
5. **adopt-record** — body · attachment · all scope · Review Queue enqueue.
6. **13-G 연결** — `client_statement` · `PHASE_15B`/`PHASE_15C` review sources.
7. **downstream 차단** — `assertPortalReviewConfirmedForDownstream` · `LAWYER_CONFIRMED` required.
8. **AuditLog** — `CLIENT_PORTAL_*` · `CASE_CONVERSATION_*` · adopt actions.
9. **Migration 순서** — 15a → 15bc → 15c2 (**15-E migration 미포함**).
10. **정적 게이트** — `verify:aibeopchin-client-collaboration-portal-rc` **PASS** · `predeploy:check` 연동.

## 5. 15‑D에서 건드리지 않는 것

| 대상 | 이유 |
| --- | --- |
| Phase **15‑E** 재판기일·알림 | RC 이후 민감 알림 축 |
| Phase **15‑F** 카카오 보안 문서 | RC 이후 외부 발송 축 |
| `20260525170000_*_phase15d` migration | 15-E 전용 (RC gate 제외) |

## 6. RC 이후 확장

- **15‑E** — Court Schedule & Client Reminder (`verify:aibeopchin-court-schedule-client-reminder-phase15e`)
- **15‑F** — Secure Document Sharing & Kakao Notice

## 7. 검증 (15‑D)

| 명령 | 기대 |
| --- | --- |
| `npm run verify:aibeopchin-client-collaboration-portal-rc` | **PASS** (15-A〜C.3 + RC 문서) |
| `npm run test -- src/features/client-portal` | **PASS** |
| `npm run predeploy:check` | Client Collaboration Portal RC gate 포함 |

## 8. 변경 이력

| 날짜 | 내용 |
| --- | --- |
| 2026-05-24 | Phase **15‑D** Collaboration Portal RC Closure **구현** |
