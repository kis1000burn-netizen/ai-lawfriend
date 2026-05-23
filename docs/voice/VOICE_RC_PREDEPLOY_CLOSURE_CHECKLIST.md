# Voice RC Predeploy Closure Checklist (Phase **5‑J**)

**증빙 태그**: **`[EVIDENCE-20260523-AIBEOPCHIN-PHASE5J-VOICE-RC-PREDEPLOY-CLOSURE]`**

목적: Voice **5‑A〜5‑H‑UI‑6** 전 레이어를 **릴리즈 후보(RC)** 로 봉인한 뒤, 배포 직전에 **한 번에** 재확인한다. MVP 단계 체크는 [`VOICE_PREDEPLOY_QA_CHECKLIST.md`](./VOICE_PREDEPLOY_QA_CHECKLIST.md)(**5‑G**)를 선행 참조한다.

---

## ☐ A. RC 정적 게이트(자동)

| # | 명령 | 기대 |
| --- | --- | --- |
| A1 | `npm run verify:aibeopchin-voice-rc` | **PASS** — `verify:aibeopchin-voice` 선행 + migration·증빙·RC 문서 |
| A2 | `npm run verify:aibeopchin-voice` | **PASS** (A1에 포함) |
| A3 | `npm run verify:canonical-sources` | **PASS** (배포 플라이트 권장) |

---

## ☐ B. Vitest RC 묶음

```bash
npm run test -- --run src/lib/voice/
npm run test -- --run src/features/voice/voice-lawyer-supplement.service.test.ts
```

| 기준(본 헤드) | 결과 |
| --- | --- |
| `src/lib/voice/**/*.test.ts` | **57+** tests **PASS** |
| `voice-lawyer-supplement.service.test.ts` | **6** tests **PASS** |

Guided 패널·TTS(**5‑E〜F**) 묶음은 [`VOICE_PREDEPLOY_QA_CHECKLIST.md`](./VOICE_PREDEPLOY_QA_CHECKLIST.md) §B와 동일.

---

## ☐ C. DB migration (배포 전 **필수**)

`DATABASE_URL` 설정 후:

```bash
npm run db:migrate
# 또는 prod: npm run db:deploy
```

| migration | 용도 |
| --- | --- |
| `20260524120000_voice_lawyer_review_completion_phase5h_ui3` | `VoiceLawyerReviewCompletion` (5‑H‑UI‑3) |
| `20260524143000_voice_lawyer_supplement_phase5h_ui4` | Supplement item voice origin (5‑H‑UI‑4) |

---

## ☐ D. Document finalize gate · UI (스폿)

[`VOICE_LAWYER_REVIEW_UX_SPEC.md`](./VOICE_LAWYER_REVIEW_UX_SPEC.md) §5〜§7.3:

- 미확정 transcript · mismatch 미검토 · 변호사 검토 미완료 → **403**
- open Voice-origin Supplement → **`H-BLOCK-OPEN-SUPPLEMENT-UNRESOLVED`**
- 사건 상세 **Block Reason Panel** · 승인·finalize 버튼 disable · 403 문구 = UI SSOT

---

## ☐ E. Playwright(범위 분리 · 5‑G 유지)

- **포함**: `tests/e2e/voice-guided-interview-smoke.spec.ts` — 미로그인 API **401**
- **별도**: 인증 UI E2E · `PLAYWRIGHT_BASE_URL` 스테이징

---

## ☐ F. 문서 교차 참조

- RC 잠금: [`VOICE_RC_LOCK_SUMMARY.md`](./VOICE_RC_LOCK_SUMMARY.md)
- MVP 잠금: [`VOICE_MVP_LOCK_SUMMARY.md`](./VOICE_MVP_LOCK_SUMMARY.md)
- 증빙 SSOT: [`IMPLEMENTATION_EVIDENCE.md`](../project-governance/IMPLEMENTATION_EVIDENCE.md) · `[EVIDENCE-20260523-AIBEOPCHIN-PHASE5J-VOICE-RC-PREDEPLOY-CLOSURE]`
