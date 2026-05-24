# AI법친 Client-Lawyer Collaboration Portal Full RC Lock Summary — Phase **15‑G**

**상태**: Phase **15‑G** — Collaboration Portal **Full RC LOCKED** (15‑A〜15‑F 봉인)

**증빙 태그**: **`[EVIDENCE-20260524-AIBEOPCHIN-CLIENT-COLLABORATION-PORTAL-PHASE15G-FULL-RC-PREDEPLOY-CLOSURE]`**

**선행**: Phase **15‑D** Partial RC (15‑A〜C.3) · Phase **15‑E** 기일 알림 · Phase **15‑F** 보안 문서·카카오

## 1. 목적

15‑D RC 이후 확장된 **재판기일·알림(15‑E)** 과 **보안 문서 공유·카카오 알림(15‑F)** 까지 포함하여, 의뢰인 협업 포털 전체를 **배포 레벨 Full RC**로 고정한다.

## 2. Full RC Phase 매트릭스

| Phase | 요약 | Full RC |
| --- | --- | --- |
| **15‑A** | 포털 접근 · 보완요청 추적 | ✓ |
| **15‑B** | 파일 업로드 · 제출 | ✓ |
| **15‑C** | 채팅 · 첨부 | ✓ |
| **15‑C.2/C.3** | adopt · 13-G Review Queue | ✓ |
| **15‑D** | Partial RC (선행) | ✓ |
| **15‑E** | 재판기일 · Client Reminder | ✓ |
| **15‑F** | Secure Document · Kakao Notice | ✓ |
| **15‑G** | **Full RC 봉인** | [`AIBEOPCHIN_CLIENT_COLLABORATION_PORTAL_FULL_RC_PREDEPLOY_CLOSURE_CHECKLIST.md`](./AIBEOPCHIN_CLIENT_COLLABORATION_PORTAL_FULL_RC_PREDEPLOY_CLOSURE_CHECKLIST.md) |

## 3. Full RC 흐름

```
의뢰인 포털 (15-A/B)
  → 채팅 · adopt-record (15-C)
  → 13-G Review Queue · downstream 차단
  → 재판기일 등록 · 알림 예약 (15-E)
  → 보안 문서 공유 · ExternalMessageLog (15-F)
  → predeploy:check 단일 Full RC gate (15-G)
```

## 4. Full RC 불변 기준

1. **자료 제출** — supplement · free-upload · submission status
2. **채팅/첨부** — CaseConversation* · post policy
3. **adopt-record** — NEEDS_LAWYER_REVIEW → Review Queue
4. **기일 알림** — LitigationDeadlineNotification · ClientNotificationPreference
5. **보안 문서** — CaseDocumentDelivery · secure link · no raw file in Kakao
6. **ExternalMessageLog** — stub provider · payloadSummaryJson
7. **동의/수신거부** — SKIPPED_NO_CONSENT · fallback IN_APP
8. **Migration 순서** — 15a → 15bc → 15c2 → 15e → 15f
9. **정적 게이트** — `verify:aibeopchin-client-collaboration-portal-full-rc` **PASS**

## 5. 검증 (15‑G)

| 명령 | 기대 |
| --- | --- |
| `npm run verify:aibeopchin-client-collaboration-portal-full-rc` | **PASS** (15-A/E/F + Full RC) |
| `npm run predeploy:check` | Full RC gate 포함 |

## 6. 변경 이력

| 날짜 | 내용 |
| --- | --- |
| 2026-05-24 | Phase **15‑G** Collaboration Portal Full RC Closure **구현** |
