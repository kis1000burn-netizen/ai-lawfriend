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

- 트리거: 확정 transcript vs 인터뷰 답변 **불일치**, 또는 변호사 **수동**.
- 결과물은 **기존 supplement / interview 질의 흐름**에 합류(예: `supplement` 경로 또는 질문셋 재요청 패턴 — **실제 라우트는 구현 과제에서 본 명세와 대조**).
- **키워드** `Supplement`(제품 검색용) — 구현 후 이벤트명은 별도 ADR 가능.

---

## 5. 문서 확정 전 검토 차단 기준 (**document finalize** gate)

다음 중 하나라도 해당하면 해당 사건 **document** 타입(**소장·내용증명 등 제품별 정의**)에 대한 **변호사 확정/발송** UX는 **블록**된다.

| ID | 차단 조건 |
| --- | --- |
| H-BLOCK-01 | 해당 질문 키에 대해 **`CONFIRMED` VoiceTranscript**가 있는데 변호사 **검토 완료** 플래그가 없음 |
| H-BLOCK-02 | 확정 transcript와 **Interview answer** 불일치 + **제안 또는 보완 질문** 미처리 상태 |
| H-BLOCK-03 | TTL 만료·REJECT 초안만 존재하고 **확정 경로 불명** 상태(의뢰인 재발화 필요) |

(제품 카피는 한국어 우선 가능하나 검증 문자열 및 API 문맥에서는 **block**(차단)·**unblock** 용어를 병행할 수 있다.)

**해제 조건**(예시): 변호사 **검토 완료**(명시 버튼) + 불일치에 대한 조치 로그 존재(메타)·보완 완료.

---

## 6. 코드 / 화면 연결 후보 (구현 버킷)

| 후보 영역 | 용도 | 비고 |
| --- | --- | --- |
| **사건 상세** (`cases/[caseId]`) 또는 **인터뷰 회고** 패널 | 변호사가 사건 진입 후 음성·인터뷰 맥락 진입점 | 라우팅 그룹 `(lawyer)` vs `(protected)` **역할별** 검증 유지 |
| **Lawyer-only transcript review panel** | draft / confirmed / 답변 3축 카드 또는 탭 · **변호사 전용** 노출 | `LAWYER` 할당 검증 필요 |
| **Confirmed transcript diff view** | 줄·토큰 수준 단순 비교 또는 섹션 정렬(side-by-side) | Diff 라이브러리·a11y는 구현 과제 |
| **Supplement question trigger** 질문 | §4 규격에 따라 supplement 플로 **시작 또는 큐 적재** | 기존 `supplement` API·플로와 합류 |

후속 단계에서는 위 표의 **실제 파일 경로**를 PR 설명과 **증빙**에 교차 링크한다.

---

## 7. 검증 (정적 게이트)

- `npm run verify:aibeopchin-voice` — 본 명세 존재·필수 문구·`VOICE_LAWYER_REVIEW_UX_SPEC_MARKER_PHASE5H` 존재
- `npm run test -- src/lib/voice/voice-lawyer-review-ux-policy.test.ts`

---

## 8. 변경 이력

| 날짜 | 내용 |
| --- | --- |
| 2026-05-23 | Phase **5‑H** 기준 명세 초안·정책·UI 후보 버킷 |
