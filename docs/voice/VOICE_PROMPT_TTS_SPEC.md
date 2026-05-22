# Voice Prompt & TTS 질문 레이어 (Phase 5-C)

**상태**: Phase **5-C** — 질문 → 음성 안내 텍스트·TTS 입력 규격 SSOT · **5-E** 브라우저 플레이어 적용 참조 **[`VOICE_TTS_GUIDED_UX.md`](./VOICE_TTS_GUIDED_UX.md)**

**증빙 태그**: `[EVIDENCE-20260523-AIBEOPCHIN-PHASE5C-VOICE-PROMPT-TTS-LAYER]` · Guided UX 증빙: **`[EVIDENCE-20260523-AIBEOPCHIN-PHASE5E-TTS-PLAYER-GUIDED-INTERVIEW-UX]`**

## 1. 목적

Gongbuho packet → 게시된 `QuestionSet` → 사건 인터뷰에서 이미 노출되는 **동일 질문**을, 화면 문구만이 아니라 **스피커 출력(TTS 입력 문자열)**으로도 재현 가능하게 한다. 질문의 **법적 의미나 답변을 확정하지 않는다**는 Phase 5-A 원칙을 그대로 둔다.

## 2. 원칙 (Non‑negotiable)

1. TTS 안내 문은 **판단·자문·결론형 문장** 금지(“승소할 것입니다”, “범죄입니다” 등).
2. **화면 표시 문자열**(기본적으로 `QuestionSetQuestion.label` 중심)과 **음성 1순위 문안**은 **동일 근거**여야 한다(음성만 다른 “숨 설명” 추가 금지).
3. `helpText`, `description` 등은 재생 **선택 블록**으로만 순서 규격(§5) 적용한다.
4. 민감 주제 문항에서는 **별도 고지 접두**(§6)·녹음/전송 동의 플로우 준수.
5. TTS 문자열에는 **Markdown·HTML 미포함**(순 텍스트). 엔티티는 제품 전역 정책에 맞춰 이스케이프.

## 3. 질문별 `voicePrompt` 규격 (데이터 명칭)

**질문 정의**(질문셋 JSON / DB `definitionJson` 투영 후 런타임 `QuestionSetQuestion`)에는 **선택** 객체 `voicePrompt`를 허용한다. 타입 이름은 레포 TS와 동기 가능하며, 초기 명세는 다음 정도를 권한다.

```ts
/**
 * 선택 — 미기재 시 §4 의 기본 합성(`buildDefaultTtsReadAloudText`) 규격 사용.
 */
type VoicePromptSpec = {
  /** TTS 1순위 본문(비우면 §4 라벨 규격) */
  readAloudPrimary?: string;
  /** true면 재생 전에 §6 접두 또는 `sensitivePrefix` 우선 재생 */
  requiresSensitiveSpeechNotice?: boolean;
  /** 민감 고지 접두 미사용 시에도 카피팀 검수 문구 가능 */
  sensitivePrefix?: string;
  /** 선택·타입 선택지를 음성으로 순회할 때의 정렬 순서 재정의 필요 시만 */
  optionReadOrder?: "DEFINITION_ORDER" | "ALPHA_BY_LABEL";
};
```

패킷 Gongbuho `questionFlow` 투영으로 생성된 질문에는, 운영에서 **패킷 수정 없이도** 카탈로그 편집 시 `voicePrompt`를 채울 수 있게 한다는 것이 목표다(실제 에디터는 백로그).

## 4. QuestionSet 질문 → TTS 안내문 변환 정책

`QuestionSetQuestion` 기준(참조: `src/features/question-set/question-set.types.ts` 의 `label`·`description`·`helpText`).

| 우선순위 | 블록 | 포함 조건 |
|:--------:|------|-----------|
| 1 | `voicePrompt.readAloudPrimary` | 지정된 경우 단독 스크립트(§2 위반 검수 필수); 미지정 시 `label` 원문 그대로(문장부호 허용) |
| 2 | `description` | null/공백이 아니며, 사용자 설정에서 「상세 말하기」 활성 또는 기본 포함 정책일 때 한 문장 접속 |
| 3 | `helpText` | null/공백이 아니면 “참고로, …” 류 **짧게** 허용(과도 장문 금지 — 권장 200자 또는 4문장 이내) |
| SELECT/MULTI_SELECT | `options` | 기본값: **항목 레이블을 짧게 열거** 또는 “목록 중에서 고르거나 말로 답할 수 있습니다” 등 **플랫폼 공통 패턴**(UX 팀 카피) |

공통 기본값 합성은 `src/lib/voice/voice-prompt-tts-policy.ts` 의 `buildDefaultTtsReadAloudText`(Phase 5-C 기준 참조 구현).

## 5. 재질문 · 천천히 말하기 · 예시 안내

이 절은 **추가 TTS 레이어만** 명문하고, 표준 질문 본문(§4)과 **분리 문자열로 합치는 순서를 고정**한다.

| 키(문구 ID 개념) | 용도 | 제약 |
|------------------|------|------|
| `replayQuestion` | 사용자 “다시 읽어주세요” 트리거 후 **본문 재생**(§4 결과와 동일) | 질문 교체 불가 |
| `speakSlowly` | 속도 변경 시 **플랫폼 공통 카피 1줄**(예 “천천히 들려드리겠습니다”) 다음 본문 재생 | 본문 문구 변경 금지 |
| `exampleHintTemplate` | **법률 사실 특정 불가**(일반 패턴만, 예 숫자·날짜 형식 안내); 질문별 `voicePrompt.exampleSentence` 허용하되 과장 금지 | 미리보기·옵트인 플래그 |

## 6. 민감정보 질문 시 음성 고지 규격

다음 분류 하나라도 해당하면 **`requiresSensitiveSpeechNotice`**를 true로 간주하거나(룰)·운영 라벨로 태깅한다.

- 본인/상대 신원 특정 가능 정보(실명 조합 등)
- 주민·금융·건강·성적 지향 등 **민감 범주**
- 채증·증거 방법을 유도할 수 있는 **구체 증언 유도**(제품 책무 정의에 따름)

**고지 순서**(권장):

1. 접두 접속어(예 “다음 안내입니다.”) 또는 앱 카피팀 제공 **짧은 민감 고정 문구**
2. `readAloudPrimary` 또는 기본 §4 스크립트

`voicePrompt.sensitivePrefix`가 있으면 1 단계 자리에 우선 적용 가능.

## 7. 접근성·운영 최소 규격

- 동일 안내에는 **무음 구간**(짧게) 또는 접근성 패턴 허용(Phase 5-E).
- 문자열 바이트/길이 이슈 회피: 한 안내 회차 **약 900자**(가이드) 초과 추천 불가 → 문단 분할.
- 다국어: 기본 로케일은 제품 우선언어 하나에만 초기 고정(확대는 배포 전략 과제).

## 8. Phase 5-D·5-E 경계

- **5-D**: STT·`VoiceTranscript` 저장·CONFIRM·Interview 바인딩은 REST·서버 서비스.
- **5-E**: 클라이언트 TTS·Web Speech 초안 카드 등 [**`VOICE_TTS_GUIDED_UX.md`**](./VOICE_TTS_GUIDED_UX.md) · TTS 재생 Trace 정책은 [**`VOICE_TTS_TRACE_POLICY.md`**](./VOICE_TTS_TRACE_POLICY.md).

## 9. 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-05-23 | Phase 5-C 초안(SSOT)·`voicePrompt`·민감 고지순 재질문·천천히 카피 ID |
