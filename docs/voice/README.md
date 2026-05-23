# AI법친 Voice Intake · Interview Layer (Phase 5)

**상태**: Phase **5‑A〜I** · **5‑H(변호사 검토 UX·gate·UI)** · **5‑J Voice RC** · **7‑A Voice Ops & E2E** 문서·스키마·검증

증빙: `[EVIDENCE-20260523-AIBEOPCHIN-PHASE5A-VOICE-INTAKE-INTERVIEW-LAYER]` · … · **`[EVIDENCE-20260523-AIBEOPCHIN-PHASE5J-VOICE-RC-PREDEPLOY-CLOSURE]`** · **`[EVIDENCE-20260523-AIBEOPCHIN-PHASE7A-VOICE-OPS-E2E-HARDENING]`** · [`IMPLEMENTATION_EVIDENCE.md`](../project-governance/IMPLEMENTATION_EVIDENCE.md)

## 검증

```bash
npm run verify:aibeopchin-voice-rc   # Phase 5-J RC (verify:aibeopchin-voice 포함)
npm run verify:aibeopchin-voice      # Phase 5-B〜5-H-UI-6 정적 게이트
```

## 목적 요약

기존 **공부호 → QuestionSet → 사건 인터뷰** 축은 유지하고, 마이크·스피커만 **입·출력 레이어**로 얹습니다. 새로운 “법률 판단 엔진”이나 별도 인터뷰 엔진을 두지 않습니다.

## Phase 번호와 착수 순서 (**5‑I 선행 원칙**)

Phase **번호**에는 **H** 다음에 **I**가 오지만, **실무 착수·봉인 순서**는 **변호사 음성 검토 UX(5‑H) 전에 개인정보·보존 규격(5‑I)을 먼저 잠그는 것**을 권장한다.

Phase **5‑I** is intentionally executed **before Phase 5‑H** to lock privacy, retention, and operations **before** adding lawyer-facing transcript review UX.

즉 실행 추천 순서: **5‑G(MVP)** → **5‑I**(Privacy) → **5‑H**(변호사 검토 UX·gate·UI) → **5‑J(Voice RC)**.

### Phase 상태(요약)

| Phase | Name | 한글 명칭 | 상태 |
| --- | --- | --- | --- |
| **5‑G** | Voice MVP Lock & Predeploy QA | 음성 MVP 봉인·배포 전 QA | **LOCKED** |
| **5‑I** | Voice Privacy, Retention & Operations Runbook | 개인정보·보존·운영 런북 봉인 | **LOCKED** |
| **5‑H** | Lawyer Voice Review UX | 변호사 음성·transcript 검토 UX | **LOCKED** (5‑H‑UI〜**5‑H‑UI‑6**) |
| **5‑J** | Voice RC / Predeploy Closure | Voice 릴리즈 후보·배포 봉인 | **LOCKED** |

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
| [VOICE_RC_LOCK_SUMMARY.md](./VOICE_RC_LOCK_SUMMARY.md) | **5‑J** Voice RC 잠금 요약 |
| [VOICE_RC_PREDEPLOY_CLOSURE_CHECKLIST.md](./VOICE_RC_PREDEPLOY_CLOSURE_CHECKLIST.md) | **5‑J** RC 배포 직전 closure |
| [VOICE_LAWYER_REVIEW_UX_SPEC.md](./VOICE_LAWYER_REVIEW_UX_SPEC.md) | **Phase 5‑H** — 변호사 검토·transcript 비교·보완 질문·문서 확정 gate |
| [VOICE_PHASE7A_OPS_E2E_SPEC.md](./VOICE_PHASE7A_OPS_E2E_SPEC.md) | **Phase 7‑A** — 운영 대시보드·privacy ops UI · E2E hardening |

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
| **5-H** | 변호사 **Voice Review UX** · 5‑H‑UI〜6 — [`VOICE_LAWYER_REVIEW_UX_SPEC.md`](./VOICE_LAWYER_REVIEW_UX_SPEC.md) · 증빙 **PHASE5H** |
| **5-J** | **Voice RC / Predeploy Closure** · [`VOICE_RC_LOCK_SUMMARY.md`](./VOICE_RC_LOCK_SUMMARY.md) · 증빙 **PHASE5J** |
| **7-A** | **Voice Operations & E2E Hardening** · [`VOICE_PHASE7A_OPS_E2E_SPEC.md`](./VOICE_PHASE7A_OPS_E2E_SPEC.md) · 운영 대시보드 · privacy ops · E2E |

## 연계 문서 (기존 제품)

- 공부호 인터뷰 바인딩: [`docs/gongbuho/GONGBUHO_INTERVIEW_BINDING.md`](../gongbuho/GONGBUHO_INTERVIEW_BINDING.md)
- 공부호 안전 원칙: [`docs/gongbuho/GONGBUHO_SAFETY_POLICY.md`](../gongbuho/GONGBUHO_SAFETY_POLICY.md)

## 한 줄 기준

AI법친 Phase 5는 새로운 법률 판단 엔진을 만드는 단계가 아니라, 기존 공부호·질문셋·인터뷰·문서 생성 흐름에 **음성 입·출력 레이어**를 안전하게 장착하는 단계이다.

AI법친은 Gongbuho MVP를 Phase 4‑G에서 잠금했고, Phase **5‑G**에서 **음성 MVP를 기능 추가 없이 봉인**했으며, Phase **5‑I**에서 **개인정보·보존 런북**을, Phase **5‑H(5‑H‑UI〜6)** 에서 **변호사 Voice Review UX·document finalize gate·Supplement·Gate UI**를 완료했고, Phase **5‑J**에서 **Voice RC / Predeploy Closure**로 전 레이어 릴리즈 후보를 **봉인**했다. Phase **7‑A**에서 **transcript 운영 대시보드·삭제/정정 민원 UI·인증 E2E**를 추가한다. 배포 전 `npm run verify:aibeopchin-voice-rc` · migration `20260524210000_voice_phase7a_ops` 포함 **`npm run db:migrate`** 적용. **Playwright** always-on: 미로그인 API 401 + admin voice ops gates; optional `E2E_VOICE_OPS_SMOKE=1`.
