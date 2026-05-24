# AI법친 Production Go/No-Go Runbook (Phase **16‑D**)

**목적**: production 배포 **직전** 승인자가 Go/No-Go를 판정하고 launch record를 남기는 절차.

**관련**: [AIBEOPCHIN_PRODUCTION_GO_NO_GO_DECISION_CHECKLIST.md](../platform/AIBEOPCHIN_PRODUCTION_GO_NO_GO_DECISION_CHECKLIST.md) · [AIBEOPCHIN_PRODUCTION_LAUNCH_RECORD_TEMPLATE.md](../platform/AIBEOPCHIN_PRODUCTION_LAUNCH_RECORD_TEMPLATE.md) · [AIBEOPCHIN_PRODUCTION_RELEASE_READINESS_RUNBOOK.md](./AIBEOPCHIN_PRODUCTION_RELEASE_READINESS_RUNBOOK.md)

---

## 1. Static gate (clone / CI)

```bash
npm run verify:aibeopchin-production-go-no-go-launch-rc
```

문서·SSOT·launch record template·16-A/16-B/16-C evidence 태그 존재 확인.

---

## 2. 배포 직전 — Phase 재확인

```bash
npm run verify:aibeopchin-full-legal-ops-platform-rc
npm run verify:aibeopchin-staging-deploy-readiness-rc
npm run verify:aibeopchin-production-release-readiness-rc
```

Staging live (동일 commit):

```bash
npm run ops:staging-deploy-readiness-live-check
```

---

## 3. Launch record 작성

1. [AIBEOPCHIN_PRODUCTION_LAUNCH_RECORD_TEMPLATE.md](../platform/AIBEOPCHIN_PRODUCTION_LAUNCH_RECORD_TEMPLATE.md) 복사
2. `deployApprover` · `deployApprovedAt` · `deployTargetCommit` · `rollbackTargetCommit` 입력
3. Kakao/Email **live mode** · `knownLimitations` · `launchNote` 작성
4. **`goNoGoDecision`**: `GO` 또는 `NO-GO` + rationale

저장 위치 (택 1):

- `docs/platform/launch-records/AIBEOPCHIN_PRODUCTION_LAUNCH_RECORD_YYYYMMDD.md` (git)
- 운영 vault / ticket 첨부 (민감 정보 분리 시)

---

## 4. Go / No-Go 판정 기준

| 판정 | 조건 |
| --- | --- |
| **GO** | 16-A/16-B/16-C static PASS · staging live smoke PASS · cutover checklist 완료 · rollback target 확정 · 승인자 기록 |
| **NO-GO** | live smoke FAIL · pending migration · rollback 미정 · blocker 미해결 · 승인자 부재 |

**NO-GO** 시 production deploy **중단**. blocker 해소 후 새 launch record 작성.

---

## 5. GO 이후 — 16-C cutover 실행

[ AIBEOPCHIN_PRODUCTION_RELEASE_READINESS_RUNBOOK.md](./AIBEOPCHIN_PRODUCTION_RELEASE_READINESS_RUNBOOK.md) 순서:

1. DB backup
2. `npm run db:deploy`
3. Deploy application
4. `npm run ops:production-release-cutover-live-check`
5. [AIBEOPCHIN_POST_DEPLOY_MONITORING_CHECKLIST.md](./AIBEOPCHIN_POST_DEPLOY_MONITORING_CHECKLIST.md)

Launch record에 live smoke 결과를 **사후 갱신**한다.

---

## 6. 증빙

- IMPLEMENTATION_EVIDENCE: `EVIDENCE-20260524-AIBEOPCHIN-PRODUCTION-GO-NO-GO-PHASE16D-LAUNCH`
- Launch record 파일명·commit·승인 시각을 release evidence에 cross-link

**버전** **`16-D.1`**

**Scope keys (RC static gate)**: verify:aibeopchin-production-go-no-go-launch-rc · AIBEOPCHIN_PRODUCTION_LAUNCH_RECORD_TEMPLATE · go / no-go
