# Tenant / Plan / Metering RC Runbook (Product Phase **22-F**)

**원칙**: Phase 22-F는 **새 기능 추가가 아니라** 22-A~E를 **하나의 배포 전 사업화 RC 게이트**로 묶는 단계입니다.

---

## 1. 한 줄 기준

**법무법인·변호사·의뢰인 사용 구조를 tenant 단위로 분리하고, 요금제·기능 권한·사용량 집계·과금 안전 원장·운영자 plan console을 하나의 사업화 RC로 묶어 배포 전 검증·운영 runbook·청구서 미발행 원장 정책을 잠근다.**

## 2. Static RC (배포 전 필수)

```bash
npm run verify:aibeopchin-tenant-rc
```

### 포함 검증

| Gate | 내용 |
| --- | --- |
| **22-A** | Tenant · Membership · organization baseline |
| **22-B** | plan tier · entitlement · API enforcement |
| **22-C** | usage metering events · plan limit comparison |
| **22-D** | billing ledger · period close · **no automatic invoice** |
| **22-E** | admin plan console · audit actions |
| **22-F** | bundled verify · evidence · cross-link 20-F/21-F |
| **20-F** | Real Messaging RC prerequisite · tenant messaging entitlement |
| **21-F** | Client Mobile RC prerequisite · client portal entitlement |

## 3. Operator checklist (배포 전)

- [ ] `npm run verify:aibeopchin-tenant-rc` PASS
- [ ] `npm run verify:aibeopchin-real-messaging-rc` PASS (Phase 20 선행)
- [ ] `npm run verify:aibeopchin-client-mobile-rc` PASS (Phase 21 선행)
- [ ] `/admin/tenants` — demo tenant plan · usage · ledger snapshot 확인
- [ ] Closed billing period — ledger adjustment UI/API 차단 확인
- [ ] **청구서 자동 발행 없음** — ledger only, invoice 미개방

## 4. Sub-phase runbooks

- [AIBEOPCHIN_TENANT_ORGANIZATION_BASELINE_RUNBOOK.md](./AIBEOPCHIN_TENANT_ORGANIZATION_BASELINE_RUNBOOK.md) — **22-A**
- [AIBEOPCHIN_TENANT_PLAN_ENTITLEMENT_RUNBOOK.md](./AIBEOPCHIN_TENANT_PLAN_ENTITLEMENT_RUNBOOK.md) — **22-B**
- [AIBEOPCHIN_TENANT_USAGE_METERING_RUNBOOK.md](./AIBEOPCHIN_TENANT_USAGE_METERING_RUNBOOK.md) — **22-C**
- [AIBEOPCHIN_BILLING_USAGE_LEDGER_RUNBOOK.md](./AIBEOPCHIN_BILLING_USAGE_LEDGER_RUNBOOK.md) — **22-D**
- [AIBEOPCHIN_ADMIN_TENANT_PLAN_CONSOLE_RUNBOOK.md](./AIBEOPCHIN_ADMIN_TENANT_PLAN_CONSOLE_RUNBOOK.md) — **22-E**

## 5. Admin console

| Path | Role |
| --- | --- |
| `/admin/tenants` | tenant list (ADMIN) |
| `/admin/tenants/{tenantId}/plan` | plan · entitlement · usage · ledger |

## 6. Evidence

- `EVIDENCE-20260524-AIBEOPCHIN-TENANT-PHASE22F-RC`
- Sub-phase: 22-A ~ 22-E evidence blocks in `IMPLEMENTATION_EVIDENCE.md`

**버전** **`22-F.1`**
