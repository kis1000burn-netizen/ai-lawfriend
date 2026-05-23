# Lawyer Voice Review UX — Phase **5‑H** 기준 명세

ASCII 정적 브리지 (`verify`): `Phase 5-H`.

**증빙 태그**: **`[EVIDENCE-20260523-AIBEOPCHIN-PHASE5H-LAWYER-VOICE-REVIEW-UX-SPEC]`**

코드 SSOT 보조 마커: `voice-lawyer-review-ux-policy.ts` → `VOICE_LAWYER_REVIEW_UX_SPEC_MARKER_PHASE5H`.

**상위 전제**: 개인정보·보관·로그·접근통제는 **[`VOICE_PRIVACY_RETENTION_RUNBOOK.md`](./VOICE_PRIVACY_RETENTION_RUNBOOK.md)** 및 Phase **5‑I** 마커 범위 안에서만 노출·처리한다.

---

## 1. 목적 (한 줄 착수 기준)

Phase **5‑H**는 Phase **5‑I**에서 잠근 **개인정보·보관** 기준 위에서, 변호사가 **음성 transcript**와 **확정 답변**을 검토하고 **보완 질문**을 만들며 **문서 확정 전** 검토 누락을 **차단**하는 **Lawyer Voice Review UX** 단계다.

본 문서는 **기능 구현 전** 제품·운영·UI 연결의 **SSOT**이다. 화면 코드는 후속 PR에서 본 명세와 **1:1 매핑**된다.

---

## 2. 검토 대상 비교 (데이터 축)

변호사 검토 화면에서는 아래 **셋**을 **역할 분리**하여 동시에 읽을 수 있어야 한다(동일 문자열이어도 출처 라벨 필수).

| 축 | 저장·출처 | 검토 포인트 |
| --- | --- | --- |
| **STT draft** | `VoiceTranscript`, `CAPTURED` / `NEEDS_CONFIRMATION` | 기계 추정·불확실성·발화 누락 가능성. **인터뷰 반영 전** 단계. |
| **confirmed transcript** | `VoiceTranscript` **`CONFIRMED`**, `confirmedText`/`draftText` 정책 | 의뢰인이 **버튼으로 확정**한 텍스트. 법적 중요도 **높음**. |
| **Interview answer** | `Interview.answersJson`(또는 동일 SSOT의 질문별 답변 필드) | 사건 인터뷰 **최종 저장**과의 정합. 확정 transcript와 **분기** 시 **이력·이유** 필요. |

**정책**

- **draft**는 문서 생성·외부 발송 **입력으로 쓰지 않는다**(이미 Phase **5‑D**·[`VOICE_TRANSCRIPT_QA.md`](./VOICE_TRANSCRIPT_QA.md) 정신과 동일).
- **CONFIRMED** transcript가 있으면 해당 질문 키에 대해 **변호사 검토 전** 자동 문서 파이프라인 **진입 금지**(§5).
- 세 축을 **한 화면 Diff**로 보여줄 때도 **본문은 Phase 5‑I** 로그 규칙 준수(감사 로그에 raw body 금지 원칙 재사용).

---

## 3. 변호사 수정 제안 (Lawyer suggested edit)

- 변호사가 **직접 인터뷰 답변을 덮어쓰지 않는다** 기본. 우선 **주석·제안 텍스트·플래그** 형태(추후 스키마: `LawyerVoiceReviewSuggestion` 등 **백로그** 명시).
- 제안 사유 카테고리 최소 세트 예: STT 불일치 · 법적 표현 교정 필요 · 추가 확인 필요 · 민감 정보 처리.
- 제안 저장 시 **`VoiceInteractionTrace` 또는 AuditLog 계열**(기존 감사 정책)에 **메타만** 남김(transcript 본문은 **별도 규격** 참조 Phase **5‑I**).

---

## 4. 보완 질문 생성 (Supplement question)

- 트리거: 확정 transcript vs 인터뷰 답변 **불일치**, 또는 변호사 **수동**(CONFIRMED transcript 존재 시).
- 결과물은 **기존 supplement / interview 질의 흐름**에 합류 — Phase **5-H-UI-4** 구현.
- API: `POST /api/cases/:caseId/voice/supplement-questions` → `SupplementRequest` + Item 생성 · 기본 **SENT** 발송.
- Item 메타: `interviewQuestionKey` · `voiceTranscriptId` · `sourceMarker=phase5h-ui-4-voice-lawyer-review-supplement`.
- Supplement **ACCEPTED** 시 Voice-origin item 응답만 `saveInterviewAnswer()`로 인터뷰에 반영.

---

## 5. 문서 확정 전 검토 차단 기준 (**document finalize** gate)

다음 중 하나라도 해당하면 해당 사건 **document** 타입(**소장·내용증명 등 제품별 정의**)에 대한 **변호사 확정/발송** UX는 **블록**된다.

| ID | 차단 조건 |
| --- | --- |
| H-BLOCK-01 | 해당 질문 키에 대해 **`CONFIRMED` VoiceTranscript**가 있는데 변호사 **검토 완료** 플래그가 없음 |
| H-BLOCK-02 | 확정 transcript와 **Interview answer** 불일치 + **제안 또는 보완 질문** 미처리 상태 → 서버 코드 **`H-BLOCK-OPEN-SUPPLEMENT-UNRESOLVED`** (Phase **5-H-UI-5**) |
| H-BLOCK-03 | TTL 만료·REJECT 초안만 존재하고 **확정 경로 불명** 상태(의뢰인 재발화 필요) |

(제품 카피는 한국어 우선 가능하나 검증 문자열 및 API 문맥에서는 **block**(차단)·**unblock** 용어를 병행할 수 있다.)

**해제 조건**(예시): 변호사 **검토 완료**(명시 버튼) + 불일치에 대한 조치 로그 존재(메타)·보완 완료.

---

## 6. 코드 / 화면 연결 (Phase 5-H-UI 반영)

| 영역 | 경로 | 용도 |
| --- | --- | --- |
| 변호사 검토 패널 | [`src/components/cases/lawyer-voice-review-panel.tsx`](../../src/components/cases/lawyer-voice-review-panel.tsx) | draft / confirmed / Interview answer 3축 비교 · document finalize gate 안내 |
| 인터뷰 화면 연결 | [`src/components/cases/case-interview-client.tsx`](../../src/components/cases/case-interview-client.tsx) | LAWYER·ADMIN·STAFF 역할 시 패널 하단 노출 |
| 정책·차단 코드 | [`src/lib/voice/voice-lawyer-review-ux-policy.ts`](../../src/lib/voice/voice-lawyer-review-ux-policy.ts) | `H-BLOCK-*` · `resolveVoiceReviewBlockReason` · `canFinalizeDocumentAfterVoiceReview` |
| 검토 완료 영속화 | [`VoiceLawyerReviewCompletion`](../../prisma/schema.prisma) · [`POST .../voice/lawyer-reviews`](../../src/app/api/cases/[caseId]/voice/lawyer-reviews/route.ts) | Phase **5-H-UI-3** |
| 보완 질문 API | [`POST .../voice/supplement-questions`](../../src/app/api/cases/[caseId]/voice/supplement-questions/route.ts) · [`voice-lawyer-supplement.service.ts`](../../src/features/voice/voice-lawyer-supplement.service.ts) | Phase **5-H-UI-4** |
| 스냅샷 빌더 | [`src/lib/voice/voice-lawyer-review-snapshot.ts`](../../src/lib/voice/voice-lawyer-review-snapshot.ts) | Prisma VoiceTranscript → 패널 입력 |
| document finalize gate | [`voice-document-finalize-gate.service.ts`](../../src/lib/voice/voice-document-finalize-gate.service.ts) · [`voice-open-supplement-gate.repository.ts`](../../src/lib/voice/voice-open-supplement-gate.repository.ts) | Phase **5-H-UI-2/3/5** 서버 차단 |
| Document Finalize Gate UI | [`voice-document-finalize-gate-panel.tsx`](../../src/components/cases/voice-document-finalize-gate-panel.tsx) · [`GET .../voice/document-finalize-gate`](../../src/app/api/cases/[caseId]/voice/document-finalize-gate/route.ts) | Phase **5-H-UI-6** |

후속: Phase **5-J Voice RC** — [`VOICE_RC_LOCK_SUMMARY.md`](./VOICE_RC_LOCK_SUMMARY.md) · **LOCKED**.

---

## 7. 검증 (정적·서버 게이트)

- `npm run verify:aibeopchin-voice` — 본 명세·5-H-UI〜**5-H-UI-6 gate UI**·document finalize gate 마커
- `npm run test -- src/lib/voice/voice-lawyer-review-ux-policy.test.ts`
- `npm run test -- src/lib/voice/voice-document-finalize-gate.service.test.ts`
- `npm run test -- src/lib/voice/voice-document-finalize-gate-ui.test.ts`
- `npm run test -- src/lib/voice/voice-open-supplement-gate.repository.test.ts`
- `npm run test -- src/features/voice/voice-lawyer-supplement.service.test.ts`

### 7.1 서버 document finalize gate (Phase 5-H-UI-2)

| 진입점 | 함수 |
| --- | --- |
| `POST /api/legal-documents/:id/approve` | `assertVoiceDocumentFinalizeAllowed(caseId)` |
| `documentDetailService.reviewDocument(APPROVE)` | 동일 |
| `finalizeDocumentDraft()` | 동일 |

차단 시 **403** · `VoiceDocumentFinalizeBlockedError` · details: `{ blockReason, questionKey, supplementRequestId?, gate: "document finalize" }`.

### 7.2 open Supplement gate (Phase 5-H-UI-5 · 명세 H-BLOCK-02)

| 조건 | 차단 코드 |
| --- | --- |
| Voice-origin Supplement `sourceMarker=phase5h-ui-4-voice-lawyer-review-supplement` · status ∉ {ACCEPTED, CLOSED, CANCELLED, EXPIRED} | `H-BLOCK-OPEN-SUPPLEMENT-UNRESOLVED` |

Voice transcript gate(5-H-UI-2/3) 통과 **후** `loadOpenVoiceOriginSupplementsByCaseId` → `evaluateOpenVoiceSupplementDocumentFinalizeGate` 순으로 평가한다.

### 7.3 Document Finalize Gate UI (Phase 5-H-UI-6)

| 영역 | 경로 |
| --- | --- |
| Block Reason Panel | [`voice-document-finalize-gate-panel.tsx`](../../src/components/cases/voice-document-finalize-gate-panel.tsx) |
| Snapshot API | `GET /api/cases/:caseId/voice/document-finalize-gate` |
| 사건 상세 | [`case-detail-client.tsx`](../../src/components/cases/case-detail-client.tsx) — 승인 전 gate 안내·버튼 disable |
| 초안 finalize | [`document-draft-client.tsx`](../../src/components/cases/document-draft-client.tsx) |

UI 문구 SSOT: `VOICE_DOCUMENT_FINALIZE_BLOCK_MESSAGES` (`voice-document-finalize-gate-ui.ts`) — 서버 403과 동일.

---

## 8. 변경 이력

| 날짜 | 내용 |
| --- | --- |
| 2026-05-23 | Phase **5‑H** 기준 명세 초안·정책·UI 후보 버킷 |
