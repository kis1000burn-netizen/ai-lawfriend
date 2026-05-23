# Staging Secrets Live Verification — Phase A

**선행**: AI Core Full RC(12-A) + 로컬 predeploy PASS  
**후행 (별도 Phase)**: Migration Baseline Squash (B) — greenfield chronology

**증빙 태그**: `[EVIDENCE-20260523-AIBEOPCHIN-STAGING-SECRETS-LIVE-PHASE]`

---

## 게이트 요약 — 운영 배포 전 마지막 현실 검증

**한 줄**: AI법친은 **코드 기준 배포 후보**이며, staging secrets · OAuth callback · 역할 smoke **실측 PASS**가 운영 배포 전 마지막 게이트이다.

### 선행 준비 (PASS 전 필수)

- [ ] `NODE_ENV=production` (runtime · build job)
- [ ] `APP_BASE_URL=https://...` (staging 오리진)
- [ ] `DATABASE_URL` (staging 전용)
- [ ] OAuth callback 등록 (verify 출력 URI ↔ provider 콘솔)
- [ ] AI Core 9 keys
- [ ] smoke 계정 4종 — CLIENT / LAWYER / STAFF / ADMIN (`OPS_SMOKE_*_EMAIL` / `PASSWORD`)
- [ ] `OPS_SMOKE_CASE_ID` + LAWYER/STAFF `CaseAssignment`

### 실행 순서 (staging env 로드 셸)

```bash
npm run verify:staging-secrets -- --db-ping --oauth-smoke
npm run ops:staging-secrets-live-check
```

---

## 0. Phase 목적

배포 후보 AI Core를 **실제 staging 환경**에서 검증한다. 코드 변경이 아니라 **secrets·callback·런타임 NODE_ENV·역할 API** 실측이다.

| 확인 항목 | 도구 |
| --- | --- |
| env 존재·형식 (값 미출력) | `npm run verify:staging-secrets` |
| DATABASE_URL 연결 | `npm run verify:staging-secrets -- --db-ping` |
| OAuth callback URL 목록 | verify 스크립트 출력 → provider 콘솔 대조 |
| `/api/health` | `ops:staging-secrets-live-check` |
| AI Core 역할 경계 | `ops:ai-core-role-smoke` (**19 checks**, staging URL) |

**Migration Baseline Squash(B)** 는 본 Phase **완료 후** 또는 staging BLOCKED 시에만 우선 검토한다.

---

## 1. 준비 (staging 호스팅 / Secret Manager)

체크리스트: [STAGING_SECRETS_CHECKLIST.md](./STAGING_SECRETS_CHECKLIST.md)

### 1.1 필수 env

| 변수 | 실측 기대 |
| --- | --- |
| `DATABASE_URL` | staging 전용 PostgreSQL · `--db-ping` PASS |
| `JWT_SECRET` / `CRON_SECRET` | 각 32자 이상 · production과 **다름** |
| `APP_BASE_URL` | `https://` staging 오리진 |
| `NODE_ENV` | **`production`** (runtime · build job) |
| `NEXT_PUBLIC_APP_ENV` | `staging` 권장 |
| AI Core 9 keys | [`full-ai-core-rc-lock.ts`](../../src/features/ai-core/full-ai-core-rc-lock.ts) |

### 1.2 OAuth (사용 provider만)

verify 실행 시 **callback URL 목록**이 출력된다. 각 provider 콘솔에 **동일 URI** 등록:

```
{APP_BASE_URL}/api/auth/oauth/google/callback
{APP_BASE_URL}/api/auth/oauth/kakao/callback
{APP_BASE_URL}/api/auth/oauth/naver/callback
```

- client id / secret **쌍** 필수 (하나만 있으면 FAIL)
- **값은 문서·채팅·증빙에 기록 금지**

### 1.3 Staging smoke 계정 · 사건

역할 smoke용 **전용 계정** (seed 계정을 staging에 그대로 쓰지 말 것 — 팀 정책에 따름):

| env | 용도 |
| --- | --- |
| `OPS_SMOKE_CLIENT_EMAIL` / `PASSWORD` | CLIENT 경계 |
| `OPS_SMOKE_LAWYER_EMAIL` / `PASSWORD` | graph · preview · review |
| `OPS_SMOKE_STAFF_EMAIL` / `PASSWORD` | STAFF 경계 |
| `OPS_SMOKE_ADMIN_EMAIL` / `PASSWORD` | audit-policy |
| `OPS_SMOKE_CASE_ID` | smoke 사건 ID (CLIENT owner + LAWYER/STAFF `CaseAssignment`) |

---

## 2. 실행 순서

### Step 1 — env 정적 실측 (staging shell)

staging 배포 파이프 env가 로드된 셸에서:

```bash
npm run verify:staging-secrets -- --db-ping
```

PowerShell (호스팅 SSH 예):

```powershell
npm run verify:staging-secrets -- --db-ping
```

**PASS 기준**: errors 0 · DB ping OK · OAuth callback URL 출력 확인.

### Step 2 — OAuth callback 수동 대조

verify 출력 callback URL ↔ Google/Kakao/Naver 콘솔 **Redirect URI** 일치 확인 (체크리스트 §2).

### Step 3 — 앱 배포 · health

staging URL 배포 후:

```bash
# env: STAGING_BASE_URL=https://your-staging-host
npm run ops:staging-secrets-live-check
```

내부 순서:

1. `verify:staging-secrets --db-ping`
2. `GET /api/health` → 200 · `ok: true`
3. `ops:ai-core-role-smoke` (원격)

### Step 4 — 역할 경계 기대 (로컬과 동일)

| 역할 | summary | graph | delivery | preview | review | audit-policy |
| --- | --- | --- | --- | --- | --- | --- |
| CLIENT | 200 | 없음 | 200 | 403 | 403 | 403 |
| LAWYER | 200 | 있음 | 403 | 200 | 200 | 403 |
| STAFF | 200 | 있음 | 403 | 200 | 200 | 200 |
| ADMIN | 200 | — | 403 | 200 | 200 | 200 |

---

## 3. 로컬에서 스크립트 형식만 dry-run (staging 아님)

로컬 `.env`는 `NODE_ENV=development` 등으로 **staging verify FAIL이 정상**이다.

validator 형식만 확인:

```powershell
$env:STAGING_SECRETS_VERIFY_RELAXED="1"
npm run verify:staging-secrets
```

원격 live-check 로컬 리허설 (localhost only):

```powershell
$env:STAGING_ALLOW_LOCAL="1"
$env:STAGING_BASE_URL="http://localhost:3000"
$env:STAGING_SECRETS_VERIFY_RELAXED="1"
$env:OPS_SMOKE_CASE_ID="<local-case-id>"
npm run ops:staging-secrets-live-check
```

---

## 4. 증빙 기록 (PASS 후)

[STAGING_SECRETS_CHECKLIST.md §7](./STAGING_SECRETS_CHECKLIST.md) 표 작성:

| 항목 | 기록 |
| --- | --- |
| staging URL | 호스트만 (secrets 없음) |
| verify:staging-secrets | PASS 시각 |
| OAuth callback | 수동 대조 PASS |
| ops:staging-secrets-live-check | PASS 시각 |
| role smoke | 19 checks PASS |

`IMPLEMENTATION_EVIDENCE.md` 태그 `[EVIDENCE-20260523-AIBEOPCHIN-STAGING-SECRETS-LIVE-PHASE]` 갱신.

---

## 5. FAIL 시 분기

| 증상 | 조치 |
| --- | --- |
| `NODE_ENV` not production | staging runtime env 수정 |
| OAuth pair error | id/secret 쌍 · callback URL |
| `--db-ping` FAIL | `DATABASE_URL` · 네트워크 · migration |
| health 503 | DB · 배포 실패 |
| role smoke login FAIL | smoke 계정 · `OPS_SMOKE_*` |
| preview/review 경계 FAIL | **코드 회귀** — AI Core RC 재검토 |

**migration chronology** 로 staging `migrate deploy` 가 막히면 → Phase **B** 검토 ([DB_MIGRATION_CHRONOLOGY.md](./DB_MIGRATION_CHRONOLOGY.md)).

---

## 6. 관련 명령 · 파일

| 명령 | 역할 |
| --- | --- |
| `npm run verify:staging-secrets` | env 실측 |
| `npm run ops:staging-secrets-live-check` | env + health + role smoke |
| `npm run ops:ai-core-role-smoke` | 역할 API only |

| 파일 | 역할 |
| --- | --- |
| [`scripts/lib/staging-secrets-env-policy.mjs`](../../scripts/lib/staging-secrets-env-policy.mjs) | 검증 정책 SSOT |
| [`scripts/verify-staging-secrets.mjs`](../../scripts/verify-staging-secrets.mjs) | env verifier |
| [`scripts/ops-staging-secrets-live-check.mjs`](../../scripts/ops-staging-secrets-live-check.mjs) | live orchestrator |

---

## 7. 한 줄 판정

**AI Core는 배포 후보** — Phase A는 staging에서 secrets·OAuth callback·production NODE_ENV·역할 API가 **살아있음**을 실측으로 닫는다. **B(Migration Squash)** 는 staging DB/migration BLOCKED 또는 greenfield 정리 필요 시 후속.
