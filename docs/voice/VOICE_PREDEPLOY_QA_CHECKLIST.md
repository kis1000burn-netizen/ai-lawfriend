# Voice Predeploy QA Checklist (Phase **5‑G**)

**증빙 태그**: **`[EVIDENCE-20260523-AIBEOPCHIN-PHASE5G-VOICE-MVP-LOCK-PREDEPLOY-QA]`**

목적: 기능 추가 없이 **배포 직전** 음성 MVP 축만 빠르게 재확인한다. 상세 브라우저·수동 QA는 [`VOICE_QA_ACCESSIBILITY_SMOKE.md`](./VOICE_QA_ACCESSIBILITY_SMOKE.md) 참조.

---

## ☐ A. 레포 불변 규격(자동)

| # | 명령 | 기대 |
|---|------|------|
| A1 | `npm run verify:aibeopchin-voice` | **PASS**(Phase **5‑B〜I** 마커) |
| A2 | `npm run verify:canonical-sources` | **PASS** — `CaseStatus` 등 레포 규격(변경 시 후속 과제 명시). 음성 직교일 수 있으나 배포 플라이트에 포함 권장 |
| A3 | `npm run lint` | **PASS** 또는 팀 허용 잔여 정책 |
| A4 | 패널·메시지·TTS policy Vitest 묶음(아래 B) | **PASS** |

---

## ☐ B. Phase **5‑E〜F** 핵심 Vitest 묶음(재현 헤드)

```bash
npm run test -- --run \
  src/components/cases/interview-voice-guided-panel.test.tsx \
  src/lib/voice/interview-voice-guided-messages.test.ts \
  src/lib/voice/voice-prompt-tts-policy.test.ts
```

| 기준(본 헤드 2026‑05‑23) | 결과 |
|--------------------------|------|
| `interview-voice-guided-panel.test.tsx` | **`3`** tests **PASS** |
| `interview-voice-guided-messages.test.ts` | **`4`** tests **PASS** |
| `voice-prompt-tts-policy.test.ts` | **`8`** tests **PASS** |
| 합계(위 3파일) | **`15`** tests **PASS** |

**Phase **5‑I** 보존 헬퍼 포함 전체**:

```bash
npm run test -- --run src/lib/voice/
```

| 기준 | 결과 |
|------|------|
| `src/lib/voice/**/*.test.ts` | **`5`** files · **`25`** tests **PASS** (신규 `voice-transcript-retention-policy`: **10**) |

---

## ☐ C. Playwright(범위 분리)

| # | 내용 |
|---|------|
| C1 | **포함 스펙**(레포 표준): `tests/e2e/voice-guided-interview-smoke.spec.ts` → **미로그인 API 401**(Phase **5‑F**·**5‑F FINAL**) |
| C2 | **별도 과제**: 로그인·인터뷰 페이지·패널 UI 자동 검증은 `PLAYWRIGHT_BASE_URL`·storageState 준비 후 **추가 스펙/describe** 또는 스테이징 런북 |
| C3 | 로컬 실행 예: `PLAYWRIGHT_BASE_URL=http://localhost:3000 npm run test:e2e -- tests/e2e/voice-guided-interview-smoke.spec.ts` — **개발 서버 필요** |

---

## ☐ D. 제품 기준 재확인(수동·스폿)

[`VOICE_MVP_LOCK_SUMMARY.md`](./VOICE_MVP_LOCK_SUMMARY.md) §3과 동일:

- **`CONFIRMED` 전 인터뷰 반영 없음**
- TTS Busy 중 **「말해서 답하기」만 비활성**, **텍스트 초안 허용**
- TTS 재생 **`VoiceInteractionTrace` 미적재**

---

## ☐ E. 문서 교차 참조

- MVP 잠금: [`VOICE_MVP_LOCK_SUMMARY.md`](./VOICE_MVP_LOCK_SUMMARY.md)
- 브라우저·접근성: [`VOICE_QA_ACCESSIBILITY_SMOKE.md`](./VOICE_QA_ACCESSIBILITY_SMOKE.md)
- Phase **5‑I** (Privacy·TTL) 런북: [`VOICE_PRIVACY_RETENTION_RUNBOOK.md`](./VOICE_PRIVACY_RETENTION_RUNBOOK.md) · [`VOICE_TTL_CLEANUP_POLICY.md`](./VOICE_TTL_CLEANUP_POLICY.md)
- 증빙 SSOT: [`IMPLEMENTATION_EVIDENCE.md`](../project-governance/IMPLEMENTATION_EVIDENCE.md) · `[EVIDENCE-20260523-AIBEOPCHIN-PHASE5I-VOICE-PRIVACY-RETENTION-OPERATIONS-RUNBOOK]` (최상단)
