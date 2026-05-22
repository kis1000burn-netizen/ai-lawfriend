# Voice Intake 정책 (VOICE_INTAKE_POLICY)

**상태**: Phase **5-A** 초안 · 제품·법무·보안 합의 전 **원칙 SSOT** (법적 검토 대체 아님)

**증빙 태그**: `[EVIDENCE-20260523-AIBEOPCHIN-PHASE5A-VOICE-INTAKE-INTERVIEW-LAYER]`

## 1. 목적

의뢰인이 **말로** 사건 관련 내용을 입력할 수 있게 하되, 그 결과가 곧바로 사건 기록·법률 문서로 굳지 않도록 **확인 전 초안** 단계를 제품 구조에 내장한다. STT(음성→텍스트)·TTS(텍스트→음성)는 **편의 레이어**이며, 판단·확정·제출 권한은 기존 AI법친 책임 모델을 따른다.

## 2. 범위 (Phase 5-A 문서 수준)

- **포함**: 음성 캡처 → STT → draft transcript → 사용자 확인/거절 → (확인 시) 기존 인터뷰 답변 저장 경로로의 연결 설계 원칙.
- **제외**: 특정 벤더 STT/TTS API 선정, 실시간 스트리밍 프로토콜 상세(5-B 이후).

## 3. 절대 원칙 (Non-negotiable)

아래는 Phase 5 전 구간에 걸쳐 **문서·UI·API**가 모두 준수해야 한다.

1. **음성 인식 결과는 자동 확정하지 않는다.** STT 출력은 항상 “기계가 추정한 텍스트”로 취급한다.
2. **사용자가 텍스트(또는 동등한 의미의 편집본)를 확인한 뒤에만** 인터뷰 답변·사건 근거 텍스트로 반영된다.
3. **변호사 검토 전·사용자 최종 확인 전**에는 법률 문서 확정·제출·외부 공유를 금지한다(기존 제품의 인간 확인 단계와 동일 계열).
4. **음성 원본(blob) 저장은 선택 기능**으로 둔다. 기본값은 **미저장** 또는 **단기 버퍼**(아래 보존 문서 참조).
5. **기본값**은 원본 음성 **미저장** 또는 **단기 보관 후 파기**(상세는 [VOICE_PRIVACY_AND_RETENTION_POLICY.md](./VOICE_PRIVACY_AND_RETENTION_POLICY.md)).
6. **STT 오류 가능성**을 질문·답변·확정 화면에 **항상 고지**한다.
7. **민감정보가 포함될 수 있음**을 전제로, transcript 및 음성(옵션)에 대한 **접근 권한을 최소화**한다(본인·권한 있는 담당자·운영 SLA 범위).

## 4. 상태 모델: `VoiceTranscriptStatus`

STT 결과와 인터뷰 반영 사이에는 **중간 상태**가 필수이다. 구현에서는 enum 또는 동등 명칭을 사용한다.

```ts
/** 제품 명칭 안 — 실제 타입명은 레포 규약에 따름 */
type VoiceTranscriptStatus =
  | "CAPTURED"              // 원시 캡처·클라 업로드 직후(또는 STT 요청 전)
  | "NEEDS_CONFIRMATION"    // STT 완료, 사용자 확인 대기 (기본 검토 상태)
  | "CONFIRMED"             // 사용자가 내용 확인·수정 후 인터뷰 바인딩 허용
  | "REJECTED";             // 사용자가 폐기 — 인터뷰에 반영하지 않음
```

**설계 노트**

- `CONFIRMED` 이후에만 `VOICE_INTERVIEW_ANSWER_BOUND` 클래스 이벤트를 발행하는 것을 권장한다([VOICE_INTERVIEW_FLOW.md](./VOICE_INTERVIEW_FLOW.md)).
- `CAPTURED`에서 곧바로 사건 노트·문서에 쓰이면 **금지**(§3 원칙 위반).

## 5. AuditLog vs Voice 추적

감사·운영 패턴은 다음을 권장한다.

- **`AuditLog`**: 고수준 플랫폼 책무(예: 음성 기능 활성화 정책 위반 알림 등)가 필요할 때만 선별 적재 — STT 문자 단위의 모든 변경은 과밀 할 수 있음.
- **`VoiceInteractionTrace`(신규) 또는 기존 Case/Gongbuho 추적 블록 확장**: 사용자 확인 전후 단계가 법적으로 중요할 때 **케이스 수준 타임라인**에 적합한 이벤트로 남김([VOICE_INTERVIEW_FLOW.md](./VOICE_INTERVIEW_FLOW.md)).

최소 권장 이벤트(명칭은 구현 전 SSOT 확정):

- `VOICE_TRANSCRIPT_CREATED`
- `VOICE_TRANSCRIPT_CONFIRMED`
- `VOICE_TRANSCRIPT_REJECTED`
- `VOICE_INTERVIEW_ANSWER_BOUND`

## 6. 책임·고지 카피(방향)

UI·약관에서는 다음 취지를 노출 가능한 형태로 둔다(문구 확정은 카피·법무 검수).

- 자동 녹음·전송이 아닌 사용자 **명시 시작** 우선.
- STT 결과는 참고 초안이며 **오류·누락 가능**.
- 확인하지 않은 은닉 텍스트는 사건 증명용으로 사용되지 않는다.

## 7. 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-05-23 | Phase 5-A 초안 작성 |
