# AI법친 Staging Secrets · Env 점검표

**목적**: 스테이징(또는 운영 직전) 배포 환경에서 **secrets·env 정합**을 한 장으로 닫는다.  
**원칙**: 연결 문자열·키 **값**은 이 문서·PR·채팅·스크린샷·증빙 본문에 **절대 기록하지 않는다.** 존재 여부·형식·일치 여부만 체크한다.

**SSOT 참고**: [`.env.example`](../../.env.example) · [`full-ai-core-rc-lock.ts`](../../src/features/ai-core/full-ai-core-rc-lock.ts)

---

## 0. 점검 전 준비

- [ ] 점검 대상: **staging** (또는 production dry-run) 환경 명시
- [ ] 점검 시각 · 담당자 기록 (증빙 태그와 연결)
- [ ] secrets는 **Secret Manager / CI secrets / 호스팅 env UI**에서만 편집
- [ ] `DATABASE_URL` 실제 값은 문서에 남기지 않음

---

## 1. 필수 앱 · 인프라

| # | 변수 | 확인 | 기대 |
| --- | --- | --- | --- |
| 1.1 | `DATABASE_URL` | ☐ | PostgreSQL 연결 가능 · staging 전용 DB |
| 1.2 | `JWT_SECRET` | ☐ | 충분한 길이의 랜덤 문자열 · dev와 **다름** |
| 1.3 | `CRON_SECRET` | ☐ | cron/내부 엔드포인트 보호 · dev와 **다름** |
| 1.4 | `APP_BASE_URL` | ☐ | **실제 staging HTTPS 오리진**과 일치 |
| 1.5 | `NEXT_PUBLIC_APP_ENV` | ☐ | `staging` (또는 팀 합의 값) |
| 1.6 | `NEXT_PUBLIC_APP_VERSION` | ☐ | 배포 빌드·릴리즈 태그와 일치 |
| 1.7 | `NODE_ENV` | ☐ | 런타임 `production` · **build/test job에 `development` 혼입 없음** |

### Cookie · HTTPS

| # | 변수 | 확인 | 기대 |
| --- | --- | --- | --- |
| 1.8 | `AUTH_COOKIE_SECURE` | ☐ | HTTPS staging이면 `true` (또는 APP_BASE_URL https 자동) |

---

## 2. OAuth (선택 — 사용 provider만)

**규칙**: client id / secret **쌍** — 하나만 있으면 `predeploy:check` auth env validation **FAIL**.

| Provider | `*_CLIENT_ID` | `*_CLIENT_SECRET` | Redirect URI (콘솔) |
| --- | --- | --- | --- |
| Google | ☐ | ☐ | staging `APP_BASE_URL` 기준 등록 |
| Kakao | ☐ | ☐ | 동일 |
| Naver | ☐ | ☐ | 동일 |

- [ ] 미사용 provider는 **둘 다 비움** (부분 설정 없음)

---

## 3. AI Core (Full RC 9 keys)

Tier 1 Document · Tier 2 Case Summary · Tier 3 Governance.

| # | 변수 | Tier | 확인 | staging 메모 |
| --- | --- | --- | --- | --- |
| 3.1 | `OPENAI_API_KEY` | 1·2 | ☐ | staging 전용 키 · quota 확인 |
| 3.2 | `OPENAI_DOCUMENT_GENERATE_MODEL` | 1 | ☐ | `.env.example`와 동일 계열 |
| 3.3 | `OPENAI_PARAGRAPH_REWRITE_MODEL` | 1 | ☐ | |
| 3.4 | `OPENAI_CASE_SUMMARY_MODEL` | 2 | ☐ | |
| 3.5 | `CASE_SUMMARY_AI_MODE` | 2 | ☐ | `RULE_BASED` / LLM 정책 합의 |
| 3.6 | `AI_GOVERNANCE_AI_ENABLED` | 3 | ☐ | staging에서 LLM on/off 정책 |
| 3.7 | `AI_GOVERNANCE_TENANT_ID` | 3 | ☐ | |
| 3.8 | `AI_GOVERNANCE_MONTHLY_TOKEN_BUDGET` | 3 | ☐ | (선택) budget cap |
| 3.9 | `AI_GOVERNANCE_MAX_LLM_CALLS_PER_CASE` | 3 | ☐ | (선택) per-case cap |

---

## 4. DB · migration (staging)

- [ ] `npx prisma migrate status` — **pending 0** (또는 배포 직전 deploy 계획 문서화)
- [ ] AI Core baseline 3 migration 존재 확인 — [DB_MIGRATION_CHRONOLOGY.md](./DB_MIGRATION_CHRONOLOGY.md) §3
- [ ] `npm run verify:supplement-migration-predeploy` **PASS**
- [ ] seed/데모 계정이 staging 정책과 일치 (운영 admin만 등)

---

## 5. Staging 검증 명령 (secrets 설정 후)

**Phase A 실측 런북**: [STAGING_SECRETS_LIVE_VERIFICATION_PHASE.md](./STAGING_SECRETS_LIVE_VERIFICATION_PHASE.md)

**dev 서버 없이** (staging shell 또는 배포 파이프 env):

```bash
npm run verify:staging-secrets -- --db-ping --oauth-smoke
npm run ops:staging-secrets-live-check
```

정적 RC (로컬 clone + staging env 파일):

```bash
npm run verify:aibeopchin-ai-core-rc
npm run verify:aibeopchin-full-ai-core-rc
npm run predeploy:check
```

배포된 staging URL — Phase **16-B** master: `npm run ops:staging-deploy-readiness-live-check` (env + migration status + role + portal + upload).  
레거시 AI Core only: `ops:staging-secrets-live-check` (health + role smoke).  
개별 smoke: `PLAYWRIGHT_BASE_URL` + `OPS_SMOKE_CASE_ID` + `OPS_SMOKE_*` → [AIBEOPCHIN_STAGING_DEPLOY_READINESS_RUNBOOK.md](./AIBEOPCHIN_STAGING_DEPLOY_READINESS_RUNBOOK.md)

---

## 6. 금지 · 주의

- [ ] production `DATABASE_URL`을 staging에 **재사용하지 않음**
- [ ] production JWT/CRON secret을 staging에 **재사용하지 않음**
- [ ] `.env` 파일을 git에 **커밋하지 않음**
- [ ] 로컬 `NODE_ENV=development`를 staging CI build job에 **복사하지 않음**

---

## 7. 점검 결과 기록 (증빙)

| 항목 | 결과 |
| --- | --- |
| 점검 환경 | staging URL / 배포 ID |
| §1 필수 | PASS / FAIL |
| §2 OAuth | PASS / N/A |
| §3 AI Core keys | PASS / FAIL |
| §4 migration | PASS / BLOCKED |
| §5 verify | PASS / FAIL |

**한 줄**: staging secrets·env·migration이 닫히면 AI Core **배포 후보 → staging 실측** 단계로 진행.

---

## 8. 관련 문서

- [Predeploy 로컬 · CI 런북](./AIBEOPCHIN_PREDEPLOY_LOCAL_CI_RUNBOOK.md)
- [DB migration chronology](./DB_MIGRATION_CHRONOLOGY.md)
- [deployment-checklist.md §1](../deployment-checklist.md)
- [Full AI Core predeploy master checklist](../ai/AIBEOPCHIN_FULL_AI_CORE_PREDEPLOY_MASTER_CHECKLIST.md)
