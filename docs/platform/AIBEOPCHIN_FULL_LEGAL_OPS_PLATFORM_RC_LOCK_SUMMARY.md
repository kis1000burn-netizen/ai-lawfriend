# AI법친 Full Legal Ops Platform RC Lock Summary — Phase **16‑A**

**상태**: Phase **16‑A** — **Full Legal Ops Platform Predeploy RC LOCKED**

**증빙 태그**: **`[EVIDENCE-20260524-AIBEOPCHIN-FULL-LEGAL-OPS-PLATFORM-PHASE16A-PREDEPLOY-RC]`**

## 1. 목적

Voice · Gongbuho · CMB · AI Core · Legal Document Intelligence · Litigation Command Center · Client Collaboration Portal Full RC 및 플랫폼 무결성 게이트를 **단일 predeploy 마스터**로 묶는다. 신규 기능 추가보다 **배포 전 통합 검증**에 집중한다.

## 2. Domain RC 스택 (실행 순서)

| # | Domain RC | verify script |
| --- | --- | --- |
| 1 | Voice | `verify:aibeopchin-voice-rc` |
| 2 | Gongbuho Legal Knowledge | `verify:gongbuho-legal-knowledge-rc` |
| 3 | CMB | `verify:aibeopchin-cmb-rc` |
| 4 | AI Core | `verify:aibeopchin-ai-core-rc` |
| 5 | Legal Document Intelligence | `verify:aibeopchin-legal-document-intelligence-rc` |
| 6 | Litigation Command Center | `verify:aibeopchin-litigation-command-center-rc` |
| 7 | Client Collaboration Portal Full | `verify:aibeopchin-client-collaboration-portal-full-rc` |

## 3. Platform gates

| Gate | 명령 |
| --- | --- |
| Supplement / DB migration | `verify:supplement-migration-predeploy` |
| CaseStatus SSOT | `verify:canonical-sources` |
| TypeScript | `npx tsc --noEmit` |
| ESLint | `npm run lint` |
| Unit tests | `npm run test` |
| Production build | `npm run build` (**predeploy-check** 마지막) |

## 4. Role smoke (post-predeploy ops)

`npm run ops:ai-core-role-smoke` — **seed DB + dev server** 필요.  
정적 RC 게이트에는 스크립트·문서 존재만 검증. 실행은 [AIBEOPCHIN_PREDEPLOY_LOCAL_CI_RUNBOOK.md](../operations/AIBEOPCHIN_PREDEPLOY_LOCAL_CI_RUNBOOK.md) §1.4.

## 5. predeploy 흐름

```
validateEnvironment()
  → verify:aibeopchin-full-legal-ops-platform-rc  (16-A master)
  → npm run build  (dev 서버 종료 후)
  → (선택) npm run dev → ops:ai-core-role-smoke
```

## 6. 검증

```bash
npm run verify:aibeopchin-full-legal-ops-platform-rc
npm run predeploy:check
```

## 7. 후행 — Phase 16-B Staging Deploy Readiness

16-A PASS 후 staging 실측:

```bash
npm run verify:aibeopchin-staging-deploy-readiness-rc
npm run ops:staging-deploy-readiness-live-check   # staging URL + OPS_SMOKE_*
```

→ [AIBEOPCHIN_STAGING_DEPLOY_READINESS_RC_LOCK_SUMMARY.md](./AIBEOPCHIN_STAGING_DEPLOY_READINESS_RC_LOCK_SUMMARY.md)

## 8. 후행 — Phase 16-C Production Release Readiness

16-B staging live smoke PASS 후 production cutover:

```bash
npm run verify:aibeopchin-production-release-readiness-rc
npm run ops:production-release-cutover-live-check   # production URL + OPS_SMOKE_*
```

**버전** **`16-A.1`**
