# AI법친 Voice Intake · Interview Layer (Phase 5)

**상태**: Phase **5‑A〜I**까지 문서·스키마(5‑B)·TTS 규격(5‑C)·**STT(5‑D)**·**Guided UX(5‑E)**·**QA·접근성(5‑F)**·**MVP Lock(5‑G)**·**개인정보·보존 런북 봉인(5‑I)** · **`5‑H` 변호사 Voice Review UX 기준 명세(문서)**

증빙: `[EVIDENCE-20260523-AIBEOPCHIN-PHASE5A-VOICE-INTAKE-INTERVIEW-LAYER]` · `[EVIDENCE-20260523-AIBEOPCHIN-PHASE5B-VOICE-TRANSCRIPT-DRAFT-STORAGE]` · `[EVIDENCE-20260523-AIBEOPCHIN-PHASE5C-VOICE-PROMPT-TTS-LAYER]` · `[EVIDENCE-20260523-AIBEOPCHIN-PHASE5D-STT-CONFIRM-INTERVIEW-BINDING]` · `[EVIDENCE-20260523-AIBEOPCHIN-PHASE5E-TTS-PLAYER-GUIDED-INTERVIEW-UX]` · **`[EVIDENCE-20260523-AIBEOPCHIN-PHASE5F-VOICE-QA-ACCESSIBILITY-SMOKE]`** · **`[EVIDENCE-20260523-AIBEOPCHIN-PHASE5F-FINAL-QA-TEXT-PRODUCT-ALIGNMENT]`** · **`[EVIDENCE-20260523-AIBEOPCHIN-PHASE5G-VOICE-MVP-LOCK-PREDEPLOY-QA]`** · **`[EVIDENCE-20260523-AIBEOPCHIN-PHASE5I-VOICE-PRIVACY-RETENTION-OPERATIONS-RUNBOOK]`** · **`[EVIDENCE-20260523-AIBEOPCHIN-PHASE5H-LAWYER-VOICE-REVIEW-UX-SPEC]`** · [`IMPLEMENTATION_EVIDENCE.md`](../project-governance/IMPLEMENTATION_EVIDENCE.md)

## 검증

```bash
npm run verify:aibeopchin-voice
```

## 목적 요약

기존 **공부호 → QuestionSet → 사건 인터뷰** 축은 유지하고, 마이크·스피커만 **입·출력 레이어**로 얹습니다. 새로운 “법률 판단 엔진”이나 별도 인터뷰 엔진을 두지 않습니다.

## Phase 번호와 착수 순서 (**5‑I 선행 원칙**)

Phase **번호**에는 **H** 다음에 **I**가 오지만, **실무 착수·봉인 순서**는 **변호사 음성 검토 UX(5‑H) 전에 개인정보·보존 규격(5‑I)을 먼저 잠그는 것**을 권장한다.

Phase **5‑I** is intentionally executed **before Phase 5‑H** to lock privacy, retention, and operations **before** adding lawyer-facing transcript review UX.

즉 실행 추천 순서: **5‑G(MVP)** → **5‑I**(Privacy·TTL·운영 런북 봉인) → **5‑H**(변호사 검토 UX) → (선후 제품 합의에 따라 **5‑J Voice RC** 검토 가능).

### Phase 상태(요약)

| Phase | Name | 한글 명칭 | 상태 |
| --- | --- | --- | --- |
| **5‑G** | Voice MVP Lock & Predeploy QA | 음성 MVP 봉인·배포 전 QA | **LOCKED** |
| **5‑I** | Voice Privacy, Retention & Operations Runbook | 개인정보·보존·운영 런북 봉인 | **LOCKED** |
| **5‑H** | Lawyer Voice Review UX | 변호사 음성·transcript 검토 UX | **SPEC** (`[VOICE_LAWYER_REVIEW_UX_SPEC.md](./VOICE_LAWYER_REVIEW_UX_SPEC.md)`) |

## 코어 문서 (5‑A〜**H**〜I 인덱스)

| 문서 | 역할 |
|------|------|
| [VOICE_INTAKE_POLICY.md](./VOICE_INTAKE_POLICY.md) | 제품 목표, 비판단 원칙, **`VoiceTranscriptStatus`**, 책임 |
| [VOICE_INTERVIEW_FLOW.md](./VOICE_INTERVIEW_FLOW.md) | Gongbuho 연계 End-to-End, 상태 전이 |
| [VOICE_TRANSCRIPT_QA.md](./VOICE_TRANSCRIPT_QA.md) | STT QA·변호사 검토 차단 준비(향후 **5‑H**) |
| [VOICE_PRIVACY_AND_RETENTION_POLICY.md](./VOICE_PRIVACY_AND_RETENTION_POLICY.md) | 원본 음성·텍스트 보존 원칙(하위 명세 연계 **5‑I**) |
| [VOICE_PRIVACY_RETENTION_RUNBOOK.md](./VOICE_PRIVACY_RETENTION_RUNBOOK.md) | **Phase 5‑I** — 접근통제·로그 금지·민원·장애·삭제 명문 |
| [VOICE_TTL_CLEANUP_POLICY.md](./VOICE_TTL_CLEANUP_POLICY.md) | **Phase 5‑I** — 초안 TTL·cleanup 타깃 정책 |
| [VOICE_TRANSCRIPT_STORAGE_SCHEMA.md](./VOICE_TRANSCRIPT_STORAGE_SCHEMA.md) | Prisma 규격, TTL 필드 · `VoiceInteractionTrace` |
| [VOICE_PROMPT_TTS_SPEC.md](./VOICE_PROMPT_TTS_SPEC.md) | 질문 TTS 문자열(**5‑C**) |
| [VOICE_TTS_GUIDED_UX.md](./VOICE_TTS_GUIDED_UX.md) | Guided 패널(**5‑E**·FINAL 규격) |
| [VOICE_TTS_TRACE_POLICY.md](./VOICE_TTS_TRACE_POLICY.md) | 브라우저 TTS → Trace 비적재 |
| [VOICE_TRANSCRIPT_API.md](./VOICE_TRANSCRIPT_API.md) | **`stt-capture`** / **`confirm`** / **`reject`** (**5‑D**) |
| [VOICE_QA_ACCESSIBILITY_SMOKE.md](./VOICE_QA_ACCESSIBILITY_SMOKE.md) | 브라우저·접근성 회귀(**5‑F**) |
| [VOICE_MVP_LOCK_SUMMARY.md](./VOICE_MVP_LOCK_SUMMARY.md) | **5‑G** 산출·불변 기준 |
| [VOICE_PREDEPLOY_QA_CHECKLIST.md](./VOICE_PREDEPLOY_QA_CHECKLIST.md) | 배포 전 체크(**5‑G**·연계 **5‑I**) |
| [VOICE_LAWYER_REVIEW_UX_SPEC.md](./VOICE_LAWYER_REVIEW_UX_SPEC.md) | **Phase 5‑H** — 변호사 검토·transcript 비교·보완 질문·문서 확정 전 차단 |

## 권장 로드맵 표 (과제 패키지)

| Phase | 코드명 방향 |
|-------|--------------|
| **5-A** | Voice Intake 표준 문서 확정 · 증빙 |
| **5-B** | `VoiceTranscript`·`VoiceInteractionTrace`·TTL·`verify:aibeopchin-voice` 시작 |
| **5-C** | Voice Prompt/TTS 문자열 규격 |
| **5-D** | STT·confirm·바인딩 REST |
| **5-E** | 브라우저 TTS + 패널 + Trace 비적재 |
| **5-F** | QA·접근성 패키지 + FINAL(텍스트·Playwright 명확화) |
| **5-G** | **Voice MVP Lock** · [`VOICE_MVP_LOCK_SUMMARY.md`](./VOICE_MVP_LOCK_SUMMARY.md) · 증빙 PHASE5G |
| **5-I** | **Privacy·Retention·Operations Runbook** · [`VOICE_PRIVACY_RETENTION_RUNBOOK.md`](./VOICE_PRIVACY_RETENTION_RUNBOOK.md)·[`VOICE_TTL_CLEANUP_POLICY.md`](./VOICE_TTL_CLEANUP_POLICY.md) · 증빙 PHASE5I |
| **5-H** | 변호사 **Voice Review UX** 규격 — [`VOICE_LAWYER_REVIEW_UX_SPEC.md`](./VOICE_LAWYER_REVIEW_UX_SPEC.md) · 증빙 **PHASE5H** (**5‑I** 이후 적용 추천) |
| **5-J** | (선택 후속) Voice Release Candidate / 전 레이어 최종 배포 잠금 |

## 연계 문서 (기존 제품)

- 공부호 인터뷰 바인딩: [`docs/gongbuho/GONGBUHO_INTERVIEW_BINDING.md`](../gongbuho/GONGBUHO_INTERVIEW_BINDING.md)
- 공부호 안전 원칙: [`docs/gongbuho/GONGBUHO_SAFETY_POLICY.md`](../gongbuho/GONGBUHO_SAFETY_POLICY.md)

## 한 줄 기준

AI법친 Phase 5는 새로운 법률 판단 엔진을 만드는 단계가 아니라, 기존 공부호·질문셋·인터뷰·문서 생성 흐름에 **음성 입·출력 레이어**를 안전하게 장착하는 단계이다.

AI법친은 Gongbuho MVP를 Phase 4‑G에서 잠금했고, Phase **5‑G**에서 **음성 MVP를 기능 추가 없이 봉인**했으며, Phase **5‑I**에서 **원본 음성 미저장·draft TTL 정리 규격·본문 로그 금지·역할 접근 분리·삭제·민원·장애 대응 워킹 패턴을 운영 런북과 코드 마커로 먼저 잠금**하였다(**Phase 5‑I**는 번호만 뒤이지만 변호사 UX 전에 우선 처리). 이후 **Phase 5‑H**에서는 Phase **5‑I** 위에서 변호사가 **음성 transcript·확정 답변**을 검토하고 **보완 질문**을 만들며 **문서 확정 전 검토 누락을 차단**하는 **Lawyer Voice Review UX** 규격([`VOICE_LAWYER_REVIEW_UX_SPEC.md`](./VOICE_LAWYER_REVIEW_UX_SPEC.md))으로 확장하고, 필요 시 **Phase 5‑J** 에서 배포 레벨 종료 검토가 가능하다. **Playwright**는 스펙에 **미로그인 API 401** 만 들어 있고, 인증 UI E2E는 `PLAYWRIGHT_BASE_URL`(예: `http://localhost:3000`)·개발 또는 스테이징 환경에서 **별도 과제**이다.
