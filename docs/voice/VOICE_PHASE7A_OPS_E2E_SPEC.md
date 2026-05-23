# Voice Phase 7-A — Operations & E2E Hardening

**상태**: Phase **7-A** — Voice 운영 안정화(개인정보·문서 확정 gate 직전)

**증빙 태그**: **`[EVIDENCE-20260523-AIBEOPCHIN-PHASE7A-VOICE-OPS-E2E-HARDENING]`**

## 1. 목적

Voice RC(5-J) 봉인 이후, **개인정보·문서 확정 gate**에 가장 가까운 운영 축을 먼저 안정화한다.

| Slice | 범위 |
| --- | --- |
| **7-A-1** | 인증 UI/API E2E 자동화(401 always-on + optional auth smoke) |
| **7-A-2** | Transcript 운영 대시보드(메타만 · TTL backlog) |
| **7-A-3** | 삭제·정정·STT 민원 처리 UI/API(런북 §7.1〜7.3) |

## 2. 운영 화면

| 경로 | 역할 |
| --- | --- |
| `/admin/voice/transcripts` | transcript 메타·상태별 집계·TTL 초과 초안 |
| `/admin/voice/privacy-requests` | 삭제·정정·STT 민원 티켓 목록 |
| `/admin/voice/privacy-requests/new` | 민원 등록(본문 transcript 금지) |
| `/admin/voice/privacy-requests/[requestId]` | 처리·resolutionCode · 초안 purge |

**접근**: STAFF · ADMIN · SUPER_ADMIN (`requireStaffOrPlatformAdmin*`)

## 3. API

| Method | Path | 설명 |
| --- | --- | --- |
| GET | `/api/admin/voice/transcripts` | 메타 목록(`draftText` 없음) |
| GET | `/api/admin/voice/transcripts/summary` | 상태별 집계 · TTL backlog · 미결 privacy |
| GET/POST | `/api/admin/voice/privacy-requests` | 민원 목록·등록 |
| GET/PATCH | `/api/admin/voice/privacy-requests/[requestId]` | 상세·처리 |

## 4. Prisma

- `VoicePrivacyOpsRequest` — `20260524210000_voice_phase7a_ops`
- Enums: `VoicePrivacyOpsRequestType` · `VoicePrivacyOpsRequestStatus` · `VoicePrivacyOpsResolutionCode`

**CONFIRMED transcript** — `DRAFT_PURGED` 차단 · 삭제는 `ESCALATED_LAWYER_REVIEW` 등만(런북 §7.1).

## 5. 검증

```bash
npm run db:migrate
npm run verify:aibeopchin-voice
npm run test -- src/lib/voice/voice-ops-policy.test.ts src/features/voice/voice-ops.service.test.ts
```

### E2E

**Always-on** (dev 서버 불필요 — API 401):

```bash
npx playwright test tests/e2e/voice-guided-interview-smoke.spec.ts
```

**Optional smoke** (`E2E_VOICE_OPS_SMOKE=1` + ADMIN + DB):

```powershell
npm run dev
npm run db:migrate
$env:E2E_VOICE_OPS_SMOKE="1"
$env:E2E_ADMIN_EMAIL="admin@example.com"
$env:E2E_ADMIN_PASSWORD="..."
# 선택: 의뢰인 STT capture
$env:E2E_USER_EMAIL="..."
$env:E2E_USER_PASSWORD="..."
$env:E2E_VOICE_CASE_ID="<uuid>"
npx playwright test tests/e2e/voice-guided-interview-smoke.spec.ts
```

## 6. 관련 문서

- [`VOICE_PRIVACY_RETENTION_RUNBOOK.md`](./VOICE_PRIVACY_RETENTION_RUNBOOK.md) §7.1〜7.3
- [`VOICE_QA_ACCESSIBILITY_SMOKE.md`](./VOICE_QA_ACCESSIBILITY_SMOKE.md)
- [`README.md`](./README.md) Phase 7-A 인덱스
