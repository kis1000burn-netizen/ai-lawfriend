# AI법친 Production Launch Record

> **Usage**: 배포 승인 시 이 템플릿을 복사하여 `docs/platform/launch-records/AIBEOPCHIN_PRODUCTION_LAUNCH_RECORD_YYYYMMDD.md`로 저장하거나 운영 vault에 보관한다.  
> **GO** 판정 후에만 production deploy를 진행한다.

---

## Metadata

| Field | Value |
| --- | --- |
| **Record ID** | `LAUNCH-YYYYMMDD-001` |
| **App version** | `NEXT_PUBLIC_APP_VERSION` |
| **Evidence tag** | `EVIDENCE-20260524-AIBEOPCHIN-PRODUCTION-GO-NO-GO-PHASE16D-LAUNCH` |

---

## Phase gate summary (16-A / 16-B / 16-C)

| Phase | Verify / smoke | Result | Notes |
| --- | --- | --- | --- |
| **16-A** | `verify:aibeopchin-full-legal-ops-platform-rc` | PASS / FAIL | |
| **16-B** | `ops:staging-deploy-readiness-live-check` | PASS / FAIL | staging URL · date |
| **16-C** | `verify:aibeopchin-production-release-readiness-rc` | PASS / FAIL | static |
| **16-C live** | `ops:production-release-cutover-live-check` | PASS / FAIL / N/A | 배포 후 |

---

## Deploy approval

| Field | Value |
| --- | --- |
| **deployApprover** | _(name · role)_ |
| **deployApprovedAt** | _(ISO 8601, e.g. 2026-05-24T09:00:00+09:00)_ |
| **deployTargetCommit** | _(full git SHA)_ |
| **rollbackTargetCommit** | _(full git SHA — last known good)_ |

---

## Live mode switches

| Provider | Env key | Mode |
| --- | --- | --- |
| Kakao Alimtalk | `PRODUCTION_KAKAO_ALIMTALK_MODE` | stub / live |
| Email delivery | `PRODUCTION_EMAIL_DELIVERY_MODE` | stub / live |

**Operator note**: live 선택 시 API keys는 vault에만 보관. 이 기록에는 **mode만** 남긴다.

---

## Nine-axis cutover confirmation (16-C)

- [ ] Production env verified
- [ ] DB backup / migration / rollback point recorded
- [ ] Kakao / Email live mode decided
- [ ] OAuth production callback registered
- [ ] Storage / document-intelligence permissions OK
- [ ] Role smoke accounts prepared (`OPS_SMOKE_*`)
- [ ] Minimum rollback criteria understood
- [ ] Release note / operator notice drafted
- [ ] Post-deploy monitoring owner assigned

---

## knownLimitations

_(List stub features, third-party deps, performance limits, intentional deferrals.)_

- 

---

## launchNote

_(Operator / lawyer portal notice — maintenance window, new features, support contact.)_

- 

---

## goNoGoDecision

| Decision | Selected |
| --- | --- |
| **GO** | ☐ |
| **NO-GO** | ☐ |

**Rationale** (required):

> 

**Blockers** (if NO-GO):

> 

---

## Sign-off

| Role | Name | Date |
| --- | --- | --- |
| Deploy approver | | |
| Ops witness (optional) | | |

---

**Related**: [Go/No-Go Checklist](./AIBEOPCHIN_PRODUCTION_GO_NO_GO_DECISION_CHECKLIST.md) · [16-C Cutover Checklist](./AIBEOPCHIN_PRODUCTION_RELEASE_READINESS_CUTOVER_CHECKLIST.md) · [minimum-rollback-playbook.md](../minimum-rollback-playbook.md)
