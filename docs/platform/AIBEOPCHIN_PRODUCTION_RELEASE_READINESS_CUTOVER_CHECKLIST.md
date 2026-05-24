# AI법친 Production Release Readiness / Cutover Checklist (Phase **16‑C**)

**상태**: **Production Cutover RC LOCKED** — static `verify:aibeopchin-production-release-readiness-rc` PASS

**증빙 태그**: **`[EVIDENCE-20260524-AIBEOPCHIN-PRODUCTION-RELEASE-READINESS-PHASE16C-CUTOVER]`**

---

## ☐ A. 선행 (16-A · 16-B)

| # | 확인 |
| --- | --- |
| A1 | `npm run verify:aibeopchin-full-legal-ops-platform-rc` **PASS** |
| A2 | `npm run predeploy:check` **PASS** |
| A3 | `npm run ops:staging-deploy-readiness-live-check` **PASS** (staging) |

---

## ☐ B. Production env checklist

| # | 항목 | 확인 |
| --- | --- | --- |
| B1 | `DATABASE_URL` | production 전용 · staging과 **분리** |
| B2 | `JWT_SECRET` / `CRON_SECRET` | 32자+ · staging/prod **재사용 금지** |
| B3 | `APP_BASE_URL` | production `https://` 오리진 |
| B4 | `NODE_ENV` | **`production`** (runtime · build) |
| B5 | `NEXT_PUBLIC_APP_ENV` | **`production`** |
| B6 | AI Core 9 keys | 16-A stack |
| B7 | `npm run verify:production-env-readiness` | **PASS** (production shell) |

---

## ☐ C. DB backup / migration deploy / rollback point

| # | 확인 |
| --- | --- |
| C1 | **배포 직전** production DB **백업** 완료 (시각·담당 기록) |
| C2 | `npm run db:deploy` (`prisma migrate deploy`) 실행 |
| C3 | `verify:staging-migration-deploy-readiness -- --status` → pending **없음** |
| C4 | `rollbackTargetCommit` · deploy commit SHA 증빙 기록 |

---

## ☐ D. Kakao / Email provider 실전 전환

| # | 확인 |
| --- | --- |
| D1 | `PRODUCTION_KAKAO_ALIMTALK_MODE` = **`stub`** 또는 **`live`** (팀 합의 문서화) |
| D2 | `PRODUCTION_EMAIL_DELIVERY_MODE` = **`stub`** 또는 **`live`** |
| D3 | **live** 선택 시 provider API key·템플릿·발신번호 등록 (값은 문서에 **미기록**) |
| D4 | Phase 15-F: 카카오/이메일 **원본 미첨부** · secure link 정책 유지 확인 |

---

## ☐ E. OAuth redirect production 검증

| # | 확인 |
| --- | --- |
| E1 | `verify:production-env-readiness` → callback URL 목록 출력 |
| E2 | Google/Kakao/Naver 콘솔에 **production** redirect URI 등록 |
| E3 | `verify:production-env-readiness -- --oauth-smoke` → start redirect **3xx PASS** |
| E4 | [social-login-provider-setup.md](../social-login-provider-setup.md) 대조 |

---

## ☐ F. Storage / document-intelligence 권한

| # | 확인 |
| --- | --- |
| F1 | `ILLEGAL_LENDING_STORAGE_DRIVER` (local / r2 / s3) · bucket·credential 설정 |
| F2 | `storage/document-intelligence` 업로드 경로 · 디스크/오브젝트 **쓰기 권한** |
| F3 | 첨부 **직접 URL 노출 없음** · 역할·사건 가드 다운로드 |
| F4 | 변호사/스태프/의뢰인 **document-intelligence API** 역할 경계 (16-A role smoke) |

---

## ☐ G. Role smoke 계정 준비

| # | 확인 |
| --- | --- |
| G1 | production 전용 `OPS_SMOKE_{CLIENT,LAWYER,STAFF,ADMIN}_EMAIL/PASSWORD` |
| G2 | `OPS_SMOKE_CASE_ID` — portal access · CaseAssignment · smoke data |
| G3 | seed/demo 계정 **production DB에 잔류하지 않음** (정책에 따름) |

---

## ☐ H. Minimum rollback playbook 실행 기준

| # | 트리거 | 조치 |
| --- | --- | --- |
| H1 | live smoke FAIL · `/api/health` FAIL | **즉시** 직전 릴리스 rollback |
| H2 | migration deploy FAIL | deploy **중단** · backup 복원 절차 |
| H3 | OAuth/login 전면 FAIL | env·callback 확인 → rollback 검토 |
| H4 | 500 반복 (LCC·portal·upload) | [minimum-rollback-playbook.md](../minimum-rollback-playbook.md) L1〜L4 |

---

## ☐ I. Release note / 운영자 공지

| # | 확인 |
| --- | --- |
| I1 | [AIBEOPCHIN_PRODUCTION_RELEASE_NOTE_TEMPLATE.md](./AIBEOPCHIN_PRODUCTION_RELEASE_NOTE_TEMPLATE.md) 작성 |
| I2 | 버전 · commit · migration · known issues · rollback target |
| I3 | 운영자·변호사 포털 **점검/공지** (필요 시) |

---

## ☐ J. Post-deploy monitoring checklist

| # | 확인 |
| --- | --- |
| J1 | [AIBEOPCHIN_POST_DEPLOY_MONITORING_CHECKLIST.md](../operations/AIBEOPCHIN_POST_DEPLOY_MONITORING_CHECKLIST.md) **PASS** |
| J2 | `npm run ops:production-release-cutover-live-check` **PASS** |
| J3 | 24h 모니터링 담당·에스컬레이션 경로 기록 |

---

**한 줄**: 16-C는 staging PASS 후 production **backup → migrate → deploy → live smoke → monitoring** cutover를 봉인한다.

**Scope keys (RC static gate)**: DB backup · rollbackTargetCommit · Kakao · OAuth · document-intelligence · OPS_SMOKE · minimum rollback · release note · post-deploy monitoring
